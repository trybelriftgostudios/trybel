import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface ReportScreenProps {
  onBack: () => void;
  targetType?: 'user' | 'message' | 'photo' | 'event' | 'team';
  targetId?: string;
  targetName?: string;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({
  onBack,
  targetType = 'user',
  targetId = 'usr_target_01',
  targetName = 'Report this user / content'
}) => {
  const [selectedReason, setSelectedReason] = useState<string>('inappropriate_content');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const reasons = [
    { key: 'inappropriate_content', label: 'Inappropriate content' },
    { key: 'harassment', label: 'Harassment or hate speech' },
    { key: 'spam', label: 'Spam or unauthorized commercial promo' },
    { key: 'fake_profile', label: 'Fake profile or impersonation' },
    { key: 'other', label: 'Other' }
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.submitReport({
        target_type: targetType,
        target_id: targetId,
        reason: selectedReason,
        details: details.trim()
      });
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep Trybel trusted and safe. Our platform moderator team will investigate promptly.',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.targetCard}>
          <View style={styles.targetIconBox}>
            <Text style={styles.targetIcon}>🛡️</Text>
          </View>
          <View style={styles.targetInfo}>
            <Text style={styles.targetTitle}>{targetName}</Text>
            <Text style={styles.targetSubtitle}>Reports are completely confidential.</Text>
          </View>
        </View>

        <Text style={styles.sectionHeading}>Why are you reporting this?</Text>

        <View style={styles.reasonsList}>
          {reasons.map(r => (
            <TouchableOpacity
              key={r.key}
              style={[styles.reasonItem, selectedReason === r.key && styles.selectedReasonItem]}
              onPress={() => setSelectedReason(r.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.radioCircle, selectedReason === r.key && styles.radioCircleActive]}>
                {selectedReason === r.key && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.reasonLabel, selectedReason === r.key && styles.selectedReasonLabel]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Additional Details (Optional)</Text>
        <TextInput
          style={styles.detailsInput}
          multiline
          placeholder="Provide any relevant context to assist moderator investigation..."
          placeholderTextColor={colors.textMuted}
          value={details}
          onChangeText={setDetails}
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 20
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
  content: {
    flex: 1,
    marginBottom: 40
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24
  },
  targetIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EF444422',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  targetIcon: {
    fontSize: 22
  },
  targetInfo: {
    flex: 1
  },
  targetTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  targetSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  reasonsList: {
    gap: 8,
    marginBottom: 20
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14
  },
  selectedReasonItem: {
    borderColor: colors.danger,
    backgroundColor: '#2A1118'
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  radioCircleActive: {
    borderColor: colors.danger
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.danger
  },
  reasonLabel: {
    fontSize: 14,
    color: colors.textSecondary
  },
  selectedReasonLabel: {
    color: colors.textPrimary,
    fontWeight: '700'
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  detailsInput: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    height: 90,
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 24
  },
  submitBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center'
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700'
  }
});
