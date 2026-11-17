import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';

interface PendingReport {
  id: string;
  targetUser: string;
  reason: string;
  reporter: string;
  details: string;
  time: string;
}

interface VerificationCandidate {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  email: string;
  idCardRef: string;
}

interface AuditLog {
  id: string;
  action: string;
  moderator: string;
  timestamp: string;
}

export default function AdminConsoleModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [activeTab, setActiveTab] = useState<'reports' | 'verifications' | 'audit'>('reports');

  const [reports, setReports] = useState<PendingReport[]>([
    {
      id: 'rep_1',
      targetUser: 'AnonymousUser92',
      reason: 'Spam, Scams, or Commercial Ads',
      reporter: 'Confidential Student',
      details: 'Posting external paid assignment services in the general campus feed.',
      time: '25m ago'
    },
    {
      id: 'rep_2',
      targetUser: 'Karan Malhotra',
      reason: 'Academic Dishonesty',
      reporter: 'Faculty Observer',
      details: 'Alleged circulating unreleased lab exam question bank answers.',
      time: '3h ago'
    }
  ]);

  const [verifications, setVerifications] = useState<VerificationCandidate[]>([
    {
      id: 'v_1',
      name: 'Rohan Sharma',
      rollNo: '23SPCS104',
      department: 'Computer Science & Engineering',
      email: 'rohan.23cs@stpetershyd.edu.in',
      idCardRef: 'ID Card Photo Verified'
    },
    {
      id: 'v_2',
      name: 'Ananya Roy',
      rollNo: '23SPIT048',
      department: 'Information Technology',
      email: 'ananya.roy@stpetershyd.edu.in',
      idCardRef: 'ID Card Photo Verified'
    }
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'log_1',
      action: 'Verified college credentials for Varun Dulam (22SPCS089)',
      moderator: 'Dean Student Affairs',
      timestamp: 'Yesterday 4:30 PM'
    },
    {
      id: 'log_2',
      action: 'Dismissed false report on GDSC Event post',
      moderator: 'Campus Moderator 01',
      timestamp: '2 days ago'
    }
  ]);

  const handleResolveReport = (reportId: string, actionType: 'dismiss' | 'warn' | 'remove') => {
    const rep = reports.find(r => r.id === reportId);
    if (!rep) return;

    setReports(prev => prev.filter(r => r.id !== reportId));

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action: `${actionType.toUpperCase()}: ${rep.targetUser} (${rep.reason})`,
      moderator: 'Varun (Dean Moderator)',
      timestamp: 'Just now'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    if (actionType === 'dismiss') {
      showFeedback('Report dismissed as resolved.', 'info');
    } else if (actionType === 'warn') {
      showFeedback(`Official campus disciplinary warning sent to ${rep.targetUser}.`, 'warning');
    } else {
      showFeedback(`Content removed and ${rep.targetUser} restricted from campus feed.`, 'success');
    }
  };

  const handleApproveVerification = (candidateId: string) => {
    const candidate = verifications.find(v => v.id === candidateId);
    if (!candidate) return;

    setVerifications(prev => prev.filter(v => v.id !== candidateId));

    const newLog: AuditLog = {
      id: `log_${Date.now()}`,
      action: `Approved student verification for ${candidate.name} (${candidate.rollNo})`,
      moderator: 'Varun (Dean Moderator)',
      timestamp: 'Just now'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    showFeedback(`Approved verified student badge for ${candidate.name}!`, 'success');
  };

  const handleRejectVerification = (candidateId: string) => {
    const candidate = verifications.find(v => v.id === candidateId);
    if (!candidate) return;

    setVerifications(prev => prev.filter(v => v.id !== candidateId));

    showFeedback(`Rejected verification application for ${candidate.name}.`, 'info');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={styles.titleRow}>
            <Text style={styles.headerTitle}>Moderator Console</Text>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>DEAN LEVEL</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>Campus Moderation & Verification Portal</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'reports' && styles.tabItemActive]}
          onPress={() => setActiveTab('reports')}
        >
          <Text style={[styles.tabText, activeTab === 'reports' && styles.tabTextActive]}>
            Reports ({reports.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'verifications' && styles.tabItemActive]}
          onPress={() => setActiveTab('verifications')}
        >
          <Text style={[styles.tabText, activeTab === 'verifications' && styles.tabTextActive]}>
            Verifications ({verifications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'audit' && styles.tabItemActive]}
          onPress={() => setActiveTab('audit')}
        >
          <Text style={[styles.tabText, activeTab === 'audit' && styles.tabTextActive]}>
            Audit Logs
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'reports' && (
          <View style={styles.sectionWrap}>
            {reports.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛡️</Text>
                <Text style={styles.emptyTitle}>All Clear</Text>
                <Text style={styles.emptySubtitle}>No pending safety reports or community flag incidents.</Text>
              </View>
            ) : (
              reports.map(rep => (
                <View key={rep.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.dangerTag}>
                      <Text style={styles.dangerTagText}>FLAGGED</Text>
                    </View>
                    <Text style={styles.repTime}>{rep.time}</Text>
                  </View>

                  <Text style={styles.reportedUser}>Subject: {rep.targetUser}</Text>
                  <Text style={styles.repReason}>Category: {rep.reason}</Text>
                  <Text style={styles.repDetails}>{rep.details}</Text>
                  <Text style={styles.repSource}>Reported by: {rep.reporter}</Text>

                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.dismissBtn}
                      onPress={() => handleResolveReport(rep.id, 'dismiss')}
                    >
                      <Text style={styles.dismissText}>Dismiss</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.warnBtn}
                      onPress={() => handleResolveReport(rep.id, 'warn')}
                    >
                      <Text style={styles.warnText}>Warn</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => handleResolveReport(rep.id, 'remove')}
                    >
                      <Text style={styles.removeText}>Remove Content</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'verifications' && (
          <View style={styles.sectionWrap}>
            {verifications.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎓</Text>
                <Text style={styles.emptyTitle}>Queue Cleared</Text>
                <Text style={styles.emptySubtitle}>No pending student verification requests.</Text>
              </View>
            ) : (
              verifications.map(candidate => (
                <View key={candidate.id} style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.candidateName}>{candidate.name}</Text>
                    <View style={styles.rollBadge}>
                      <Text style={styles.rollBadgeText}>{candidate.rollNo}</Text>
                    </View>
                  </View>

                  <Text style={styles.candidateSub}>{candidate.department}</Text>
                  <Text style={styles.candidateEmail}>📧 {candidate.email}</Text>
                  <Text style={styles.idCardProof}>🪪 {candidate.idCardRef}</Text>

                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.dismissBtn}
                      onPress={() => handleRejectVerification(candidate.id)}
                    >
                      <Text style={styles.dismissText}>Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApproveVerification(candidate.id)}
                    >
                      <Text style={styles.approveText}>Approve & Issue Badge ✓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === 'audit' && (
          <View style={styles.sectionWrap}>
            <View style={styles.auditContainer}>
              {auditLogs.map(log => (
                <View key={log.id} style={styles.auditRow}>
                  <Text style={styles.auditDot}>●</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.auditAction}>{log.action}</Text>
                    <View style={styles.auditMetaRow}>
                      <Text style={styles.auditMod}>By: {log.moderator}</Text>
                      <Text style={styles.auditTime}>{log.timestamp}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center'
  },
  backBtnText: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700'
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
    fontWeight: '800',
    color: colors.textPrimary
  },
  adminBadge: {
    backgroundColor: '#7C2D12',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  adminBadgeText: {
    color: '#FB923C',
    fontSize: 9,
    fontWeight: '900'
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.bg
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  tabTextActive: {
    color: colors.bg,
    fontWeight: '800'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  sectionWrap: {
    gap: 12
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 8
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dangerTag: {
    backgroundColor: '#450A0A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4
  },
  dangerTagText: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '800'
  },
  repTime: {
    fontSize: 11,
    color: colors.textMuted
  },
  reportedUser: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  repReason: {
    fontSize: 13,
    color: colors.dangerText,
    fontWeight: '600'
  },
  repDetails: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16
  },
  repSource: {
    fontSize: 11,
    color: colors.textMuted
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  dismissBtn: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  dismissText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700'
  },
  warnBtn: {
    flex: 1,
    backgroundColor: '#451A03',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  warnText: {
    color: '#FDBA74',
    fontSize: 12,
    fontWeight: '800'
  },
  removeBtn: {
    flex: 1.5,
    backgroundColor: colors.danger,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  removeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800'
  },
  candidateName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  rollBadge: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  rollBadgeText: {
    color: colors.accentBlue,
    fontSize: 11,
    fontWeight: '800'
  },
  candidateSub: {
    fontSize: 12,
    color: colors.textSecondary
  },
  candidateEmail: {
    fontSize: 12,
    color: colors.textMuted
  },
  idCardProof: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600'
  },
  approveBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  approveText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '800'
  },
  auditContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 14
  },
  auditRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start'
  },
  auditDot: {
    color: colors.accentBlue,
    fontSize: 12,
    marginTop: 2
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  auditMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4
  },
  auditMod: {
    fontSize: 11,
    color: colors.accentBlue
  },
  auditTime: {
    fontSize: 11,
    color: colors.textMuted
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center'
  }
});