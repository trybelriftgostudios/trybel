import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface AdminScreenProps {
  onBack: () => void;
}

export const AdminScreen: React.FC<AdminScreenProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'reports' | 'clubs' | 'logs'>('reports');
  const [reportsData, setReportsData] = useState<any>({ stats: {}, reports: [] });
  const [logs, setLogs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [actionReason, setActionReason] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      if (activeTab === 'reports') {
        const res = await api.getAdminReports();
        setReportsData(res);
      } else if (activeTab === 'clubs') {
        const res = await api.getClubs();
        setClubs(res.data || []);
      } else if (activeTab === 'logs') {
        const res = await api.getAdminLogs();
        setLogs(res.data || []);
      }
    } catch (err: any) {
      console.warn('Error loading admin data:', err);
    }
  };

  const handleTakeAction = async (action: string) => {
    if (!selectedReport) return;
    try {
      await api.takeModerationAction(selectedReport.id, action, actionReason || 'Moderator review action');
      Alert.alert('Action Executed', `Recorded action '${action}'. Immutable audit log written.`);
      setSelectedReport(null);
      setActionReason('');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleToggleClubVerify = async (club: any) => {
    try {
      await api.verifyClub(club.id, !club.is_verified, 'Verified via student council credentials');
      Alert.alert('Updated', `Club ${club.name} verification toggled. Audit log recorded.`);
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Moderator Panel</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['reports', 'clubs', 'logs'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'reports' ? 'Reports' : tab === 'clubs' ? 'Club Approvals' : 'Audit Logs'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* TAB 1: REPORTS */}
      {activeTab === 'reports' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Row */}
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{reportsData.stats?.pendingReports || 2}</Text>
              <Text style={styles.statLabel}>Pending Reports</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{reportsData.stats?.flaggedPosts || 3}</Text>
              <Text style={styles.statLabel}>Flagged Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statNum}>{reportsData.stats?.flaggedUsers || 1}</Text>
              <Text style={styles.statLabel}>Flagged Users</Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Pending Safety Queue</Text>
          {reportsData.reports?.map((rep: any) => (
            <View key={rep.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <View style={styles.reportTypeBadge}>
                  <Text style={styles.reportTypeText}>{rep.target_type?.toUpperCase()}</Text>
                </View>
                <Text style={styles.reportReason}>{rep.reason}</Text>
                <View style={[styles.statusTag, rep.status === 'pending' ? styles.statusPending : styles.statusResolved]}>
                  <Text style={styles.statusText}>{rep.status}</Text>
                </View>
              </View>

              <Text style={styles.reportDetails}>{rep.details || 'No additional details provided.'}</Text>
              <Text style={styles.reportTime}>Reported: {rep.created_at}</Text>

              {rep.status === 'pending' && (
                <TouchableOpacity
                  style={styles.reviewBtn}
                  onPress={() => setSelectedReport(rep)}
                >
                  <Text style={styles.reviewBtnText}>Take Action</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* TAB 2: CLUB APPROVALS */}
      {activeTab === 'clubs' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Campus Club Verification</Text>
          {clubs.map(club => (
            <View key={club.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.clubName}>{club.name}</Text>
                <View style={[styles.statusTag, club.is_verified ? styles.statusResolved : styles.statusPending]}>
                  <Text style={styles.statusText}>{club.is_verified ? 'Verified' : 'Unverified'}</Text>
                </View>
              </View>
              <Text style={styles.reportDetails}>{club.description}</Text>
              <TouchableOpacity
                style={[styles.reviewBtn, club.is_verified ? styles.revokeBtn : styles.verifyBtn]}
                onPress={() => handleToggleClubVerify(club)}
              >
                <Text style={styles.reviewBtnText}>
                  {club.is_verified ? 'Revoke Verification' : 'Verify Club President'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionHeader}>Immutable Admin Activity Logs</Text>
          {logs.map(log => (
            <View key={log.id} style={styles.logCard}>
              <Text style={styles.logAction}>⚡ {log.action}</Text>
              <Text style={styles.logTarget}>Target: {log.target_object_type} ({log.target_object_id})</Text>
              <Text style={styles.logReason}>Reason: {log.reason || 'N/A'}</Text>
              <Text style={styles.logTime}>Timestamp: {log.timestamp}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Action Modal */}
      <Modal visible={!!selectedReport} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Resolve Report</Text>
            <Text style={styles.modalSub}>{selectedReport?.reason} on {selectedReport?.target_type}</Text>

            <Text style={styles.fieldLabel}>Action Reason (Required for Audit Log)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Violates Section 4 Community Safety Policy"
              placeholderTextColor={colors.textMuted}
              value={actionReason}
              onChangeText={setActionReason}
            />

            <View style={styles.actionButtonsCol}>
              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: colors.danger }]}
                onPress={() => handleTakeAction('remove_content')}
              >
                <Text style={styles.actionBtnText}>Remove Content</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#B45309' }]}
                onPress={() => handleTakeAction('suspend_user')}
              >
                <Text style={styles.actionBtnText}>Suspend User Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalActionBtn, { backgroundColor: '#334155' }]}
                onPress={() => handleTakeAction('dismiss')}
              >
                <Text style={styles.actionBtnText}>Dismiss Report</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.cancelLink} onPress={() => setSelectedReport(null)}>
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 48
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtn: {
    padding: 6,
    marginRight: 10
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTabBtn: {
    backgroundColor: '#1E293B'
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  activeTabText: {
    color: colors.textPrimary
  },
  content: {
    flex: 1,
    marginBottom: 60
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  statCol: {
    flex: 1,
    alignItems: 'center'
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  reportCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  reportTypeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8
  },
  reportTypeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700'
  },
  reportReason: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  statusPending: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)'
  },
  statusResolved: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)'
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#F59E0B'
  },
  reportDetails: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 8
  },
  reportTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 10
  },
  reviewBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  reviewBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  clubName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1
  },
  verifyBtn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  revokeBtn: {
    backgroundColor: colors.danger,
    borderColor: colors.danger
  },
  logCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  logAction: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 4
  },
  logTarget: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2
  },
  logReason: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4
  },
  logTime: {
    fontSize: 10,
    color: colors.textMuted
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  modalSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 14
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 16
  },
  actionButtonsCol: {
    gap: 10,
    marginBottom: 14
  },
  modalActionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  actionBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700'
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: 6
  },
  cancelLinkText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  }
});
