import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../theme/colors';

interface SettingsScreenProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigate: (screen: string) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ onBack, onLogout, onNavigate }) => {
  const settingsGroups = [
    {
      title: 'Preferences & Safety',
      items: [
        { icon: '👤', label: 'Account Information', desc: 'Verified: St. Peter’s Engineering College' },
        { icon: '🔒', label: 'Privacy & Scoping', desc: 'Study partners & photos permanently college-scoped' },
        { icon: '🔔', label: 'Notifications', desc: 'Event reminders, matches, friend alerts' },
        { icon: '⚙️', label: 'App Preferences', desc: 'Theme: Campus Dark (Default)' }
      ]
    },
    {
      title: 'Platform & Trust',
      items: [
        { icon: '🛡️', label: 'Moderator & Trust Center', desc: 'Community safety and reporting guidelines', action: () => onNavigate('Admin') },
        { icon: '❓', label: 'Help & Campus Support', desc: 'Reach your campus club representative' },
        { icon: 'ℹ️', label: 'About Trybel', desc: 'Version 1.0.0 (College Pilot Edition)' }
      ]
    }
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings & Privacy</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingsGroups.map((group, gIdx) => (
          <View key={gIdx} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            {group.items.map((item, iIdx) => (
              <TouchableOpacity
                key={iIdx}
                style={styles.settingItem}
                onPress={item.action || (() => Alert.alert(item.label, item.desc))}
              >
                <View style={styles.iconCircle}>
                  <Text style={styles.itemEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  <Text style={styles.itemDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
          <Text style={styles.logoutBtnText}>Log Out of Trybel</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Trybel v1.0.0 • College-first. Brighter together.</Text>
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
    marginBottom: 60
  },
  group: {
    marginBottom: 24
  },
  groupTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    letterSpacing: 0.5
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  itemEmoji: {
    fontSize: 18
  },
  itemTextCol: {
    flex: 1
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  itemDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    marginLeft: 8
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: colors.danger,
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  logoutBtnText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700'
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 40
  }
});
