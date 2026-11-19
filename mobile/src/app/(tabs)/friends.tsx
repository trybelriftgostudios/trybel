import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useFeedback } from '../../context/FeedbackContext';
import { IOSSegmentedControl } from '../../components/IOSSegmentedControl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - 48) / 2;

interface Friend {
  id: string;
  username?: string; // Optional handle; defaults to id
  name?: string;
  department: string;
  avatar: string;
  isMutual: boolean;
}

interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  author: string;
  timeAgo: string;
}

export default function FriendsScreen() {
  const { showFeedback } = useFeedback();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'photos'>('friends');

  const [friends, setFriends] = useState<Friend[]>([
    {
      id: 'usr_sana_04',
      username: 'sana_khan',
      name: 'Sana Khan',
      department: 'CSE • 3rd Year',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      isMutual: true
    },
    {
      id: 'usr_arjun_92',
      // No username provided - falls back to userid 'usr_arjun_92' as display name
      name: 'Arjun Reddy',
      department: 'CSE • 3rd Year',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      isMutual: true
    },
    {
      id: 'usr_venky_11',
      username: 'venkatesh_ece',
      name: 'Venkatesh',
      department: 'ECE • 2nd Year',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      isMutual: true
    }
  ]);

  const [requests, setRequests] = useState<{ id: string; name: string; dept: string; avatar: string }[]>([
    {
      id: 'req_ishita',
      name: 'Ishita Sharma',
      dept: 'IT • 3rd Year',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200'
    }
  ]);

  const [photos] = useState<PhotoItem[]>([
    {
      id: 'ph_1',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600',
      caption: 'Sunset over SPEC campus quad 🌅',
      author: 'Varun Dulam',
      timeAgo: '2d ago'
    },
    {
      id: 'ph_2',
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600',
      caption: 'Hackathon SIH 2025 team win 🏆',
      author: 'Varun Dulam',
      timeAgo: '1w ago'
    },
    {
      id: 'ph_3',
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600',
      caption: 'Library study session before end-sems 📚',
      author: 'Sana Khan',
      timeAgo: '3d ago'
    },
    {
      id: 'ph_4',
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600',
      caption: 'Robotics lab drone demo flight 🚀',
      author: 'Venkatesh',
      timeAgo: '4d ago'
    }
  ]);

  const handleAcceptRequest = (reqId: string, name: string) => {
    setRequests(requests.filter((r) => r.id !== reqId));
    setFriends([
      ...friends,
      {
        id: reqId,
        name,
        department: 'IT • 3rd Year',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200',
        isMutual: true
      }
    ]);
    showFeedback(`Accepted ${name}'s request! Photo audience access granted.`, 'success');
  };

  const handleDeclineRequest = (reqId: string) => {
    setRequests(requests.filter((r) => r.id !== reqId));
    showFeedback('Friend request declined', 'info');
  };

  const handleUnfriend = (friendId: string, name: string) => {
    setFriends(friends.filter((f) => f.id !== friendId));
    showFeedback(`Unfriended ${name}. Photo audience access revoked immediately.`, 'warning');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Friends & Photos</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* iOS Large Title */}
        <View style={styles.largeTitleSection}>
          <Text style={styles.largeTitle}>Friends</Text>
        </View>

        {/* iOS Segmented Switcher */}
        <View style={styles.segmentedWrapper}>
          <IOSSegmentedControl
            values={['friends', 'requests', 'photos'] as const}
            selectedIndex={activeTab === 'friends' ? 0 : activeTab === 'requests' ? 1 : 2}
            onChange={(tab) => setActiveTab(tab)}
            formatLabel={(tab) =>
              tab === 'friends'
                ? `Friends (${friends.length})`
                : tab === 'requests'
                ? `Requests (${requests.length})`
                : 'Shared Photos'
            }
          />
        </View>

        {/* FRIENDS LIST */}
        {activeTab === 'friends' && (
          <View style={styles.groupedList}>
            {friends.map((f, idx) => (
              <React.Fragment key={f.id}>
                <View style={styles.friendRow}>
                  <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{f.username || f.id}</Text>
                    <Text style={styles.friendDept}>{f.department}</Text>
                    <View style={styles.verifiedTag}>
                      <Text style={styles.verifiedTagText}>✓ Verified Peer</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.unfriendBtn}
                    onPress={() => handleUnfriend(f.id, f.name || f.username || f.id)}
                  >
                    <Text style={styles.unfriendBtnText}>Unfriend</Text>
                  </TouchableOpacity>
                </View>
                {idx < friends.length - 1 && <View style={styles.rowSeparator} />}
              </React.Fragment>
            ))}
          </View>
        )}

        {/* REQUESTS LIST */}
        {activeTab === 'requests' && (
          <View style={styles.groupedList}>
            {requests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="mail-unread-outline" size={36} color={colors.textSecondary} style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No Pending Requests</Text>
                <Text style={styles.emptySub}>You are all caught up with your campus invitations.</Text>
              </View>
            ) : (
              requests.map((r, idx) => (
                <React.Fragment key={r.id}>
                  <View style={styles.requestRow}>
                    <Image source={{ uri: r.avatar }} style={styles.friendAvatar} />
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{r.name}</Text>
                      <Text style={styles.friendDept}>{r.dept}</Text>
                    </View>

                    <View style={styles.requestActions}>
                      <TouchableOpacity
                        style={styles.acceptBtn}
                        onPress={() => handleAcceptRequest(r.id, r.name)}
                      >
                        <Text style={styles.acceptBtnText}>Confirm</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.declineBtn}
                        onPress={() => handleDeclineRequest(r.id)}
                      >
                        <Ionicons name="close" size={16} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {idx < requests.length - 1 && <View style={styles.rowSeparator} />}
                </React.Fragment>
              ))
            )}
          </View>
        )}

        {/* SHARED PHOTOS GRID */}
        {activeTab === 'photos' && (
          <View style={styles.photosGrid}>
            <View style={styles.privacyBanner}>
              <Ionicons name="lock-closed" size={15} color={colors.primary} />
              <Text style={styles.privacyText}>
                Photos are visible only to accepted friends via 15-min expiring signed URLs.
              </Text>
            </View>

            <View style={styles.gridRow}>
              {photos.map((p) => (
                <View key={p.id} style={styles.photoCard}>
                  <Image source={{ uri: p.url }} style={styles.photoImg} />
                  <View style={styles.photoDetails}>
                    <Text style={styles.photoCaption} numberOfLines={2}>
                      {p.caption}
                    </Text>
                    <View style={styles.photoMetaRow}>
                      <Text style={styles.photoAuthor}>{p.author}</Text>
                      <Text style={styles.photoTime}>{p.timeAgo}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    backgroundColor: colors.bg,
    alignItems: 'center',
    zIndex: 10,
    elevation: 4
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.4
  },
  scrollView: {
    flex: 1
  },
  largeTitleSection: {
    paddingHorizontal: 16,
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
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 16
  },
  scrollContent: {
    paddingBottom: 110
  },
  groupedList: {
    marginHorizontal: 16,
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    overflow: 'hidden'
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12
  },
  friendInfo: {
    flex: 1
  },
  friendName: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  friendDept: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryMuted,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 4
  },
  verifiedTagText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '700'
  },
  unfriendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.systemFill
  },
  unfriendBtnText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 14
  },
  acceptBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700'
  },
  declineBtn: {
    backgroundColor: colors.systemFill,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 74
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20
  },
  emptyIcon: {
    marginBottom: 8
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600'
  },
  emptySub: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center'
  },
  photosGrid: {
    paddingHorizontal: 16
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8
  },
  privacyText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    flex: 1
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between'
  },
  photoCard: {
    width: PHOTO_SIZE,
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    marginBottom: 12
  },
  photoImg: {
    width: '100%',
    height: PHOTO_SIZE * 0.95
  },
  photoDetails: {
    padding: 8
  },
  photoCaption: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16
  },
  photoMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6
  },
  photoAuthor: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700'
  },
  photoTime: {
    color: colors.textSecondary,
    fontSize: 10
  }
});
