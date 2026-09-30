// Client-side resilient fallback mock data for offline / web preview / mixed-content environments

export const mockCollege = {
  id: 'col_stpeters_01',
  name: "St. Peter's Engineering College",
  domain: 'stpeters.edu',
  logo_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',
  is_active: true
};

export const mockUser = {
  id: 'usr_sritan_01',
  college_id: 'col_stpeters_01',
  email: 'varun@pappu',
  role: 'student',
  is_verified: true,
  status: 'active',
  created_at: new Date().toISOString()
};

export const mockProfile = {
  id: 'prof_sritan',
  user_id: 'usr_sritan_01',
  college_id: 'col_stpeters_01',
  full_name: 'Varun Dulam',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
  department: 'CSE',
  year_of_study: '3rd Year',
  about: 'Passionate about building products, exploring new technologies and collaborating with like-minded people.',
  motto: 'Learn • Build • Connect',
  skills: ['Python', 'Web Development', 'Machine Learning', 'UI/UX', 'Leadership'],
  interests: ['AI', 'Web Dev', 'Startups', 'Tech Events'],
  available_for: ['Study Partners', 'Hackathon Teams', 'Projects'],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const mockStudyRequests = [
  {
    id: 'req_1',
    college_id: 'col_stpeters_01',
    subject: 'Machine Learning (CS601)',
    goal_description: 'Looking for a study partner to prepare for end-sems and implement transformer architectures from scratch.',
    preferred_mode: 'offline',
    availability_slot: 'Evenings (6 PM - 8 PM)',
    looking_for: 'one_partner',
    status: 'open',
    requester: {
      id: 'usr_sana_04',
      name: 'Sana Khan',
      department: 'CSE',
      year_of_study: '3rd Year',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200'
    },
    created_at: new Date().toISOString()
  },
  {
    id: 'req_2',
    college_id: 'col_stpeters_01',
    subject: 'Database Management Systems (DBMS)',
    goal_description: 'Group revision for SQL, indexing, and normalization before next Tuesday quiz.',
    preferred_mode: 'either',
    availability_slot: 'Weekends (10 AM - 1 PM)',
    looking_for: 'small_group',
    status: 'open',
    requester: {
      id: 'usr_arjun_02',
      name: 'Arjun Reddy',
      department: 'CSE',
      year_of_study: '3rd Year',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200'
    },
    created_at: new Date().toISOString()
  }
];

export const mockTeams = [
  {
    id: 'team_sih_01',
    college_id: 'col_stpeters_01',
    title: 'Smart India Hackathon (SIH 2025)',
    project_name: 'Campus AgriTech AI',
    description: 'Building an IoT and drone-based precision agriculture pipeline with computer vision.',
    required_skills: ['Python', 'Computer Vision', 'React Native', 'IoT/Firmware'],
    team_size_target: 6,
    members_count: 4,
    deadline: '2025-10-15',
    visibility: 'open_to_all',
    creator: {
      name: 'Varun Dulam',
      college_name: "St. Peter's Engineering College"
    }
  },
  {
    id: 'team_internal_02',
    college_id: 'col_stpeters_01',
    title: 'SPEC Internal Hack Sprint',
    project_name: 'Hostel Room Booking Automation',
    description: 'Developing automated room allocation and grievance portal for college hostels.',
    required_skills: ['Next.js', 'PostgreSQL', 'Tailwind'],
    team_size_target: 4,
    members_count: 2,
    deadline: '2025-11-01',
    visibility: 'college_only',
    creator: {
      name: 'Arjun Reddy',
      college_name: "St. Peter's Engineering College"
    }
  }
];

export const mockClubs = [
  {
    id: 'club_gdsc',
    college_id: 'col_stpeters_01',
    name: 'Google Developer Student Clubs (GDSC)',
    category: 'Technology',
    description: 'Community groups for college students interested in Google developer technologies.',
    logo_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=200',
    is_verified: true,
    members_count: 280
  },
  {
    id: 'club_ecell',
    college_id: 'col_stpeters_01',
    name: 'Entrepreneurship Cell (E-Cell)',
    category: 'Entrepreneurship',
    description: 'Fostering the spirit of entrepreneurship and innovation across campus.',
    logo_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=200',
    is_verified: true,
    members_count: 195
  }
];

export const mockEvents = [
  {
    id: 'evt_webdev_01',
    college_id: 'col_stpeters_01',
    club_name: 'GDSC',
    title: 'Modern Full-Stack Development Workshop',
    description: 'Hands-on session on React Native, Expo, and Fastify microservices architecture.',
    start_time: '2025-10-12T10:00:00Z',
    location: 'Seminar Hall 3 & Google Meet',
    visibility: 'everyone',
    registration_eligibility: 'cross_college',
    attendees_count: 142,
    is_registered: true
  },
  {
    id: 'evt_hack_02',
    college_id: 'col_stpeters_01',
    club_name: 'E-Cell',
    title: 'Annual Campus Innovation Pitch',
    description: 'Pitch your early-stage startup ideas to alumni angel investors.',
    start_time: '2025-10-25T14:00:00Z',
    location: 'Auditorium Block A',
    visibility: 'college',
    registration_eligibility: 'college_only',
    attendees_count: 89,
    is_registered: false
  }
];

export const mockThreads = [
  {
    id: 'thm_team_1',
    name: 'Smart India Hackathon Team',
    type: 'team',
    last_message: 'Varun: I updated the project prototype architecture on GitHub!',
    last_message_at: '10:14 AM',
    unread_count: 2
  },
  {
    id: 'thm_direct_1',
    name: 'Sana Khan',
    type: 'direct',
    last_message: 'Sounds great! Let us meet at the library at 5 PM.',
    last_message_at: 'Yesterday',
    unread_count: 0
  },
  {
    id: 'thm_group_1',
    name: 'DBMS Revision Cohort',
    type: 'study_group',
    last_message: 'Arjun: Shared the SQL indexing cheat sheet in notes.',
    last_message_at: '2 days ago',
    unread_count: 0
  }
];

export const mockMessages = [
  {
    id: 'msg_1',
    thread_id: 'thm_team_1',
    sender_id: 'usr_sritan_01',
    sender_name: 'Varun Dulam',
    content: 'Welcome team! Let us prepare our SIH 2025 pitch deck.',
    created_at: '10:00 AM'
  },
  {
    id: 'msg_2',
    thread_id: 'thm_team_1',
    sender_id: 'usr_sana_04',
    sender_name: 'Sana Khan',
    content: 'Working on the computer vision model pipeline now.',
    created_at: '10:08 AM'
  },
  {
    id: 'msg_3',
    thread_id: 'thm_team_1',
    sender_id: 'usr_sritan_01',
    sender_name: 'Varun Dulam',
    content: 'Awesome, I updated the project prototype architecture on GitHub!',
    created_at: '10:14 AM'
  }
];

export const mockPhotos = [
  {
    id: 'ph_1',
    user_id: 'usr_sritan_01',
    owner_name: 'Varun Dulam',
    caption: 'Sunset over SPEC engineering campus quad 🌅',
    signed_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600',
    created_at: '2 days ago'
  },
  {
    id: 'ph_2',
    user_id: 'usr_sritan_01',
    owner_name: 'Varun Dulam',
    caption: '1st place trophy at inter-college hackathon 🏆',
    signed_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
    created_at: 'Last week'
  }
];

export const mockFriends = [
  {
    id: 'usr_sana_04',
    name: 'Sana Khan',
    department: 'CSE • 3rd Year',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
    is_friend: true
  },
  {
    id: 'usr_arjun_02',
    name: 'Arjun Reddy',
    department: 'CSE • 3rd Year',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
    is_friend: true
  }
];

export const mockChallenge = {
  id: 'chal_today',
  date: new Date().toISOString().split('T')[0],
  question: 'In PostgreSQL, which index structure is optimal for high-dimensional vector embeddings when building college RAG chatbots?',
  options: ['B-Tree Index', 'HNSW (Hierarchical Navigable Small World)', 'Hash Index', 'BRIN Index'],
  correct_option: 1,
  explanation: 'HNSW provides fast approximate nearest neighbor search over vector embeddings with high recall.',
  participants_count: 184
};

export const mockNotifications = [
  {
    id: 'notif_1',
    title: 'Team Application Received',
    body: 'Sana Khan applied to join Smart India Hackathon (SIH 2025).',
    category: 'team',
    is_read: false,
    created_at: '15m ago'
  },
  {
    id: 'notif_2',
    title: 'Event Reminder',
    body: 'Modern Full-Stack Development Workshop starts tomorrow at 10 AM.',
    category: 'event',
    is_read: true,
    created_at: '2h ago'
  }
];

export function getMockResponse(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();

  if (endpoint.includes('/auth/send-verification')) {
    let email = 'varun@pappu';
    try {
      if (options.body) {
        const parsed = JSON.parse(options.body as string);
        if (parsed.email) email = parsed.email;
      }
    } catch {}
    return {
      success: true,
      message: `Verification link sent to ${email}`,
      college: mockCollege,
      devOtp: '123456'
    };
  }

  if (endpoint.includes('/auth/verify') || endpoint.includes('/auth/oauth')) {
    return {
      success: true,
      token: 'mock_jwt_token_varun_dulam',
      user: mockUser,
      profile: mockProfile,
      college: mockCollege
    };
  }

  if (endpoint.includes('/auth/me')) {
    return {
      user: mockUser,
      profile: mockProfile,
      college: mockCollege
    };
  }

  if (endpoint.includes('/study-partners')) {
    return { success: true, data: mockStudyRequests };
  }

  if (endpoint.includes('/teams')) {
    return { success: true, data: mockTeams };
  }

  if (endpoint.includes('/clubs')) {
    return { success: true, data: mockClubs };
  }

  if (endpoint.includes('/events')) {
    return { success: true, data: mockEvents };
  }

  if (endpoint.includes('/chat/threads') && endpoint.includes('/messages')) {
    return { success: true, data: mockMessages };
  }

  if (endpoint.includes('/chat/threads')) {
    return { success: true, data: mockThreads };
  }

  if (endpoint.includes('/friends')) {
    return { success: true, friends: mockFriends, requests: [] };
  }

  if (endpoint.includes('/photos')) {
    return { success: true, data: mockPhotos };
  }

  if (endpoint.includes('/chatbot/ask')) {
    return {
      success: true,
      answer: "According to the St. Peter's Academic Calendar, Midterm exams commence on October 15th.",
      source: "Source: Academic Calendar"
    };
  }

  if (endpoint.includes('/challenges')) {
    return { success: true, data: [mockChallenge], challenge: mockChallenge };
  }

  if (endpoint.includes('/notifications')) {
    return { success: true, data: mockNotifications };
  }

  if (endpoint.includes('/profiles/')) {
    return { success: true, user: mockUser, profile: mockProfile, college: mockCollege };
  }

  if (method === 'POST' || method === 'PUT') {
    return { success: true, message: 'Saved successfully' };
  }

  return { success: true, data: [] };
}
