import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { canViewTeam } from '../../middleware/college-scope.middleware.js';
import { ModerationService } from '../moderation/moderation.service.js';

export async function teamRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. List teams: filter by scope (same college OR open_to_all)
  fastify.get('/', async (request: FastifyRequest<{
    Querystring: { filter?: 'all' | 'my_college' | 'open_to_all'; search?: string; myTeams?: string }
  }>, reply: FastifyReply) => {
    const userCollegeId = request.user!.collegeId;
    const userId = request.user!.userId;
    const { filter, search, myTeams } = request.query;

    let teams = db.teams.filter(t => canViewTeam(t, userCollegeId));

    if (myTeams === 'true') {
      const myTeamIds = db.teamMembers.filter(tm => tm.user_id === userId).map(tm => tm.team_id);
      teams = teams.filter(t => myTeamIds.includes(t.id) || t.creator_id === userId);
    } else {
      if (filter === 'my_college') {
        teams = teams.filter(t => t.college_id === userCollegeId);
      } else if (filter === 'open_to_all') {
        teams = teams.filter(t => t.visibility === 'open_to_all');
      }
    }

    if (search) {
      const q = search.toLowerCase();
      teams = teams.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.project_name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.required_skills.some(s => s.toLowerCase().includes(q))
      );
    }

    const enriched = teams.map(t => {
      const creatorProfile = db.profiles.find(p => p.user_id === t.creator_id);
      const creatorCollege = db.colleges.find(c => c.id === t.college_id);
      const members = db.teamMembers.filter(tm => tm.team_id === t.id);
      return {
        ...t,
        creator: {
          id: t.creator_id,
          name: creatorProfile?.full_name || 'Creator',
          college_name: creatorCollege?.name || 'Partner College',
          college_id: t.college_id,
          is_same_college: t.college_id === userCollegeId
        },
        members_count: members.length
      };
    });

    return reply.send({
      total: enriched.length,
      data: enriched
    });
  });

  // 2. Create team listing with dual visibility toggle
  fastify.post('/', async (request: FastifyRequest<{
    Body: {
      title: string;
      project_name: string;
      description: string;
      required_skills: string[];
      team_size_target?: number;
      deadline?: string;
      visibility: 'college_only' | 'open_to_all';
    }
  }>, reply: FastifyReply) => {
    const { title, project_name, description, required_skills, team_size_target, deadline, visibility } = request.body || {};
    
    if (!title || !description || !visibility) {
      return reply.status(400).send({ error: 'ValidationError', message: 'Title, description, and visibility setting are required' });
    }

    // Run moderation screening on title and description
    const modResult = ModerationService.screenText(`${title} ${description}`);
    if (modResult.status === 'hold_for_review') {
      return reply.status(400).send({
        error: 'ContentFlagged',
        message: 'Your team listing could not be published because it triggered our safety guidelines.'
      });
    }

    const teamId = 'team_' + uuidv4().substring(0, 8);
    const newTeam = {
      id: teamId,
      college_id: request.user!.collegeId,
      creator_id: request.user!.userId,
      title,
      project_name: project_name || title,
      description,
      required_skills: required_skills || [],
      team_size_target: team_size_target || 4,
      current_members_count: 1,
      deadline: deadline || 'Open',
      visibility, // Dual visibility toggle: 'college_only' or 'open_to_all'
      status: 'recruiting' as const,
      created_at: new Date().toISOString()
    };

    db.teams.unshift(newTeam);

    // Add creator as team leader
    db.teamMembers.push({
      id: 'tm_' + uuidv4().substring(0, 8),
      team_id: teamId,
      user_id: request.user!.userId,
      college_id: request.user!.collegeId,
      role: 'leader',
      joined_at: new Date().toISOString()
    });

    // Create scoped team chat thread
    const threadId = 'th_team_' + uuidv4().substring(0, 8);
    db.chatThreads.push({
      id: threadId,
      type: 'team',
      title: `Team: ${newTeam.title}`,
      entity_id: teamId,
      created_at: new Date().toISOString()
    });

    db.threadMembers.push({
      id: 'thm_' + uuidv4().substring(0, 8),
      thread_id: threadId,
      user_id: request.user!.userId,
      college_id: request.user!.collegeId,
      role: 'admin'
    });

    db.save();

    return reply.status(201).send({
      success: true,
      data: newTeam
    });
  });

  // 3. Apply to join team (Enforces scoping: if college_only, only same-college allowed)
  fastify.post('/:id/apply', async (request: FastifyRequest<{ Params: { id: string }; Body: { message?: string } }>, reply: FastifyReply) => {
    const team = db.teams.find(t => t.id === request.params.id);
    if (!team) {
      return reply.status(404).send({ error: 'NotFound', message: 'Team listing not found' });
    }

    const userCollegeId = request.user!.collegeId;
    const isSameCollege = team.college_id === userCollegeId;

    if (!isSameCollege && team.visibility === 'college_only') {
      return reply.status(403).send({
        error: 'ForbiddenCollegeOnly',
        message: 'This team is college-only and does not accept applications from other colleges.'
      });
    }

    // Check if already a member or already applied
    const isMember = db.teamMembers.some(tm => tm.team_id === team.id && tm.user_id === request.user!.userId);
    if (isMember) {
      return reply.status(400).send({ error: 'AlreadyMember', message: 'You are already a member of this team' });
    }

    const application = {
      id: 'app_' + uuidv4().substring(0, 8),
      team_id: team.id,
      applicant_id: request.user!.userId,
      applicant_college_id: userCollegeId,
      message: request.body?.message || 'I would love to join your team!',
      status: 'pending' as const,
      created_at: new Date().toISOString()
    };

    db.teamApplications.push(application);

    // Notify team owner (with applicant college affiliation clearly visible per PRD 6.3)
    const applicantCollege = db.colleges.find(c => c.id === userCollegeId);
    const applicantProfile = db.profiles.find(p => p.user_id === request.user!.userId);

    db.notifications.push({
      id: 'notif_' + uuidv4().substring(0, 8),
      user_id: team.creator_id,
      college_id: team.college_id,
      category: 'team',
      title: 'New Team Application',
      body: `${applicantProfile?.full_name || 'A student'} from ${applicantCollege?.name || 'partner campus'} applied to ${team.title}.`,
      deep_link_screen: 'Teams',
      read: false,
      created_at: 'Just now'
    });

    db.save();

    return reply.send({
      success: true,
      message: 'Application submitted successfully to team leader',
      application
    });
  });

  // 4. View team applications (Team owner only)
  fastify.get('/:id/applications', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const team = db.teams.find(t => t.id === request.params.id);
    if (!team) {
      return reply.status(404).send({ error: 'NotFound', message: 'Team not found' });
    }
    if (team.creator_id !== request.user!.userId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Only team leader can view applications' });
    }

    const apps = db.teamApplications.filter(a => a.team_id === team.id);
    const enriched = apps.map(a => {
      const prof = db.profiles.find(p => p.user_id === a.applicant_id);
      const col = db.colleges.find(c => c.id === a.applicant_college_id);
      return {
        ...a,
        applicant: {
          id: a.applicant_id,
          name: prof?.full_name || 'Applicant',
          avatar_url: prof?.avatar_url,
          college_id: a.applicant_college_id,
          college_name: col?.name,
          skills: prof?.skills || []
        }
      };
    });

    return reply.send({ data: enriched });
  });

  // 5. Accept team applicant
  fastify.post('/:id/applications/:appId/accept', async (request: FastifyRequest<{ Params: { id: string; appId: string } }>, reply: FastifyReply) => {
    const team = db.teams.find(t => t.id === request.params.id);
    if (!team || team.creator_id !== request.user!.userId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Only team leader can accept applications' });
    }

    const application = db.teamApplications.find(a => a.id === request.params.appId && a.team_id === team.id);
    if (!application) {
      return reply.status(404).send({ error: 'NotFound', message: 'Application not found' });
    }

    application.status = 'accepted';

    // Add to members
    db.teamMembers.push({
      id: 'tm_' + uuidv4().substring(0, 8),
      team_id: team.id,
      user_id: application.applicant_id,
      college_id: application.applicant_college_id,
      role: 'member',
      joined_at: new Date().toISOString()
    });

    team.current_members_count = db.teamMembers.filter(m => m.team_id === team.id).length;

    // Add to scoped team chat thread
    const teamThread = db.chatThreads.find(th => th.entity_id === team.id && th.type === 'team');
    if (teamThread) {
      db.threadMembers.push({
        id: 'thm_' + uuidv4().substring(0, 8),
        thread_id: teamThread.id,
        user_id: application.applicant_id,
        college_id: application.applicant_college_id,
        role: 'member'
      });
    }

    // Notify applicant
    db.notifications.push({
      id: 'notif_' + uuidv4().substring(0, 8),
      user_id: application.applicant_id,
      college_id: application.applicant_college_id,
      category: 'team',
      title: 'Application Accepted! 🎉',
      body: `You were accepted into the team "${team.title}". You now have access to the team chat!`,
      deep_link_screen: 'Teams',
      read: false,
      created_at: 'Just now'
    });

    db.save();

    return reply.send({ success: true, message: 'Applicant accepted and added to team workspace' });
  });
}
