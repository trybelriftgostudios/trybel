import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { canViewEvent, canRegisterEvent } from '../../middleware/college-scope.middleware.js';

export async function clubEventRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. List clubs in user's college
  fastify.get('/clubs', async (request: FastifyRequest, reply: FastifyReply) => {
    const userCollegeId = request.user!.collegeId;
    const clubs = db.clubs.filter(c => c.college_id === userCollegeId);
    return reply.send({ total: clubs.length, data: clubs });
  });

  // 2. Register club (initially is_verified = false until admin verifies)
  fastify.post('/clubs', async (request: FastifyRequest<{
    Body: { name: string; category: string; description: string; logo_url?: string }
  }>, reply: FastifyReply) => {
    const { name, category, description, logo_url } = request.body || {};
    if (!name || !category) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Name and category are required' });
    }

    const clubId = 'club_' + uuidv4().substring(0, 8);
    const newClub = {
      id: clubId,
      college_id: request.user!.collegeId,
      name,
      category,
      description: description || '',
      logo_url: logo_url || 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200',
      president_id: request.user!.userId,
      is_verified: false, // Requires platform admin verification per PRD 6.4
      member_count: 1,
      created_at: new Date().toISOString()
    };

    db.clubs.push(newClub);
    db.clubAdminRoles.push({
      id: 'car_' + uuidv4().substring(0, 8),
      club_id: clubId,
      user_id: request.user!.userId,
      role: 'president',
      assigned_by: request.user!.userId,
      created_at: new Date().toISOString()
    });

    db.save();

    return reply.status(201).send({
      success: true,
      message: 'Club registration submitted. Requires admin verification before publishing events.',
      data: newClub
    });
  });

  // 3. List events with independent visibility scoping
  fastify.get('/events', async (request: FastifyRequest<{
    Querystring: { filter?: 'all' | 'my_college' | 'open_to_all'; search?: string }
  }>, reply: FastifyReply) => {
    const userCollegeId = request.user!.collegeId;
    const { filter, search } = request.query;

    let events = db.events.filter(e => canViewEvent(e, userCollegeId));

    if (filter === 'my_college') {
      events = events.filter(e => e.college_id === userCollegeId);
    } else if (filter === 'open_to_all') {
      events = events.filter(e => e.visibility === 'everyone');
    }

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e => e.title.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
    }

    const enriched = events.map(e => {
      const club = db.clubs.find(c => c.id === e.club_id);
      const college = db.colleges.find(c => c.id === e.college_id);
      const registrations = db.eventRegistrations.filter(r => r.event_id === e.id && r.status === 'registered');
      const isRegistered = registrations.some(r => r.user_id === request.user!.userId);
      const isEligibleToRegister = canRegisterEvent(e, userCollegeId);

      return {
        ...e,
        club_name: club?.name || 'Campus Club',
        club_logo: club?.logo_url,
        college_name: college?.name,
        is_same_college: e.college_id === userCollegeId,
        interested_count: registrations.length,
        is_registered: isRegistered,
        can_register: isEligibleToRegister
      };
    });

    return reply.send({ total: enriched.length, data: enriched });
  });

  // 4. Create event: ONLY verified club presidents can publish per PRD 6.4
  // Features TWO INDEPENDENT TOGGLES: visibility & registration_eligibility
  fastify.post('/events', async (request: FastifyRequest<{
    Body: {
      club_id: string;
      title: string;
      description: string;
      start_time: string;
      location: string;
      capacity?: number;
      visibility: 'college' | 'everyone';
      registration_eligibility: 'college_only' | 'cross_college';
    }
  }>, reply: FastifyReply) => {
    const { club_id, title, description, start_time, location, capacity, visibility, registration_eligibility } = request.body || {};

    const club = db.clubs.find(c => c.id === club_id);
    if (!club) {
      return reply.status(404).send({ error: 'NotFound', message: 'Club not found' });
    }

    // Verify president permission & verification status
    const adminRole = db.clubAdminRoles.find(car => car.club_id === club.id && car.user_id === request.user!.userId);
    const isPlatformAdmin = request.user!.role === 'super_admin' || request.user!.role === 'platform_moderator';

    if (!adminRole && !isPlatformAdmin) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Only club leaders can create events' });
    }

    if (!club.is_verified && !isPlatformAdmin) {
      return reply.status(403).send({
        error: 'ClubUnverified',
        message: 'Your club must be manually verified by campus platform admins before creating public events.'
      });
    }

    if (!visibility || !registration_eligibility) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'Both visibility (college/everyone) and registration_eligibility (college_only/cross_college) toggles must be explicitly configured.'
      });
    }

    const eventId = 'evt_' + uuidv4().substring(0, 8);
    const newEvent = {
      id: eventId,
      college_id: club.college_id,
      club_id: club.id,
      title,
      description: description || '',
      start_time: start_time || 'TBD',
      location: location || 'Campus',
      capacity: capacity || 100,
      visibility, // Toggle 1: Who can see
      registration_eligibility, // Toggle 2: Who can register
      status: 'published' as const,
      created_at: new Date().toISOString()
    };

    db.events.unshift(newEvent);
    db.save();

    return reply.status(201).send({ success: true, data: newEvent });
  });

  // 5. Register for event (enforcing registration_eligibility server-side)
  fastify.post('/events/:id/register', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const event = db.events.find(e => e.id === request.params.id);
    if (!event) {
      return reply.status(404).send({ error: 'NotFound', message: 'Event not found' });
    }

    const userCollegeId = request.user!.collegeId;
    const canRegister = canRegisterEvent(event, userCollegeId);

    if (!canRegister) {
      return reply.status(403).send({
        error: 'ForbiddenRegistration',
        message: 'Registration for this event is restricted to students of the organizing college.'
      });
    }

    const existing = db.eventRegistrations.find(r => r.event_id === event.id && r.user_id === request.user!.userId);
    if (existing) {
      if (existing.status === 'registered') {
        return reply.status(400).send({ error: 'AlreadyRegistered', message: 'You are already registered for this event' });
      } else {
        existing.status = 'registered';
        db.save();
        return reply.send({ success: true, message: 'Registration reinstated' });
      }
    }

    const registration = {
      id: 'reg_' + uuidv4().substring(0, 8),
      event_id: event.id,
      user_id: request.user!.userId,
      college_id: userCollegeId,
      status: 'registered' as const,
      registered_at: new Date().toISOString()
    };

    db.eventRegistrations.push(registration);
    db.save();

    return reply.status(201).send({
      success: true,
      message: 'Successfully registered for event!',
      registration
    });
  });

  // 6. Event Feedback: Strictly visible only to registered attendees and authorized club/platform admins!
  fastify.get('/events/:id/feedback', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const event = db.events.find(e => e.id === request.params.id);
    if (!event) {
      return reply.status(404).send({ error: 'NotFound', message: 'Event not found' });
    }

    const userId = request.user!.userId;
    const isRegistered = db.eventRegistrations.some(r => r.event_id === event.id && r.user_id === userId && r.status === 'registered');
    const club = db.clubs.find(c => c.id === event.club_id);
    const isClubAdmin = club?.president_id === userId;
    const isPlatformAdmin = request.user!.role === 'platform_moderator' || request.user!.role === 'super_admin';

    if (!isRegistered && !isClubAdmin && !isPlatformAdmin) {
      return reply.status(403).send({
        error: 'FeedbackAccessDenied',
        message: 'Post-event feedback is private and only accessible to verified attendees of this specific event.'
      });
    }

    const feedbacks = db.eventFeedback.filter(fb => fb.event_id === event.id);
    return reply.send({
      event_id: event.id,
      total_responses: feedbacks.length,
      data: feedbacks
    });
  });

  // 7. Submit Event Feedback (Gated to registered attendees)
  fastify.post('/events/:id/feedback', async (request: FastifyRequest<{
    Params: { id: string };
    Body: { rating: number; feedback_text: string }
  }>, reply: FastifyReply) => {
    const event = db.events.find(e => e.id === request.params.id);
    if (!event) {
      return reply.status(404).send({ error: 'NotFound', message: 'Event not found' });
    }

    const userId = request.user!.userId;
    const isRegistered = db.eventRegistrations.some(r => r.event_id === event.id && r.user_id === userId && r.status === 'registered');

    if (!isRegistered) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: 'Only registered participants of this event can submit feedback.'
      });
    }

    const { rating, feedback_text } = request.body || {};
    const feedback = {
      id: 'fb_' + uuidv4().substring(0, 8),
      event_id: event.id,
      user_id: userId,
      college_id: request.user!.collegeId,
      rating: rating || 5,
      feedback_text: feedback_text || '',
      created_at: new Date().toISOString()
    };

    db.eventFeedback.push(feedback);
    db.save();

    return reply.status(201).send({ success: true, message: 'Thank you for your feedback!', feedback });
  });
}
