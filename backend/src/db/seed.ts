import { db } from './db.js';

export function seedDatabase() {
  db.reset();

  // 1. Colleges
  const stPeters = {
    id: 'col_stpeters_01',
    name: "St. Peter's Engineering College",
    domain: 'stpeters.edu',
    logo_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',
    is_active: true,
    created_at: new Date().toISOString()
  };

  const apexInst = {
    id: 'col_apex_02',
    name: 'Apex Institute of Technology',
    domain: 'apex.edu',
    logo_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200',
    is_active: true,
    created_at: new Date().toISOString()
  };

  db.colleges.push(stPeters, apexInst);

  // 2. Users (St. Peter's)
  const sritan = {
    id: 'usr_sritan_01',
    college_id: stPeters.id,
    email: 'sritan@stpeters.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const arjun = {
    id: 'usr_arjun_02',
    college_id: stPeters.id,
    email: 'arjun@stpeters.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const priya = {
    id: 'usr_priya_03',
    college_id: stPeters.id,
    email: 'priya@stpeters.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const sana = {
    id: 'usr_sana_04',
    college_id: stPeters.id,
    email: 'sana@stpeters.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const venkatesh = {
    id: 'usr_venkatesh_05',
    college_id: stPeters.id,
    email: 'venkatesh@stpeters.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const rahul = {
    id: 'usr_rahul_06',
    college_id: stPeters.id,
    email: 'rahul@stpeters.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const pranav = {
    id: 'usr_pranav_07',
    college_id: stPeters.id,
    email: 'pranav@stpeters.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const clubPres = {
    id: 'usr_pres_08',
    college_id: stPeters.id,
    email: 'gdsc_lead@stpeters.edu',
    role: 'club_president' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const moderator = {
    id: 'usr_mod_09',
    college_id: stPeters.id,
    email: 'moderator@stpeters.edu',
    role: 'platform_moderator' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  // Apex Users
  const rohan = {
    id: 'usr_rohan_10',
    college_id: apexInst.id,
    email: 'rohan@apex.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  const ishita = {
    id: 'usr_ishita_11',
    college_id: apexInst.id,
    email: 'ishita@apex.edu',
    role: 'student' as const,
    is_verified: true,
    status: 'active' as const,
    created_at: new Date().toISOString()
  };

  db.users.push(sritan, arjun, priya, sana, venkatesh, rahul, pranav, clubPres, moderator, rohan, ishita);

  // 3. Profiles
  db.profiles.push(
    {
      id: 'prof_sritan',
      user_id: sritan.id,
      college_id: stPeters.id,
      full_name: 'Sritan Vesangi',
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
    },
    {
      id: 'prof_sana',
      user_id: sana.id,
      college_id: stPeters.id,
      full_name: 'Sana Khan',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      department: 'CSE',
      year_of_study: '3rd Year',
      about: 'Deep learning researcher and competitive programmer.',
      skills: ['Machine Learning', 'Python', 'PyTorch', 'Data Structures'],
      interests: ['AI Research', 'Algorithms', 'Hackathons'],
      available_for: ['Study Partners', 'Hackathon Teams'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'prof_venkatesh',
      user_id: venkatesh.id,
      college_id: stPeters.id,
      full_name: 'Venkatesh',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      department: 'ECE',
      year_of_study: '2nd Year',
      about: 'Hardware enthusiast and embedded systems developer.',
      skills: ['IoT', 'Embedded Systems', 'C++', 'Circuit Design'],
      interests: ['Robotics', 'Firmware', 'Hardware Hacks'],
      available_for: ['Hackathon Teams'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'prof_arjun',
      user_id: arjun.id,
      college_id: stPeters.id,
      full_name: 'Arjun Reddy',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
      department: 'CSE',
      year_of_study: '3rd Year',
      about: 'Full-stack builder preparing for Smart India Hackathon (SIH 2025).',
      skills: ['React', 'Node.js', 'Python', 'System Design'],
      interests: ['Hackathons', 'Cloud', 'Open Source'],
      available_for: ['Hackathon Teams'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'prof_rohan',
      user_id: rohan.id,
      college_id: apexInst.id,
      full_name: 'Rohan Das',
      avatar_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300',
      department: 'CSE',
      year_of_study: '3rd Year',
      about: 'Apex Institute student passionate about cross-campus collaborations.',
      skills: ['Flutter', 'Python', 'Firebase'],
      interests: ['Mobile Dev', 'Competitive Coding'],
      available_for: ['Hackathon Teams'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  );

  // 4. Clubs
  const gdscClub = {
    id: 'club_gdsc_01',
    college_id: stPeters.id,
    name: 'Google Developer Student Clubs',
    category: 'Technology',
    description: 'Community groups for college and university students interested in Google developer technologies.',
    logo_url: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=200',
    president_id: clubPres.id,
    is_verified: true,
    member_count: 350,
    created_at: new Date().toISOString()
  };

  const ieeeClub = {
    id: 'club_ieee_02',
    college_id: stPeters.id,
    name: 'IEEE Student Branch',
    category: 'Engineering & Innovation',
    description: 'Dedicated to fostering technological innovation and excellence for the benefit of humanity.',
    logo_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200',
    president_id: clubPres.id,
    is_verified: true,
    member_count: 220,
    created_at: new Date().toISOString()
  };

  const photoClub = {
    id: 'club_photo_03',
    college_id: stPeters.id,
    name: 'Photography Club',
    category: 'Arts & Creative',
    description: 'Capturing moments, campus memories, and visual storytelling.',
    logo_url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=200',
    president_id: clubPres.id,
    is_verified: true,
    member_count: 140,
    created_at: new Date().toISOString()
  };

  db.clubs.push(gdscClub, ieeeClub, photoClub);

  // 5. Events with dual independent toggles
  const eventWebDev = {
    id: 'evt_webdev_01',
    college_id: stPeters.id,
    club_id: gdscClub.id,
    title: 'Web Dev Workshop',
    description: 'Hands-on full stack application development with Next.js and Cloud deployment.',
    start_time: '12 Sep 2025 - 10:00 AM',
    location: 'Main Block, CSE Seminar Hall',
    capacity: 150,
    visibility: 'everyone' as const, // Open to all colleges to discover
    registration_eligibility: 'cross_college' as const, // Cross-college students can register!
    status: 'published' as const,
    created_at: new Date().toISOString()
  };

  const eventAI = {
    id: 'evt_ai_02',
    college_id: stPeters.id,
    club_id: ieeeClub.id,
    title: 'Tech Talk: Future of AI',
    description: 'Insights into frontier models, agentic workflows, and future careers.',
    start_time: '15 Sep 2025 - 2:00 PM',
    location: 'College Auditorium',
    capacity: 300,
    visibility: 'everyone' as const, // Visible to everyone
    registration_eligibility: 'college_only' as const, // But registration is locked to St. Peter's!
    status: 'published' as const,
    created_at: new Date().toISOString()
  };

  const eventPhoto = {
    id: 'evt_photo_03',
    college_id: stPeters.id,
    club_id: photoClub.id,
    title: 'Campus Photo Walk',
    description: 'Sunset photography session exploring architectural hidden gems around campus.',
    start_time: '18 Sep 2025 - 4:00 PM',
    location: 'Campus Grounds & Fountain',
    capacity: 50,
    visibility: 'college' as const, // Strictly internal
    registration_eligibility: 'college_only' as const,
    status: 'published' as const,
    created_at: new Date().toISOString()
  };

  db.events.push(eventWebDev, eventAI, eventPhoto);

  // Pre-seed registration for Sritan on WebDev workshop
  db.eventRegistrations.push({
    id: 'reg_sritan_webdev',
    event_id: eventWebDev.id,
    user_id: sritan.id,
    college_id: sritan.college_id,
    status: 'registered',
    registered_at: new Date().toISOString()
  });

  // Pre-seed feedback for WebDev workshop
  db.eventFeedback.push({
    id: 'fb_01',
    event_id: eventWebDev.id,
    user_id: sritan.id,
    college_id: sritan.college_id,
    rating: 5,
    feedback_text: 'Excellent live coding and clear explanations on state management!',
    created_at: new Date().toISOString()
  });

  // 6. Hackathon Teams (Dual Visibility)
  const sihTeam = {
    id: 'team_sih_01',
    college_id: stPeters.id,
    creator_id: arjun.id,
    title: 'SIH 2025 Team',
    project_name: 'Smart India Hackathon 2025',
    description: 'Looking for 2 teammates for SIH. Need a UI/UX designer and an ML developer. Working on automated disaster relief routing.',
    required_skills: ['Python', 'React', 'Machine Learning', 'UI/UX'],
    team_size_target: 4,
    current_members_count: 2,
    deadline: '25 Sep 2025',
    visibility: 'open_to_all' as const, // Cross-college allowed
    status: 'recruiting' as const,
    created_at: new Date().toISOString()
  };

  const aiTeam = {
    id: 'team_ai_02',
    college_id: stPeters.id,
    creator_id: sritan.id,
    title: 'Build with AI',
    project_name: 'AI Campus Assistant',
    description: 'Developing open campus agents and specialized RAG assistants for student workflows.',
    required_skills: ['LLM', 'UI/UX', 'Node.js'],
    team_size_target: 3,
    current_members_count: 2,
    visibility: 'college_only' as const, // College only
    status: 'recruiting' as const,
    created_at: new Date().toISOString()
  };

  const web3Team = {
    id: 'team_web3_03',
    college_id: stPeters.id,
    creator_id: venkatesh.id,
    title: 'Web3 Builders',
    project_name: 'Decentralized Campus Identity',
    description: 'Looking for passionate devs building verifiable credential wallets.',
    required_skills: ['Solidity', 'React', 'Cryptography'],
    team_size_target: 4,
    current_members_count: 1,
    visibility: 'open_to_all' as const,
    status: 'recruiting' as const,
    created_at: new Date().toISOString()
  };

  db.teams.push(sihTeam, aiTeam, web3Team);
  db.teamMembers.push(
    { id: 'tm_1', team_id: sihTeam.id, user_id: arjun.id, college_id: stPeters.id, role: 'leader', joined_at: new Date().toISOString() },
    { id: 'tm_2', team_id: aiTeam.id, user_id: sritan.id, college_id: stPeters.id, role: 'leader', joined_at: new Date().toISOString() }
  );

  // 7. Study Requests (Strictly College-Only!)
  db.studyRequests.push(
    {
      id: 'sr_01',
      college_id: stPeters.id,
      user_id: sritan.id,
      subject: 'DBMS & Operating Systems',
      goal_description: 'Prepping for midterm exams on SQL transactions and virtual memory.',
      preferred_mode: 'either',
      availability_slot: 'Weekday Evenings (5-7 PM)',
      looking_for: 'small_group',
      status: 'active',
      created_at: new Date().toISOString()
    },
    {
      id: 'sr_02',
      college_id: stPeters.id,
      user_id: sana.id,
      subject: 'Data Structures & Algorithms',
      goal_description: 'Solving LeetCode hard problems on Graphs and Dynamic Programming.',
      preferred_mode: 'online',
      availability_slot: 'Weekend Mornings',
      looking_for: 'one_partner',
      status: 'active',
      created_at: new Date().toISOString()
    }
  );

  // 8. Friendships and Photo Audiences
  const f1 = {
    id: 'fr_01',
    college_id: stPeters.id,
    requester_id: sritan.id,
    addressee_id: pranav.id,
    status: 'accepted' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const f2 = {
    id: 'fr_02',
    college_id: stPeters.id,
    requester_id: sritan.id,
    addressee_id: priya.id,
    status: 'accepted' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const f3 = {
    id: 'fr_03',
    college_id: stPeters.id,
    requester_id: sana.id,
    addressee_id: sritan.id,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.friendships.push(f1, f2, f3);

  // Sritan's photos (friends only)
  const p1 = {
    id: 'photo_01',
    user_id: sritan.id,
    college_id: stPeters.id,
    s3_key: 'colleges/stpeters/users/sritan/campus_sunset.jpg',
    caption: 'Golden hour at the central library garden 🌅',
    moderation_status: 'clean' as const,
    created_at: new Date().toISOString()
  };

  const p2 = {
    id: 'photo_02',
    user_id: sritan.id,
    college_id: stPeters.id,
    s3_key: 'colleges/stpeters/users/sritan/hackathon_win.jpg',
    caption: 'Hackathon demo day with the squad 🏆',
    moderation_status: 'clean' as const,
    created_at: new Date().toISOString()
  };

  db.photos.push(p1, p2);

  // photo_audiences join entries for Sritan's accepted friends (Pranav, Priya)
  db.photoAudiences.push(
    { id: 'pa_1', photo_id: p1.id, friend_id: pranav.id, granted_at: new Date().toISOString() },
    { id: 'pa_2', photo_id: p1.id, friend_id: priya.id, granted_at: new Date().toISOString() },
    { id: 'pa_3', photo_id: p2.id, friend_id: pranav.id, granted_at: new Date().toISOString() },
    { id: 'pa_4', photo_id: p2.id, friend_id: priya.id, granted_at: new Date().toISOString() }
  );

  // 9. Scoped Chat Threads & Messages
  const directThread = {
    id: 'th_dm_01',
    college_id: stPeters.id,
    type: 'direct_friend' as const,
    title: 'Pranav',
    created_at: new Date().toISOString()
  };

  const dbmsGroupThread = {
    id: 'th_group_02',
    college_id: stPeters.id,
    type: 'study_match' as const,
    title: 'DBMS Study Group',
    created_at: new Date().toISOString()
  };

  const teamThread = {
    id: 'th_team_03',
    college_id: stPeters.id,
    type: 'team' as const,
    title: 'Hackathon Team (AI Campus)',
    entity_id: aiTeam.id,
    created_at: new Date().toISOString()
  };

  const announcementThread = {
    id: 'th_announcement_04',
    college_id: stPeters.id,
    type: 'club_announcements' as const,
    title: 'Campus Announcements (GDSC)',
    entity_id: gdscClub.id,
    created_at: new Date().toISOString()
  };

  db.chatThreads.push(directThread, dbmsGroupThread, teamThread, announcementThread);

  db.threadMembers.push(
    { id: 'thm_1', thread_id: directThread.id, user_id: sritan.id, college_id: stPeters.id, role: 'member' },
    { id: 'thm_2', thread_id: directThread.id, user_id: pranav.id, college_id: stPeters.id, role: 'member' },
    { id: 'thm_3', thread_id: dbmsGroupThread.id, user_id: sritan.id, college_id: stPeters.id, role: 'member' },
    { id: 'thm_4', thread_id: teamThread.id, user_id: sritan.id, college_id: stPeters.id, role: 'admin' },
    { id: 'thm_5', thread_id: announcementThread.id, user_id: sritan.id, college_id: stPeters.id, role: 'member' }
  );

  db.messages.push(
    {
      id: 'msg_01',
      thread_id: directThread.id,
      sender_id: pranav.id,
      content: 'Hey! Are you available for study tonight?',
      moderation_status: 'clean',
      created_at: '10:24 AM'
    },
    {
      id: 'msg_02',
      thread_id: dbmsGroupThread.id,
      sender_id: sritan.id,
      content: 'Shared a PDF with previous year question papers.',
      moderation_status: 'clean',
      created_at: '9:12 AM'
    },
    {
      id: 'msg_03',
      thread_id: teamThread.id,
      sender_id: arjun.id,
      content: 'Can we meet at 5 PM in the CSE block?',
      moderation_status: 'clean',
      created_at: 'Yesterday'
    },
    {
      id: 'msg_04',
      thread_id: announcementThread.id,
      sender_id: clubPres.id,
      content: 'New event posted: Tech Fest 2025. Registrations now open!',
      moderation_status: 'clean',
      created_at: 'Yesterday'
    }
  );

  // 10. Challenges (Daily Puzzle format)
  db.challenges.push(
    {
      id: 'chal_01',
      college_id: stPeters.id,
      title: '30 Days of Learning',
      description: 'Daily CS algorithmic puzzles and system design trivia.',
      puzzle_date: '2025-09-22',
      puzzle_data: {
        category: 'Algorithms',
        question: 'What is the average time complexity of searching in a balanced AVL tree?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        explanation: 'AVL trees maintain a height balance factor <= 1, guaranteeing O(log n) lookup.'
      },
      active: true,
      participant_count: 2400,
      created_at: new Date().toISOString()
    },
    {
      id: 'chal_02',
      college_id: stPeters.id,
      title: 'Build & Ship',
      description: 'Build a small project in 30 days. Weekly checkpoint challenges.',
      puzzle_date: '2025-09-22',
      puzzle_data: {
        category: 'Product Engineering',
        question: 'Which HTTP status code is most appropriate for rate limiting?',
        options: ['400 Bad Request', '403 Forbidden', '429 Too Many Requests', '503 Service Unavailable'],
        explanation: 'RFC 6585 defines 429 Too Many Requests for rate limiting.'
      },
      active: true,
      participant_count: 1100,
      created_at: new Date().toISOString()
    },
    {
      id: 'chal_03',
      college_id: stPeters.id,
      title: 'Campus Explorer',
      description: 'Visit and discover 10 campus spots and historical building facts.',
      puzzle_date: '2025-09-22',
      puzzle_data: {
        category: 'Campus History',
        question: 'In which year was the Central Library foundation stone laid at St. Peter’s?',
        options: ['1998', '2004', '2010', '2015'],
        explanation: 'The St. Peter’s Central Library foundation stone was laid in 2004.'
      },
      active: true,
      participant_count: 1300,
      created_at: new Date().toISOString()
    }
  );

  // 11. Per-College Partitioned Chatbot Knowledge Sources
  db.chatbotSources.push(
    {
      id: 'cbs_01',
      college_id: stPeters.id,
      title: 'Academic Calendar 2025-2026',
      source_name: "Academic Calendar (St. Peter's Engineering College)",
      content: 'The next internal exam for CSE is scheduled from 22 Sep 2025 to 26 Sep 2025. Practical labs commence from 1 Oct 2025.',
      last_updated_at: '2025-09-01'
    },
    {
      id: 'cbs_02',
      college_id: stPeters.id,
      title: 'Campus Navigation & Departments',
      source_name: "Campus Guide (St. Peter's Engineering College)",
      content: 'The CSE department is located in Main Block, 2nd Floor. The ECE department is in Block B, 1st Floor. Dean office is on the Ground Floor.',
      last_updated_at: '2025-08-15'
    },
    {
      id: 'cbs_03',
      college_id: apexInst.id, // Strictly Apex Institute partition!
      title: 'Apex Academic Schedule',
      source_name: 'Apex Academic Almanac 2025',
      content: 'Apex Institute midterms begin on 10 Oct 2025. Robotics labs are housed in the Tech Tower 4th Floor.',
      last_updated_at: '2025-09-05'
    }
  );

  // 12. Notifications
  db.notifications.push(
    {
      id: 'notif_01',
      user_id: sritan.id,
      college_id: stPeters.id,
      category: 'friend',
      title: 'Friend Request',
      body: 'Sana Khan sent you a friend request.',
      deep_link_screen: 'Friends',
      read: false,
      created_at: '2m ago'
    },
    {
      id: 'notif_02',
      user_id: sritan.id,
      college_id: stPeters.id,
      category: 'team',
      title: 'Team Update',
      body: 'Your team "AI Campus Assistant" got a new member.',
      deep_link_screen: 'Teams',
      read: false,
      created_at: '10m ago'
    },
    {
      id: 'notif_03',
      user_id: sritan.id,
      college_id: stPeters.id,
      category: 'event',
      title: 'Campus Event',
      body: 'New event posted: Tech Fest 2025',
      deep_link_screen: 'Events',
      read: true,
      created_at: '1h ago'
    },
    {
      id: 'notif_04',
      user_id: sritan.id,
      college_id: stPeters.id,
      category: 'match',
      title: 'Study Partner Match',
      body: 'Your study partner request got a match for DBMS!',
      deep_link_screen: 'StudyPartner',
      read: true,
      created_at: '5h ago'
    }
  );

  // 13. Reports and Admin Queue
  db.reports.push(
    {
      id: 'rep_01',
      reporter_id: priya.id,
      reporter_college_id: stPeters.id,
      target_type: 'message',
      target_id: 'msg_flag_test',
      reason: 'inappropriate_content',
      details: 'Spamming referral codes in team thread',
      status: 'pending',
      created_at: '2h ago'
    },
    {
      id: 'rep_02',
      reporter_id: sritan.id,
      reporter_college_id: stPeters.id,
      target_type: 'user',
      target_id: 'usr_suspicious_bot',
      reason: 'fake_profile',
      details: 'Unverified profile impersonating student council member',
      status: 'pending',
      created_at: '5h ago'
    }
  );

  // 14. Admin activity logs
  db.adminActivityLogs.push({
    id: 'log_01',
    actor_id: moderator.id,
    actor_college_id: stPeters.id,
    action: 'verify_club_president',
    target_object_type: 'user',
    target_object_id: clubPres.id,
    reason: 'Verified faculty advisor recommendation letter',
    metadata: { club_id: gdscClub.id },
    ip_address: '10.0.1.20',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  });

  db.save();
  console.log('Database successfully seeded with 2 colleges, users, clubs, dual-toggle events & teams!');
}
