import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

export async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. Get notifications with category filter (All/Mentions/Team/Events)
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { category?: string } }>, reply: FastifyReply) => {
    const userId = request.user!.userId;
    const { category } = request.query;

    let notifs = db.notifications.filter(n => n.user_id === userId);

    if (category && category !== 'all') {
      if (category === 'team') {
        notifs = notifs.filter(n => n.category === 'team');
      } else if (category === 'events') {
        notifs = notifs.filter(n => n.category === 'event');
      } else if (category === 'mentions') {
        notifs = notifs.filter(n => n.category === 'chat' || n.category === 'friend');
      }
    }

    return reply.send({
      unread_count: notifs.filter(n => !n.read).length,
      data: notifs
    });
  });

  // 2. Mark notification as read
  fastify.put('/:id/read', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const notif = db.notifications.find(n => n.id === request.params.id && n.user_id === request.user!.userId);
    if (notif) {
      notif.read = true;
      db.save();
    }
    return reply.send({ success: true });
  });

  // 3. Mark all as read
  fastify.put('/read-all', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.userId;
    for (const n of db.notifications) {
      if (n.user_id === userId) {
        n.read = true;
      }
    }
    db.save();
    return reply.send({ success: true });
  });
}
