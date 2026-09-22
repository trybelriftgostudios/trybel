import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

export async function profileRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. Get user profile by user_id
  fastify.get('/:userId', async (request: FastifyRequest<{ Params: { userId: string } }>, reply: FastifyReply) => {
    const targetUserId = request.params.userId;
    const user = db.users.find(u => u.id === targetUserId);
    if (!user) {
      return reply.status(404).send({ error: 'NotFound', message: 'User not found' });
    }

    const profile = db.profiles.find(p => p.user_id === targetUserId);
    const college = db.colleges.find(c => c.id === user.college_id);

    // Compute stats
    const connectionsCount = db.friendships.filter(
      f => (f.requester_id === user.id || f.addressee_id === user.id) && f.status === 'accepted'
    ).length;
    const teamsCount = db.teamMembers.filter(tm => tm.user_id === user.id).length;
    const clubsCount = db.clubAdminRoles.filter(car => car.user_id === user.id).length;

    // Check friendship status with caller
    const callerId = request.user!.userId;
    const friendship = db.friendships.find(
      f => (f.requester_id === callerId && f.addressee_id === targetUserId) ||
           (f.requester_id === targetUserId && f.addressee_id === callerId)
    );

    return reply.send({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_verified: user.is_verified,
        college_id: user.college_id
      },
      profile,
      college: {
        id: college?.id,
        name: college?.name,
        domain: college?.domain
      },
      stats: {
        connections: connectionsCount,
        teams: teamsCount,
        clubs: clubsCount
      },
      friendship_status: friendship ? friendship.status : 'none',
      is_self: callerId === targetUserId
    });
  });

  // 2. Edit my profile
  fastify.put('/me', async (request: FastifyRequest<{
    Body: {
      full_name?: string;
      department?: string;
      year_of_study?: string;
      about?: string;
      motto?: string;
      skills?: string[];
      interests?: string[];
      available_for?: string[];
    }
  }>, reply: FastifyReply) => {
    const userId = request.user!.userId;
    let profile = db.profiles.find(p => p.user_id === userId);

    if (!profile) {
      return reply.status(404).send({ error: 'NotFound', message: 'Profile not found' });
    }

    const { full_name, department, year_of_study, about, motto, skills, interests, available_for } = request.body || {};

    if (full_name !== undefined) profile.full_name = full_name;
    if (department !== undefined) profile.department = department;
    if (year_of_study !== undefined) profile.year_of_study = year_of_study;
    if (about !== undefined) profile.about = about;
    if (motto !== undefined) profile.motto = motto;
    if (skills !== undefined) profile.skills = skills;
    if (interests !== undefined) profile.interests = interests;
    if (available_for !== undefined) profile.available_for = available_for;
    profile.updated_at = new Date().toISOString();

    db.save();

    return reply.send({ success: true, profile });
  });
}
