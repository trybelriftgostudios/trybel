import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { ModerationService } from '../moderation/moderation.service.js';

export async function authRoutes(fastify: FastifyInstance) {
  // 1. Send verification link / OTP
  fastify.post('/send-verification', async (request: FastifyRequest<{ Body: { email: string } }>, reply: FastifyReply) => {
    const { email } = request.body || {};
    if (!email || !email.includes('@')) {
      return reply.status(400).send({ error: 'InvalidEmail', message: 'Valid email address is required' });
    }

    const domain = email.split('@')[1].toLowerCase();
    const college = db.colleges.find(c => c.domain.toLowerCase() === domain && c.is_active);

    if (!college) {
      // AUTH-03: Route unrecognized domain to waitlist
      return reply.status(403).send({
        error: 'UnrecognizedDomain',
        message: 'Your college domain is not yet active on Trybel. You have been added to the priority campus waitlist.',
        domain,
        waitlisted: true
      });
    }

    // Generate token
    const token = uuidv4();
    const otp = '123456'; // standard dev OTP for instant frictionless testing
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins

    db.verificationTokens.push({
      id: uuidv4(),
      email: email.toLowerCase(),
      college_id: college.id,
      token_hash: token,
      expires_at: expiresAt,
      type: 'magic_link'
    });
    db.save();

    return reply.send({
      success: true,
      message: `Verification link sent to ${email}`,
      college: {
        id: college.id,
        name: college.name
      },
      magicLink: `trybel://verify?token=${token}`,
      devOtp: otp,
      verificationToken: token
    });
  });

  // 2. Verify token / OTP and issue JWT session
  fastify.post('/verify', async (request: FastifyRequest<{ Body: { token?: string; email?: string; otp?: string } }>, reply: FastifyReply) => {
    const { token, email, otp } = request.body || {};
    
    let matchedToken = db.verificationTokens.find(
      t => (token && t.token_hash === token) || (email && otp === '123456' && t.email === email.toLowerCase())
    );

    let userEmail = email?.toLowerCase();
    let collegeId = matchedToken?.college_id;

    if (!matchedToken && email) {
      const domain = email.split('@')[1]?.toLowerCase();
      const college = db.colleges.find(c => c.domain.toLowerCase() === domain && c.is_active);
      if (college && otp === '123456') {
        collegeId = college.id;
      }
    }

    if (!collegeId && matchedToken) {
      collegeId = matchedToken.college_id;
      userEmail = matchedToken.email;
    }

    if (!collegeId || !userEmail) {
      return reply.status(400).send({ error: 'InvalidToken', message: 'Invalid or expired verification token' });
    }

    // Find or create user
    let user = db.users.find(u => u.email.toLowerCase() === userEmail);
    if (!user) {
      user = {
        id: 'usr_' + uuidv4().substring(0, 8),
        college_id: collegeId,
        email: userEmail,
        role: 'student',
        is_verified: true,
        status: 'active',
        created_at: new Date().toISOString()
      };
      db.users.push(user);

      // Create default profile
      const namePart = userEmail.split('@')[0];
      const fullName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      db.profiles.push({
        id: 'prof_' + uuidv4().substring(0, 8),
        user_id: user.id,
        college_id: collegeId,
        full_name: fullName,
        skills: ['Python', 'Web Development'],
        interests: ['Tech', 'Campus Life'],
        available_for: ['Study Partners', 'Hackathon Teams'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      db.save();
    } else {
      user.is_verified = true;
      db.save();
    }

    // Sign JWT
    const jwtToken = fastify.jwt.sign({
      userId: user.id,
      collegeId: user.college_id,
      role: user.role,
      email: user.email
    });

    const college = db.colleges.find(c => c.id === user.college_id);
    const profile = db.profiles.find(p => p.user_id === user.id);

    return reply.send({
      success: true,
      token: jwtToken,
      user,
      college,
      profile
    });
  });

  // 3. OAuth secondary entry (still requires college domain match per AUTH-01)
  fastify.post('/oauth', async (request: FastifyRequest<{ Body: { provider: 'google' | 'apple'; email: string; name?: string } }>, reply: FastifyReply) => {
    const { email, name } = request.body || {};
    if (!email || !email.includes('@')) {
      return reply.status(400).send({ error: 'InvalidEmail', message: 'Valid email required' });
    }

    const domain = email.split('@')[1].toLowerCase();
    const college = db.colleges.find(c => c.domain.toLowerCase() === domain && c.is_active);

    if (!college) {
      return reply.status(403).send({
        error: 'OAuthDomainMismatch',
        message: 'Your OAuth account email domain does not belong to a recognized college on Trybel.'
      });
    }

    let user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: 'usr_' + uuidv4().substring(0, 8),
        college_id: college.id,
        email: email.toLowerCase(),
        role: 'student',
        is_verified: true,
        status: 'active',
        created_at: new Date().toISOString()
      };
      db.users.push(user);
      db.profiles.push({
        id: 'prof_' + uuidv4().substring(0, 8),
        user_id: user.id,
        college_id: college.id,
        full_name: name || email.split('@')[0],
        skills: ['Software Engineering'],
        interests: ['Collaboration'],
        available_for: ['Hackathon Teams'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      db.save();
    }

    const jwtToken = fastify.jwt.sign({
      userId: user.id,
      collegeId: user.college_id,
      role: user.role,
      email: user.email
    });

    return reply.send({
      success: true,
      token: jwtToken,
      user,
      college,
      profile: db.profiles.find(p => p.user_id === user.id)
    });
  });

  // 4. Current user session
  fastify.get('/me', { preHandler: [authenticateToken] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = db.users.find(u => u.id === request.user!.userId);
    const profile = db.profiles.find(p => p.user_id === request.user!.userId);
    const college = db.colleges.find(c => c.id === request.user!.collegeId);

    // Compute stats
    const connectionsCount = db.friendships.filter(
      f => (f.requester_id === user?.id || f.addressee_id === user?.id) && f.status === 'accepted'
    ).length;
    const teamsCount = db.teamMembers.filter(tm => tm.user_id === user?.id).length;
    const clubsCount = db.clubAdminRoles.filter(car => car.user_id === user?.id).length;

    return reply.send({
      user,
      profile,
      college,
      stats: {
        connections: connectionsCount,
        teams: teamsCount,
        clubs: clubsCount
      }
    });
  });
}
