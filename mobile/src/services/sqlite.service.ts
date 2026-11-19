import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

export interface OfflinePost {
  id: string;
  college_id: string;
  author_name: string;
  author_role: string;
  avatar_url: string;
  content: string;
  tags_json: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface OfflineStudyRequest {
  id: string;
  college_id: string;
  subject: string;
  goal_description: string;
  preferred_mode: string;
  availability_slot: string;
  looking_for: string;
  requester_name: string;
  created_at: string;
}

export interface OfflineTeam {
  id: string;
  college_id: string;
  title: string;
  project_name: string;
  description: string;
  required_skills_json: string;
  team_size_target: number;
  members_count: number;
  visibility: string;
  creator_name: string;
}

export interface OfflineEvent {
  id: string;
  college_id: string;
  club_name: string;
  title: string;
  description: string;
  start_time: string;
  location: string;
  visibility: string;
  registration_eligibility: string;
  attendees_count: number;
  is_registered: number;
}

class SQLiteService {
  private db: any = null;
  private isInitialized = false;
  private inMemoryStore: Record<string, any[]> = {
    offline_posts: [],
    offline_study_requests: [],
    offline_teams: [],
    offline_events: [],
    local_settings: []
  };

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    if (Platform.OS === 'web') {
      this.isInitialized = true;
      this.seedInMemoryDefaults();
      return;
    }

