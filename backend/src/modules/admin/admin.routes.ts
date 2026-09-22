import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { requireRoles } from '../../middleware/college-scope.middleware.js';
import { ModerationService } from '../moderation/moderation.service.js';

export async function adminRoutes(fastify: FastifyInstance) {
  // 1. Submit report (accessible to any authenticated student)
  fastify.post('/reports', { preHandler: [authenticateToken] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { target_type, target_id, reason, details } = (request.body || {}) as {
      target_type: 'user' | 'message' | 'photo' | 'event' | 'team' | 'study_request';
      target_id: string;
      reason: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other';
      details?: string;
    };

    if (!target_type || !target_id || !reason) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Target type, target id, and reason are required' });
    }

    const reportId = 'rep_' + uuidv4().substring(0, 8);
    const report = {
      id: reportId,
      reporter_id: request.user!.userId,
      reporter_college_id: request.user!.collegeId,
      target_type,
      target_id,
      reason,
      details: details || '',
      status: 'pending' as const,
      created_at: new Date().toISOString()
    };

    db.reports.unshift(report);
    db.save();

    return reply.status(201).send({
      success: true,
      message: 'Report submitted to campus trust & safety team.',
      reportId
    });
  });

  // ADMIN/MODERATOR ONLY ROUTES BELOW
  fastify.register(async (adminScope) => {
    adminScope.addHook('preHandler', authenticateToken);
    adminScope.addHook('preHandler', requireRoles(['platform_moderator', 'super_admin']));

    // 2. Get pending reports and queue stats
    adminScope.get('/reports', async (request: FastifyRequest, reply: FastifyReply) => {
      const pendingCount = db.reports.filter(r => r.status === 'pending').length;
      const flaggedPosts = db.messages.filter(m => m.moderation_status === 'flagged_auto' || m.moderation_status === 'hold_for_review').length;
      const flaggedUsers = db.users.filter(u => u.status === 'suspended').length;

      return reply.send({
        stats: {
          pendingReports: pendingCount,
          flaggedPosts,
          flaggedUsers
        },
        reports: db.reports
      });
    });

    // 3. Resolve report / moderation action (MUTATES + IMMUTABLY LOGS TO admin_activity_logs)
    adminScope.post('/reports/:id/action', async (request: FastifyRequest<{
      Params: { id: string };
      Body: {
        action: 'dismiss' | 'remove_content' | 'warn_user' | 'suspend_user';
        reason: string;
      }
    }>, reply: FastifyReply) => {
      const report = db.reports.find(r => r.id === request.params.id);
      if (!report) {
        return reply.status(404).send({ error: 'NotFound', message: 'Report not found' });
      }

      const { action, reason } = request.body || {};

      if (action === 'dismiss') {
        report.status = 'dismissed';
      } else {
        report.status = 'action_taken';

        if (action === 'remove_content') {
          if (report.target_type === 'message') {
            const msg = db.messages.find(m => m.id === report.target_id);
            if (msg) msg.moderation_status = 'removed';
          } else if (report.target_type === 'photo') {
            const photo = db.photos.find(p => p.id === report.target_id);
            if (photo) photo.moderation_status = 'removed';
          }
        } else if (action === 'suspend_user') {
          const usr = db.users.find(u => u.id === report.target_id);
          if (usr) usr.status = 'suspended';
        }
      }

      // STRICT AUDIT LOGGING: Write every moderator action to admin_activity_logs
      ModerationService.logAdminAction({
        actorId: request.user!.userId,
        actorCollegeId: request.user!.collegeId,
        action: `moderation_${action}`,
        targetObjectType: report.target_type,
        targetObjectId: report.target_id,
        reason: reason || `Action taken on report ${report.id}`,
        metadata: { reportId: report.id, action }
      });

      db.save();

      return reply.send({ success: true, message: `Report ${report.id} resolved with action '${action}'. Audit log recorded.` });
    });

    // 4. Verify club president (MUTATES + IMMUTABLY LOGS TO admin_activity_logs)
    adminScope.post('/clubs/:id/verify', async (request: FastifyRequest<{
      Params: { id: string };
      Body: { is_verified: boolean; reason?: string }
    }>, reply: FastifyReply) => {
      const club = db.clubs.find(c => c.id === request.params.id);
      if (!club) {
        return reply.status(404).send({ error: 'NotFound', message: 'Club not found' });
      }

      const { is_verified, reason } = request.body || {};
      club.is_verified = is_verified;

      // Update president user role if verifying
      const president = db.users.find(u => u.id === club.president_id);
      if (president && is_verified) {
        president.role = 'club_president';
      }

      // MANDATORY AUDIT LOG: Write to admin_activity_logs
      ModerationService.logAdminAction({
        actorId: request.user!.userId,
        actorCollegeId: request.user!.collegeId,
        action: is_verified ? 'verify_club_president' : 'suspend_club_president',
        targetObjectType: 'club',
        targetObjectId: club.id,
        reason: reason || 'Platform administrator verified club leadership credentials',
        metadata: { clubName: club.name, presidentId: club.president_id }
      });

      db.save();

      return reply.send({
        success: true,
        message: `Club ${club.name} verification status updated to ${is_verified}. Audit log recorded.`,
        club
      });
    });

    // 5. Get audit activity logs
    adminScope.get('/logs', async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({ total: db.adminActivityLogs.length, data: db.adminActivityLogs });
    });
  });
}
