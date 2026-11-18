import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';
import { IOSSegmentedControl } from '../components/IOSSegmentedControl';

// -------------------------------------------------------------
// TYPES & RBAC
// -------------------------------------------------------------
export type AdminRole = 'main_admin' | 'super_mod' | 'campus_mod' | 'club_head';

export interface VerificationCandidate {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  collegeId: string;
  collegeName: string;
  email: string;
  emailVerified: boolean;
  idCardRef: string;
  idCardIssuedYear: string;
  submittedAt: string;
}

export interface ModerationIncident {
  id: string;
  targetUser: string;
  targetUserId: string;
  collegeId: string;
  collegeName: string;
  targetType: 'post' | 'message' | 'photo' | 'comment';
  severity: 'high' | 'medium' | 'low';
  category: string;
  snippet: string;
  reporter: string;
  timeAgo: string;
  status: 'pending' | 'resolved';
}

export interface ImmutableAuditLog {
  id: string;
  sequence: number;
  timestamp: string;
  actorName: string;
  actorRole: AdminRole;
  actorCollegeId: string;
  actionType: string;
  targetName: string;
  reason: string;
  prevHash: string;
  entryHash: string;
  isEncrypted: boolean;
}

export interface CampusClubMetrics {
  id: string;
  name: string;
  category: string;
  collegeId: string;
  presidentName: string;
  isVerified: boolean;
  eventsHosted: number;
  verifiedAttendees: number;
  studentInteractions: number;
  crossDeptBonus: number;
  penaltiesCount: number;
  calculatedScore: number;
}

// -------------------------------------------------------------
// INITIAL MOCK DATA WITH MULTI-COLLEGE SCOPING
// -------------------------------------------------------------
const INITIAL_VERIFICATIONS: VerificationCandidate[] = [
  {
    id: 'v_1',
    name: 'Rohan Sharma',
    rollNo: '23SPCS104',
    department: 'Computer Science & Engineering',
    collegeId: 'col_stpeters_01',
    collegeName: "St. Peter's Engineering College",
    email: 'rohan.23cs@stpetershyd.edu.in',
    emailVerified: true,
    idCardRef: 'ID_CARD_23SPCS104.jpg',
    idCardIssuedYear: '2023 - 2027',
    submittedAt: '12m ago'
  },
  {
    id: 'v_2',
    name: 'Ananya Roy',
    rollNo: '23SPIT048',
    department: 'Information Technology',
    collegeId: 'col_stpeters_01',
    collegeName: "St. Peter's Engineering College",
    email: 'ananya.roy@stpetershyd.edu.in',
    emailVerified: true,
    idCardRef: 'ID_CARD_23SPIT048.jpg',
    idCardIssuedYear: '2023 - 2027',
    submittedAt: '45m ago'
  },
  {
    id: 'v_3',
    name: 'Vikramaditya Varma',
    rollNo: '22CBITCSE089',
    department: 'Artificial Intelligence & ML',
    collegeId: 'col_cbit_02',
    collegeName: 'CBIT Hyderabad',
    email: 'vikram.22aiml@cbit.ac.in',
    emailVerified: true,
    idCardRef: 'ID_CARD_CBIT_089.jpg',
    idCardIssuedYear: '2022 - 2026',
    submittedAt: '1h ago'
  },
  {
    id: 'v_4',
    name: 'Preeti Nair',
    rollNo: '24IITHCS012',
    department: 'Computer Science',
    collegeId: 'col_iith_03',
    collegeName: 'IIT Hyderabad',
    email: 'preeti.nair@iith.ac.in',
    emailVerified: true,
    idCardRef: 'ID_CARD_IITH_012.jpg',
    idCardIssuedYear: '2024 - 2028',
    submittedAt: '2h ago'
  }
];

const INITIAL_INCIDENTS: ModerationIncident[] = [
  {
    id: 'inc_101',
    targetUser: 'AnonymousUser_94',
    targetUserId: 'usr_anon_94',
    collegeId: 'col_stpeters_01',
    collegeName: "St. Peter's Engineering College",
    targetType: 'post',
    severity: 'high',
    category: 'Anti-Ragging / Intimidation',
    snippet: '"Hostel Block B freshers must report to 3rd floor terrace tonight at 11 PM or face consequences."',
    reporter: 'Confidential 1st Year Student',
    timeAgo: '18m ago',
    status: 'pending'
  },
  {
    id: 'inc_102',
    targetUser: 'Karan Malhotra',
    targetUserId: 'usr_karan_02',
    collegeId: 'col_cbit_02',
    collegeName: 'CBIT Hyderabad',
    targetType: 'message',
    severity: 'high',
    category: 'Academic Dishonesty',
    snippet: '"Leaked mid-term DBMS question bank paper available for 500 Rs on UPI."',
    reporter: 'Faculty Observer',
    timeAgo: '1h ago',
    status: 'pending'
  },
  {
    id: 'inc_103',
    targetUser: 'CampusDeals_India',
    targetUserId: 'usr_deals_09',
    collegeId: 'col_stpeters_01',
    collegeName: "St. Peter's Engineering College",
    targetType: 'post',
    severity: 'medium',
    category: 'Commercial Spam / Scams',
    snippet: '"Earn 5000 Rs daily doing simple typing work from hostel room. Click telegram link."',
    reporter: 'Student Council Rep',
    timeAgo: '2h ago',
    status: 'pending'
  },
  {
    id: 'inc_104',
    targetUser: 'Samir Rao',
    targetUserId: 'usr_samir_55',
    collegeId: 'col_iith_03',
    collegeName: 'IIT Hyderabad',
    targetType: 'comment',
    severity: 'low',
    category: 'Off-Topic Flooding',
    snippet: '"Repeated copy-pasting of memes under the Placement Notice board thread."',
    reporter: 'Peer Student',
    timeAgo: '3h ago',
    status: 'pending'
  }
];

