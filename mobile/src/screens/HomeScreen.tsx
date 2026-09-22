import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { colors } from '../theme/colors';
import { AudienceBadge } from '../components/AudienceBadge';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'for_you' | 'college' | 'following'>('for_you');
  const [likes, setLikes] = useState<Record<string, number>>({ post_1: 12, post_2: 9 });

  const toggleLike = (postId: string) => {
    setLikes(prev => ({
      ...prev,
      [postId]: prev[postId] ? prev[postId] + 1 : 1
    }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <Text style={styles.brandIcon}>❖</Text>
          <Text style={styles.brandText}>TRYBEL</Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate('Notifications')}>
            <Text style={styles.headerIconText}>🔔</Text>
            <View style={styles.unreadBadge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate('Menu')}>
            <Text style={styles.headerIconText}>☰</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabsRow}>
        {(['for_you', 'college', 'following'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === 'for_you' ? 'For You' : tab === 'college' ? 'College' : 'Following'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Campus Highlight Banner */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800' }}
        style={styles.banner}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerTitle}>Same Campus.{'\n'}More Possibilities.</Text>
          <Text style={styles.bannerSubtitle}>Discover events, teams, clubs and people.</Text>
        </View>
      </ImageBackground>

      {/* Quick Action Icons */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('StudyPartners')}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#3B82F622' }]}>
              <Text style={styles.actionEmoji}>👥</Text>
            </View>
            <Text style={styles.actionLabel}>Study</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('Teams')}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#10B98122' }]}>
              <Text style={styles.actionEmoji}>💻</Text>
            </View>
            <Text style={styles.actionLabel}>Teams</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('ClubsEvents')}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#F59E0B22' }]}>
              <Text style={styles.actionEmoji}>🎪</Text>
            </View>
            <Text style={styles.actionLabel}>Clubs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('ClubsEvents')}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#EC489922' }]}>
              <Text style={styles.actionEmoji}>📅</Text>
            </View>
            <Text style={styles.actionLabel}>Events</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={() => onNavigate('Chatbot')}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#8B5CF622' }]}>
              <Text style={styles.actionEmoji}>🤖</Text>
            </View>
            <Text style={styles.actionLabel}>Campus AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Posts Feed */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionHeader}>Recent Posts</Text>

        {/* Post 1: Arjun Reddy */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }}
              style={styles.avatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Arjun Reddy</Text>
              <Text style={styles.authorMeta}>CSE • 3rd Year • 3h</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('Report')}>
              <Text style={styles.moreDots}>•••</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.postContent}>
            Looking for 2 teammates for SIH. Need a UI/UX designer and an ML developer. Anyone interested?
          </Text>

          {/* Tags & Dual Scoping Badge */}
          <View style={styles.tagRow}>
            <View style={styles.hashTag}><Text style={styles.hashTagText}>#Hackathon</Text></View>
            <View style={styles.hashTag}><Text style={styles.hashTagText}>#Team</Text></View>
            <AudienceBadge type="open_to_all" />
          </View>

          {/* Engagement Footer */}
          <View style={styles.postFooter}>
            <TouchableOpacity style={styles.engageBtn} onPress={() => toggleLike('post_1')}>
              <Text style={styles.engageIcon}>💙</Text>
              <Text style={styles.engageCount}>{likes.post_1}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.engageBtn}>
              <Text style={styles.engageIcon}>💬</Text>
              <Text style={styles.engageCount}>8</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageCTA} onPress={() => onNavigate('Chat')}>
              <Text style={styles.messageCTAText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Post 2: Priya Sharma */}
        <View style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' }}
              style={styles.avatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>Priya Sharma</Text>
              <Text style={styles.authorMeta}>CSE • 4th Year • 5h</Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('Report')}>
              <Text style={styles.moreDots}>•••</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.postContent}>
            Hosting an open group study prep for DBMS midterms at Central Library reading room 3. All CSE students welcome!
          </Text>

          <View style={styles.tagRow}>
            <View style={styles.hashTag}><Text style={styles.hashTagText}>#StudyGroup</Text></View>
            <View style={styles.hashTag}><Text style={styles.hashTagText}>#DBMS</Text></View>
            <AudienceBadge type="college_only" />
          </View>

          <View style={styles.postFooter}>
            <TouchableOpacity style={styles.engageBtn} onPress={() => toggleLike('post_2')}>
              <Text style={styles.engageIcon}>💙</Text>
              <Text style={styles.engageCount}>{likes.post_2}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.engageBtn}>
              <Text style={styles.engageIcon}>💬</Text>
              <Text style={styles.engageCount}>4</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.messageCTA} onPress={() => onNavigate('Chat')}>
              <Text style={styles.messageCTAText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 16,
    paddingTop: 48
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandIcon: {
    fontSize: 22,
    color: colors.primary,
    marginRight: 6
  },
  brandText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  headerIconText: {
    fontSize: 16
  },
  unreadBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8
  },
  activeTabButton: {
    backgroundColor: '#1E293B'
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeTabText: {
    color: colors.textPrimary
  },
  banner: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    padding: 16,
    justifyContent: 'center'
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#CBD5E1'
  },
  quickActionsContainer: {
    marginBottom: 20
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  actionItem: {
    alignItems: 'center'
  },
  actionIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  actionEmoji: {
    fontSize: 22
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  feedSection: {
    paddingBottom: 90
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12
  },
  authorInfo: {
    flex: 1
  },
  authorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  authorMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  moreDots: {
    fontSize: 18,
    color: colors.textMuted
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: '#E2E8F0',
    marginBottom: 14
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
    marginBottom: 14
  },
  hashTag: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  hashTagText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600'
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12
  },
  engageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 18
  },
  engageIcon: {
    fontSize: 14,
    marginRight: 4
  },
  engageCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  messageCTA: {
    marginLeft: 'auto',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  messageCTAText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  }
});
