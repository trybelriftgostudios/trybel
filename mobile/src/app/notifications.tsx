import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';
import { notificationsService } from '../services/notifications.service';

interface CampusNotification {
  id: string;
  type: 'mention' | 'team' | 'event' | 'system';
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  actionRoute?: string;
}

const INITIAL_NOTIFICATIONS: CampusNotification[] = [
  {
    id: 'notif_1',
    type: 'team',
    title: 'Hackathon Squad Application',
    body: 'Sneha Patel applied to join "Smart India Hackathon Squad".',
    time: '12m ago',
    isRead: false,
    actionRoute: '/teams'
  },
  {
    id: 'notif_2',
    type: 'event',
    title: 'Upcoming GDSC Workshop',
    body: 'Modern Full-Stack Development Workshop starts this Saturday at Seminar Hall 3.',
    time: '2h ago',
    isRead: false,
    actionRoute: '/clubs'
  },
  {
    id: 'notif_3',
    type: 'mention',
    title: 'Mention in Campus Feed',
    body: 'Sana Khan tagged you in a post: "Working with @Varun Dulam on SIH architecture".',
    time: '5h ago',
    isRead: true,
    actionRoute: '/(tabs)'
  },
  {
    id: 'notif_4',
    type: 'system',
    title: 'Campus Verification Approved',
    body: 'Your St. Peter’s Engineering identity has been verified with Dean credentials.',
    time: 'Yesterday',
    isRead: true,
    actionRoute: '/(tabs)/profile'
  }
];

export default function NotificationsModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [activeFilter, setActiveFilter] = useState<'all' | 'mention' | 'team' | 'event' | 'system'>('all');
  const [notifications, setNotifications] = useState<CampusNotification[]>(INITIAL_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    showFeedback('All notifications marked as read', 'success');
  };

  const handleNotificationPress = (notif: CampusNotification) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
    );

    if (notif.actionRoute) {
      router.push(notif.actionRoute as any);
    } else {
      showFeedback(`Viewed: ${notif.title}`, 'info');
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await notificationsService.triggerImmediateTestNotification();
      showFeedback('Local notification dispatched!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Notification trigger failed';
      showFeedback(msg, 'error');
    }
  };

  const filtered = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mention':
        return '💬';
      case 'team':
        return '🚀';
      case 'event':
        return '📅';
      case 'system':
      default:
        return '🔔';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>
            {unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.markReadBtn}
          onPress={markAllRead}
          disabled={unreadCount === 0}
        >
          <Text style={[styles.markReadText, unreadCount === 0 && styles.markReadDisabled]}>
            Mark Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeFilter === 'all' && styles.tabItemActive]}
          onPress={() => setActiveFilter('all')}
        >
          <Text style={[styles.tabText, activeFilter === 'all' && styles.tabTextActive]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeFilter === 'team' && styles.tabItemActive]}
          onPress={() => setActiveFilter('team')}
        >
          <Text style={[styles.tabText, activeFilter === 'team' && styles.tabTextActive]}>
            Teams
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeFilter === 'event' && styles.tabItemActive]}
          onPress={() => setActiveFilter('event')}
        >
          <Text style={[styles.tabText, activeFilter === 'event' && styles.tabTextActive]}>
            Events
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeFilter === 'mention' && styles.tabItemActive]}
          onPress={() => setActiveFilter('mention')}
        >
          <Text style={[styles.tabText, activeFilter === 'mention' && styles.tabTextActive]}>
            Mentions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Test Notification Banner */}
        <View style={styles.testNotificationBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.testBannerTitle}>Expo Notifications Engine</Text>
            <Text style={styles.testBannerSub}>
              Android channel wrapped in try/catch for Expo Go compatibility.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.testBannerBtn}
            onPress={handleSendTestNotification}
          >
            <Text style={styles.testBannerBtnText}>Dispatch Test</Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You have no active alerts in this category. Check back later!
            </Text>
          </View>
        ) : (
          filtered.map(notif => (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifCard, !notif.isRead && styles.notifCardUnread]}
              onPress={() => handleNotificationPress(notif)}
            >
              <View style={styles.iconBox}>
                <Text style={styles.iconText}>{getTypeIcon(notif.type)}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.notifTitle, !notif.isRead && styles.notifTitleUnread]}>
                    {notif.title}
                  </Text>
                  {!notif.isRead && <View style={styles.unreadDot} />}
                </View>

                <Text style={styles.notifBody}>{notif.body}</Text>
                <Text style={styles.notifTime}>{notif.time}</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
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
  markReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  markReadText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700'
  },
  markReadDisabled: {
    color: colors.textMuted
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.bg
  },
  tabItem: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  tabItemActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  tabTextActive: {
    color: colors.bg,
    fontWeight: '800'
  },
  scrollContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 40
  },
  testNotificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1A2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.accentBlue,
    gap: 12
  },
  testBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary
  },
  testBannerSub: {
    fontSize: 11,
    color: colors.accentBlue,
    marginTop: 2
  },
  testBannerBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  testBannerBtnText: {
    color: colors.bg,
    fontSize: 11,
    fontWeight: '800'
  },
  notifCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12
  },
  notifCardUnread: {
    borderColor: colors.primary,
    backgroundColor: '#0B171A'
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  iconText: {
    fontSize: 18
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1
  },
  notifTitleUnread: {
    fontWeight: '800',
    color: colors.primary
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 6
  },
  notifBody: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 16
  },
  notifTime: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 6
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18
  }
});