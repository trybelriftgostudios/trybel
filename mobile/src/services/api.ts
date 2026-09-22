import { Platform } from 'react-native';

const LAN_IP = '192.168.78.176';
export const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:4000/api'
  : `http://${LAN_IP}:4000/api`;

class ApiService {
  private token: string | null = null;
  public currentUser: any = null;
  public currentProfile: any = null;
  public currentCollege: any = null;

  public setToken(token: string | null) {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || data.error || `HTTP error ${res.status}`);
    }

    return data as T;
  }

  // Auth
  async sendVerification(email: string) {
    return this.request<any>('/auth/send-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyToken(params: { token?: string; email?: string; otp?: string }) {
    const data = await this.request<any>('/auth/verify', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (data.token) {
      this.token = data.token;
      this.currentUser = data.user;
      this.currentProfile = data.profile;
      this.currentCollege = data.college;
    }
    return data;
  }

  async oauthLogin(provider: 'google' | 'apple', email: string, name?: string) {
    const data = await this.request<any>('/auth/oauth', {
      method: 'POST',
      body: JSON.stringify({ provider, email, name })
    });
    if (data.token) {
      this.token = data.token;
      this.currentUser = data.user;
      this.currentProfile = data.profile;
      this.currentCollege = data.college;
    }
    return data;
  }

  async getMe() {
    const data = await this.request<any>('/auth/me');
    this.currentUser = data.user;
    this.currentProfile = data.profile;
    this.currentCollege = data.college;
    return data;
  }

  // Study Partners (College-only)
  async getStudyPartners(params?: { subject?: string; mode?: string; availability?: string; myRequests?: boolean }) {
    const q = new URLSearchParams();
    if (params?.subject) q.set('subject', params.subject);
    if (params?.mode) q.set('mode', params.mode);
    if (params?.availability) q.set('availability', params.availability);
    if (params?.myRequests) q.set('myRequests', 'true');
    return this.request<any>(`/study-partners?${q.toString()}`);
  }

  async createStudyRequest(body: {
    subject: string;
    goal_description: string;
    preferred_mode: 'online' | 'offline' | 'either';
    availability_slot: string;
    looking_for: 'one_partner' | 'small_group';
  }) {
    return this.request<any>('/study-partners', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async connectStudyRequest(id: string, message?: string) {
    return this.request<any>(`/study-partners/${id}/connect`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // Hackathon Teams (Dual visibility toggle)
  async getTeams(params?: { filter?: 'all' | 'my_college' | 'open_to_all'; search?: string; myTeams?: boolean }) {
    const q = new URLSearchParams();
    if (params?.filter) q.set('filter', params.filter);
    if (params?.search) q.set('search', params.search);
    if (params?.myTeams) q.set('myTeams', 'true');
    return this.request<any>(`/teams?${q.toString()}`);
  }

  async createTeam(body: {
    title: string;
    project_name: string;
    description: string;
    required_skills: string[];
    team_size_target?: number;
    deadline?: string;
    visibility: 'college_only' | 'open_to_all';
  }) {
    return this.request<any>('/teams', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async applyTeam(teamId: string, message?: string) {
    return this.request<any>(`/teams/${teamId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async getTeamApplications(teamId: string) {
    return this.request<any>(`/teams/${teamId}/applications`);
  }

  async acceptTeamApplication(teamId: string, appId: string) {
    return this.request<any>(`/teams/${teamId}/applications/${appId}/accept`, {
      method: 'POST'
    });
  }

  // Clubs & Events (Independent dual toggles + Feedback)
  async getClubs() {
    return this.request<any>('/clubs');
  }

  async registerClub(body: { name: string; category: string; description: string; logo_url?: string }) {
    return this.request<any>('/clubs', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async getEvents(params?: { filter?: 'all' | 'my_college' | 'open_to_all'; search?: string }) {
    const q = new URLSearchParams();
    if (params?.filter) q.set('filter', params.filter);
    if (params?.search) q.set('search', params.search);
    return this.request<any>(`/events?${q.toString()}`);
  }

  async createEvent(body: {
    club_id: string;
    title: string;
    description: string;
    start_time: string;
    location: string;
    capacity?: number;
    visibility: 'college' | 'everyone';
    registration_eligibility: 'college_only' | 'cross_college';
  }) {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  async registerEvent(eventId: string) {
    return this.request<any>(`/events/${eventId}/register`, {
      method: 'POST'
    });
  }

  async getEventFeedback(eventId: string) {
    return this.request<any>(`/events/${eventId}/feedback`);
  }

  async submitEventFeedback(eventId: string, rating: number, feedback_text: string) {
    return this.request<any>(`/events/${eventId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, feedback_text })
    });
  }

  // Scoped Chat
  async getChatThreads(type?: 'all' | 'friends' | 'groups') {
    const q = type ? `?type=${type}` : '';
    return this.request<any>(`/chat/threads${q}`);
  }

  async getChatMessages(threadId: string) {
    return this.request<any>(`/chat/threads/${threadId}/messages`);
  }

  async sendChatMessage(threadId: string, content: string) {
    return this.request<any>(`/chat/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  // Friends & Photos (photo_audiences + signed URLs)
  async getFriends() {
    return this.request<any>('/friends');
  }

  async sendFriendRequest(targetUserId: string) {
    return this.request<any>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ target_user_id: targetUserId })
    });
  }

  async acceptFriendRequest(requestId: string) {
    return this.request<any>(`/friends/requests/${requestId}/accept`, {
      method: 'POST'
    });
  }

  async unfriend(friendId: string) {
    return this.request<any>(`/friends/${friendId}/unfriend`, {
      method: 'POST'
    });
  }

  async getPhotos() {
    return this.request<any>('/photos');
  }

  async uploadPhoto(caption: string, s3_key?: string) {
    return this.request<any>('/photos', {
      method: 'POST',
      body: JSON.stringify({ caption, s3_key })
    });
  }

  // Chatbot
  async askChatbot(message: string) {
    return this.request<any>('/chatbot/ask', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async submitChatbotFeedback(conversation_id: string, helpful: boolean) {
    return this.request<any>('/chatbot/feedback', {
      method: 'POST',
      body: JSON.stringify({ conversation_id, helpful })
    });
  }

  // Challenges (Daily Puzzle)
  async getChallenges(myChallenges?: boolean) {
    const q = myChallenges ? '?myChallenges=true' : '';
    return this.request<any>(`/challenges${q}`);
  }

  async submitChallenge(challengeId: string, selectedOption: number, completionTimeSeconds?: number) {
    return this.request<any>(`/challenges/${challengeId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ selected_option: selectedOption, completion_time_seconds: completionTimeSeconds })
    });
  }

  // Notifications
  async getNotifications(category?: string) {
    const q = category ? `?category=${category}` : '';
    return this.request<any>(`/notifications${q}`);
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request<any>('/notifications/read-all', { method: 'PUT' });
  }

  // Profile
  async getProfile(userId: string) {
    return this.request<any>(`/profiles/${userId}`);
  }

  async updateProfile(updates: any) {
    return this.request<any>('/profiles/me', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  // Reports
  async submitReport(body: {
    target_type: 'user' | 'message' | 'photo' | 'event' | 'team' | 'study_request';
    target_id: string;
    reason: string;
    details?: string;
  }) {
    return this.request<any>('/admin/reports', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // Admin
  async getAdminReports() {
    return this.request<any>('/admin/reports');
  }

  async takeModerationAction(reportId: string, action: string, reason: string) {
    return this.request<any>(`/admin/reports/${reportId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, reason })
    });
  }

  async verifyClub(clubId: string, is_verified: boolean, reason?: string) {
    return this.request<any>(`/admin/clubs/${clubId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ is_verified, reason })
    });
  }

  async getAdminLogs() {
    return this.request<any>('/admin/logs');
  }
}

export const api = new ApiService();
