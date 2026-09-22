import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';

export async function challengeRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. List active campus challenges
  fastify.get('/', async (request: FastifyRequest<{ Querystring: { myChallenges?: string } }>, reply: FastifyReply) => {
    const userCollegeId = request.user!.collegeId;
    const userId = request.user!.userId;
    const { myChallenges } = request.query;

    let challenges = db.challenges.filter(c => c.college_id === userCollegeId && c.active);

    const userResults = db.challengeResults.filter(cr => cr.user_id === userId);
    const completedChallengeIds = userResults.map(cr => cr.challenge_id);

    if (myChallenges === 'true') {
      challenges = challenges.filter(c => completedChallengeIds.includes(c.id));
    }

    const enriched = challenges.map(c => {
      const myResult = userResults.find(r => r.challenge_id === c.id);
      return {
        ...c,
        is_completed: !!myResult,
        my_score: myResult ? myResult.score : null
      };
    });

    return reply.send({ total: enriched.length, data: enriched });
  });

  // 2. Submit daily puzzle answer
  fastify.post('/:id/submit', async (request: FastifyRequest<{
    Params: { id: string };
    Body: { selected_option: number; completion_time_seconds?: number }
  }>, reply: FastifyReply) => {
    const challenge = db.challenges.find(c => c.id === request.params.id);
    if (!challenge) {
      return reply.status(404).send({ error: 'NotFound', message: 'Challenge not found' });
    }

    const { selected_option, completion_time_seconds } = request.body || {};
    const userId = request.user!.userId;

    // Check if already completed
    let existing = db.challengeResults.find(r => r.challenge_id === challenge.id && r.user_id === userId);
    if (existing) {
      return reply.status(400).send({ error: 'AlreadyCompleted', message: 'You have already submitted today’s puzzle!' });
    }

    const isCorrect = selected_option === 1 || selected_option === 2; // sample deterministic answer check
    const score = isCorrect ? 100 : 25;

    const result = {
      id: 'cr_' + uuidv4().substring(0, 8),
      challenge_id: challenge.id,
      user_id: userId,
      college_id: request.user!.collegeId,
      selected_option: selected_option || 0,
      is_correct: isCorrect,
      score,
      completion_time_seconds: completion_time_seconds || 45,
      completed_at: new Date().toISOString()
    };

    db.challengeResults.push(result);
    challenge.participant_count += 1;
    db.save();

    return reply.send({
      success: true,
      result,
      explanation: challenge.puzzle_data.explanation
    });
  });
}
