import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthTokenPayload } from '../types/index.js';
import { db } from '../db/db.js';

export async function authenticateToken(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.substring(7);
    const decoded = await request.jwtVerify<AuthTokenPayload>();
    
    // Verify user exists and is active
    const user = db.users.find(u => u.id === decoded.userId);
    if (!user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'User not found' });
    }
    if (user.status === 'banned' || user.status === 'suspended') {
      return reply.status(403).send({ error: 'Forbidden', message: `Account is ${user.status}` });
    }

    request.user = {
      userId: user.id,
      collegeId: user.college_id,
      role: user.role,
      email: user.email
    };
  } catch (err) {
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}