    try {
      this.db = SQLite.openDatabaseSync('trybel_local.db');

      // Create Tables
      this.db.execSync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS offline_posts (
          id TEXT PRIMARY KEY,
          college_id TEXT NOT NULL,
          author_name TEXT NOT NULL,
          author_role TEXT,
          avatar_url TEXT,
          content TEXT NOT NULL,
          tags_json TEXT,
          likes_count INTEGER DEFAULT 0,
          comments_count INTEGER DEFAULT 0,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS offline_study_requests (
          id TEXT PRIMARY KEY,
          college_id TEXT NOT NULL,
          subject TEXT NOT NULL,
          goal_description TEXT NOT NULL,
          preferred_mode TEXT,
          availability_slot TEXT,
          looking_for TEXT,
          requester_name TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS offline_teams (
          id TEXT PRIMARY KEY,
          college_id TEXT NOT NULL,
          title TEXT NOT NULL,
          project_name TEXT,
          description TEXT,
          required_skills_json TEXT,
          team_size_target INTEGER DEFAULT 4,
          members_count INTEGER DEFAULT 1,
          visibility TEXT DEFAULT 'college_only',
          creator_name TEXT
        );

        CREATE TABLE IF NOT EXISTS offline_events (
          id TEXT PRIMARY KEY,
          college_id TEXT NOT NULL,
          club_name TEXT,
          title TEXT NOT NULL,
          description TEXT,
          start_time TEXT,
          location TEXT,
          visibility TEXT DEFAULT 'college',
          registration_eligibility TEXT DEFAULT 'college_only',
          attendees_count INTEGER DEFAULT 0,
          is_registered INTEGER DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS local_settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);

      this.isInitialized = true;
      await this.ensureSeedData();
    } catch (err: any) {
      console.warn('[SQLite] Fallback to in-memory store:', err.message);
      this.isInitialized = true;
      this.seedInMemoryDefaults();
    }
  }

  private seedInMemoryDefaults(): void {
    if (this.inMemoryStore.offline_posts.length === 0) {
      this.inMemoryStore.offline_posts = [
        {
          id: 'post_1',
          college_id: 'col_stpeters_01',
          author_name: '@varundulam',
          author_role: 'CSE • 3rd Year',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
          content: 'Looking for 2 more team members for Smart India Hackathon (SIH 2025)! Open to cross-college collaborators.',
          tags_json: JSON.stringify(['#Hackathon', '#Team', 'Open to other colleges']),
          likes_count: 42,
          comments_count: 12,
          created_at: new Date().toISOString()
        },
        {
          id: 'post_2',
          college_id: 'col_stpeters_01',
          author_name: 'GDSC Lead',
          author_role: 'Google Developer Student Clubs',
          avatar_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200',
          content: 'Modern Full-Stack Expo + Fastify workshop this Saturday! Register via the Clubs & Events tab.',
          tags_json: JSON.stringify(['#Workshop', '#WebDev', '#GDSC']),
          likes_count: 88,
          comments_count: 24,
          created_at: new Date().toISOString()
        }
      ];
    }
  }

  private async ensureSeedData(): Promise<void> {
    if (!this.db) return;
    try {
      const existing = this.db.getFirstSync('SELECT COUNT(*) as cnt FROM offline_posts') as { cnt: number } | null;
      if (!existing || existing.cnt === 0) {
        this.db.runSync(
          `INSERT INTO offline_posts (id, college_id, author_name, author_role, avatar_url, content, tags_json, likes_count, comments_count, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'post_1',
            'col_stpeters_01',
            '@varundulam',
            'CSE • 3rd Year',
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
            'Looking for 2 more team members for Smart India Hackathon (SIH 2025)! Open to cross-college collaborators.',
            JSON.stringify(['#Hackathon', '#Team', 'Open to other colleges']),
            42,
            12,
            new Date().toISOString()
          ]
        );

        this.db.runSync(
          `INSERT INTO offline_posts (id, college_id, author_name, author_role, avatar_url, content, tags_json, likes_count, comments_count, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'post_2',
            'col_stpeters_01',
            'GDSC Lead',
            'Google Developer Student Clubs',
            'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200',
            'Modern Full-Stack Expo + Fastify workshop this Saturday! Register via the Clubs & Events tab.',
            JSON.stringify(['#Workshop', '#WebDev', '#GDSC']),
            88,
            24,
            new Date().toISOString()
          ]
        );

        // Seed study request
        this.db.runSync(
          `INSERT INTO offline_study_requests (id, college_id, subject, goal_description, preferred_mode, availability_slot, looking_for, requester_name, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'req_1',
            'col_stpeters_01',
            'Machine Learning (CS601)',
            'Prepare for end-sems and implement transformers from scratch.',
            'offline',
            'Evenings (6 PM - 8 PM)',
            'one_partner',
            'Sana Khan',
            new Date().toISOString()
          ]
        );

        // Seed team
        this.db.runSync(
          `INSERT INTO offline_teams (id, college_id, title, project_name, description, required_skills_json, team_size_target, members_count, visibility, creator_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'team_sih_01',
            'col_stpeters_01',
            'Smart India Hackathon (SIH 2025)',
            'Campus AgriTech AI',
            'Building precision agriculture pipeline with computer vision and IoT.',
            JSON.stringify(['Python', 'Computer Vision', 'React Native', 'IoT']),
            6,
            4,
            'open_to_all',
            'Varun Dulam'
          ]
        );

        // Seed event
        this.db.runSync(
          `INSERT INTO offline_events (id, college_id, club_name, title, description, start_time, location, visibility, registration_eligibility, attendees_count, is_registered)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            'evt_webdev_01',
            'col_stpeters_01',
            'GDSC',
            'Modern Full-Stack Development Workshop',
            'Hands-on session on React Native, Expo, and Fastify microservices.',
            '2026-11-20T10:00:00Z',
            'Seminar Hall 3',
            'everyone',
            'cross_college',
            140,
            1
          ]
        );
      }
    } catch (err: any) {
      console.warn('[SQLite Seed] Warning:', err.message);
    }
  }

  // --- POSTS ---
  public async getPosts(): Promise<OfflinePost[]> {
    await this.init();
    if (this.db) {
      try {
        return this.db.getAllSync('SELECT * FROM offline_posts ORDER BY created_at DESC') as OfflinePost[];
      } catch {
        return this.inMemoryStore.offline_posts;
      }
    }
    return this.inMemoryStore.offline_posts;
  }

  public async insertPost(post: OfflinePost): Promise<void> {
    await this.init();
    if (this.db) {
      try {
        this.db.runSync(
          `INSERT OR REPLACE INTO offline_posts (id, college_id, author_name, author_role, avatar_url, content, tags_json, likes_count, comments_count, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            post.id,
            post.college_id,
            post.author_name,
            post.author_role,
            post.avatar_url,
            post.content,
            post.tags_json,
            post.likes_count,
            post.comments_count,
            post.created_at
          ]
        );
        return;
      } catch {}
    }
    const idx = this.inMemoryStore.offline_posts.findIndex(p => p.id === post.id);
    if (idx >= 0) this.inMemoryStore.offline_posts[idx] = post;
    else this.inMemoryStore.offline_posts.unshift(post);
  }

  // --- STUDY REQUESTS ---
  public async getStudyRequests(): Promise<OfflineStudyRequest[]> {
    await this.init();
    if (this.db) {
      try {
        return this.db.getAllSync('SELECT * FROM offline_study_requests ORDER BY created_at DESC') as OfflineStudyRequest[];
      } catch {
        return this.inMemoryStore.offline_study_requests;
      }
    }
    return this.inMemoryStore.offline_study_requests;
  }

  public async insertStudyRequest(req: OfflineStudyRequest): Promise<void> {
    await this.init();
    if (this.db) {
      try {
        this.db.runSync(
          `INSERT OR REPLACE INTO offline_study_requests (id, college_id, subject, goal_description, preferred_mode, availability_slot, looking_for, requester_name, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            req.id,
            req.college_id,
            req.subject,
            req.goal_description,
            req.preferred_mode,
            req.availability_slot,
            req.looking_for,
            req.requester_name,
            req.created_at
          ]
        );
        return;
      } catch {}
    }
    this.inMemoryStore.offline_study_requests.unshift(req);
  }

  // --- TEAMS ---
  public async getTeams(): Promise<OfflineTeam[]> {
    await this.init();
    if (this.db) {
      try {
        return this.db.getAllSync('SELECT * FROM offline_teams ORDER BY id DESC') as OfflineTeam[];
      } catch {
        return this.inMemoryStore.offline_teams;
      }
    }
    return this.inMemoryStore.offline_teams;
  }

  public async insertTeam(team: OfflineTeam): Promise<void> {
    await this.init();
    if (this.db) {
      try {
        this.db.runSync(
          `INSERT OR REPLACE INTO offline_teams (id, college_id, title, project_name, description, required_skills_json, team_size_target, members_count, visibility, creator_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            team.id,
            team.college_id,
            team.title,
            team.project_name,
            team.description,
            team.required_skills_json,
            team.team_size_target,
            team.members_count,
            team.visibility,
            team.creator_name
          ]
        );
        return;
      } catch {}
    }
    this.inMemoryStore.offline_teams.unshift(team);
  }

  // --- EVENTS ---
  public async getEvents(): Promise<OfflineEvent[]> {
    await this.init();
    if (this.db) {
      try {
        return this.db.getAllSync('SELECT * FROM offline_events ORDER BY start_time ASC') as OfflineEvent[];
      } catch {
        return this.inMemoryStore.offline_events;
      }
    }
    return this.inMemoryStore.offline_events;
  }

  // --- SETTINGS KEY/VALUE ---
  public async getSetting(key: string, defaultValue = ''): Promise<string> {
    await this.init();
    if (this.db) {
      try {
        const row = this.db.getFirstSync('SELECT value FROM local_settings WHERE key = ?', [key]) as { value: string } | null;
        return row ? row.value : defaultValue;
      } catch {
        const item = this.inMemoryStore.local_settings.find((s: any) => s.key === key);
        return item ? item.value : defaultValue;
      }
    }
    const item = this.inMemoryStore.local_settings.find((s: any) => s.key === key);
    return item ? item.value : defaultValue;
  }

  public async setSetting(key: string, value: string): Promise<void> {
    await this.init();
    const now = new Date().toISOString();
    if (this.db) {
      try {
        this.db.runSync(
          'INSERT OR REPLACE INTO local_settings (key, value, updated_at) VALUES (?, ?, ?)',
          [key, value, now]
        );
        return;
      } catch {}
    }
    const idx = this.inMemoryStore.local_settings.findIndex((s: any) => s.key === key);
    if (idx >= 0) this.inMemoryStore.local_settings[idx] = { key, value, updated_at: now };
    else this.inMemoryStore.local_settings.push({ key, value, updated_at: now });
  }

  // --- EXPORT DATABASE DUMP AS JSON ---
  public async exportFullBackup(): Promise<string> {
    const posts = await this.getPosts();
    const studyRequests = await this.getStudyRequests();
    const teams = await this.getTeams();
    const events = await this.getEvents();

    const backupData = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      platform: Platform.OS,
      tables: {
        posts,
        studyRequests,
        teams,
        events
      }
    };

    return JSON.stringify(backupData, null, 2);
  }

  // --- RESTORE DATABASE DUMP FROM JSON ---
  public async restoreFullBackup(jsonString: string): Promise<{ success: boolean; count: number }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.tables) throw new Error('Invalid backup schema');

      let restoredCount = 0;
      if (Array.isArray(parsed.tables.posts)) {
        for (const p of parsed.tables.posts) {
          await this.insertPost(p);
          restoredCount++;
        }
      }
      if (Array.isArray(parsed.tables.studyRequests)) {
        for (const req of parsed.tables.studyRequests) {
          await this.insertStudyRequest(req);
          restoredCount++;
        }
      }
      if (Array.isArray(parsed.tables.teams)) {
        for (const t of parsed.tables.teams) {
          await this.insertTeam(t);
          restoredCount++;
        }
      }

      return { success: true, count: restoredCount };
    } catch (err: any) {
      throw new Error(`Failed to restore backup: ${err.message}`);
    }
  }
}

export const sqliteService = new SQLiteService();
