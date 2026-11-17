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
import { colors } from '../../theme/colors';
import { useFeedback } from '../../context/FeedbackContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PHOTO_SIZE = (SCREEN_WIDTH - 48) / 2;

interface Friend {
  id: string;
  name: string;
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
      id: 'usr_sana',
      name: 'Sana Khan',
      department: 'CSE • 3rd Year',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      isMutual: true
    },
    {
      id: 'usr_arjun',
      name: 'Arjun Reddy',
      department: 'CSE • 3rd Year',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      isMutual: true
    },
    {
      id: 'usr_venkatesh',
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Campus Friends & Photos</Text>
        <Text style={styles.headerSubtitle}>Friends-only audience scoping & signed URLs</Text>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          {(['friends', 'requests', 'photos'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === tab && styles.tabBtnTextActive
                ]}
              >
                {tab === 'friends'
                  ? `Friends (${friends.length})`
                  : tab === 'requests'
                  ? `Requests (${requests.length})`
                  : 'Shared Photos'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* FRIENDS LIST */}
        {activeTab === 'friends' && (
          <View style={styles.friendsList}>
            {friends.map((f) => (
              <View key={f.id} style={styles.friendCard}>
                <Image source={{ uri: f.avatar }} style={styles.friendAvatar} />
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{f.name}</Text>
                  <Text style={styles.friendDept}>{f.department}</Text>
                  <View style={styles.verifiedTag}>
                    <Text style={styles.verifiedTagText}>✓ Verified Peer</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.unfriendBtn}
                  onPress={() => handleUnfriend(f.id, f.name)}
                >
                  <Text style={styles.unfriendBtnText}>Unfriend</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* REQUESTS LIST */}
        {activeTab === 'requests' && (
          <View style={styles.friendsList}>
            {requests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyEmoji}>📬</Text>
                <Text style={styles.emptyTitle}>No Pending Requests</Text>
                <Text style={styles.emptySub}>You are all caught up with your campus invitations.</Text>
              </View>
            ) : (
              requests.map((r) => (
                <View key={r.id} style={styles.requestCard}>
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
                      <Text style={styles.declineBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* SHARED PHOTOS GRID */}
        {activeTab === 'photos' && (
          <View style={styles.photosGrid}>
            <View style={styles.privacyBanner}>
              <Text style={styles.privacyIcon}>🔒</Text>
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
    backgroundColor: colors.bg
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC'
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 10
  },
  tabSwitcher: {
    flexDirection: 'row',
    gap: 8
  },
  tabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#131B2E',
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  tabBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  tabBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600'
  },
  tabBtnTextActive: {
    color: '#0A0E17',
    fontWeight: '700'
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40
  },
  friendsList: {
    gap: 12
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B'
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
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700'
  },
  friendDept: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2
  },
  verifiedTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#064E3B',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 4
  },
  verifiedTagText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '700'
  },
  unfriendBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155'
  },
  unfriendBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600'
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  acceptBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  acceptBtnText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '700'
  },
  declineBtn: {
    backgroundColor: '#1E293B',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155'
  },
  declineBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700'
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700'
  },
  emptySub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4
  },
  photosGrid: {
    width: '100%'
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0C4A6E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    gap: 8
  },
  privacyIcon: {
    fontSize: 16
  },
  privacyText: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '600',
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
    backgroundColor: '#131B2E',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
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
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
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
    color: '#64748B',
    fontSize: 10
  }
});
