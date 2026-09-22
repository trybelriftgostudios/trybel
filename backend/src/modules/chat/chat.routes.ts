import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { ModerationService } from '../moderation/moderation.service.js';

export async function chatRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. List user's accessible scoped threads
  fastify.get('/threads', async (request: FastifyRequest<{ Querystring: { type?: string } }>, reply: FastifyReply) => {
    const userId = request.user!.userId;
    const { type } = request.query;

    const myThreadMemberships = db.threadMembers.filter(tm => tm.user_id === userId);
    const myThreadIds = myThreadMemberships.map(tm => tm.thread_id);

    let threads = db.chatThreads.filter(th => myThreadIds.includes(th.id));

    if (type && type !== 'all') {
      if (type === 'friends') {
        threads = threads.filter(th => th.type === 'direct_friend');
      } else if (type === 'groups') {
        threads = threads.filter(th => th.type !== 'direct_friend');
      }
    }

    const enriched = threads.map(th => {
      const msgs = db.messages.filter(m => m.thread_id === th.id && m.moderation_status !== 'hold_for_review' && m.moderation_status !== 'removed');
      const lastMsg = msgs[msgs.length - 1];
      const memberCount = db.threadMembers.filter(tm => tm.thread_id === th.id).length;

      return {
        ...th,
        member_count: memberCount,
        last_message: lastMsg ? {
          content: lastMsg.content,
          sender_id: lastMsg.sender_id,
          created_at: lastMsg.created_at
        } : null
      };
    });

    return reply.send({ total: enriched.length, data: enriched });
  });

  // 2. Get messages in thread (enforces membership)
  fastify.get('/threads/:id/messages', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const threadId = request.params.id;
    const userId = request.user!.userId;

    const isMember = db.threadMembers.some(tm => tm.thread_id === threadId && tm.user_id === userId);
    if (!isMember) {
      return reply.status(403).send({ error: 'Forbidden', message: 'You are not a member of this scoped thread' });
    }

    // Filter out quarantined and removed messages unless viewed by author
    const messages = db.messages.filter(m => {
      if (m.thread_id !== threadId) return false;
      if (m.moderation_status === 'removed') return false;
      if (m.moderation_status === 'hold_for_review' && m.sender_id !== userId) return false;
      return true;
    });

    const enriched = messages.map(m => {
      const profile = db.profiles.find(p => p.user_id === m.sender_id);
      return {
        ...m,
        sender_name: profile?.full_name || 'Member',
        sender_avatar: profile?.avatar_url,
        is_mine: m.sender_id === userId
      };
    });

    return reply.send({ data: enriched });
  });

  // 3. Post message in thread (runs through automated moderation pipeline)
  fastify.post('/threads/:id/messages', async (request: FastifyRequest<{
    Params: { id: string };
    Body: { content: string }
  }>, reply: FastifyReply) => {
    const threadId = request.params.id;
    const userId = request.user!.userId;
    const { content } = request.body || {};

    if (!content || !content.trim()) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Message content is required' });
    }

    const thread = db.chatThreads.find(t => t.id === threadId);
    if (!thread) {
      return reply.status(404).send({ error: 'NotFound', message: 'Thread not found' });
    }

    const member = db.threadMembers.find(tm => tm.thread_id === threadId && tm.user_id === userId);
    if (!member) {
      return reply.status(403).send({ error: 'Forbidden', message: 'You are not a member of this scoped thread' });
    }

    // Club announcement channel: only admin can post!
    if (thread.type === 'club_announcements' && member.role !== 'admin') {
      return reply.status(403).send({
        error: 'ForbiddenAnnouncement',
        message: 'Only verified club administrators can post in campus announcement channels.'
      });
    }

    // Screening pipeline
    const modResult = ModerationService.screenText(content);

    const messageId = 'msg_' + uuidv4().substring(0, 8);
    const newMessage = {
      id: messageId,
      thread_id: threadId,
      sender_id: userId,
      content,
      moderation_status: modResult.status,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    db.messages.push(newMessage);

    // If quarantined or flagged, log and add to report queue
    if (modResult.status === 'hold_for_review' || modResult.status === 'flagged_auto') {
      db.reports.push({
        id: 'rep_' + uuidv4().substring(0, 8),
        reporter_id: 'system_automod',
        reporter_college_id: request.user!.collegeId,
        target_type: 'message',
        target_id: messageId,
        reason: 'inappropriate_content',
        details: `Automated detection: ${modResult.flaggedCategories.join(', ')} (score: ${modResult.highestScore.toFixed(2)})`,
        status: 'pending',
        created_at: new Date().toISOString()
      });
    }

    db.save();

    if (modResult.status === 'hold_for_review') {
      return reply.status(202).send({
        success: false,
        warning: 'Message held for moderation review due to sensitive content policy.',
        data: newMessage
      });
    }

    return reply.status(201).send({ success: true, data: newMessage });
  });
}
