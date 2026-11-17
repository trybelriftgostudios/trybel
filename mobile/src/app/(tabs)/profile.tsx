import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image
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
        <Text style={styles.title}>My Campus Profile</Text>
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
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
              style={styles.avatar}
            />
            <View style={styles.verifiedCheckBadge}>
              <Ionicons name="checkmark" size={14} color={colors.white} />
            </View>
          </View>

          <Text style={styles.fullName}>{studentProfile.fullName}</Text>
          <Text style={styles.emailText}>{studentProfile.email}</Text>
          <Text style={styles.deptText}>
            {studentProfile.department} • {studentProfile.yearOfStudy}
          </Text>
          <Text style={styles.collegeText}>{studentProfile.collegeName}</Text>
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

        {/* PDF & Data Backup Tools Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Campus Reports & Data Portability</Text>
          <Text style={styles.sectionSubtitle}>
            Generate certified PDF transcripts or export/restore encrypted SQLite backups.
          </Text>

          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={[styles.actionButton, styles.pdfBtn]}
              onPress={handleGeneratePdf}
              disabled={isExporting}
            >
              <Ionicons name="document-text-outline" size={22} color={colors.primary} style={styles.actionBtnIcon} />
              <View style={styles.actionBtnInfo}>
                <Text style={styles.actionBtnTitle}>Generate & Share PDF Transcript</Text>
                <Text style={styles.actionBtnSub}>Official student credentials, teams & verified projects</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.jsonBtn]}
              onPress={handleExportJson}
              disabled={isExporting}
            >
              <Ionicons name="cloud-upload-outline" size={22} color={colors.primary} style={styles.actionBtnIcon} />
              <View style={styles.actionBtnInfo}>
                <Text style={styles.actionBtnTitle}>Export SQLite JSON Backup</Text>
                <Text style={styles.actionBtnSub}>Share full offline database dump</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.restoreBtn]}
              onPress={handleRestoreJson}
            >
              <Ionicons name="cloud-download-outline" size={22} color={colors.textSecondary} style={styles.actionBtnIcon} />
              <View style={styles.actionBtnInfo}>
                <Text style={styles.actionBtnTitle}>Restore JSON Backup</Text>
                <Text style={styles.actionBtnSub}>Pick JSON file and restore into local storage</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Skills & Interests */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Verified Technical Skills</Text>
          <View style={styles.tagsContainer}>
            {studentProfile.skills.map((s, idx) => (
              <View key={idx} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{s}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available For */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Available For Collaboration</Text>
          <View style={styles.tagsContainer}>
            {studentProfile.availableFor.map((item, idx) => (
              <View key={idx} style={styles.availableTag}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.availableTagText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Administrative Shortcut */}
        <View style={styles.adminRow}>
          <TouchableOpacity
            style={styles.adminLink}
            onPress={() => router.push('/admin')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
              <Text style={styles.adminLinkText}>Open Moderator & Admin Panel &rarr;</Text>
            </View>
          </TouchableOpacity>
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.bg,
    zIndex: 10,
    elevation: 4
  },
  scrollView: {
    flex: 1
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.3
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 110,
    gap: 16
  },
  profileCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder
  },
  avatarRow: {
    position: 'relative',
    marginBottom: 12
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: colors.primary
  },
  verifiedCheckBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.card
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  emailText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  deptText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  collegeText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  mottoText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 10
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statBox: {
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
    height: 26,
    backgroundColor: colors.cardBorder
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16
  },
  buttonStack: {
    gap: 10
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tagBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  pdfBtn: {
    borderColor: 'rgba(255, 36, 50, 0.4)'
  },
  jsonBtn: {
    borderColor: colors.cardBorder
  },
  restoreBtn: {
    borderColor: colors.cardBorder
  },
  actionBtnIcon: {
    marginRight: 12
  },
  actionBtnInfo: {
    flex: 1
  },
  actionBtnTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  },
  actionBtnSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10
  },
  skillTag: {
    backgroundColor: colors.tagBg,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  skillTagText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  availableTag: {
    backgroundColor: colors.primaryMuted,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.25)'
  },
  availableTagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  adminRow: {
    alignItems: 'center',
    paddingVertical: 8
  },
  adminLink: {
    padding: 10
  },
  adminLinkText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  }
});
