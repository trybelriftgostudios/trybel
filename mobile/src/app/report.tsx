import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';

const REPORT_REASONS = [
  { id: 'harassment', label: 'Harassment or Bullying', desc: 'Disparaging, threatening, or stalking a student.' },
  { id: 'hate_speech', label: 'Hate Speech or Discrimination', desc: 'Attacking protected identity, caste, religion, or gender.' },
  { id: 'spam', label: 'Spam, Scams, or Commercial Ads', desc: 'Unsolicited promotional content, phishing, or bot behavior.' },
  { id: 'academic_dishonesty', label: 'Academic Dishonesty', desc: 'Leaking exam questions, test keys, or lab plagiarism.' },
  { id: 'impersonation', label: 'Impersonation or Fake Student', desc: 'Posing as another college student or faculty member.' },
  { id: 'inappropriate', label: 'Inappropriate or Sensitive Media', desc: 'Explicit imagery, violent content, or unconsented photos.' }
];

export default function ReportContentModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [selectedReason, setSelectedReason] = useState<string>('harassment');
  const [details, setDetails] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReport = () => {
    if (!selectedReason) {
      showFeedback('Please select a reason for reporting', 'warning');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      showFeedback(
        'Report submitted securely to Campus Moderators & Dean for review.',
        'success'
      );
      router.back();
    }, 400);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Report Content</Text>
          <Text style={styles.headerSubtitle}>Strict Campus Safety & Zero-Tolerance Policy</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.policyNotice}>
          <Text style={styles.noticeIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Campus Trust & Safety</Text>
            <Text style={styles.noticeText}>
              All reports are reviewed by authorized college moderators and dean delegates within 24 hours. False reports violate the Trybel Campus Charter.
            </Text>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Why are you reporting this?</Text>
        <View style={styles.reasonsList}>
          {REPORT_REASONS.map(reason => {
            const isSelected = selectedReason === reason.id;
            return (
              <TouchableOpacity
                key={reason.id}
                style={[styles.reasonCard, isSelected && styles.reasonCardActive]}
                onPress={() => setSelectedReason(reason.id)}
              >
                <View style={styles.radioOuter}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reasonLabel, isSelected && styles.reasonLabelActive]}>
                    {reason.label}
                  </Text>
                  <Text style={styles.reasonDesc}>{reason.desc}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionHeader}>Additional Context or Evidence</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Please describe what happened, provide relevant timestamps or usernames..."
          placeholderTextColor={colors.textMuted}
          value={details}
          onChangeText={setDetails}
          multiline
          numberOfLines={4}
        />

        <View style={styles.anonymousRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.anonTitle}>Submit Anonymously</Text>
            <Text style={styles.anonDesc}>
              Your student identity and email will be hidden from moderators.
            </Text>
          </View>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: colors.cardBorder, true: colors.primary }}
            thumbColor={isAnonymous ? colors.bg : '#94A3B8'}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
          disabled={isSubmitting}
          onPress={handleSubmitReport}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Submitting...' : 'Submit Confidential Report'}
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
    gap: 16,
    paddingBottom: 40
  },
  policyNotice: {
    flexDirection: 'row',
    backgroundColor: '#1E1715',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#7C2D12',
    gap: 12,
    alignItems: 'center'
  },
  noticeIcon: {
    fontSize: 26
  },
  noticeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.badgeOrangeText
  },
  noticeText: {
    fontSize: 11,
    color: '#FED7AA',
    lineHeight: 16,
    marginTop: 2
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4
  },
  reasonsList: {
    gap: 8
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    gap: 12
  },
  reasonCardActive: {
    borderColor: colors.danger,
    backgroundColor: '#260B0B'
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger
  },
  reasonLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  reasonLabelActive: {
    color: colors.dangerText
  },
  reasonDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  textArea: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    padding: 14,
    color: colors.textPrimary,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    height: 100,
    textAlignVertical: 'top'
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  anonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  anonDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  submitBtn: {
    backgroundColor: colors.danger,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  submitBtnDisabled: {
    opacity: 0.5
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '800'
  }
});