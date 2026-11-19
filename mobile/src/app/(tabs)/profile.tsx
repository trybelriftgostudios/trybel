import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useSecurity } from '../../context/SecurityContext';
import { useFeedback } from '../../context/FeedbackContext';
import { exportImportService } from '../../services/export-import.service';

export default function ProfileScreen() {
  const router = useRouter();
  const { lockApp, hasPin } = useSecurity();
  const { showFeedback } = useFeedback();

  const [isExporting, setIsExporting] = useState(false);

  const studentProfile = {
    userId: 'usr_sritan_01',
    username: 'Varun Dulam', // Discord-style display name (can have spaces, emojis, custom casing)
    fullName: 'Varun Dulam',
    email: 'varun.dulam@stpeters.edu.in',
    collegeName: "St. Peter's Engineering College",
    department: 'CSE',
    yearOfStudy: '3rd Year',
    verified: true,
    motto: 'Learn • Build • Connect',
    about: 'Passionate about building scalable cross-platform systems, exploring edge AI models, and collaborating for SIH 2025.',
    skills: ['Python', 'React Native', 'Expo', 'Fastify', 'TypeScript', 'PostgreSQL', 'Computer Vision'],
    interests: ['AI Research', 'Startups', 'Hackathons', 'Cloud Infrastructure'],
    availableFor: ['Study Partners', 'Hackathon Teams', 'Club Leadership']
  };

  // Discord-style: if user doesn't specify username, it defaults to their internal UID
  const effectiveUsername = studentProfile.username?.trim() || studentProfile.userId;

  const handleGeneratePdf = async () => {
    setIsExporting(true);
    showFeedback('Generating verified campus PDF report...', 'info');
    try {
      await exportImportService.generateAndSharePdfReport(studentProfile);
      showFeedback('PDF report generated and ready to share!', 'success');
    } catch (err: any) {
      showFeedback(err.message || 'PDF export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJson = async () => {
    setIsExporting(true);
    try {
      await exportImportService.exportAndShareJsonBackup();
      showFeedback('JSON campus backup exported!', 'success');
    } catch (err: any) {
      showFeedback(err.message || 'JSON export failed', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRestoreJson = async () => {
    try {
      const res = await exportImportService.pickAndRestoreJsonBackup();
      if (res.success) {
        showFeedback(`Successfully restored ${res.count} records from backup!`, 'success');
      }
    } catch (err: any) {
      showFeedback(err.message || 'Backup restore failed', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerActions}>
          {hasPin && (
            <TouchableOpacity style={styles.headerBtn} onPress={lockApp} accessibilityLabel="Lock App">
              <Ionicons name="lock-closed-outline" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/settings')} accessibilityLabel="Settings">
            <Ionicons name="settings-outline" size={18} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* iOS Large Title */}
        <View style={styles.largeTitleSection}>
          <Text style={styles.largeTitle}>Profile</Text>
        </View>

        {/* User Profile Card (iOS Apple ID Style) */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
              style={styles.avatar}
            />
            <View style={styles.verifiedCheckBadge}>
              <Ionicons name="checkmark" size={13} color={colors.white} />
            </View>
          </View>

          <Text style={styles.fullName}>{effectiveUsername}</Text>
          <Text style={styles.handleSubtext}>
            {studentProfile.fullName ? `${studentProfile.fullName} • ` : ''}
            <Text style={styles.uidTag}>UID: {studentProfile.userId}</Text>
          </Text>
          <Text style={styles.emailText}>{studentProfile.email}</Text>
          <Text style={styles.deptText}>
            {studentProfile.department} • {studentProfile.yearOfStudy} • {studentProfile.collegeName}
          </Text>
          <Text style={styles.mottoText}>“{studentProfile.motto}”</Text>

          {/* Quick Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>14</Text>
              <Text style={styles.statLabel}>Peers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>2</Text>
              <Text style={styles.statLabel}>Teams</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statNum}>3</Text>
              <Text style={styles.statLabel}>Clubs</Text>
            </View>
          </View>
        </View>

        {/* PDF & Data Backup Inset Group (iOS Settings Style) */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>DATA & PORTABILITY</Text>
          <View style={styles.groupedList}>
            <TouchableOpacity
              style={styles.groupedRow}
              onPress={handleGeneratePdf}
              disabled={isExporting}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(255, 36, 50, 0.18)' }]}>
                <Ionicons name="document-text" size={18} color={colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Generate PDF Transcript</Text>
                <Text style={styles.rowSub}>Official credentials & verified projects</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            <TouchableOpacity
              style={styles.groupedRow}
              onPress={handleExportJson}
              disabled={isExporting}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(10, 132, 255, 0.18)' }]}>
                <Ionicons name="cloud-upload" size={18} color="#0A84FF" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Export SQLite Backup</Text>
                <Text style={styles.rowSub}>Encrypted offline database dump</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            <TouchableOpacity
              style={styles.groupedRow}
              onPress={handleRestoreJson}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(94, 92, 230, 0.18)' }]}>
                <Ionicons name="cloud-download" size={18} color="#5E5CE6" />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Restore Backup</Text>
                <Text style={styles.rowSub}>Restore JSON archive to local storage</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Skills & Interests Inset Group */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>VERIFIED TECHNICAL SKILLS</Text>
          <View style={styles.tagsCard}>
            <View style={styles.tagsContainer}>
              {studentProfile.skills.map((s, idx) => (
                <View key={idx} style={styles.skillTag}>
                  <Text style={styles.skillTagText}>{s}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Available For Inset Group */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>COLLABORATION SCOPE</Text>
          <View style={styles.tagsCard}>
            <View style={styles.tagsContainer}>
              {studentProfile.availableFor.map((item, idx) => (
                <View key={idx} style={styles.availableTag}>
                  <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginRight: 5 }} />
                  <Text style={styles.availableTagText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Administrative Shortcut Row */}
        <View style={styles.sectionContainer}>
          <View style={styles.groupedList}>
            <TouchableOpacity
              style={styles.groupedRow}
              onPress={() => router.push('/admin')}
            >
              <View style={[styles.rowIconCircle, { backgroundColor: 'rgba(255, 69, 58, 0.18)' }]}>
                <Ionicons name="shield-checkmark" size={18} color={colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>Moderator & Admin Panel</Text>
                <Text style={styles.rowSub}>Campus review tools & safety logs</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    backgroundColor: colors.bg,
    zIndex: 10,
    elevation: 4
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.4
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.systemFill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110
  },
  largeTitleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.37
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder
  },
  avatarRow: {
    position: 'relative',
    marginBottom: 12
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: colors.primary
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card
  },
  fullName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3
  },
  handleSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  uidTag: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  emailText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  deptText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center'
  },
  mottoText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 10
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statBox: {
    alignItems: 'center'
  },
  statNum: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: colors.separator
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 16
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
    marginLeft: 4
  },
  groupedList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    overflow: 'hidden'
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14
  },
  rowIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rowInfo: {
    flex: 1
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  rowSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 58
  },
  tagsCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  skillTag: {
    backgroundColor: colors.tagBg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7
  },
  skillTagText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500'
  },
  availableTag: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center'
  },
  availableTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600'
  }
});
