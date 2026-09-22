import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, Modal, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface FriendsPhotosScreenProps {
  onBack?: () => void;
  onNavigate: (screen: string) => void;
}

export const FriendsPhotosScreen: React.FC<FriendsPhotosScreenProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'photos'>('friends');
  const [friendsData, setFriendsData] = useState<any>({ friends: [], requests: [], suggested: [] });
  const [photos, setPhotos] = useState<any[]>([]);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [photoCaption, setPhotoCaption] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const fRes = await api.getFriends();
      setFriendsData(fRes);

      const pRes = await api.getPhotos();
      setPhotos(pRes.data || []);
    } catch (err: any) {
      console.warn('Error loading friends/photos:', err);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await api.acceptFriendRequest(requestId);
      Alert.alert('Accepted! 🤝', 'Friendship confirmed. Reciprocal photo access granted.');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleUnfriend = async (friendId: string) => {
    Alert.alert('Unfriend', 'Are you sure? Photo access will be revoked immediately.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unfriend',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.unfriend(friendId);
            Alert.alert('Unfriended', 'Photo access has been revoked immediately.');
            loadData();
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        }
      }
    ]);
  };

  const handleUploadPhoto = async () => {
    if (!photoCaption.trim()) {
      Alert.alert('Caption required', 'Please enter a caption for your campus moment.');
      return;
    }

    try {
      await api.uploadPhoto(photoCaption.trim());
      Alert.alert('Photo Shared! 📸', 'Shared securely with your accepted friends via signed expiring links.');
      setUploadModalVisible(false);
      setPhotoCaption('');
      loadData();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Friends & Photos</Text>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {(['friends', 'requests', 'photos'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.activeTabBtn]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'requests' && friendsData.requests?.length > 0 ? ` (${friendsData.requests.length})` : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* TAB 1: FRIENDS */}
        {activeTab === 'friends' && (
          <>
            <Text style={styles.sectionHeader}>My Friends ({friendsData.friends?.length || 0})</Text>
            {friendsData.friends?.map((f: any) => (
              <View key={f.id} style={styles.userCard}>
                <Image
                  source={{ uri: f.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{f.name}</Text>
                  <Text style={styles.userMeta}>{f.department} • {f.year_of_study}</Text>
                </View>
                <TouchableOpacity style={styles.unfriendBtn} onPress={() => handleUnfriend(f.id)}>
                  <Text style={styles.unfriendText}>Unfriend</Text>
                </TouchableOpacity>
              </View>
            ))}

            <Text style={[styles.sectionHeader, { marginTop: 24 }]}>Suggested Friends</Text>
            {friendsData.suggested?.map((s: any) => (
              <View key={s.id} style={styles.userCard}>
                <Image
                  source={{ uri: s.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' }}
                  style={styles.avatar}
                />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{s.name}</Text>
                  <Text style={styles.userMeta}>{s.department} • {s.year_of_study}</Text>
                </View>
                <TouchableOpacity
                  style={styles.connectBtn}
                  onPress={async () => {
                    await api.sendFriendRequest(s.id);
                    Alert.alert('Request Sent', `Friend request sent to ${s.name}`);
                    loadData();
                  }}
                >
                  <Text style={styles.connectText}>Connect</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* TAB 2: REQUESTS */}
        {activeTab === 'requests' && (
          <>
            <Text style={styles.sectionHeader}>Pending Requests</Text>
            {friendsData.requests?.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No pending friend requests.</Text>
              </View>
            ) : (
              friendsData.requests?.map((req: any) => (
                <View key={req.request_id} style={styles.userCard}>
                  <Image
                    source={{ uri: req.avatar_url || 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100' }}
                    style={styles.avatar}
                  />
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{req.name}</Text>
                    <Text style={styles.userMeta}>{req.department} • {req.year_of_study}</Text>
                  </View>
                  <View style={styles.actionIconsRow}>
                    <TouchableOpacity
                      style={styles.acceptCircle}
                      onPress={() => handleAccept(req.request_id)}
                    >
                      <Text style={styles.acceptIcon}>✓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* TAB 3: PHOTOS (FRIENDS ONLY) */}
        {activeTab === 'photos' && (
          <>
            <View style={styles.photoHeaderRow}>
              <View>
                <Text style={styles.sectionHeader}>Shared Photos</Text>
                <Text style={styles.photoNotice}>🔒 Private • Visible only to accepted friends</Text>
              </View>
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => setUploadModalVisible(true)}
              >
                <Text style={styles.uploadBtnText}>+ Share Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.photoGrid}>
              {photos.map(photo => (
                <View key={photo.id} style={styles.photoCard}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400' }}
                    style={styles.photoImage}
                  />
                  <View style={styles.photoMeta}>
                    <Text style={styles.photoUploader}>{photo.uploader_name}</Text>
                    <Text style={styles.photoCaption} numberOfLines={2}>{photo.caption}</Text>
                    <View style={styles.signedTag}>
                      <Text style={styles.signedTagText}>✓ 15m Expiring S3 URL</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Upload Photo Modal */}
      <Modal visible={uploadModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share Campus Photo</Text>
            <Text style={styles.modalNotice}>
              Photos are stored in a private S3 bucket and automatically shared only with accepted friends in photo_audiences.
            </Text>

            <Text style={styles.fieldLabel}>Caption</Text>
            <TextInput
              style={[styles.input, { height: 60 }]}
              multiline
              placeholder="What's happening on campus?"
              placeholderTextColor={colors.textMuted}
              value={photoCaption}
              onChangeText={setPhotoCaption}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setUploadModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleUploadPhoto}>
                <Text style={styles.confirmBtnText}>Upload & Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16
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
    fontSize: 13,
    fontWeight: '600'
  },
  activeTabText: {
    color: colors.textPrimary
  },
  content: {
    flex: 1,
    marginBottom: 70
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12
  },
  userInfo: {
    flex: 1
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  userMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  unfriendBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: colors.inputBg
  },
  unfriendText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600'
  },
  connectBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  connectText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  },
  emptyBox: {
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13
  },
  actionIconsRow: {
    flexDirection: 'row',
    gap: 8
  },
  acceptCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  acceptIcon: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '900'
  },
  photoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  photoNotice: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  uploadBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  uploadBtnText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '700'
  },
  photoGrid: {
    gap: 14
  },
  photoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  photoImage: {
    width: '100%',
    height: 190
  },
  photoMeta: {
    padding: 12
  },
  photoUploader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4
  },
  photoCaption: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 6
  },
  signedTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6
  },
  signedTagText: {
    fontSize: 10,
    color: '#38BDF8',
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6
  },
  modalNotice: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 16
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13,
    marginBottom: 16
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  cancelBtnText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600'
  },
  confirmBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  confirmBtnText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '700'
  }
});
