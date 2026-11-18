import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useSecurity } from '../context/SecurityContext';
import { useFeedback } from '../context/FeedbackContext';
import { AutoLockTimeout } from '../services/security.service';
import { notificationsService } from '../services/notifications.service';
import { exportImportService } from '../services/export-import.service';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    hasPin,
    setupPin,
    removePin,
    biometricsEnabled,
    biometricsAvailable,
    biometricsType,
    toggleBiometrics,
    autoLockTimeout,
    updateAutoLockTimeout,
    lockApp
  } = useSecurity();
  const { showFeedback } = useFeedback();

  const [pinInput, setPinInput] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  const timeoutOptions: AutoLockTimeout[] = ['immediate', '2m', '5m', 'never'];

  const handleSavePin = async () => {
    if (pinInput.trim().length !== 4 || isNaN(Number(pinInput))) {
      showFeedback('PIN must be exactly 4 numeric digits', 'error');
      return;
    }
    await setupPin(pinInput.trim());
    setPinInput('');
    setShowPinSetup(false);
    showFeedback('App security PIN configured successfully!', 'success');
  };

  const handleRemovePin = async () => {
    await removePin();
    showFeedback('Security PIN removed', 'info');
  };

  const handleToggleBiometrics = async (val: boolean) => {
    await toggleBiometrics(val);
    showFeedback(val ? `${biometricsType} authentication enabled` : `${biometricsType} disabled`, 'info');
  };

  const handleTestNotification = async () => {
    const granted = await notificationsService.requestPermissions();
    if (!granted) {
      showFeedback('Please enable notifications in device settings', 'warning');
      return;
    }
    await notificationsService.scheduleLocalReminder({
      title: 'Trybel Campus Test Reminder 🎓',
      body: 'Your SIH 2025 team application was received.',
      secondsFromNow: 3
    });
    showFeedback('Scheduled local reminder in 3 seconds!', 'success');
  };

  const handleScheduleDailyReminder = async () => {
    const granted = await notificationsService.requestPermissions();
    if (!granted) {
      showFeedback('Notification permissions required', 'warning');
      return;
    }
    await notificationsService.scheduleDailyPuzzleReminder();
    showFeedback('Daily campus puzzle reminder scheduled for 9:00 AM!', 'success');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Security</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Security & App Lock Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>App Lock & Biometrics</Text>
            <Text style={styles.badgeSecure}>SECURE STORE</Text>
          </View>
          <Text style={styles.sectionSubtitle}>
            Protect your verified college data with an automated lock overlay.
          </Text>

          {/* PIN Setup / Toggle */}
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Security PIN (4 digits)</Text>
              <Text style={styles.settingSub}>
                {hasPin ? 'PIN is configured and active' : 'No PIN set (app lock disabled)'}
              </Text>
            </View>

            {hasPin ? (
              <TouchableOpacity style={styles.dangerBtn} onPress={handleRemovePin}>
                <Text style={styles.dangerBtnText}>Remove</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setShowPinSetup(!showPinSetup)}
              >
                <Text style={styles.primaryBtnText}>{showPinSetup ? 'Cancel' : 'Set PIN'}</Text>
              </TouchableOpacity>
            )}
          </View>

          {showPinSetup && (
            <View style={styles.pinSetupBox}>
              <Text style={styles.pinSetupPrompt}>Enter new 4-digit PIN:</Text>
              <TextInput
                style={styles.pinInput}
                placeholder="••••"
                placeholderTextColor={colors.textMuted}
                value={pinInput}
                onChangeText={setPinInput}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              <TouchableOpacity style={styles.savePinBtn} onPress={handleSavePin}>
                <Text style={styles.savePinBtnText}>Save PIN</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Biometrics Toggle */}
          <View style={[styles.settingRow, { marginTop: 16 }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{biometricsType} Authentication</Text>
              <Text style={styles.settingSub}>
                {biometricsAvailable
                  ? `Unlock instantly with ${biometricsType}`
                  : 'Biometric hardware not available on this device'}
              </Text>
            </View>

            <Switch
              value={biometricsEnabled}
              onValueChange={handleToggleBiometrics}
              disabled={!biometricsAvailable || !hasPin}
              trackColor={{ false: '#1E293B', true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Auto-Lock Timeout Selector */}
          <View style={{ marginTop: 18 }}>
            <Text style={styles.settingLabel}>Auto-Lock Timeout</Text>
            <Text style={styles.settingSub}>
              App locks automatically when placed in the background
            </Text>

            <View style={styles.timeoutRow}>
              {timeoutOptions.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.timeoutChip,
                    autoLockTimeout === opt && styles.timeoutChipActive
                  ]}
                  onPress={async () => {
                    await updateAutoLockTimeout(opt);
                    showFeedback(`Auto-lock timeout set to: ${opt}`, 'info');
                  }}
                  disabled={!hasPin}
                >
                  <Text
                    style={[
                      styles.timeoutText,
                      autoLockTimeout === opt && styles.timeoutTextActive
                    ]}
                  >
                    {opt === 'immediate'
                      ? 'Immediate'
                      : opt === '2m'
                      ? '2 min'
                      : opt === '5m'
                      ? '5 min'
                      : 'Never'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Immediate Lock Button */}
          {hasPin && (
            <TouchableOpacity style={styles.lockNowBtn} onPress={lockApp}>
              <Ionicons name="lock-closed" size={16} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.lockNowText}>Lock App Now</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Local Notifications Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Local Notifications & Reminders</Text>
          <Text style={styles.sectionSubtitle}>
            Scheduled reminders running safely in Expo Go with try/catch channel guards.
          </Text>

          <View style={{ gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={styles.notifyBtn}
              onPress={handleScheduleDailyReminder}
            >
              <Text style={styles.notifyBtnIcon}>⏰</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifyBtnTitle}>Daily Puzzle Reminder (9:00 AM)</Text>
                <Text style={styles.notifyBtnSub}>Schedule recurring local challenge notification</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notifyBtn}
              onPress={handleTestNotification}
            >
              <Text style={styles.notifyBtnIcon}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifyBtnTitle}>Send Test Notification (3s)</Text>
                <Text style={styles.notifyBtnSub}>Test immediate Expo Go notification banner</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Export / Import Data Portability */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Data Management & Portability</Text>
          <Text style={styles.sectionSubtitle}>
            Offline-first SQLite backups and certified PDF exports.
          </Text>

          <View style={{ gap: 10, marginTop: 10 }}>
            <TouchableOpacity
              style={styles.notifyBtn}
              onPress={async () => {
                showFeedback('Exporting SQLite JSON backup...', 'info');
                await exportImportService.exportAndShareJsonBackup();
              }}
            >
              <Text style={styles.notifyBtnIcon}>📤</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifyBtnTitle}>Export JSON Backup</Text>
                <Text style={styles.notifyBtnSub}>Generate and share database dump</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.notifyBtn}
              onPress={async () => {
                const res = await exportImportService.pickAndRestoreJsonBackup();
                if (res.success) {
                  showFeedback(`Restored ${res.count} records into SQLite!`, 'success');
                }
              }}
            >
              <Text style={styles.notifyBtnIcon}>📥</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.notifyBtnTitle}>Restore from JSON File</Text>
                <Text style={styles.notifyBtnSub}>Pick JSON document and restore local database</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Trybel */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About Trybel</Text>
          <Text style={styles.aboutText}>
            Trybel Campus v1.0.0 (Expo SDK 51 + React Native 0.74){'\n'}
            Multi-Tenant College Scoping • Hardware-Accelerated 60/120fps UI • Offline SQLite Database
          </Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
    gap: 16
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  badgeSecure: {
    backgroundColor: colors.primaryMuted,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.25)'
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    marginBottom: 12,
    lineHeight: 16
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  settingSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  primaryBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800'
  },
  dangerBtn: {
    backgroundColor: colors.dangerBg,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  dangerBtnText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '700'
  },
  pinSetupBox: {
    backgroundColor: colors.tagBg,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  pinSetupPrompt: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8
  },
  pinInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.primary,
    fontSize: 18,
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    textAlign: 'center',
    marginBottom: 10
  },
  savePinBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  savePinBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13
  },
  timeoutRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10
  },
  timeoutChip: {
    flex: 1,
    backgroundColor: colors.tagBg,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  timeoutChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  timeoutText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  timeoutTextActive: {
    color: colors.white,
    fontWeight: '800'
  },
  lockNowBtn: {
    backgroundColor: colors.primaryMuted,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.3)'
  },
  lockNowText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  notifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  notifyBtnIcon: {
    fontSize: 22,
    marginRight: 12
  },
  notifyBtnTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700'
  },
  notifyBtnSub: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18
  }
});
