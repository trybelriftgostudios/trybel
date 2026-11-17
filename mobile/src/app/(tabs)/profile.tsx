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
    email: 'varun@pappu',
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
            <TouchableOpacity style={styles.headerBtn} onPress={lockApp}>
              <Text style={styles.btnIcon}>🔒</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/settings')}>
            <Text style={styles.btnIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
              style={styles.avatar}
            />
            <View style={styles.verifiedCheckBadge}>
              <Text style={styles.checkText}>✓</Text>
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
              <Text style={styles.actionBtnIcon}>📄</Text>
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
              <Text style={styles.actionBtnIcon}>📦</Text>
              <View style={styles.actionBtnInfo}>
                <Text style={styles.actionBtnTitle}>Export SQLite JSON Backup</Text>
                <Text style={styles.actionBtnSub}>Share full offline database dump</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.restoreBtn]}
              onPress={handleRestoreJson}
            >
              <Text style={styles.actionBtnIcon}>📥</Text>
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
                <Text style={styles.availableTagText}>✓ {item}</Text>
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
            <Text style={styles.adminLinkText}>🛡️ Open Moderator & Admin Panel &rarr;</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#161F30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26354D'
  },
  btnIcon: {
    fontSize: 18
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 80,
    gap: 16
  },
  profileCard: {
    backgroundColor: '#131B2E',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B'
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
    borderColor: '#0A0E17'
  },
  checkText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '900'
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC'
  },
  emailText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 2
  },
  deptText: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4
  },
  collegeText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2
  },
  mottoText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#94A3B8',
    marginTop: 10
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
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
    color: '#F8FAFC'
  },
  statLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2
  },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#1E293B'
  },
  sectionCard: {
    backgroundColor: '#131B2E',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC'
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#64748B',
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
    backgroundColor: '#161F30',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#26354D'
  },
  pdfBtn: {
    borderColor: colors.primary
  },
  jsonBtn: {
    borderColor: '#38BDF8'
  },
  restoreBtn: {
    borderColor: '#818CF8'
  },
  actionBtnIcon: {
    fontSize: 24,
    marginRight: 12
  },
  actionBtnInfo: {
    flex: 1
  },
  actionBtnTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700'
  },
  actionBtnSub: {
    color: '#94A3B8',
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
    backgroundColor: '#1E293B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  skillTagText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600'
  },
  availableTag: {
    backgroundColor: '#064E3B',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  availableTagText: {
    color: '#34D399',
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
    color: '#818CF8',
    fontSize: 13,
    fontWeight: '700'
  }
});
