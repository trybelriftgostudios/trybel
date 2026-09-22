import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

export async function studyPartnerRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. List study requests: HARD RESTRICTED to user's verified college network
  fastify.get('/', async (request: FastifyRequest<{
    Querystring: { subject?: string; mode?: string; availability?: string; myRequests?: string }
  }>, reply: FastifyReply) => {
    const userCollegeId = request.user!.collegeId;
    const userId = request.user!.userId;
    const { subject, mode, availability, myRequests } = request.query;

    let requests = db.studyRequests.filter(r => r.college_id === userCollegeId);

    if (myRequests === 'true') {
      requests = requests.filter(r => r.user_id === userId);
    }

    if (subject) {
      const subLower = subject.toLowerCase();
      requests = requests.filter(r => r.subject.toLowerCase().includes(subLower));
    }

    if (mode && mode !== 'either') {
      requests = requests.filter(r => r.preferred_mode === mode || r.preferred_mode === 'either');
    }

    if (availability) {
      requests = requests.filter(r => r.availability_slot.toLowerCase().includes(availability.toLowerCase()));
    }

    // Attach user profile info
    const enriched = requests.map(r => {
      const profile = db.profiles.find(p => p.user_id === r.user_id);
      return {
        ...r,
        user: {
          id: r.user_id,
          name: profile?.full_name || 'Student',
          avatar_url: profile?.avatar_url,
          department: profile?.department,
          year_of_study: profile?.year_of_study,
          skills: profile?.skills || []
        }
      };
    });

    return reply.send({
      college_id: userCollegeId,
      is_college_only: true, // explicitly locked ON
      total: enriched.length,
      data: enriched
    });
  });

  // 2. Create study partner request (strictly pinned to caller's college_id)
  fastify.post('/', async (request: FastifyRequest<{
    Body: {
      subject: string;
      goal_description: string;
      preferred_mode: 'online' | 'offline' | 'either';
      availability_slot: string;
      looking_for: 'one_partner' | 'small_group';
    }
  }>, reply: FastifyReply) => {
    const { subject, goal_description, preferred_mode, availability_slot, looking_for } = request.body || {};
    
    if (!subject || !goal_description) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Subject and goal description are required' });
    }

    const newRequest = {
      id: 'sr_' + uuidv4().substring(0, 8),
      college_id: request.user!.collegeId, // Guaranteed server-side pinning
      user_id: request.user!.userId,
      subject,
      goal_description,
      preferred_mode: preferred_mode || 'either',
      availability_slot: availability_slot || 'Flexible',
      looking_for: looking_for || 'one_partner',
      status: 'active' as const,
      created_at: new Date().toISOString()
    };

    db.studyRequests.unshift(newRequest);
    db.save();

    return reply.status(201).send({
      success: true,
      data: newRequest
    });
  });

  // 3. Express interest / connect on a study request
  fastify.post('/:id/connect', async (request: FastifyRequest<{ Params: { id: string }; Body: { message?: string } }>, reply: FastifyReply) => {
    const studyReq = db.studyRequests.find(r => r.id === request.params.id);
    if (!studyReq) {
      return reply.status(404).send({ error: 'NotFound', message: 'Study request not found' });
    }

    // Strict college barrier: if applicant's college != request's college -> FORBIDDEN
    if (studyReq.college_id !== request.user!.collegeId) {
      return reply.status(403).send({
        error: 'ForbiddenCrossCollege',
        message: 'Study partner discovery is strictly college-only. You cannot connect with students from other campuses.'
      });
    }

    if (studyReq.user_id === request.user!.userId) {
      return reply.status(400).send({ error: 'InvalidOperation', message: 'Cannot connect to your own study request' });
    }

    // Create match and scoped chat thread
    const threadId = 'th_study_' + uuidv4().substring(0, 8);
    db.chatThreads.push({
      id: threadId,
      college_id: request.user!.collegeId,
      type: 'study_match',
      title: `Study Match: ${studyReq.subject}`,
      entity_id: studyReq.id,
      created_at: new Date().toISOString()
    });

    db.threadMembers.push(
      { id: 'thm_' + uuidv4().substring(0, 8), thread_id: threadId, user_id: studyReq.user_id, college_id: request.user!.collegeId, role: 'member' },
      { id: 'thm_' + uuidv4().substring(0, 8), thread_id: threadId, user_id: request.user!.userId, college_id: request.user!.collegeId, role: 'member' }
    );

    const match = {
      id: 'sm_' + uuidv4().substring(0, 8),
      college_id: request.user!.collegeId,
      request_id: studyReq.id,
      sender_id: request.user!.userId,
      recipient_id: studyReq.user_id,
      status: 'accepted' as const,
      thread_id: threadId,
      created_at: new Date().toISOString()
    };
    db.studyMatches.push(match);

    // Create notification for target user
    const senderProfile = db.profiles.find(p => p.user_id === request.user!.userId);
    db.notifications.push({
      id: 'notif_' + uuidv4().substring(0, 8),
      user_id: studyReq.user_id,
      college_id: request.user!.collegeId,
      category: 'match',
      title: 'Study Partner Match!',
      body: `${senderProfile?.full_name || 'A classmate'} connected with your study request for ${studyReq.subject}.`,
      deep_link_screen: 'Chat',
      read: false,
      created_at: 'Just now'
    });

    db.save();

    return reply.send({
      success: true,
      message: 'Connected! Study chat thread created.',
      match,
      threadId
    });
  });
}
