import fs from 'fs';
import path from 'path';
import {
  College,
  User,
  Profile,
  StudyRequest,
  StudyMatch,
  Team,
  TeamMember,
  TeamApplication,
  Club,
  Event,
  EventRegistration,
  EventFeedback,
  ChatThread,
  ThreadMember,
  Message,
  Friendship,
  Photo,
  PhotoAudience,
  Challenge,
  ChallengeResult,
  ChatbotSource,
  ChatbotConversation,
  Notification,
  Report,
  AdminActivityLog
} from '../types/index.js';

export interface DatabaseState {
  colleges: College[];
  users: User[];
  profiles: Profile[];
  verification_tokens: Array<{
    id: string;
    email: string;
    college_id: string;
    token_hash: string;
    expires_at: string;
    type: 'magic_link' | 'otp';
    used_at?: string;
  }>;
  study_requests: StudyRequest[];
  study_matches: Array<{
    id: string;
    college_id: string;
    request_id: string;
    sender_id: string;
    recipient_id: string;
    status: 'pending' | 'accepted' | 'declined';
    thread_id?: string;
    created_at: string;
  }>;
  teams: Team[];
  team_members: TeamMember[];
  team_applications: TeamApplication[];
  clubs: Club[];
  club_admin_roles: Array<{
    id: string;
    club_id: string;
    user_id: string;
    role: 'president' | 'officer';
    assigned_by: string;
    created_at: string;
  }>;
  events: Event[];
  event_registrations: EventRegistration[];
  event_feedback: EventFeedback[];
  chat_threads: ChatThread[];
  thread_members: ThreadMember[];
  messages: Message[];
  friendships: Friendship[];
  photos: Photo[];
  photo_audiences: PhotoAudience[];
  challenges: Challenge[];
  challenge_results: ChallengeResult[];
  chatbot_sources: ChatbotSource[];
  chatbot_conversations: ChatbotConversation[];
  notifications: Notification[];
  reports: Report[];
  admin_activity_logs: AdminActivityLog[];
}

export class Database {
  private state: DatabaseState;
  private persistencePath?: string;

  constructor(persistencePath?: string) {
    this.persistencePath = persistencePath;
    this.state = this.getEmptyState();
    if (this.persistencePath && fs.existsSync(this.persistencePath)) {
      try {
        const data = fs.readFileSync(this.persistencePath, 'utf8');
        this.state = { ...this.getEmptyState(), ...JSON.parse(data) };
      } catch (err) {
        console.warn('Could not read existing database persistence file, starting fresh:', err);
      }
    }
  }

  private getEmptyState(): DatabaseState {
    return {
      colleges: [],
      users: [],
      profiles: [],
      verification_tokens: [],
      study_requests: [],
      study_matches: [],
      teams: [],
      team_members: [],
      team_applications: [],
      clubs: [],
      club_admin_roles: [],
      events: [],
      event_registrations: [],
      event_feedback: [],
      chat_threads: [],
      thread_members: [],
      messages: [],
      friendships: [],
      photos: [],
      photo_audiences: [],
      challenges: [],
      challenge_results: [],
      chatbot_sources: [],
      chatbot_conversations: [],
      notifications: [],
      reports: [],
      admin_activity_logs: []
    };
  }

  public save(): void {
    if (this.persistencePath) {
      const dir = path.dirname(this.persistencePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.persistencePath, JSON.stringify(this.state, null, 2), 'utf8');
    }
  }

  public reset(): void {
    this.state = this.getEmptyState();
    this.save();
  }

  // Getters for all tables
  public get colleges() { return this.state.colleges; }
  public get users() { return this.state.users; }
  public get profiles() { return this.state.profiles; }
  public get verificationTokens() { return this.state.verification_tokens; }
  public get studyRequests() { return this.state.study_requests; }
  public get studyMatches() { return this.state.study_matches; }
  public get teams() { return this.state.teams; }
  public get teamMembers() { return this.state.team_members; }
  public get teamApplications() { return this.state.team_applications; }
  public get clubs() { return this.state.clubs; }
  public get clubAdminRoles() { return this.state.club_admin_roles; }
  public get events() { return this.state.events; }
  public get eventRegistrations() { return this.state.event_registrations; }
  public get eventFeedback() { return this.state.event_feedback; }
  public get chatThreads() { return this.state.chat_threads; }
  public get threadMembers() { return this.state.thread_members; }
  public get messages() { return this.state.messages; }
  public get friendships() { return this.state.friendships; }
  public get photos() { return this.state.photos; }
  public get photoAudiences() { return this.state.photo_audiences; }
  public get challenges() { return this.state.challenges; }
  public get challengeResults() { return this.state.challenge_results; }
  public get chatbotSources() { return this.state.chatbot_sources; }
  public get chatbotConversations() { return this.state.chatbot_conversations; }
  public get notifications() { return this.state.notifications; }
  public get reports() { return this.state.reports; }
  public get adminActivityLogs() { return this.state.admin_activity_logs; }
}

// Global singleton instance
const dbPath = process.env.DB_FILE || path.join(process.cwd(), 'data', 'trybel_dev.json');
export const db = new Database(dbPath);
