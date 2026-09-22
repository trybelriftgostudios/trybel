export type UserRole = 'student' | 'club_president' | 'platform_moderator' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

export interface College {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  college_id: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
  status: UserStatus;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  college_id: string;
  full_name: string;
  avatar_url?: string;
  department?: string;
  year_of_study?: string;
  about?: string;
  motto?: string;
  skills: string[];
  interests: string[];
  available_for: string[];
  created_at: string;
  updated_at: string;
}

export interface StudyRequest {
  id: string;
  college_id: string;
  user_id: string;
  subject: string;
  goal_description: string;
  preferred_mode: 'online' | 'offline' | 'either';
  availability_slot: string;
  looking_for: 'one_partner' | 'small_group';
  status: 'active' | 'paused' | 'matched' | 'closed';
  created_at: string;
}

export interface StudyMatch {
  id: string;
  college_id: string;
  request_id: string;
  sender_id: string;
  recipient_id: string;
  status: 'pending' | 'accepted' | 'declined';
  thread_id?: string;
  created_at: string;
}

export interface Team {
  id: string;
  college_id: string;
  creator_id: string;
  title: string;
  project_name: string;
  description: string;
  required_skills: string[];
  team_size_target: number;
  current_members_count: number;
  deadline?: string;
  visibility: 'college_only' | 'open_to_all';
  status: 'recruiting' | 'complete' | 'closed';
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  college_id: string;
  role: 'leader' | 'member';
  joined_at: string;
}

export interface TeamApplication {
  id: string;
  team_id: string;
  applicant_id: string;
  applicant_college_id: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Club {
  id: string;
  college_id: string;
  name: string;
  category: string;
  description: string;
  logo_url?: string;
  president_id: string;
  is_verified: boolean;
  member_count: number;
  created_at: string;
}

export interface Event {
  id: string;
  college_id: string;
  club_id: string;
  title: string;
  description: string;
  start_time: string;
  end_time?: string;
  location: string;
  meeting_link?: string;
  capacity?: number;
  visibility: 'college' | 'everyone';
  registration_eligibility: 'college_only' | 'cross_college';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  created_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  college_id: string;
  status: 'registered' | 'cancelled' | 'attended';
  registered_at: string;
}

export interface EventFeedback {
  id: string;
  event_id: string;
  user_id: string;
  college_id: string;
  rating: number; // 1-5
  feedback_text: string;
  created_at: string;
}

export interface ChatThread {
  id: string;
  college_id?: string;
  type: 'direct_friend' | 'team' | 'event' | 'study_match' | 'club_announcements';
  title: string;
  entity_id?: string;
  created_at: string;
}

export interface ThreadMember {
  id: string;
  thread_id: string;
  user_id: string;
  college_id: string;
  role: 'admin' | 'member';
  last_read_at?: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  attachment_url?: string;
  moderation_status: 'clean' | 'hold_for_review' | 'flagged_auto' | 'flagged_user' | 'removed';
  created_at: string;
}

export interface Friendship {
  id: string;
  college_id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  college_id: string;
  s3_key: string;
  caption?: string;
  moderation_status: 'clean' | 'hold_for_review' | 'flagged_auto' | 'flagged_user' | 'removed';
  created_at: string;
}

export interface PhotoAudience {
  id: string;
  photo_id: string;
  friend_id: string;
  granted_at: string;
  revoked_at?: string | null;
}

export interface Challenge {
  id: string;
  college_id: string;
  title: string;
  description: string;
  puzzle_date: string;
  puzzle_data: {
    question: string;
    options: string[];
    explanation?: string;
    category: string;
  };
  active: boolean;
  participant_count: number;
  created_at: string;
}

export interface ChallengeResult {
  id: string;
  challenge_id: string;
  user_id: string;
  college_id: string;
  selected_option: number;
  is_correct: boolean;
  score: number;
  completion_time_seconds: number;
  completed_at: string;
}

export interface ChatbotSource {
  id: string;
  college_id: string;
  title: string;
  source_name: string;
  content: string;
  last_updated_at: string;
}

export interface ChatbotConversation {
  id: string;
  college_id: string;
  user_id: string;
  message: string;
  bot_response: string;
  cited_source?: string;
  helpful_rating?: boolean | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  college_id: string;
  category: 'event' | 'team' | 'match' | 'friend' | 'chat' | 'moderation';
  title: string;
  body: string;
  deep_link_screen?: string;
  read: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reporter_college_id: string;
  target_type: 'user' | 'message' | 'photo' | 'event' | 'team' | 'study_request';
  target_id: string;
  reason: 'inappropriate_content' | 'harassment' | 'spam' | 'fake_profile' | 'other';
  details?: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
  created_at: string;
}

export interface AdminActivityLog {
  id: string;
  actor_id: string;
  actor_college_id: string;
  action: string;
  target_object_type: string;
  target_object_id: string;
  reason?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
  timestamp: string;
}

export interface AuthTokenPayload {
  userId: string;
  collegeId: string;
  role: UserRole;
  email: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthTokenPayload;
    user: AuthTokenPayload;
  }
}

