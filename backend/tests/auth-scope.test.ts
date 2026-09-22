import { describe, it, expect, beforeAll } from 'vitest';
import { buildApp } from '../src/server.js';
import { db } from '../src/db/db.js';
import { seedDatabase } from '../src/db/seed.js';

describe('Trybel Multi-Tenant College-Scoping & Security Test Suite', () => {
  let app: any;
  let stPetersToken: string;
  let apexToken: string;
  let moderatorToken: string;

  beforeAll(async () => {
    seedDatabase();
    app = await buildApp();

    // Generate JWT for St. Peter's Student (Sritan)
    const sritan = db.users.find(u => u.email === 'sritan@stpeters.edu')!;
    stPetersToken = app.jwt.sign({
      userId: sritan.id,
      collegeId: sritan.college_id,
      role: sritan.role,
      email: sritan.email
    });

    // Generate JWT for Apex Student (Rohan)
    const rohan = db.users.find(u => u.email === 'rohan@apex.edu')!;
    apexToken = app.jwt.sign({
      userId: rohan.id,
      collegeId: rohan.college_id,
      role: rohan.role,
      email: rohan.email
    });

    // Generate JWT for St. Peter's Moderator
    const mod = db.users.find(u => u.role === 'platform_moderator')!;
    moderatorToken = app.jwt.sign({
      userId: mod.id,
      collegeId: mod.college_id,
      role: mod.role,
      email: mod.email
    });
  });

  // 1. AUTH & VERIFICATION
  describe('1. Auth & College Domain Verification', () => {
    it('AUTH-01: Accepts valid verified college email domain', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/send-verification',
        payload: { email: 'student123@stpeters.edu' }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.success).toBe(true);
      expect(json.college.name).toContain("St. Peter's");
    });

    it('AUTH-03: Rejects unrecognized non-college email and routes to waitlist', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/send-verification',
        payload: { email: 'outsider@gmail.com' }
      });
      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.body);
      expect(json.error).toBe('UnrecognizedDomain');
      expect(json.waitlisted).toBe(true);
    });

    it('Verifies token and issues session JWT with college context', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/auth/verify',
        payload: { email: 'sritan@stpeters.edu', otp: '123456' }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.token).toBeDefined();
      expect(json.college.id).toBe('col_stpeters_01');
    });
  });

  // 2. STUDY PARTNER FINDER (HARD COLLEGE-ONLY)
  describe('2. Study Partner Finder (Strictly College-Only)', () => {
    it('St. Peter student only sees St. Peter study requests', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/study-partners',
        headers: { authorization: `Bearer ${stPetersToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.is_college_only).toBe(true);
      expect(json.data.length).toBeGreaterThan(0);
      for (const item of json.data) {
        expect(item.college_id).toBe('col_stpeters_01');
      }
    });

    it('Apex student cannot see St. Peter study requests', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/study-partners',
        headers: { authorization: `Bearer ${apexToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      // Apex has 0 study requests seeded
      expect(json.data.length).toBe(0);
    });

    it('Cross-college connection attempt is blocked with 403 Forbidden', async () => {
      const stPetersReq = db.studyRequests.find(r => r.college_id === 'col_stpeters_01')!;
      const res = await app.inject({
        method: 'POST',
        url: `/api/study-partners/${stPetersReq.id}/connect`,
        headers: { authorization: `Bearer ${apexToken}` },
        payload: { message: 'Can I join your study group?' }
      });
      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.body);
      expect(json.error).toBe('ForbiddenCrossCollege');
    });
  });

  // 3. HACKATHON TEAMS (DUAL VISIBILITY TOGGLE)
  describe('3. Hackathon Teams (Dual Visibility Scoping)', () => {
    it('St. Peter student sees both college_only and open_to_all teams from their college', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/teams',
        headers: { authorization: `Bearer ${stPetersToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      const visibilities = json.data.map((t: any) => t.visibility);
      expect(visibilities).toContain('college_only');
      expect(visibilities).toContain('open_to_all');
    });

    it('Apex student can discover open_to_all teams from St. Peter, but CANNOT discover college_only teams', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/teams',
        headers: { authorization: `Bearer ${apexToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      for (const team of json.data) {
        if (team.college_id !== 'col_apex_02') {
          expect(team.visibility).toBe('open_to_all');
        }
      }
    });

    it('Apex student cannot apply to college_only team from St. Peter', async () => {
      const collegeOnlyTeam = db.teams.find(t => t.college_id === 'col_stpeters_01' && t.visibility === 'college_only')!;
      const res = await app.inject({
        method: 'POST',
        url: `/api/teams/${collegeOnlyTeam.id}/apply`,
        headers: { authorization: `Bearer ${apexToken}` },
        payload: { message: 'I want to apply' }
      });
      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.body);
      expect(json.error).toBe('ForbiddenCollegeOnly');
    });
  });

  // 4. CLUBS & EVENTS (INDEPENDENT DUAL TOGGLES & FEEDBACK GATING)
  describe('4. Clubs & Events (Independent Toggles & Feedback Gating)', () => {
    it('Event with visibility: everyone is visible to Apex student', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/events',
        headers: { authorization: `Bearer ${apexToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      const titles = json.data.map((e: any) => e.title);
      expect(titles).toContain('Web Dev Workshop');
    });

    it('Event with visibility: college is NOT visible to Apex student', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/events',
        headers: { authorization: `Bearer ${apexToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      const titles = json.data.map((e: any) => e.title);
      expect(titles).not.toContain('Campus Photo Walk');
    });

    it('Event with registration_eligibility: college_only blocks Apex student from registering with 403', async () => {
      const collegeOnlyEvent = db.events.find(e => e.registration_eligibility === 'college_only')!;
      const res = await app.inject({
        method: 'POST',
        url: `/api/events/${collegeOnlyEvent.id}/register`,
        headers: { authorization: `Bearer ${apexToken}` }
      });
      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.body);
      expect(json.error).toBe('ForbiddenRegistration');
    });

    it('Event feedback endpoint returns 403 for non-registered user', async () => {
      const event = db.events.find(e => e.title === 'Web Dev Workshop')!;
      const res = await app.inject({
        method: 'GET',
        url: `/api/events/${event.id}/feedback`,
        headers: { authorization: `Bearer ${apexToken}` } // Apex student did not register
      });
      expect(res.statusCode).toBe(403);
      const json = JSON.parse(res.body);
      expect(json.error).toBe('FeedbackAccessDenied');
    });
  });

  // 5. FRIENDS & PHOTOS WITH PHOTO_AUDIENCES AND SIGNED EXPIRING URLS
  describe('5. Friends & Photo Sharing with photo_audiences & Signed URLs', () => {
    it('Photos return signed expiring URLs containing exp and signature', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/photos',
        headers: { authorization: `Bearer ${stPetersToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.data.length).toBeGreaterThan(0);
      const photo = json.data[0];
      expect(photo.signed_url).toContain('exp=');
      expect(photo.signed_url).toContain('sig=');
    });

    it('Non-friend student from Apex cannot access private photos', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/photos',
        headers: { authorization: `Bearer ${apexToken}` }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.data.length).toBe(0);
    });

    it('Unfriending immediately revokes photo access in photo_audiences', async () => {
      const sritan = db.users.find(u => u.email === 'sritan@stpeters.edu')!;
      const pranav = db.users.find(u => u.email === 'pranav@stpeters.edu')!;
      
      const unfriendRes = await app.inject({
        method: 'POST',
        url: `/api/friends/${pranav.id}/unfriend`,
        headers: { authorization: `Bearer ${stPetersToken}` }
      });
      expect(unfriendRes.statusCode).toBe(200);

      // Check photo_audiences revoked_at is populated
      const revokedEntry = db.photoAudiences.find(pa => pa.friend_id === pranav.id);
      expect(revokedEntry?.revoked_at).toBeDefined();
    });
  });

  // 6. PER-COLLEGE PARTITIONED CHATBOT
  describe('6. Per-College Partitioned Chatbot RAG', () => {
    it('Returns verified St. Peter information and cites source inline', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/chatbot/ask',
        headers: { authorization: `Bearer ${stPetersToken}` },
        payload: { message: 'When is the next internal exam for CSE?' }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      expect(json.response).toContain('22 Sep 2025');
      expect(json.cited_source).toContain("Academic Calendar (St. Peter's Engineering College)");
    });

    it('Apex student asking the same question receives their own partitioned college response or fallback', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/api/chatbot/ask',
        headers: { authorization: `Bearer ${apexToken}` },
        payload: { message: 'When is the next internal exam for CSE?' }
      });
      expect(res.statusCode).toBe(200);
      const json = JSON.parse(res.body);
      // Must NOT leak St. Peter's 22 Sep exam
      expect(json.response).not.toContain('St. Peter');
    });
  });

  // 7. MODERATION PIPELINE & ADMIN ACTIVITY LOGS
  describe('7. Moderation Pipeline & Audit Logging', () => {
    it('High-risk message is quarantined as hold_for_review and creates report', async () => {
      const thread = db.chatThreads[0];
      const res = await app.inject({
        method: 'POST',
        url: `/api/chat/threads/${thread.id}/messages`,
        headers: { authorization: `Bearer ${stPetersToken}` },
        payload: { content: 'I will hate and attack you with a bomb threat' }
      });
      expect(res.statusCode).toBe(202);
      const json = JSON.parse(res.body);
      expect(json.warning).toBeDefined();
      expect(json.data.moderation_status).toBe('hold_for_review');
    });

    it('Moderator action strictly writes to admin_activity_logs', async () => {
      const pendingReport = db.reports.find(r => r.status === 'pending')!;
      const initialLogsCount = db.adminActivityLogs.length;

      const res = await app.inject({
        method: 'POST',
        url: `/api/admin/reports/${pendingReport.id}/action`,
        headers: { authorization: `Bearer ${moderatorToken}` },
        payload: { action: 'warn_user', reason: 'User violated harassment policy' }
      });
      expect(res.statusCode).toBe(200);
      expect(db.adminActivityLogs.length).toBe(initialLogsCount + 1);
      const latestLog = db.adminActivityLogs[0];
      expect(latestLog.action).toBe('moderation_warn_user');
      expect(latestLog.target_object_id).toBe(pendingReport.target_id);
    });

    it('Club president verification strictly writes to admin_activity_logs', async () => {
      const club = db.clubs[0];
      const initialLogsCount = db.adminActivityLogs.length;

      const res = await app.inject({
        method: 'POST',
        url: `/api/admin/clubs/${club.id}/verify`,
        headers: { authorization: `Bearer ${moderatorToken}` },
        payload: { is_verified: true, reason: 'Dean approval verified' }
      });
      expect(res.statusCode).toBe(200);
      expect(db.adminActivityLogs.length).toBe(initialLogsCount + 1);
      const latestLog = db.adminActivityLogs[0];
      expect(latestLog.action).toBe('verify_club_president');
    });
  });
});
