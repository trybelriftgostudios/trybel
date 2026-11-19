import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { sqliteService, OfflinePost } from '../../services/sqlite.service';
import { useFeedback } from '../../context/FeedbackContext';
import { useSecurity } from '../../context/SecurityContext';
import { PanCarousel } from '../../components/PanCarousel';
import { IOSSegmentedControl } from '../../components/IOSSegmentedControl';

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
      {/* Top Header */}
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
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

        {/* iOS Native Large Title */}
        <View style={styles.largeTitleSection}>
          <Text style={styles.largeTitle}>Campus</Text>
        </View>

        {/* iOS Native Segmented Control */}
        <View style={styles.segmentedWrapper}>
          <IOSSegmentedControl
            values={['for_you', 'college', 'following'] as const}
            selectedIndex={activeTab === 'for_you' ? 0 : activeTab === 'college' ? 1 : 2}
            onChange={(val) => setActiveTab(val)}
            formatLabel={(val) => (val === 'for_you' ? 'For You' : val === 'college' ? "St. Peter's" : 'Following')}
          />
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
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    backgroundColor: colors.bg,
    zIndex: 10,
    elevation: 4
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  brandLogoCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  brandLogo: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.5
  },
  verifiedCampusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.systemFill,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 4
  },
  verifiedDot: {
    color: colors.primary,
    fontSize: 8
  },
  verifiedCampusText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600'
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.systemFill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110
  },
  largeTitleSection: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 8
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.37
  },
  segmentedWrapper: {
    paddingHorizontal: 18,
    marginTop: 6,
    marginBottom: 16
  },
  bannerCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    width: '100%'
  },
  bannerBadge: {
    backgroundColor: colors.primaryMuted,
    alignSelf: 'flex-start',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginBottom: 8
  },
  bannerBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.2
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
    fontWeight: '600'
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
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder
  },
  actionIcon: {
    marginBottom: 6
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center'
  },
  actionSub: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2
  },
  createPostBox: {
    backgroundColor: colors.card,
    marginHorizontal: 18,
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
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
    borderRadius: 19
  },
  createInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingTop: 8,
    minHeight: 40
  },
  postSubmitRow: {
    alignItems: 'flex-end',
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator,
    paddingTop: 8
  },
  postBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 16
  },
  postBtnDisabled: {
    opacity: 0.5
  },
  postBtnText: {
    color: colors.white,
    fontWeight: '700',
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
    borderWidth: StyleSheet.hairlineWidth,
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
    marginRight: 10
  },
  postAuthorInfo: {
    flex: 1
  },
  authorName: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600'
  },
  authorRole: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 1
  },
  postTime: {
    color: colors.textMuted,
    fontSize: 12
  },
  postContent: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 21
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
    borderRadius: 6
  },
  tagChipCrossCollege: {
    backgroundColor: colors.primaryMuted
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.separator
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
    fontSize: 12,
    fontWeight: '500'
  }
});
