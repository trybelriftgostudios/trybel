import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { db } from './db/db.js';
import { seedDatabase } from './db/seed.js';

import { authRoutes } from './modules/auth/auth.routes.js';
import { profileRoutes } from './modules/profiles/profiles.routes.js';
import { studyPartnerRoutes } from './modules/study-partners/study-partners.routes.js';
import { teamRoutes } from './modules/teams/teams.routes.js';
import { clubEventRoutes } from './modules/clubs-events/clubs-events.routes.js';
import { chatRoutes } from './modules/chat/chat.routes.js';
import { friendPhotoRoutes } from './modules/friends-photos/friends-photos.routes.js';
import { chatbotRoutes } from './modules/chatbot/chatbot.routes.js';
import { challengeRoutes } from './modules/challenges/challenges.routes.js';
import { notificationRoutes } from './modules/notifications/notifications.routes.js';
import { adminRoutes } from './modules/admin/admin.routes.js';

export async function buildApp() {
  const fastify = Fastify({
    logger: false
  });

  // CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  });

  // JWT
  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'trybel-super-secure-jwt-college-secret-key-2026'
  });

  // Health check & Colleges directory
  fastify.get('/health', async () => ({ status: 'healthy', timestamp: new Date().toISOString() }));
  fastify.get('/api/colleges', async () => ({ colleges: db.colleges.filter(c => c.is_active) }));

  // Register feature modules
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(profileRoutes, { prefix: '/api/profiles' });
  await fastify.register(studyPartnerRoutes, { prefix: '/api/study-partners' });
  await fastify.register(teamRoutes, { prefix: '/api/teams' });
  await fastify.register(clubEventRoutes, { prefix: '/api' });
  await fastify.register(chatRoutes, { prefix: '/api/chat' });
  await fastify.register(friendPhotoRoutes, { prefix: '/api' });
  await fastify.register(chatbotRoutes, { prefix: '/api/chatbot' });
  await fastify.register(challengeRoutes, { prefix: '/api/challenges' });
  await fastify.register(notificationRoutes, { prefix: '/api/notifications' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });

  return fastify;
}

async function start() {
  // Ensure database has seed data
  if (db.colleges.length === 0) {
    seedDatabase();
  }

  const app = await buildApp();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

  try {
    const address = await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(` Trybel Backend API running at ${address}`);
    
    // Attach Socket.io server
    const io = new SocketIOServer(app.server, {
      cors: { origin: '*' }
    });

    io.on('connection', (socket) => {
      socket.on('join_thread', ({ threadId }) => {
        socket.join(threadId);
      });
      socket.on('leave_thread', ({ threadId }) => {
        socket.leave(threadId);
      });
    });

    console.log(` Scoped Realtime Chat WebSocket Gateway ready`);
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  start();
}
