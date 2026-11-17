import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { sqliteService, OfflinePost } from '../../services/sqlite.service';
import { useFeedback } from '../../context/FeedbackContext';
import { useSecurity } from '../../context/SecurityContext';
import { PanCarousel } from '../../components/PanCarousel';

export default function HomeScreen() {
  const router = useRouter();
  const { showFeedback } = useFeedback();
  const { lockApp, hasPin } = useSecurity();

  const [posts, setPosts] = useState<OfflinePost[]>([]);
  const [activeTab, setActiveTab] = useState<'for_you' | 'college' | 'following'>('for_you');
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      const data = await sqliteService.getPosts();
      setPosts(data);
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleCreatePost = async () => {
    if (!newPostText.trim()) return;
    setIsPosting(true);
    try {
      const newPost: OfflinePost = {
        id: `post_${Date.now()}`,
        college_id: 'col_stpeters_01',
        author_name: 'Varun Dulam',
        author_role: 'CSE • 3rd Year',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        content: newPostText.trim(),
        tags_json: JSON.stringify(['#Campus', '#SIH2025']),
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString()
      };

      await sqliteService.insertPost(newPost);
      setNewPostText('');
      await loadPosts();
      showFeedback('Post published to campus feed!', 'success');
    } catch (err: any) {
      showFeedback(err.message || 'Failed to post', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  const highlightReels = [
    {
      id: '1',
      title: 'Smart India Hackathon 2025',
      subtitle: 'Hardware & AI track teams forming now',
      badge: 'FEATURED HACKATHON',
      route: '/teams'
    },
    {
      id: '2',
      title: 'Full-Stack Development Sprint',
      subtitle: 'GDSC hands-on session this Saturday',
      badge: 'CAMPUS CLUB EVENT',
      route: '/clubs'
    },
    {
      id: '3',
      title: 'Today’s Campus Knowledge Puzzle',
      subtitle: 'Test your distributed systems and SQL skills',
      badge: 'DAILY PUZZLE',
      route: '/challenges'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Header - Scrolls away naturally with feed like Instagram */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.brandLogoCircle}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.brandLogo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.brandTitle}>TRYBEL</Text>
            <View style={styles.verifiedCampusTag}>
              <Text style={styles.verifiedDot}>●</Text>
              <Text style={styles.verifiedCampusText}>St. Peter's</Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            {hasPin && (
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={lockApp}
                accessibilityLabel="Lock App"
              >
                <Ionicons name="lock-closed-outline" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/chatbot')}
              accessibilityLabel="Campus AI Assistant"
            >
              <Ionicons name="sparkles" size={17} color={colors.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => router.push('/notifications')}
              accessibilityLabel="Notifications"
            >
              <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hardware-Accelerated Pan Carousel Banner */}
        <PanCarousel
          data={highlightReels}
          renderItem={(item) => (
            <TouchableOpacity
              style={styles.bannerCard}
              activeOpacity={0.88}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.bannerBadge}>
                <Text style={styles.bannerBadgeText}>{item.badge}</Text>
              </View>
              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSub}>{item.subtitle}</Text>
              <View style={styles.bannerFooter}>
                <Text style={styles.bannerCta}>Explore &rarr;</Text>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Quick Action Chips */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => router.push('/study-partners')}
          >
            <Ionicons name="book-outline" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionLabel}>Study Partners</Text>
            <Text style={styles.actionSub}>College-Only</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => router.push('/teams')}
          >
            <Ionicons name="people-outline" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionLabel}>Find Team</Text>
            <Text style={styles.actionSub}>Dual Toggle</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => router.push('/clubs')}
          >
            <Ionicons name="flag-outline" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionLabel}>Clubs & Events</Text>
            <Text style={styles.actionSub}>With Feedback</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => router.push('/challenges')}
          >
            <Ionicons name="trophy-outline" size={20} color={colors.primary} style={styles.actionIcon} />
            <Text style={styles.actionLabel}>Daily Puzzle</Text>
            <Text style={styles.actionSub}>Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* Feed Tab Switcher */}
        <View style={styles.tabSwitcher}>
          {(['for_you', 'college', 'following'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.feedTab, activeTab === tab && styles.feedTabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.feedTabText,
                  activeTab === tab && styles.feedTabTextActive
                ]}
              >
                {tab === 'for_you' ? 'For You' : tab === 'college' ? 'St. Peter’s' : 'Following'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Create Post Input */}
        <View style={styles.createPostBox}>
          <View style={styles.createPostRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }}
              style={styles.myAvatar}
            />
            <TextInput
              style={styles.createInput}
              placeholder="What's happening on campus?"
              placeholderTextColor={colors.textMuted}
              value={newPostText}
              onChangeText={setNewPostText}
              multiline
            />
          </View>
          {newPostText.trim().length > 0 && (
            <View style={styles.postSubmitRow}>
              <TouchableOpacity
                style={[styles.postBtn, isPosting && styles.postBtnDisabled]}
                onPress={handleCreatePost}
                disabled={isPosting}
              >
                <Text style={styles.postBtnText}>{isPosting ? 'Posting...' : 'Share'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Offline-First Posts List */}
        <View style={styles.postsList}>
          {posts.map((post) => {
            let tags: string[] = [];
            try {
              tags = JSON.parse(post.tags_json || '[]');
            } catch {}

            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: post.avatar_url }} style={styles.postAvatar} />
                  <View style={styles.postAuthorInfo}>
                    <Text style={styles.authorName}>{post.author_name}</Text>
                    <Text style={styles.authorRole}>{post.author_role}</Text>
                  </View>
                  <Text style={styles.postTime}>Just now</Text>
                </View>

                <Text style={styles.postContent}>{post.content}</Text>

                {tags.length > 0 && (
                  <View style={styles.tagRow}>
                    {tags.map((t, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.tagChip,
                          t.includes('Open') && styles.tagChipCrossCollege
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            t.includes('Open') && styles.tagTextCrossCollege
                          ]}
                        >
                          {t}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.postFooter}>
                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => showFeedback('Liked post!', 'success')}
                  >
                    <Ionicons name="heart-outline" size={17} color={colors.primary} />
                    <Text style={styles.postActionCount}>{post.likes_count}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => router.push('/chat')}
                  >
                    <Ionicons name="chatbubble-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.postActionCount}>{post.comments_count}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => router.push('/report')}
                  >
                    <Ionicons name="flag-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.postActionText}>Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.bg,
    marginBottom: 6
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  brandLogoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 17
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1.2
  },
  verifiedCampusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 5
  },
  verifiedDot: {
    color: colors.primary,
    fontSize: 9
  },
  verifiedCampusText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110
  },
  bannerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    width: '100%'
  },
  bannerBadge: {
    backgroundColor: colors.primaryMuted,
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.3)'
  },
  bannerBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3
  },
  bannerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  bannerFooter: {
    marginTop: 14,
    alignItems: 'flex-end'
  },
  bannerCta: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700'
  },
  quickActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    gap: 10,
    marginTop: 10,
    marginBottom: 16
  },
  actionChip: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  actionIcon: {
    marginBottom: 6
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'
  },
  actionSub: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2
  },
  tabSwitcher: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    marginBottom: 14
  },
  feedTab: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  feedTabActive: {
    borderBottomColor: colors.primary
  },
  feedTabText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  feedTabTextActive: {
    color: colors.textPrimary,
    fontWeight: '800'
  },
  createPostBox: {
    backgroundColor: colors.card,
    marginHorizontal: 18,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 18
  },
  createPostRow: {
    flexDirection: 'row',
    gap: 12
  },
  myAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  createInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingTop: 8,
    minHeight: 40
  },
  postSubmitRow: {
    alignItems: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingTop: 8
  },
  postBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  postBtnDisabled: {
    opacity: 0.5
  },
  postBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 13
  },
  postsList: {
    paddingHorizontal: 18,
    gap: 14
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  postAuthorInfo: {
    flex: 1
  },
  authorName: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  authorRole: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 1
  },
  postTime: {
    color: colors.textMuted,
    fontSize: 11
  },
  postContent: {
    color: '#E4E4E7',
    fontSize: 14,
    lineHeight: 20
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10
  },
  tagChip: {
    backgroundColor: colors.tagBg,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  tagChipCrossCollege: {
    backgroundColor: colors.primaryMuted,
    borderColor: 'rgba(255, 36, 50, 0.3)'
  },
  tagText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600'
  },
  tagTextCrossCollege: {
    color: colors.primary
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  postActionCount: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  postActionText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600'
  }
});
