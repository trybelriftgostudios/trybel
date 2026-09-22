import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface NotificationsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'mentions' | 'team' | 'events'>('all');
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, [activeTab]);

  const loadNotifications = async () => {
    try {
      const res = await api.getNotifications(activeTab);
      setNotifications(res.data || []);
    } catch (err: any) {
      console.warn('Error loading notifications:', err);
    }
  };

  const handleTapNotif = (notif: any) => {
    api.markNotificationRead(notif.id);
    if (notif.deep_link_screen) {
      if (notif.deep_link_screen === 'Teams') onNavigate('Teams');
      else if (notif.deep_link_screen === 'Events') onNavigate('ClubsEvents');
      else if (notif.deep_link_screen === 'Friends') onNavigate('Friends');
      else if (notif.deep_link_screen === 'Chat') onNavigate('Chat');
      else if (notif.deep_link_screen === 'StudyPartner') onNavigate('StudyPartners');
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['all', 'mentions', 'team', 'events'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {notifications.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifCard, !item.read && styles.unreadCard]}
            onPress={() => handleTapNotif(item)}
            activeOpacity={0.75}
          >
            <View style={styles.iconBox}>
              <Text style={styles.notifEmoji}>
                {item.category === 'friend' ? '👤' : item.category === 'team' ? '💻' : item.category === 'event' ? '📅' : '💬'}
              </Text>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.notifTitle}>{item.title}</Text>
              <Text style={styles.notifBody}>{item.body}</Text>
              <Text style={styles.notifTime}>{item.created_at}</Text>
            </View>

            {!item.read && <View style={styles.blueDot} />}
          </TouchableOpacity>
        ))}
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
  list: {
    flex: 1,
    marginBottom: 70
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  unreadCard: {
    backgroundColor: '#121A2E',
    borderColor: '#233876'
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  notifEmoji: {
    fontSize: 20
  },
  cardContent: {
    flex: 1
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  notifBody: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 16,
    marginTop: 2
  },
  notifTime: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4
  },
  blueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#38BDF8',
    marginLeft: 8
  }
});
