import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal, TextInput, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface ProfileScreenProps {
  onBack?: () => void;
  onNavigate: (screen: string) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ onBack, onNavigate }) => {
  const [profileData, setProfileData] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit form state
  const [about, setAbout] = useState('');
  const [motto, setMotto] = useState('');
  const [skills, setSkills] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const me = await api.getMe();
      setProfileData(me);
      setAbout(me.profile?.about || '');
      setMotto(me.profile?.motto || '');
      setSkills(me.profile?.skills?.join(', ') || '');
    } catch (err: any) {
      console.warn('Error loading profile:', err);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await api.updateProfile({
        about,
        motto,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean)
      });
      Alert.alert('Profile Updated', 'Your changes have been saved.');
      setEditModalVisible(false);
      loadProfile();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.iconBtn}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 30 }} />}

        <TouchableOpacity onPress={() => onNavigate('Report')} style={styles.iconBtn}>
          <Text style={styles.dotsIcon}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar & Verification Badge */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: profileData?.profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
              style={styles.avatar}
            />
            <View style={styles.checkBadge}>
              <Text style={styles.checkText}>✓</Text>
            </View>
          </View>

          <View style={styles.nameRow}>
            <Text style={styles.fullName}>{profileData?.profile?.full_name || 'Sritan Vesangi'}</Text>
          </View>

          <Text style={styles.deptText}>
            {profileData?.profile?.department || 'CSE'} • {profileData?.profile?.year_of_study || '3rd Year'}
          </Text>
          <Text style={styles.collegeText}>
            {profileData?.college?.name || "St. Peter's Engineering College"}
          </Text>

          <TouchableOpacity style={styles.editBtn} onPress={() => setEditModalVisible(true)}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{profileData?.stats?.connections || 12}</Text>
            <Text style={styles.statLabel}>Connections</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{profileData?.stats?.teams || 5}</Text>
            <Text style={styles.statLabel}>Teams</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statNum}>{profileData?.stats?.clubs || 3}</Text>
            <Text style={styles.statLabel}>Clubs</Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            {profileData?.profile?.about || 'Passionate about building products, exploring new technologies and collaborating with like-minded people.'}
          </Text>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <View style={styles.tagsGrid}>
            {(profileData?.profile?.skills || ['Python', 'Web Development', 'Machine Learning', 'UI/UX', 'Leadership']).map((skill: string, i: number) => (
              <View key={i} style={styles.tagPill}>
                <Text style={styles.tagText}>• {skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Available For */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available for</Text>
          <View style={styles.tagsGrid}>
            {(profileData?.profile?.available_for || ['Study Partners', 'Hackathon Teams', 'Projects']).map((item: string, i: number) => (
              <View key={i} style={[styles.tagPill, styles.availPill]}>
                <Text style={styles.availText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Motto */}
        <View style={[styles.section, { marginBottom: 90 }]}>
          <Text style={styles.sectionTitle}>Motto</Text>
          <Text style={styles.mottoText}>
            "{profileData?.profile?.motto || 'Learn • Build • Connect'}"
          </Text>
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>Edit Profile</Text>

            <Text style={styles.fieldLabel}>About You</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              multiline
              value={about}
              onChangeText={setAbout}
            />

            <Text style={styles.fieldLabel}>Motto / Philosophy</Text>
            <TextInput
              style={styles.modalInput}
              value={motto}
              onChangeText={setMotto}
            />

            <Text style={styles.fieldLabel}>Skills (comma-separated)</Text>
            <TextInput
              style={styles.modalInput}
              value={skills}
              onChangeText={setSkills}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
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
    paddingTop: 48
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8
  },
  iconBtn: {
    padding: 6
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700'
  },
  dotsIcon: {
    color: colors.textSecondary,
    fontSize: 20
  },
  content: {
    flex: 1,
    paddingHorizontal: 16
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2,
    borderColor: '#38BDF8'
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '900'
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  deptText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4
  },
  collegeText: {
    fontSize: 12,
    color: '#38BDF8',
    marginTop: 2
  },
  editBtn: {
    marginTop: 14,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10
  },
  editBtnText: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600'
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  statCol: {
    flex: 1,
    alignItems: 'center'
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border
  },
  section: {
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8
  },
  aboutText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#CBD5E1'
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  tagPill: {
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  tagText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600'
  },
  availPill: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderColor: 'rgba(34, 197, 94, 0.3)'
  },
  availText: {
    fontSize: 12,
    color: '#34D399',
    fontWeight: '600'
  },
  mottoText: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textSecondary
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
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
  modalHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 8
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: colors.textPrimary,
    fontSize: 13
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 18
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
  saveBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10
  },
  saveBtnText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '700'
  }
});
