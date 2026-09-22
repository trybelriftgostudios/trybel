import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

export async function chatbotRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. Ask question to per-college partitioned chatbot
  fastify.post('/ask', async (request: FastifyRequest<{ Body: { message: string } }>, reply: FastifyReply) => {
    const { message } = request.body || {};
    if (!message || !message.trim()) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Question message is required' });
    }

    const userCollegeId = request.user!.collegeId;
    const college = db.colleges.find(c => c.id === userCollegeId);

    // Hard partition filter: ONLY search knowledge sources from user's college!
    const collegeSources = db.chatbotSources.filter(s => s.college_id === userCollegeId);

    const queryLower = message.toLowerCase();
    let bestMatch = collegeSources.find(s => {
      const contentLower = s.content.toLowerCase();
      const titleLower = s.title.toLowerCase();
      return queryLower.split(' ').some(word => word.length > 3 && (contentLower.includes(word) || titleLower.includes(word)));
    });

    let botResponse = '';
    let citedSource = '';

    if (bestMatch) {
      botResponse = bestMatch.content;
      citedSource = `${bestMatch.source_name}`;
    } else {
      botResponse = `I could not find specific verified records regarding your question in the ${college?.name || 'campus'} directory. Please check the administrative help desk or department notice board.`;
    }

    const conversationId = 'cbc_' + uuidv4().substring(0, 8);
    db.chatbotConversations.push({
      id: conversationId,
      college_id: userCollegeId,
      user_id: request.user!.userId,
      message,
      bot_response: botResponse,
      cited_source: citedSource || undefined,
      created_at: new Date().toISOString()
    });
    db.save();

    return reply.send({
      conversation_id: conversationId,
      college_name: college?.name,
      response: botResponse,
      cited_source: citedSource || null,
      suggestions: [
        'When is the next internal exam for CSE?',
        'Where is the CSE department?',
        'How to register for events?',
        'View Academic Calendar'
      ]
    });
  });

  // 2. Feedback on bot answer
  fastify.post('/feedback', async (request: FastifyRequest<{ Body: { conversation_id: string; helpful: boolean } }>, reply: FastifyReply) => {
    const { conversation_id, helpful } = request.body || {};
    const conv = db.chatbotConversations.find(c => c.id === conversation_id);
    if (conv) {
      conv.helpful_rating = helpful;
      db.save();
    }
    return reply.send({ success: true, message: 'Thank you for your feedback' });
  });
}
