import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';

export default function StudentVerifyScreen() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [collegeName] = useState("St. Peter's Engineering College (Hyderabad)");
  const [username, setUsername] = useState('varundulam');
  const [rollNumber, setRollNumber] = useState('22SPCS089');
  const [eduEmail, setEduEmail] = useState('varun.dulam@stpetershyd.edu.in');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmitVerification = () => {
    if (!rollNumber.trim() || !eduEmail.trim()) {
      showFeedback('Roll number and campus email are required', 'warning');
      return;
    }

    if (!eduEmail.includes('@') || !eduEmail.includes('.')) {
      showFeedback('Please provide a valid institutional email', 'warning');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      showFeedback('Student verification approved! Dean verified badge issued.', 'success');
      router.back();
    }, 600);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Campus Verification</Text>
          <Text style={styles.headerSubtitle}>Official Institutional Credentialing</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.badgeInfoCard}>
          <Text style={styles.badgeInfoIcon}>🎓</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.badgeInfoTitle}>Verified Student Seal</Text>
            <Text style={styles.badgeInfoDesc}>
              A verified profile unlocks direct access to Hackathon Squads, Dean announcements, and campus study partners.
            </Text>
          </View>
        </View>

        <Text style={styles.label}>College Institution</Text>
        <View style={styles.disabledInputBox}>
          <Text style={styles.disabledInputText}>{collegeName}</Text>
        </View>

        <Text style={styles.label}>Display Username (Optional • Discord-style with spaces • defaults to UID)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Varun Dulam or Cyber Knight (leave blank to use UID)"
          placeholderTextColor={colors.textMuted}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Student Roll Number / Registration ID *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 22SPCS089"
          placeholderTextColor={colors.textMuted}
          value={rollNumber}
          onChangeText={setRollNumber}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Institutional (.edu / college domain) Email *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., yourname@stpetershyd.edu.in"
          placeholderTextColor={colors.textMuted}
          value={eduEmail}
          onChangeText={setEduEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Branch / Department</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Computer Science & Engineering"
          placeholderTextColor={colors.textMuted}
          value={department}
          onChangeText={setDepartment}
        />

        <Text style={styles.label}>Expected Graduation Year</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 2026"
          placeholderTextColor={colors.textMuted}
          value={graduationYear}
          onChangeText={setGraduationYear}
          keyboardType="numeric"
        />

        <View style={styles.idCardProofCard}>
          <View style={styles.idIconBox}>
            <Text style={styles.idIcon}>🪪</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.idTitle}>Student Physical ID Card</Text>
            <Text style={styles.idSubtitle}>Physical smart card image on file with admissions</Text>
          </View>
          <View style={styles.verifiedCheckPill}>
            <Text style={styles.verifiedCheckText}>✓ ON FILE</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isVerifying && styles.submitBtnDisabled]}
          disabled={isVerifying}
          onPress={handleSubmitVerification}
        >
          <Text style={styles.submitBtnText}>
            {isVerifying ? 'Verifying with Admissions Server...' : 'Confirm Campus Credentials'}
          </Text>
        </TouchableOpacity>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  badgeInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#072416',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 12
  },
  badgeInfoIcon: {
    fontSize: 28
  },
  badgeInfoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.badgeGreenText
  },
  badgeInfoDesc: {
    fontSize: 12,
    color: '#A7F3D0',
    lineHeight: 16,
    marginTop: 2
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4
  },
  disabledInputBox: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  disabledInputText: {
    color: colors.accentBlue,
    fontWeight: '600',
    fontSize: 13
  },
  input: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    color: colors.textPrimary,
    fontSize: 14
  },
  idCardProofCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12,
    marginTop: 6
  },
  idIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  idIcon: {
    fontSize: 18
  },
  idTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  idSubtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1
  },
  verifiedCheckPill: {
    backgroundColor: colors.badgeGreen,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  verifiedCheckText: {
    color: colors.badgeGreenText,
    fontSize: 10,
    fontWeight: '900'
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 14
  },
  submitBtnDisabled: {
    opacity: 0.6
  },
  submitBtnText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '900'
  }
});