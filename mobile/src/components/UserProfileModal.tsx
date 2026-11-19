import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { CampusTag, mockAvailableTags } from '../services/mockFallback';
import { useFeedback } from '../context/FeedbackContext';

export interface UserProfileData {
  id: string;
  username?: string; // Discord-style display name (can have spaces)
  fullName?: string;
  collegeName?: string;
  collegeId?: string;
  avatar?: string;
  department?: string;
  yearOfStudy?: string;
  about?: string;
  verified?: boolean;
  tags?: CampusTag[];
}

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserProfileData | null;
  viewerRole?: 'student' | 'campus_mod' | 'super_mod' | 'main_admin';
  viewerCollegeId?: string;
}

const PRESET_COLORS = [
  '#0A84FF', // Blue
  '#30D158', // Green
  '#BF5AF2', // Purple
  '#FF9F0A', // Orange
  '#FF453A', // Red
  '#30B0C7', // Cyan
  '#5E5CE6', // Indigo
  '#FFD700', // Gold
  '#E11D48'  // Rose
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  visible,
  onClose,
  user,
  viewerRole = 'campus_mod',
  viewerCollegeId = 'col_stpeters_01'
}) => {
  const { showFeedback } = useFeedback();

  // State for all available tags in system
  const [allTags, setAllTags] = useState<CampusTag[]>(mockAvailableTags);
  // State for this user's assigned tags
  const [assignedTags, setAssignedTags] = useState<CampusTag[]>([]);

  // Mod manager panel
  const [isManagingRoles, setIsManagingRoles] = useState(false);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // New Tag Form state
  const [newTagName, setNewTagName] = useState('');
  const [newTagCategory, setNewTagCategory] = useState<'department' | 'club' | 'role' | 'achievement'>('department');
  const [newTagColor, setNewTagColor] = useState('#0A84FF');
  const [newTagScope, setNewTagScope] = useState<'global' | 'college'>(
    viewerRole === 'campus_mod' ? 'college' : 'global'
  );

  // Synchronize assigned tags when modal opens with user
  React.useEffect(() => {
    if (user) {
      if (user.tags && user.tags.length > 0) {
        setAssignedTags(user.tags);
      } else {
        // Default tags based on department or sample
        const deptTag = allTags.find(t => t.name.toLowerCase() === (user.department || '').toLowerCase().split(' ')[0]);
        setAssignedTags(deptTag ? [deptTag] : [allTags[0]]);
      }
    }
  }, [user]);

  if (!user) return null;

  const effectiveDisplayName = user.username?.trim() || user.fullName || user.id;
  const isModOrAdmin = viewerRole === 'campus_mod' || viewerRole === 'super_mod' || viewerRole === 'main_admin';

  // Toggle assigning a tag to this user
  const handleToggleTag = (tag: CampusTag) => {
    // Check permission:
    // Campus mods can only assign tags belonging to their college or global tags
    if (viewerRole === 'campus_mod' && tag.scope === 'college' && tag.college_id && tag.college_id !== viewerCollegeId) {
      showFeedback('Campus Mods can only assign tags for their own college.', 'error');
      return;
    }

    const hasTag = assignedTags.some(t => t.id === tag.id);
    if (hasTag) {
      setAssignedTags(prev => prev.filter(t => t.id !== tag.id));
      showFeedback(`Removed tag "${tag.name}" from ${effectiveDisplayName}`, 'info');
    } else {
      setAssignedTags(prev => [...prev, tag]);
      showFeedback(`Assigned tag "${tag.name}" to ${effectiveDisplayName}!`, 'success');
    }
  };

  // Create new tag (Campus Mod creates for their college; Super Mod creates for whole app or college)
  const handleCreateNewTag = () => {
    if (!newTagName.trim()) {
      showFeedback('Tag name cannot be empty', 'warning');
      return;
    }

    // Enforce scoping permissions
    if (viewerRole === 'campus_mod' && newTagScope === 'global') {
      showFeedback('Campus Mods cannot create global whole-app tags. Only Super Mods can.', 'error');
      return;
    }

    const newTagId = `tag_${Date.now()}`;
    const createdTag: CampusTag = {
      id: newTagId,
      name: newTagName.trim(),
      color: newTagColor,
      category: newTagCategory,
      scope: viewerRole === 'campus_mod' ? 'college' : newTagScope,
      college_id: (viewerRole === 'campus_mod' || newTagScope === 'college') ? viewerCollegeId : undefined,
      icon: newTagCategory === 'department' ? 'school' : newTagCategory === 'club' ? 'sparkles' : 'ribbon'
    };

    setAllTags(prev => [createdTag, ...prev]);
    setAssignedTags(prev => [...prev, createdTag]);

    showFeedback(
      `Created ${createdTag.scope === 'global' ? 'Global' : 'Campus'} tag "${createdTag.name}" and assigned it!`,
      'success'
    );

    setNewTagName('');
    setIsCreatingTag(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheetContainer}>
          {/* Header Bar */}
          <View style={styles.headerBar}>
            <View style={styles.headerDragHandle} />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* User Profile Card */}
            <View style={styles.profileHeaderCard}>
              <View style={styles.avatarRow}>
                <Image
                  source={{ uri: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' }}
                  style={styles.avatar}
                />
                {user.verified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  </View>
                )}
              </View>

              <Text style={styles.displayName}>{effectiveDisplayName}</Text>
              <Text style={styles.subtext}>
                {user.fullName && user.fullName !== effectiveDisplayName ? `${user.fullName} • ` : ''}
                <Text style={styles.uidTag}>UID: {user.id}</Text>
              </Text>
              <Text style={styles.collegeName}>{user.collegeName || "St. Peter's Engineering College"}</Text>
            </View>

            {/* Discord-Style Tags & Roles Section */}
            <View style={styles.rolesContainer}>
              <View style={styles.rolesHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.rolesSectionTitle}>ROLES & CAMPUS TAGS</Text>
                  <Text style={styles.rolesCount}>({assignedTags.length})</Text>
                </View>

                {isModOrAdmin && (
                  <TouchableOpacity
                    style={styles.modManageBtn}
                    onPress={() => setIsManagingRoles(!isManagingRoles)}
                  >
                    <Ionicons name="shield-checkmark" size={13} color="#0A84FF" />
                    <Text style={styles.modManageBtnText}>
                      {isManagingRoles ? 'Done' : 'Manage Tags'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Tag Pills */}
              <View style={styles.tagPillsWrap}>
                {assignedTags.length === 0 ? (
                  <Text style={styles.noTagsText}>No roles or department tags assigned yet.</Text>
                ) : (
                  assignedTags.map(tag => (
                    <View key={tag.id} style={[styles.discordTagPill, { borderColor: tag.color }]}>
                      <View style={[styles.discordTagDot, { backgroundColor: tag.color }]} />
                      <Text style={[styles.discordTagText, { color: tag.color }]}>{tag.name}</Text>
                      {tag.scope === 'global' && (
                        <Text style={styles.globalBadge}>GLOBAL</Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            </View>

            {/* Moderator Tag Management Panel */}
            {isManagingRoles && isModOrAdmin && (
              <View style={styles.modPanelCard}>
                <View style={styles.modPanelHeader}>
                  <Ionicons name="construct-outline" size={18} color="#0A84FF" />
                  <Text style={styles.modPanelTitle}>
                    {viewerRole === 'super_mod' || viewerRole === 'main_admin'
                      ? '⚡ SUPER MOD TAG MANAGER (ALL COLLEGES)'
                      : `🏫 CAMPUS MOD TAG MANAGER (${user.collegeName || 'SPEC'})`}
                  </Text>
                </View>

                <Text style={styles.modPanelSub}>
                  Tap any tag below to add or remove it from {effectiveDisplayName}'s profile:
                </Text>

                {/* Available Tags Toggle Grid */}
                <View style={styles.availableTagsGrid}>
                  {allTags.map(tag => {
                    const isAssigned = assignedTags.some(t => t.id === tag.id);
                    return (
                      <TouchableOpacity
                        key={tag.id}
                        style={[
                          styles.toggleTagChip,
                          isAssigned && { backgroundColor: `${tag.color}25`, borderColor: tag.color }
                        ]}
                        onPress={() => handleToggleTag(tag)}
                      >
                        <Ionicons
                          name={isAssigned ? 'checkmark-circle' : 'add-circle-outline'}
                          size={15}
                          color={isAssigned ? tag.color : '#8E8E93'}
                        />
                        <Text
                          style={[
                            styles.toggleTagText,
                            isAssigned && { color: tag.color, fontWeight: '700' }
                          ]}
                        >
                          {tag.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Create Tag Trigger */}
                {!isCreatingTag ? (
                  <TouchableOpacity
                    style={styles.openCreateBtn}
                    onPress={() => setIsCreatingTag(true)}
                  >
                    <Ionicons name="add" size={16} color="#0A84FF" />
                    <Text style={styles.openCreateBtnText}>
                      {viewerRole === 'campus_mod'
                        ? '+ Create New College Tag (For SPEC)'
                        : '+ Create Global or College Tag'}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  /* Create New Tag Form */
                  <View style={styles.createTagForm}>
                    <Text style={styles.formTitle}>CREATE NEW DISCORD-STYLE TAG</Text>

                    <Text style={styles.formLabel}>TAG NAME (e.g. CSD Data Science, GDSC Core, ECE Lead):</Text>
                    <TextInput
                      style={styles.formInput}
                      placeholder="e.g. CSM (AI & ML)"
                      placeholderTextColor="#8E8E93"
                      value={newTagName}
                      onChangeText={setNewTagName}
                    />

                    <Text style={styles.formLabel}>CATEGORY:</Text>
                    <View style={styles.categoryRow}>
                      {(['department', 'club', 'role', 'achievement'] as const).map(cat => (
                        <TouchableOpacity
                          key={cat}
                          style={[styles.catChip, newTagCategory === cat && styles.catChipActive]}
                          onPress={() => setNewTagCategory(cat)}
                        >
                          <Text style={[styles.catChipText, newTagCategory === cat && styles.catChipTextActive]}>
                            {cat.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.formLabel}>TAG COLOR:</Text>
                    <View style={styles.colorRow}>
                      {PRESET_COLORS.map(c => (
                        <TouchableOpacity
                          key={c}
                          style={[
                            styles.colorDot,
                            { backgroundColor: c },
                            newTagColor === c && styles.colorDotSelected
                          ]}
                          onPress={() => setNewTagColor(c)}
                        />
                      ))}
                    </View>

                    {/* Scoping Selector (Only Super Mod/Main Admin can make Global tags) */}
                    {(viewerRole === 'super_mod' || viewerRole === 'main_admin') && (
                      <View style={{ marginTop: 8 }}>
                        <Text style={styles.formLabel}>SCOPE LEVEL:</Text>
                        <View style={styles.categoryRow}>
                          <TouchableOpacity
                            style={[styles.catChip, newTagScope === 'global' && styles.catChipActive]}
                            onPress={() => setNewTagScope('global')}
                          >
                            <Text style={[styles.catChipText, newTagScope === 'global' && styles.catChipTextActive]}>
                              ⚡ WHOLE APP (GLOBAL)
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.catChip, newTagScope === 'college' && styles.catChipActive]}
                            onPress={() => setNewTagScope('college')}
                          >
                            <Text style={[styles.catChipText, newTagScope === 'college' && styles.catChipTextActive]}>
                              🏫 SPEC ONLY
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View style={styles.formBtnRow}>
                      <TouchableOpacity
                        style={styles.cancelFormBtn}
                        onPress={() => setIsCreatingTag(false)}
                      >
                        <Text style={styles.cancelFormText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.saveTagBtn}
                        onPress={handleCreateNewTag}
                      >
                        <Text style={styles.saveTagBtnText}>Save & Assign</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* About / Bio Card */}
            {user.about ? (
              <View style={styles.bioCard}>
                <Text style={styles.bioLabel}>ABOUT</Text>
                <Text style={styles.bioText}>{user.about}</Text>
              </View>
            ) : null}

            {/* Quick Actions */}
            <View style={styles.quickActionRow}>
              <TouchableOpacity
                style={styles.chatActionBtn}
                onPress={() => {
                  onClose();
                  showFeedback(`Opening direct message with ${effectiveDisplayName}`, 'info');
                }}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#FFFFFF" />
                <Text style={styles.chatActionText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end'
  },
  sheetContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)'
  },
  headerBar: {
    alignItems: 'center',
    paddingVertical: 10,
    position: 'relative'
  },
  headerDragHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  closeBtn: {
    position: 'absolute',
    right: 16,
    top: 8,
    padding: 6
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16
  },
  profileHeaderCard: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(84, 84, 88, 0.4)'
  },
  avatarRow: {
    position: 'relative',
    marginBottom: 10
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2C2C2E'
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C1C1E'
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3
  },
  subtext: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2
  },
  uidTag: {
    fontSize: 10,
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  collegeName: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 4
  },
  rolesContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    padding: 14,
    gap: 10
  },
  rolesHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rolesSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8
  },
  rolesCount: {
    fontSize: 11,
    color: '#8E8E93'
  },
  modManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(10, 132, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  modManageBtnText: {
    fontSize: 11,
    color: '#0A84FF',
    fontWeight: '700'
  },
  tagPillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  discordTagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1
  },
  discordTagDot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  discordTagText: {
    fontSize: 12,
    fontWeight: '700'
  },
  globalBadge: {
    fontSize: 8,
    color: '#8E8E93',
    fontWeight: '800',
    marginLeft: 2
  },
  noTagsText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic'
  },
  modPanelCard: {
    backgroundColor: '#18181A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#0A84FF',
    gap: 10
  },
  modPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  modPanelTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0A84FF',
    letterSpacing: 0.5
  },
  modPanelSub: {
    fontSize: 11,
    color: '#8E8E93'
  },
  availableTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  toggleTagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(84, 84, 88, 0.4)'
  },
  toggleTagText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600'
  },
  openCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(10, 132, 255, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 4
  },
  openCreateBtnText: {
    fontSize: 12,
    color: '#0A84FF',
    fontWeight: '700'
  },
  createTagForm: {
    backgroundColor: '#2C2C2E',
    borderRadius: 10,
    padding: 12,
    gap: 8,
    marginTop: 6
  },
  formTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8
  },
  formLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
    marginTop: 2
  },
  formInput: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    padding: 8,
    color: '#FFFFFF',
    fontSize: 12
  },
  categoryRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap'
  },
  catChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1C1C1E'
  },
  catChipActive: {
    backgroundColor: '#0A84FF'
  },
  catChipText: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '700'
  },
  catChipTextActive: {
    color: '#FFFFFF'
  },
  colorRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4
  },
  colorDot: {
    width: 22,
    height: 22,
    borderRadius: 11
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF'
  },
  formBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6
  },
  cancelFormBtn: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  cancelFormText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '600'
  },
  saveTagBtn: {
    flex: 1.5,
    backgroundColor: '#0A84FF',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  saveTagBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700'
  },
  bioCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 14,
    padding: 14,
    gap: 6
  },
  bioLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8
  },
  bioText: {
    fontSize: 12,
    color: '#EBEBF5',
    lineHeight: 18
  },
  quickActionRow: {
    marginTop: 4
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12
  },
  chatActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});
