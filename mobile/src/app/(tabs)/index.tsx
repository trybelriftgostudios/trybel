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
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { sqliteService, OfflinePost } from '../../services/sqlite.service';
import { useFeedback } from '../../context/FeedbackContext';
import { useSecurity } from '../../context/SecurityContext';
import { PanCarousel } from '../../components/PanCarousel';

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(style);
    } catch {}
  }
};

export default function HomeScreen() {
  const router = useRouter();
  const { showFeedback } = useFeedback();
  const { lockApp, hasPin } = useSecurity();

  const [posts, setPosts] = useState<OfflinePost[]>([]);
  const [activeTab, setActiveTab] = useState<'for_you' | 'college' | 'following'>('for_you');
  const [newPostText, setNewPostText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});

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
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
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

  const toggleLike = (postId: string) => {
    triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
    setLikedPosts(prev => {
      const isLiked = !prev[postId];
      showFeedback(isLiked ? 'Liked post!' : 'Removed like', 'success');
      return { ...prev, [postId]: isLiked };
    });
  };

  const campusHubs = [
    {
      id: 'study',
      title: 'Study',
      subtitle: 'Partners',
      icon: 'book-outline',
      route: '/study-partners',
      badgeText: 'SPEC',
      accentColor: '#10B981',
      ringColor: 'rgba(16, 185, 129, 0.45)'
    },
    {
      id: 'teams',
      title: 'Teams',
      subtitle: 'SIH 2025',
      icon: 'people-outline',
      route: '/teams',
      badgeText: 'HOT',
      accentColor: colors.primary,
      ringColor: 'rgba(255, 36, 50, 0.55)'
    },
    {
      id: 'clubs',
      title: 'Clubs',
      subtitle: 'Events',
      icon: 'flag-outline',
      route: '/clubs',
      badgeText: 'GDSC',
      accentColor: '#F59E0B',
      ringColor: 'rgba(245, 158, 11, 0.45)'
    },
    {
      id: 'challenges',
      title: 'Daily Quiz',
      subtitle: 'Streak 3x',
      icon: 'trophy-outline',
      route: '/challenges',
      badgeText: 'DAILY',
      accentColor: '#A855F7',
      ringColor: 'rgba(168, 85, 247, 0.45)'
    },
    {
      id: 'chatbot',
      title: 'Trybel AI',
      subtitle: 'Assistant',
      icon: 'sparkles',
      route: '/chatbot',
      badgeText: '24/7',
      accentColor: '#06B6D4',
      ringColor: 'rgba(6, 182, 212, 0.45)'
    },
    {
      id: 'notifications',
      title: 'Alerts',
      subtitle: 'Reminders',
      icon: 'notifications-outline',
      route: '/notifications',
      badgeText: 'NEW',
      accentColor: '#38BDF8',
      ringColor: 'rgba(56, 189, 248, 0.45)'
    },
    {
      id: 'admin',
      title: 'Mod Panel',
      subtitle: 'Review',
      icon: 'shield-checkmark-outline',
      route: '/admin',
      badgeText: null,
      accentColor: '#F43F5E',
      ringColor: 'rgba(244, 63, 94, 0.45)'
    }
  ];

  const highlightReels = [
    {
      id: '1',
      title: 'Smart India Hackathon 2025',
      subtitle: 'Hardware & AI track teams forming now. Join cross-college squads.',
      badge: 'FEATURED HACKATHON',
      route: '/teams'
    },
    {
      id: '2',
      title: 'Full-Stack Development Sprint',
      subtitle: 'GDSC hands-on systems workshop this Saturday at SPEC Lab 3.',
      badge: 'CAMPUS CLUB EVENT',
      route: '/clubs'
    },
    {
      id: '3',
      title: 'Today’s Campus Knowledge Puzzle',
      subtitle: 'Test your distributed systems, concurrency, and SQL indexing skills.',
      badge: 'DAILY PUZZLE',
      route: '/challenges'
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Apple Translucent Frosted Header */}
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.brandLogoCircle}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.brandTitle}>TRYBEL</Text>
            <View style={styles.verifiedCampusTag}>
              <Text style={styles.verifiedDot}>●</Text>
              <Text style={styles.verifiedCampusText}>St. Peter's College</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          {hasPin && (
            <TouchableOpacity
              style={styles.headerBtn}
              onPress={() => {
                triggerHaptic();
                lockApp();
              }}
              accessibilityLabel="Lock App"
            >
              <Ionicons name="lock-closed-outline" size={17} color={colors.textPrimary} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              triggerHaptic();
              router.push('/chatbot');
            }}
            accessibilityLabel="Campus AI Assistant"
          >
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => {
              triggerHaptic();
              router.push('/notifications');
            }}
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
        bounces={true}
      >
        {/* Apple iOS Horizontal Scrolling Icons Hub Tray */}
        <View style={styles.hubSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.hubScrollContent}
            decelerationRate="normal"
            bounces={true}
          >
            {campusHubs.map((hub) => (
              <TouchableOpacity
                key={hub.id}
                style={styles.hubItem}
                activeOpacity={0.72}
                onPress={() => {
                  triggerHaptic();
                  router.push(hub.route as any);
                }}
              >
                <View style={[styles.hubIconPod, { borderColor: hub.ringColor }]}>
                  <Ionicons name={hub.icon as any} size={24} color={hub.accentColor} />
                  {hub.badgeText && (
                    <View style={[styles.hubBadge, { backgroundColor: hub.accentColor }]}>
                      <Text style={styles.hubBadgeText}>{hub.badgeText}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.hubItemTitle} numberOfLines={1}>{hub.title}</Text>
                <Text style={styles.hubItemSubtitle} numberOfLines={1}>{hub.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Apple App Store Style Highlights Reel Carousel */}
        <PanCarousel
          data={highlightReels}
          renderItem={(item) => (
            <TouchableOpacity
              style={styles.appleBannerCard}
              activeOpacity={0.9}
              onPress={() => {
                triggerHaptic();
                router.push(item.route as any);
              }}
            >
              <View style={styles.bannerTopRow}>
                <View style={styles.bannerBadgePill}>
                  <Text style={styles.bannerBadgeText}>{item.badge}</Text>
                </View>
                <Ionicons name="sparkles" size={13} color={colors.primary} />
              </View>

              <Text style={styles.bannerTitle}>{item.title}</Text>
              <Text style={styles.bannerSub}>{item.subtitle}</Text>

              <View style={styles.bannerActionRow}>
                <Text style={styles.bannerCtaText}>Explore</Text>
                <View style={styles.bannerArrowCircle}>
                  <Ionicons name="arrow-forward" size={12} color={colors.white} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Apple iOS Native Segmented Pill Control */}
        <View style={styles.segmentedControl}>
          {(['for_you', 'college', 'following'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'for_you' ? 'For You' : tab === 'college' ? "St. Peter’s" : 'Following';
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.segmentBtn, isActive && styles.segmentBtnActive]}
                activeOpacity={0.82}
                onPress={() => {
                  triggerHaptic();
                  setActiveTab(tab);
                }}
              >
                {isActive && <View style={styles.activeDot} />}
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Apple-style Create Post Bar */}
        <View style={styles.createPostBox}>
          <View style={styles.createPostRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120' }}
              style={styles.myAvatar}
            />
            <TextInput
              style={styles.createInput}
              placeholder="Share what's happening on campus..."
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
                <Ionicons name="arrow-up" size={16} color={colors.white} style={{ marginRight: 4 }} />
                <Text style={styles.postBtnText}>{isPosting ? 'Posting...' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Posts List */}
        <View style={styles.postsList}>
          {posts.map((post) => {
            let tags: string[] = [];
            try {
              tags = JSON.parse(post.tags_json || '[]');
            } catch {}

            const isLiked = likedPosts[post.id];
            const displayLikes = (post.likes_count || 0) + (isLiked ? 1 : 0);

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
                    onPress={() => toggleLike(post.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={isLiked ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isLiked ? colors.primary : colors.textSecondary}
                    />
                    <Text style={[styles.postActionCount, isLiked && { color: colors.primary }]}>
                      {displayLikes}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => {
                      triggerHaptic();
                      router.push('/chat');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="chatbubble-outline" size={17} color={colors.textSecondary} />
                    <Text style={styles.postActionCount}>{post.comments_count}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.postAction}
                    onPress={() => {
                      triggerHaptic();
                      router.push('/report');
                    }}
                    activeOpacity={0.7}
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
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: 'rgba(8, 8, 10, 0.94)',
    zIndex: 10,
    elevation: 4
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
    borderColor: 'rgba(255, 36, 50, 0.4)',
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
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 1.4
  },
  verifiedCampusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1
  },
  verifiedDot: {
    color: colors.primary,
    fontSize: 7
  },
  verifiedCampusText: {
    color: colors.textSecondary,
    fontSize: 10,
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110
  },
  hubSection: {
    paddingTop: 14,
    paddingBottom: 4
  },
  hubScrollContent: {
    paddingHorizontal: 16,
    gap: 14
  },
  hubItem: {
    alignItems: 'center',
    width: 68
  },
  hubIconPod: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 6
  },
  hubBadge: {
    position: 'absolute',
    top: -3,
    right: -4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6
  },
  hubBadgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3
  },
  hubItemTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center'
  },
  hubItemSubtitle: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
    textAlign: 'center'
  },
  appleBannerCard: {
    backgroundColor: '#121216',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%'
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  bannerBadgePill: {
    backgroundColor: 'rgba(255, 36, 50, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 36, 50, 0.3)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8
  },
  bannerBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.3
  },
  bannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 17
  },
  bannerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 14,
    gap: 6
  },
  bannerCtaText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  bannerArrowCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#141418',
    borderRadius: 14,
    padding: 3,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 11,
    gap: 5
  },
  segmentBtnActive: {
    backgroundColor: '#24242B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600'
  },
  segmentTextActive: {
    color: colors.white,
    fontWeight: '800'
  },
  createPostBox: {
    backgroundColor: '#121216',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 16
  },
  createPostRow: {
    flexDirection: 'row',
    gap: 12
  },
  myAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 8
  },
  postBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  postBtnDisabled: {
    opacity: 0.5
  },
  postBtnText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 12
  },
  postsList: {
    paddingHorizontal: 16,
    gap: 12
  },
  postCard: {
    backgroundColor: '#121216',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  postAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
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
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.08)'
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
