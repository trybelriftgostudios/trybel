import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { colors } from '../theme/colors';

interface MenuScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
  onLogout: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({ onBack, onNavigate, onLogout }) => {
  const menuItems = [
    { icon: '👤', label: 'My Profile', screen: 'Profile' },
    { icon: '💻', label: 'My Teams', screen: 'Teams' },
    { icon: '🎪', label: 'My Clubs', screen: 'ClubsEvents' },
    { icon: '🔖', label: 'Saved', screen: 'Discover' },
    { icon: '👥', label: 'Invite Friends', screen: 'Friends' },
    { icon: '⚙️', label: 'Settings', screen: 'Settings' },
    { icon: '🔒', label: 'Privacy', screen: 'Settings' },
    { icon: '🛡️', label: 'Moderator Panel', screen: 'Admin' },
    { icon: '❓', label: 'Help & Support', screen: 'Settings' },
    { icon: 'ℹ️', label: 'About Trybel', screen: 'Settings' }
  ];

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Menu</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Shortcut Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => onNavigate('Profile')}
          activeOpacity={0.8}
        >
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Sritan Vesangi</Text>
            <Text style={styles.profileSub}>CSE • 3rd Year</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Menu Items List */}
        <View style={styles.menuBox}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.menuItem}
              onPress={() => onNavigate(item.screen)}
            >
              <Text style={styles.menuEmoji}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Text style={styles.itemChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout CTA */}
        <TouchableOpacity style={styles.logoutBtn} onPress={onLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>🚪  Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Trybel v1.0{'\n'}College-first. Brighter together.</Text>
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
  content: {
    flex: 1,
    marginBottom: 40
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: '#38BDF8'
  },
  profileInfo: {
    flex: 1
  },
  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary
  },
  profileSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted
  },
  menuBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24,
    overflow: 'hidden'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  menuEmoji: {
    fontSize: 18,
    marginRight: 14
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary
  },
  itemChevron: {
    fontSize: 20,
    color: colors.textMuted
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20
  },
  logoutText: {
    color: colors.danger,
    fontSize: 15,
    fontWeight: '700'
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 30
  }
});
