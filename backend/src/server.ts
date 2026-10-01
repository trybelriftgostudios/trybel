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
import { mediaCatalogRoutes } from './modules/media-catalog/media-catalog.routes.js';
import { PostgresService } from './db/postgres-pool.js';

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

  // Root Welcome & Status Dashboard
  fastify.get('/', async (_req, reply) => {
    return reply.type('text/html').send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trybel API Gateway</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0A0E17; color: #FFFFFF; padding: 40px 20px; margin: 0; }
            .card { background: #131B2E; border: 1px solid #1E293B; border-radius: 12px; padding: 28px; max-width: 650px; margin: 0 auto; box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
            h1 { color: #6366F1; margin-top: 0; font-size: 26px; }
            .badge { display: inline-block; background: #10B981; color: #042f1a; font-weight: bold; padding: 4px 10px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; }
            p { color: #94A3B8; line-height: 1.6; }
            ul { list-style: none; padding: 0; }
            li { padding: 10px 14px; background: #1E293B; margin-bottom: 8px; border-radius: 8px; font-family: monospace; font-size: 14px; display: flex; justify-content: space-between; }
            a { color: #38BDF8; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .btn { display: inline-block; background: #6366F1; color: white; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">● Trybel Backend Online</span>
            <h1>Trybel Campus API Gateway</h1>
            <p>Welcome to Trybel's Fastify backend service with PostgreSQL pooling, Cloudinary v2 asset storage, Jimp on-the-fly image processing, and multi-tenant college scoping.</p>
            
            <p><strong>Available API Endpoints:</strong></p>
            <ul>
              <li><span>Health & DB Status:</span> <a href="/health">GET /health</a></li>
              <li><span>Verified Colleges:</span> <a href="/api/colleges">GET /api/colleges</a></li>
              <li><span>Campus Catalog:</span> <a href="/api/catalog/products">GET /api/catalog/products</a></li>
              <li><span>Homepage Feed & Reels:</span> <a href="/api/feed/homepage">GET /api/feed/homepage</a></li>
            </ul>

            <p>To view the full 18-screen interactive mobile app interface:</p>
            <a class="btn" href="https://trybel.vercel.app" target="_blank">Open Trybel Web App &rarr;</a>
          </div>
        </body>
      </html>
    `);
  });

  // Health check & Colleges directory
  fastify.get('/health', async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: PostgresService.isDatabaseConnected() ? 'postgresql_active' : 'local_snapshot_cache_active'
  }));
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
  await fastify.register(mediaCatalogRoutes, { prefix: '/api' });

  return fastify;
}

async function start() {
  // Check PostgreSQL connection
  const pgHealthy = await PostgresService.checkConnection();
  if (pgHealthy) {
    console.log(' PostgreSQL Connection Pool active and healthy.');
  } else {
    console.log(' PostgreSQL is cold/migrating — local JSON snapshot cache (local-products-fallback.json, local-homepage-fallback.json) active for zero downtime.');
  }
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