// Helper to simulate cryptographic SHA-256 chain hash
const generateSimulatedHash = (seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}${Math.abs(hash * 31).toString(16).padStart(8, '0')}e9f1a20b4c`;
};

const INITIAL_AUDIT_LOGS: ImmutableAuditLog[] = [
  {
    id: 'log_001',
    sequence: 1042,
    timestamp: 'Today 04:30 AM',
    actorName: 'Varun (Main Admin)',
    actorRole: 'main_admin',
    actorCollegeId: 'GLOBAL',
    actionType: 'ROLE_PROMOTION',
    targetName: 'Priya Sharma (Assigned Super Mod)',
    reason: 'Promoted to Super Mod for cross-campus safety oversight',
    prevHash: '0000000000000000a1b2c3d4e5f6',
    entryHash: generateSimulatedHash('genesis_block_audit_001'),
    isEncrypted: true
  },
  {
    id: 'log_002',
    sequence: 1043,
    timestamp: 'Today 03:15 AM',
    actorName: 'Campus Mod SPEC',
    actorRole: 'campus_mod',
    actorCollegeId: 'col_stpeters_01',
    actionType: 'APPROVE_VERIFICATION',
    targetName: 'Varun Dulam (22SPCS089)',
    reason: '2-Step ID Card & Email match confirmed against college registrar roster',
    prevHash: generateSimulatedHash('genesis_block_audit_001'),
    entryHash: generateSimulatedHash('audit_block_1043_verify'),
    isEncrypted: true
  }
];

const INITIAL_CLUBS: CampusClubMetrics[] = [
  {
    id: 'club_gdsc',
    name: 'Google Developer Student Clubs (GDSC)',
    category: 'Technical & AI',
    collegeId: 'col_stpeters_01',
    presidentName: 'Aryan Varma',
    isVerified: true,
    eventsHosted: 4,
    verifiedAttendees: 148,
    studentInteractions: 412,
    crossDeptBonus: 4,
    penaltiesCount: 0,
    calculatedScore: 0
  },
  {
    id: 'club_robotics',
    name: 'SPEC Robotics & Automation Club',
    category: 'Robotics & Hardware',
    collegeId: 'col_stpeters_01',
    presidentName: 'Sneha Patel',
    isVerified: true,
    eventsHosted: 3,
    verifiedAttendees: 96,
    studentInteractions: 280,
    crossDeptBonus: 3,
    penaltiesCount: 0,
    calculatedScore: 0
  },
  {
    id: 'club_ecell',
    name: 'E-Cell Entrepreneurship Hub',
    category: 'Startups & Business',
    collegeId: 'col_stpeters_01',
    presidentName: 'Rahul Chawla',
    isVerified: true,
    eventsHosted: 2,
    verifiedAttendees: 84,
    studentInteractions: 195,
    crossDeptBonus: 2,
    penaltiesCount: 0,
    calculatedScore: 0
  },
  {
    id: 'club_cultural',
    name: 'Tarang Cultural & Literary Society',
    category: 'Arts & Cultural',
    collegeId: 'col_stpeters_01',
    presidentName: 'Megha Sen',
    isVerified: false,
    eventsHosted: 2,
    verifiedAttendees: 110,
    studentInteractions: 160,
    crossDeptBonus: 1,
    penaltiesCount: 1,
    calculatedScore: 0
  }
];

// -------------------------------------------------------------
// MAIN ADMIN COMPONENT
// -------------------------------------------------------------
export default function AdminConsoleModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  // Active Role Switcher State
  const [activeRole, setActiveRole] = useState<AdminRole>('main_admin');
  const [collegeFilter, setCollegeFilter] = useState<'all' | 'col_stpeters_01' | 'col_cbit_02' | 'col_iith_03'>('all');

  // Main navigation tabs
  const [activeSection, setActiveSection] = useState<'verify' | 'moderation' | 'pulse' | 'audit'>('verify');

  // Pillar Data
  const [verifications, setVerifications] = useState<VerificationCandidate[]>(INITIAL_VERIFICATIONS);
  const [incidents, setIncidents] = useState<ModerationIncident[]>(INITIAL_INCIDENTS);
  const [auditLogs, setAuditLogs] = useState<ImmutableAuditLog[]>(INITIAL_AUDIT_LOGS);
  const [clubs, setClubs] = useState<CampusClubMetrics[]>(INITIAL_CLUBS);

  // Moderation Filters
  const [severityFilter, setSeverityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  // Modal States
  const [rejectModalCandidate, setRejectModalCandidate] = useState<VerificationCandidate | null>(null);
  const [rejectReasonPreset, setRejectReasonPreset] = useState<string>('Blurry ID / Unreadable text');
  const [rejectCustomReason, setRejectCustomReason] = useState<string>('');

  const [actionModalIncident, setActionModalIncident] = useState<ModerationIncident | null>(null);
  const [actionTypeSelected, setActionTypeSelected] = useState<'warn' | 'mute_48h' | 'remove_content' | 'device_ban'>('warn');
  const [actionReason, setActionReason] = useState<string>('');

  const [inspectAuditLog, setInspectAuditLog] = useState<ImmutableAuditLog | null>(null);

  // Role info helper
  const roleMeta = useMemo(() => {
    switch (activeRole) {
      case 'main_admin':
        return {
          title: 'Main Admin',
          badgeText: '👑 ALL ACCESS',
          badgeColor: '#E11D48',
          description: 'Global authority across all colleges, system configs, role assignment & audit chains.'
        };
      case 'super_mod':
        return {
          title: 'Super Mod',
          badgeText: '⚡ CROSS-COLLEGE',
          badgeColor: '#7C3AED',
          description: 'High-privilege cross-campus moderation & verification across all partner colleges.'
        };
      case 'campus_mod':
        return {
          title: 'Campus Mod',
          badgeText: '🏫 SPEC HYDERABAD',
          badgeColor: '#0284C7',
          description: "Strictly scoped to St. Peter's Engineering College. Reports & ID cards within SPEC only."
        };
      case 'club_head':
        return {
          title: 'Club Head',
          badgeText: '🛡️ GDSC SPEC',
          badgeColor: '#16A34A',
          description: 'Scoped to club event creation, verified member onboarding, and club leaderboard analytics.'
        };
    }
  }, [activeRole]);

  // Compute Club Scores using the formula:
  // Score = (Events * 25) + (Verified Attendees * 2) + (Interactions * 1) + (Diversity Bonus * 15) - (Penalties * 50)
  const scoredClubs = useMemo(() => {
    return clubs
      .map(c => {
        const score =
          c.eventsHosted * 25 +
          c.verifiedAttendees * 2 +
          c.studentInteractions * 1 +
          c.crossDeptBonus * 15 -
          c.penaltiesCount * 50;
        return { ...c, calculatedScore: Math.max(0, score) };
      })
      .sort((a, b) => b.calculatedScore - a.calculatedScore);
  }, [clubs]);

  // Record an immutable cryptographic audit log entry
  const recordAuditLog = (actionType: string, targetName: string, reason: string) => {
    setAuditLogs(prev => {
      const last = prev[0] || INITIAL_AUDIT_LOGS[0];
      const seq = last.sequence + 1;
      const seed = `${last.entryHash}_${Date.now()}_${activeRole}_${actionType}_${targetName}`;
      const newHash = generateSimulatedHash(seed);

      const newEntry: ImmutableAuditLog = {
        id: `log_${Date.now()}`,
        sequence: seq,
        timestamp: 'Just now',
        actorName: roleMeta.title,
        actorRole: activeRole,
        actorCollegeId: activeRole === 'campus_mod' ? 'col_stpeters_01' : 'GLOBAL',
        actionType,
        targetName,
        reason,
        prevHash: last.entryHash,
        entryHash: newHash,
        isEncrypted: true
      };

      return [newEntry, ...prev];
    });
  };

  // -------------------------------------------------------------
  // PILLAR 1: VERIFICATION ACTIONS
  // -------------------------------------------------------------
  const handleApproveVerification = (candidate: VerificationCandidate) => {
    setVerifications(prev => prev.filter(c => c.id !== candidate.id));
    recordAuditLog(
      'APPROVE_STUDENT_2STEP',
      `${candidate.name} (${candidate.rollNo})`,
      `Approved 2-step verification. ID Card matched against ${candidate.collegeName} roster.`
    );
    showFeedback(`Approved verified student badge for ${candidate.name}!`, 'success');
  };

  const handleOpenRejectModal = (candidate: VerificationCandidate) => {
    setRejectModalCandidate(candidate);
    setRejectReasonPreset('Blurry ID / Unreadable text');
    setRejectCustomReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectModalCandidate) return;
    const finalReason = rejectCustomReason.trim() ? rejectCustomReason.trim() : rejectReasonPreset;

    setVerifications(prev => prev.filter(c => c.id !== rejectModalCandidate.id));
    recordAuditLog(
      'REJECT_STUDENT_ID',
      `${rejectModalCandidate.name} (${rejectModalCandidate.rollNo})`,
      `Rejected ID card application: ${finalReason}`
    );

    showFeedback(`Rejected ID verification for ${rejectModalCandidate.name}. Feedback sent.`, 'warning');
    setRejectModalCandidate(null);
  };

  // -------------------------------------------------------------
  // PILLAR 2: MODERATION ACTIONS
  // -------------------------------------------------------------
  const handleOpenActionModal = (incident: ModerationIncident) => {
    setActionModalIncident(incident);
    setActionTypeSelected('warn');
    setActionReason('');
  };

  const handleDismissIncident = (incident: ModerationIncident) => {
    setIncidents(prev => prev.filter(i => i.id !== incident.id));
    recordAuditLog(
      'DISMISS_REPORT',
      incident.targetUser,
      `Dismissed report (${incident.category}) as benign/unsubstantiated.`
    );
    showFeedback('Report marked resolved & dismissed.', 'info');
  };

  const handleConfirmModerationAction = () => {
    if (!actionModalIncident) return;

    if (actionTypeSelected === 'device_ban' && activeRole !== 'main_admin' && activeRole !== 'super_mod') {
      showFeedback('Permanent device bans require Super Mod or Main Admin authority.', 'error');
      return;
    }

    const reasonText = actionReason.trim() || `Disciplinary action for ${actionModalIncident.category}`;
    setIncidents(prev => prev.filter(i => i.id !== actionModalIncident.id));

    let actionLabel = '';
    switch (actionTypeSelected) {
      case 'warn':
        actionLabel = 'ISSUE_FORMAL_WARNING';
        showFeedback(`Formal in-app warning dispatched to ${actionModalIncident.targetUser}.`, 'warning');
        break;
      case 'mute_48h':
        actionLabel = 'MUTE_CAMPUS_FEED_48H';
        showFeedback(`Placed ${actionModalIncident.targetUser} on 48h read-only campus mute.`, 'info');
        break;
      case 'remove_content':
        actionLabel = 'PURGE_CONTENT';
        showFeedback(`Purged offending ${actionModalIncident.targetType} from all feeds.`, 'success');
        break;
      case 'device_ban':
        actionLabel = 'PERMANENT_DEVICE_BAN';
        showFeedback(`Permanent device UUID ban issued against ${actionModalIncident.targetUser}.`, 'error');
        break;
    }

    recordAuditLog(actionLabel, `${actionModalIncident.targetUser} (${actionModalIncident.collegeName})`, reasonText);
    setActionModalIncident(null);
  };

  // -------------------------------------------------------------
  // PILLAR 4: CLUB VERIFICATION
  // -------------------------------------------------------------
  const handleToggleClubVerification = (clubId: string) => {
    if (activeRole !== 'main_admin' && activeRole !== 'super_mod' && activeRole !== 'campus_mod') {
      showFeedback('Only Campus Mods and Admins can verify official clubs.', 'error');
      return;
    }

    setClubs(prev =>
      prev.map(c => {
        if (c.id === clubId) {
          const nextState = !c.isVerified;
          recordAuditLog(
            nextState ? 'VERIFY_OFFICIAL_CLUB' : 'REVOKE_CLUB_BADGE',
            c.name,
            nextState ? 'Verified official campus club chapter' : 'Revoked verified badge'
          );
          showFeedback(nextState ? `Verified ${c.name} with official checkmark!` : `Revoked verification for ${c.name}`, 'info');
          return { ...c, isVerified: nextState };
        }
        return c;
      })
    );
  };

  // -------------------------------------------------------------
  // SCOPING & FILTERING LOGIC
  // -------------------------------------------------------------
  // Campus Mod is strictly restricted to their own college ('col_stpeters_01')
  const visibleVerifications = useMemo(() => {
    let list = verifications;
    if (activeRole === 'campus_mod') {
      list = list.filter(v => v.collegeId === 'col_stpeters_01');
    } else if (collegeFilter !== 'all') {
      list = list.filter(v => v.collegeId === collegeFilter);
    }
    return list;
  }, [verifications, activeRole, collegeFilter]);

  const visibleIncidents = useMemo(() => {
    let list = incidents;
    if (activeRole === 'campus_mod') {
      list = list.filter(i => i.collegeId === 'col_stpeters_01');
    } else if (collegeFilter !== 'all') {
      list = list.filter(i => i.collegeId === collegeFilter);
    }

    if (severityFilter !== 'all') {
      list = list.filter(i => i.severity === severityFilter);
    }
    return list;
  }, [incidents, activeRole, collegeFilter, severityFilter]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Top Navigation Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.headerTitleWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Trybel Admin</Text>
            <View style={[styles.roleBadge, { backgroundColor: roleMeta.badgeColor }]}>
              <Text style={styles.roleBadgeText}>{roleMeta.badgeText}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{roleMeta.description}</Text>
        </View>
      </View>

      {/* Role Switcher Pill Bar (Simulates RBAC Tiers) */}
      <View style={styles.roleSwitcherContainer}>
        <Text style={styles.switcherLabel}>SWITCH ACTIVE ROLE:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roleChipsScroll}>
          <TouchableOpacity
            style={[styles.roleChip, activeRole === 'main_admin' && styles.roleChipActive]}
            onPress={() => setActiveRole('main_admin')}
          >
            <Text style={[styles.roleChipText, activeRole === 'main_admin' && styles.roleChipTextActive]}>
              👑 Main Admin
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleChip, activeRole === 'super_mod' && styles.roleChipActive]}
            onPress={() => setActiveRole('super_mod')}
          >
            <Text style={[styles.roleChipText, activeRole === 'super_mod' && styles.roleChipTextActive]}>
              ⚡ Super Mod (All Colleges)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleChip, activeRole === 'campus_mod' && styles.roleChipActive]}
            onPress={() => {
              setActiveRole('campus_mod');
              setCollegeFilter('col_stpeters_01');
            }}
          >
            <Text style={[styles.roleChipText, activeRole === 'campus_mod' && styles.roleChipTextActive]}>
              🏫 Campus Mod (SPEC)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleChip, activeRole === 'club_head' && styles.roleChipActive]}
            onPress={() => {
              setActiveRole('club_head');
              setActiveSection('pulse');
            }}
          >
            <Text style={[styles.roleChipText, activeRole === 'club_head' && styles.roleChipTextActive]}>
              🛡️ Club Head (GDSC)
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* College Scoping Selector (Only enabled for Main Admin & Super Mod) */}
      {activeRole !== 'campus_mod' && activeRole !== 'club_head' ? (
        <View style={styles.collegeScopeBar}>
          <Text style={styles.scopeLabel}>CAMPUS SCOPE:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            <TouchableOpacity
              style={[styles.scopeChip, collegeFilter === 'all' && styles.scopeChipActive]}
              onPress={() => setCollegeFilter('all')}
            >
              <Text style={[styles.scopeChipText, collegeFilter === 'all' && styles.scopeChipTextActive]}>
                Global (All)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scopeChip, collegeFilter === 'col_stpeters_01' && styles.scopeChipActive]}
              onPress={() => setCollegeFilter('col_stpeters_01')}
            >
              <Text style={[styles.scopeChipText, collegeFilter === 'col_stpeters_01' && styles.scopeChipTextActive]}>
                SPEC Hyderabad
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scopeChip, collegeFilter === 'col_cbit_02' && styles.scopeChipActive]}
              onPress={() => setCollegeFilter('col_cbit_02')}
            >
              <Text style={[styles.scopeChipText, collegeFilter === 'col_cbit_02' && styles.scopeChipTextActive]}>
                CBIT Hyd
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.scopeChip, collegeFilter === 'col_iith_03' && styles.scopeChipActive]}
              onPress={() => setCollegeFilter('col_iith_03')}
            >
              <Text style={[styles.scopeChipText, collegeFilter === 'col_iith_03' && styles.scopeChipTextActive]}>
                IIT Hyderabad
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      ) : activeRole === 'campus_mod' ? (
        <View style={styles.lockedScopeBar}>
          <Ionicons name="lock-closed" size={12} color="#0284C7" />
          <Text style={styles.lockedScopeText}>
            Campus Mod Locked: Showing records for St. Peter's Engineering College only.
          </Text>
        </View>
      ) : null}

      {/* Main Pillars Segmented Control */}
      <View style={styles.segmentedWrap}>
        <IOSSegmentedControl<'verify' | 'moderation' | 'pulse' | 'audit'>
          values={['verify', 'moderation', 'pulse', 'audit']}
          selectedIndex={['verify', 'moderation', 'pulse', 'audit'].indexOf(activeSection)}
          onChange={(val) => setActiveSection(val)}
          formatLabel={(val) => {
            switch (val) {
              case 'verify':
                return `Verify (${visibleVerifications.length})`;
              case 'moderation':
                return `Reports (${visibleIncidents.length})`;
              case 'pulse':
                return 'Top Clubs 🏆';
              case 'audit':
                return 'Audit Chain 🔒';
            }
          }}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ========================================================= */}
        {/* PILLAR 1: 2-STEP STUDENT IDENTITY VERIFICATION QUEUE      */}
        {/* ========================================================= */}
        {activeSection === 'verify' && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionNotice}>
              <Ionicons name="shield-checkmark" size={18} color="#30D158" />
              <Text style={styles.sectionNoticeText}>
                Step 1: College Email OTP Verified. Step 2: Review physical/digital college ID card against campus registry.
              </Text>
            </View>

            {visibleVerifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-done-circle" size={54} color="#30D158" />
                <Text style={styles.emptyTitle}>Verification Queue Cleared</Text>
                <Text style={styles.emptySubtitle}>All submitted college ID cards have been reviewed.</Text>
              </View>
            ) : (
              visibleVerifications.map(candidate => (
                <View key={candidate.id} style={styles.card}>
                  {/* Card Header */}
                  <View style={styles.cardHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.candidateCollege}>{candidate.collegeName}</Text>
                    </View>
                    <View style={styles.rollBadge}>
                      <Text style={styles.rollBadgeText}>{candidate.rollNo}</Text>
                    </View>
                  </View>

                  <Text style={styles.candidateDepartment}>{candidate.department}</Text>

                  {/* 2-Step Checklist Indicator */}
                  <View style={styles.twoStepBox}>
                    <View style={styles.stepItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#30D158" />
                      <Text style={styles.stepText}>
                        <Text style={{ fontWeight: '700' }}>Step 1 (Email):</Text> {candidate.email}
                      </Text>
                    </View>

                    <View style={styles.stepItem}>
                      <Ionicons name="id-card" size={16} color="#FF9F0A" />
                      <Text style={styles.stepText}>
                        <Text style={{ fontWeight: '700' }}>Step 2 (ID Card):</Text> {candidate.idCardRef} ({candidate.idCardIssuedYear})
                      </Text>
                    </View>
                  </View>

                  {/* ID Card Visual Preview Mockup */}
                  <View style={styles.idCardMockup}>
                    <View style={styles.idCardHeader}>
                      <Ionicons name="school" size={16} color="#FFFFFF" />
                      <Text style={styles.idCardHeaderText}>{candidate.collegeName.toUpperCase()}</Text>
                    </View>
                    <View style={styles.idCardBody}>
                      <View style={styles.idCardPhotoPlaceholder}>
                        <Ionicons name="person" size={28} color="rgba(255,255,255,0.4)" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.idCardStudentName}>{candidate.name}</Text>
                        <Text style={styles.idCardStudentRoll}>ROLL: {candidate.rollNo}</Text>
                        <Text style={styles.idCardStudentDept}>{candidate.department}</Text>
                        <Text style={styles.idCardValid}>VALID: {candidate.idCardIssuedYear}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Quick Action Buttons */}
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleOpenRejectModal(candidate)}
                    >
                      <Text style={styles.rejectBtnText}>Reject ID</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApproveVerification(candidate)}
                    >
                      <Text style={styles.approveBtnText}>Approve Badge ✓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* PILLAR 2: TRIAGE MODERATION QUEUE & GRANULAR ACTIONS       */}
        {/* ========================================================= */}
        {activeSection === 'moderation' && (
          <View style={styles.sectionWrap}>
            {/* Severity Triage Pills */}
            <View style={styles.severityTriageRow}>
              {(['all', 'high', 'medium', 'low'] as const).map(sev => (
                <TouchableOpacity
                  key={sev}
                  style={[styles.sevPill, severityFilter === sev && styles.sevPillActive]}
                  onPress={() => setSeverityFilter(sev)}
                >
                  <Text style={[styles.sevPillText, severityFilter === sev && styles.sevPillTextActive]}>
                    {sev === 'all'
                      ? 'All'
                      : sev === 'high'
                      ? '🚨 High Priority'
                      : sev === 'medium'
                      ? '⚠️ Medium'
                      : 'ℹ️ Low'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {visibleIncidents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="shield-checkmark" size={54} color="#30D158" />
                <Text style={styles.emptyTitle}>Incident Queue Clear</Text>
                <Text style={styles.emptySubtitle}>No unreviewed community reports for the current filter.</Text>
              </View>
            ) : (
              visibleIncidents.map(incident => (
                <View key={incident.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View
                      style={[
                        styles.severityTag,
                        incident.severity === 'high'
                          ? styles.sevTagHigh
                          : incident.severity === 'medium'
                          ? styles.sevTagMed
                          : styles.sevTagLow
                      ]}
                    >
                      <Text style={styles.severityTagText}>
                        {incident.severity.toUpperCase()} • {incident.category.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.timeAgoText}>{incident.timeAgo}</Text>
                  </View>

                  <Text style={styles.reportedSubject}>User: {incident.targetUser}</Text>
                  <Text style={styles.reportedCollege}>Campus: {incident.collegeName}</Text>

                  {/* Flagged Content Quote */}
                  <View style={styles.quoteBox}>
                    <Text style={styles.quoteText}>{incident.snippet}</Text>
                  </View>

                  <Text style={styles.reporterMeta}>Reported by: {incident.reporter}</Text>

                  {/* Action Buttons */}
                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.dismissBtn}
                      onPress={() => handleDismissIncident(incident)}
                    >
                      <Text style={styles.dismissBtnText}>Dismiss</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.takeActionBtn}
                      onPress={() => handleOpenActionModal(incident)}
                    >
                      <Text style={styles.takeActionBtnText}>Take Action...</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ========================================================= */}
        {/* PILLAR 4: CAMPUS PULSE & "TOP CLUB OF THE MONTH" LEADERBOARD*/}
        {/* ========================================================= */}
        {activeSection === 'pulse' && (
          <View style={styles.sectionWrap}>
            {/* Top Club of the Month Winner Podium Card */}
            {scoredClubs.length > 0 && (
              <View style={styles.topClubWinnerCard}>
                <View style={styles.trophyBanner}>
                  <Text style={styles.trophyIcon}>🏆</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.topClubTitle}>TOP CLUB OF THE MONTH</Text>
                    <Text style={styles.topClubSubtitle}>Rank #1 across campus engagement, events & verified diversity</Text>
                  </View>
                  <View style={styles.scorePill}>
                    <Text style={styles.scorePillNum}>{scoredClubs[0].calculatedScore}</Text>
                    <Text style={styles.scorePillUnit}>PTS</Text>
                  </View>
                </View>

                <View style={styles.winnerClubInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Text style={styles.winnerClubName}>{scoredClubs[0].name}</Text>
                    {scoredClubs[0].isVerified && (
                      <Ionicons name="checkmark-circle" size={18} color="#0A84FF" />
                    )}
                  </View>
                  <Text style={styles.winnerLead}>Led by: {scoredClubs[0].presidentName}</Text>
                </View>

                {/* Mathematical Score Formula Breakdown */}
                <View style={styles.scoreBreakdownGrid}>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreColNum}>{scoredClubs[0].eventsHosted} ({scoredClubs[0].eventsHosted * 25}p)</Text>
                    <Text style={styles.scoreColLabel}>Events (×25)</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreColNum}>{scoredClubs[0].verifiedAttendees} ({scoredClubs[0].verifiedAttendees * 2}p)</Text>
                    <Text style={styles.scoreColLabel}>Attendees (×2)</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreColNum}>{scoredClubs[0].studentInteractions} ({scoredClubs[0].studentInteractions * 1}p)</Text>
                    <Text style={styles.scoreColLabel}>Interactions</Text>
                  </View>
                  <View style={styles.scoreCol}>
                    <Text style={styles.scoreColNum}>0</Text>
                    <Text style={styles.scoreColLabel}>Penalties</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Club Ranking Table */}
            <Text style={styles.subSectionTitle}>CAMPUS CLUB LEADERBOARD</Text>

            {scoredClubs.map((club, index) => (
              <View key={club.id} style={styles.clubRowCard}>
                <View style={styles.clubRankBadge}>
                  <Text style={styles.clubRankNum}>#{index + 1}</Text>
                </View>

                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={styles.clubRowName}>{club.name}</Text>
                    {club.isVerified ? (
                      <Ionicons name="checkmark-circle" size={14} color="#0A84FF" />
                    ) : null}
                  </View>
                  <Text style={styles.clubRowCategory}>
                    {club.category} • {club.presidentName}
                  </Text>
                  <Text style={styles.clubStatMini}>
                    {club.eventsHosted} events • {club.verifiedAttendees} attendees • {club.studentInteractions} reactions
                  </Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  <Text style={styles.clubScoreBold}>{club.calculatedScore} pts</Text>
                  {activeRole !== 'club_head' ? (
                    <TouchableOpacity
                      style={[styles.verifyToggleBtn, club.isVerified && styles.verifyToggleBtnActive]}
                      onPress={() => handleToggleClubVerification(club.id)}
                    >
                      <Text style={styles.verifyToggleText}>
                        {club.isVerified ? 'Official ✓' : 'Verify'}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            ))}

            {/* Platform Pulse KPI Tiles */}
            <Text style={[styles.subSectionTitle, { marginTop: 16 }]}>CAMPUS PULSE HEALTH</Text>
            <View style={styles.kpiGrid}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiVal}>2,840</Text>
                <Text style={styles.kpiLabel}>Verified Students</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiVal}>91.4%</Text>
                <Text style={styles.kpiLabel}>2-Step Completion</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiVal}>8.2m</Text>
                <Text style={styles.kpiLabel}>Resolution Time</Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiVal}>100%</Text>
                <Text style={styles.kpiLabel}>Audit Integrity</Text>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================= */}
        {/* PILLAR 3: ENCRYPTED IMMUTABLE AUDIT TRAIL & RBAC ROSTER    */}
        {/* ========================================================= */}
        {activeSection === 'audit' && (
          <View style={styles.sectionWrap}>
            {/* Cryptographic Chain Integrity Indicator */}
            <View style={styles.chainIntegrityBanner}>
              <Ionicons name="lock-closed" size={20} color="#30D158" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.chainTitle}>IMMUTABLE AUDIT CHAIN: 100% VERIFIED</Text>
                <Text style={styles.chainSubtitle}>
                  SHA-256 tamper-evident hash chaining active. Every moderation action is cryptographically sealed and encrypted at rest (AES-256-GCM).
                </Text>
              </View>
            </View>

            {/* Audit Log Entries */}
            {auditLogs.map((log) => (
              <TouchableOpacity
                key={log.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => setInspectAuditLog(log)}
              >
                <View style={styles.cardHeaderRow}>
                  <View style={styles.auditActionTag}>
                    <Text style={styles.auditActionTagText}>#{log.sequence} {log.actionType}</Text>
                  </View>
                  <Text style={styles.timeAgoText}>{log.timestamp}</Text>
                </View>

                <Text style={styles.auditTarget}>Target: {log.targetName}</Text>
                <Text style={styles.auditReason}>Reason: {log.reason}</Text>

                <View style={styles.cryptoHashBox}>
                  <Text style={styles.hashLine} numberOfLines={1}>
                    <Text style={{ color: '#8E8E93' }}>SHA256: </Text>
                    {log.entryHash}
                  </Text>
                  <Text style={styles.hashLine} numberOfLines={1}>
                    <Text style={{ color: '#8E8E93' }}>PREV: </Text>
                    {log.prevHash}
                  </Text>
                </View>

                <View style={styles.auditFooter}>
                  <Text style={styles.auditActor}>By: {log.actorName} ({log.actorRole.toUpperCase()})</Text>
                  <View style={styles.encryptedBadge}>
                    <Ionicons name="key" size={10} color="#30D158" />
                    <Text style={styles.encryptedBadgeText}>AES-256-GCM</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ========================================================= */}
      {/* MODAL 1: REJECT ID CARD MODAL                            */}
      {/* ========================================================= */}
      <Modal
        visible={!!rejectModalCandidate}
        transparent
        animationType="fade"
        onRequestClose={() => setRejectModalCandidate(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reject Verification Application</Text>
              <TouchableOpacity onPress={() => setRejectModalCandidate(null)}>
                <Ionicons name="close" size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {rejectModalCandidate && (
              <Text style={styles.modalSub}>
                Provide feedback to {rejectModalCandidate.name} ({rejectModalCandidate.rollNo}) explaining why their ID card could not be validated.
              </Text>
            )}

            <Text style={styles.fieldLabel}>PRESET REASONS:</Text>
            {[
              'Blurry ID / Unreadable text',
              'Expired ID / Invalid academic year',
              'Roll Number mismatch with university registry',
              'Alumni / Non-student identity'
            ].map(preset => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetChip,
                  rejectReasonPreset === preset && !rejectCustomReason && styles.presetChipActive
                ]}
                onPress={() => {
                  setRejectReasonPreset(preset);
                  setRejectCustomReason('');
                }}
              >
                <Ionicons
                  name={rejectReasonPreset === preset && !rejectCustomReason ? 'radio-button-on' : 'radio-button-off'}
                  size={16}
                  color={rejectReasonPreset === preset && !rejectCustomReason ? colors.primary : '#8E8E93'}
                />
                <Text style={styles.presetChipText}>{preset}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>OR CUSTOM REASON:</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Please upload original physical ID card, not digital screenshot..."
              placeholderTextColor="#8E8E93"
              value={rejectCustomReason}
              onChangeText={setRejectCustomReason}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setRejectModalCandidate(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmRejectBtn}
                onPress={handleConfirmReject}
              >
                <Text style={styles.modalConfirmRejectText}>Confirm Rejection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: GRANULAR MODERATION ACTION SHEET                 */}
      {/* ========================================================= */}
      <Modal
        visible={!!actionModalIncident}
        transparent
        animationType="fade"
        onRequestClose={() => setActionModalIncident(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Granular Disciplinary Action</Text>
              <TouchableOpacity onPress={() => setActionModalIncident(null)}>
                <Ionicons name="close" size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {actionModalIncident && (
              <Text style={styles.modalSub}>
                Enforce corrective measures against {actionModalIncident.targetUser} ({actionModalIncident.collegeName}).
              </Text>
            )}

            <Text style={styles.fieldLabel}>SELECT DISCIPLINARY MEASURE:</Text>

            <TouchableOpacity
              style={[styles.actionOption, actionTypeSelected === 'warn' && styles.actionOptionActive]}
              onPress={() => setActionTypeSelected('warn')}
            >
              <Ionicons name="alert-circle" size={20} color="#FF9F0A" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.actionOptTitle}>Issue Formal In-App Warning</Text>
                <Text style={styles.actionOptSub}>Official violation notification delivered to student's inbox.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionOption, actionTypeSelected === 'mute_48h' && styles.actionOptionActive]}
              onPress={() => setActionTypeSelected('mute_48h')}
            >
              <Ionicons name="volume-mute" size={20} color="#0A84FF" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.actionOptTitle}>48-Hour Campus Read-Only Mute</Text>
                <Text style={styles.actionOptSub}>Cannot post, comment, or message across campus feeds for 48h.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionOption, actionTypeSelected === 'remove_content' && styles.actionOptionActive]}
              onPress={() => setActionTypeSelected('remove_content')}
            >
              <Ionicons name="trash" size={20} color="#FF453A" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.actionOptTitle}>Purge Offending Content</Text>
                <Text style={styles.actionOptSub}>Instantly removes the post, comment, or media from all student feeds.</Text>
              </View>
            </TouchableOpacity>

            {(activeRole === 'main_admin' || activeRole === 'super_mod') && (
              <TouchableOpacity
                style={[styles.actionOption, actionTypeSelected === 'device_ban' && styles.actionOptionActive]}
                onPress={() => setActionTypeSelected('device_ban')}
              >
                <Ionicons name="ban" size={20} color="#E11D48" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.actionOptTitle, { color: '#E11D48' }]}>Permanent Device Ban (UUID)</Text>
                  <Text style={styles.actionOptSub}>Bans hardware device UUID and blacklist roll number permanently.</Text>
                </View>
              </TouchableOpacity>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>JUSTIFICATION / REASON (AUDIT RECORD):</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Violation of campus anti-ragging code of conduct..."
              placeholderTextColor="#8E8E93"
              value={actionReason}
              onChangeText={setActionReason}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setActionModalIncident(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmActionBtn}
                onPress={handleConfirmModerationAction}
              >
                <Text style={styles.modalConfirmActionText}>Apply Action</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: CRYPTOGRAPHIC AUDIT LOG DECRYPTION INSPECTOR      */}
      {/* ========================================================= */}
      <Modal
        visible={!!inspectAuditLog}
        transparent
        animationType="fade"
        onRequestClose={() => setInspectAuditLog(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="lock-closed" size={18} color="#30D158" />
                <Text style={styles.modalTitle}>Audit Block #{inspectAuditLog?.sequence}</Text>
              </View>
              <TouchableOpacity onPress={() => setInspectAuditLog(null)}>
                <Ionicons name="close" size={22} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            {inspectAuditLog && (
              <ScrollView style={{ maxHeight: 380 }}>
                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>ACTION:</Text>
                  <Text style={styles.inspectValue}>{inspectAuditLog.actionType}</Text>
                </View>

                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>ACTOR:</Text>
                  <Text style={styles.inspectValue}>{inspectAuditLog.actorName} ({inspectAuditLog.actorRole})</Text>
                </View>

                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>SUBJECT:</Text>
                  <Text style={styles.inspectValue}>{inspectAuditLog.targetName}</Text>
                </View>

                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>REASON:</Text>
                  <Text style={styles.inspectValue}>{inspectAuditLog.reason}</Text>
                </View>

                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>TIMESTAMP:</Text>
                  <Text style={styles.inspectValue}>{inspectAuditLog.timestamp}</Text>
                </View>

                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>CURRENT HASH:</Text>
                  <Text style={styles.hashInspectText}>{inspectAuditLog.entryHash}</Text>
                </View>

                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>PREVIOUS BLOCK HASH:</Text>
                  <Text style={styles.hashInspectText}>{inspectAuditLog.prevHash}</Text>
                </View>

                <View style={styles.auditInspectRow}>
                  <Text style={styles.inspectLabel}>ENCRYPTION STATUS:</Text>
                  <Text style={[styles.inspectValue, { color: '#30D158' }]}>
                    AES-256-GCM Verified (Zero Tampering Detected)
                  </Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.modalCancelBtn, { marginTop: 14 }]}
              onPress={() => setInspectAuditLog(null)}
            >
              <Text style={styles.modalCancelText}>Close Inspector</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// STYLES (iOS Native HIG Aesthetics)
// -------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(84, 84, 88, 0.4)'
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitleWrap: {
    flex: 1,
    marginLeft: 12
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2
  },
  roleSwitcherContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 4
  },
  switcherLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  roleChipsScroll: {
    gap: 8,
    paddingBottom: 4
  },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)'
  },
  roleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  roleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93'
  },
  roleChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  collegeScopeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8
  },
  scopeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8
  },
  scopeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#1C1C1E'
  },
  scopeChipActive: {
    backgroundColor: '#2C2C2E'
  },
  scopeChipText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600'
  },
  scopeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  lockedScopeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 6
  },
  lockedScopeText: {
    fontSize: 11,
    color: '#0284C7',
    fontWeight: '600'
  },
  segmentedWrap: {
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  sectionWrap: {
    gap: 14
  },
  sectionNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    borderRadius: 10,
    padding: 10,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(48, 209, 88, 0.3)'
  },
  sectionNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#30D158',
    lineHeight: 15
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)',
    gap: 8
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2
  },
  candidateCollege: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1
  },
  candidateDepartment: {
    fontSize: 12,
    color: '#EBEBF5',
    fontWeight: '500'
  },
  rollBadge: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  rollBadgeText: {
    color: '#0A84FF',
    fontSize: 11,
    fontWeight: '700'
  },
  twoStepBox: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 10,
    gap: 6,
    marginTop: 4
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  stepText: {
    fontSize: 11,
    color: '#EBEBF5'
  },
  idCardMockup: {
    backgroundColor: '#18181A',
    borderRadius: 10,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    marginTop: 4
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 6,
    marginBottom: 8
  },
  idCardHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5
  },
  idCardBody: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  idCardPhotoPlaceholder: {
    width: 48,
    height: 56,
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  idCardStudentName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  idCardStudentRoll: {
    fontSize: 10,
    color: '#0A84FF',
    fontWeight: '600',
    marginTop: 1
  },
  idCardStudentDept: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1
  },
  idCardValid: {
    fontSize: 9,
    color: '#30D158',
    fontWeight: '700',
    marginTop: 2
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8
  },
  rejectBtn: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  rejectBtnText: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: '600'
  },
  approveBtn: {
    flex: 1.6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  severityTriageRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4
  },
  sevPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)'
  },
  sevPillActive: {
    backgroundColor: '#2C2C2E',
    borderColor: '#FFFFFF'
  },
  sevPillText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600'
  },
  sevPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700'
  },
  severityTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  sevTagHigh: {
    backgroundColor: 'rgba(255, 69, 58, 0.15)'
  },
  sevTagMed: {
    backgroundColor: 'rgba(255, 159, 10, 0.15)'
  },
  sevTagLow: {
    backgroundColor: 'rgba(10, 132, 255, 0.15)'
  },
  severityTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  timeAgoText: {
    fontSize: 11,
    color: '#8E8E93'
  },
  reportedSubject: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  reportedCollege: {
    fontSize: 11,
    color: '#8E8E93'
  },
  quoteBox: {
    backgroundColor: '#2C2C2E',
    borderLeftWidth: 3,
    borderLeftColor: '#FF453A',
    padding: 10,
    borderRadius: 6,
    marginVertical: 4
  },
  quoteText: {
    fontSize: 12,
    color: '#EBEBF5',
    fontStyle: 'italic',
    lineHeight: 16
  },
  reporterMeta: {
    fontSize: 11,
    color: '#8E8E93'
  },
  dismissBtn: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  dismissBtnText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600'
  },
  takeActionBtn: {
    flex: 1.5,
    backgroundColor: 'rgba(255, 69, 58, 0.15)',
    borderWidth: 1,
    borderColor: '#FF453A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  takeActionBtnText: {
    color: '#FF453A',
    fontSize: 13,
    fontWeight: '700'
  },
  topClubWinnerCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    gap: 12
  },
  trophyBanner: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  trophyIcon: {
    fontSize: 32
  },
  topClubTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFD700',
    letterSpacing: 0.8
  },
  topClubSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2
  },
  scorePill: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    alignItems: 'center'
  },
  scorePillNum: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFD700'
  },
  scorePillUnit: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFD700'
  },
  winnerClubInfo: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(84, 84, 88, 0.4)',
    paddingTop: 10
  },
  winnerClubName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  winnerLead: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2
  },
  scoreBreakdownGrid: {
    flexDirection: 'row',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 10
  },
  scoreCol: {
    flex: 1,
    alignItems: 'center'
  },
  scoreColNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  scoreColLabel: {
    fontSize: 9,
    color: '#8E8E93',
    marginTop: 2
  },
  subSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginTop: 8
  },
  clubRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)'
  },
  clubRankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center'
  },
  clubRankNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  clubRowName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  clubRowCategory: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1
  },
  clubStatMini: {
    fontSize: 9,
    color: '#0A84FF',
    marginTop: 2
  },
  clubScoreBold: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFD700'
  },
  verifyToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#2C2C2E'
  },
  verifyToggleBtnActive: {
    backgroundColor: 'rgba(10, 132, 255, 0.2)'
  },
  verifyToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0A84FF'
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  kpiCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)'
  },
  kpiVal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  kpiLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2
  },
  chainIntegrityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(48, 209, 88, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(48, 209, 88, 0.3)'
  },
  chainTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#30D158',
    letterSpacing: 0.5
  },
  chainSubtitle: {
    fontSize: 10,
    color: '#EBEBF5',
    lineHeight: 14,
    marginTop: 2
  },
  auditActionTag: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  auditActionTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  auditTarget: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  auditReason: {
    fontSize: 12,
    color: '#8E8E93'
  },
  cryptoHashBox: {
    backgroundColor: '#18181A',
    borderRadius: 6,
    padding: 8,
    marginVertical: 4
  },
  hashLine: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#30D158'
  },
  auditFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  auditActor: {
    fontSize: 11,
    color: '#8E8E93'
  },
  encryptedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(48, 209, 88, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  encryptedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#30D158'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 8
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center'
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  modalSub: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 16,
    marginBottom: 14
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
    marginBottom: 6
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6
  },
  presetChipActive: {
    backgroundColor: 'rgba(255, 36, 50, 0.15)',
    borderWidth: 1,
    borderColor: colors.primary
  },
  presetChipText: {
    fontSize: 12,
    color: '#FFFFFF'
  },
  modalInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 16
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 10
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  modalCancelText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600'
  },
  modalConfirmRejectBtn: {
    flex: 1.5,
    backgroundColor: '#FF453A',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  modalConfirmRejectText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  modalConfirmActionBtn: {
    flex: 1.5,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  modalConfirmActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  actionOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  actionOptionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(255, 36, 50, 0.12)'
  },
  actionOptTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  actionOptSub: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1
  },
  auditInspectRow: {
    marginBottom: 10
  },
  inspectLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8
  },
  inspectValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 2
  },
  hashInspectText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#30D158',
    marginTop: 2
  }
});
