import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useFeedback } from '../context/FeedbackContext';
import { sqliteService, OfflineTeam } from '../services/sqlite.service';

export default function TeamsModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [activeTab, setActiveTab] = useState<'all' | 'college' | 'cross_college' | 'my_teams'>('all');
  const [teams, setTeams] = useState<OfflineTeam[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Create Team Form State
  const [teamTitle, setTeamTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [targetSize, setTargetSize] = useState('4');
  const [visibility, setVisibility] = useState<'college_only' | 'open_to_all'>('open_to_all');
  const [myTeamIds, setMyTeamIds] = useState<string[]>(['team_sih_01']);

  const loadTeams = useCallback(async () => {
    try {
      const data = await sqliteService.getTeams();
      setTeams(data);
    } catch {
      // Keep default
    }
  }, []);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const handleCreateTeam = async () => {
    if (!teamTitle.trim() || !projectName.trim()) {
      showFeedback('Team title and project name are required', 'warning');
      return;
    }

    const skillsArray = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const newTeam: OfflineTeam = {
      id: `team_${Date.now()}`,
      college_id: 'col_stpeters_01',
      title: teamTitle.trim(),
      project_name: projectName.trim(),
      description: description.trim() || 'Collaborative hackathon project.',
      required_skills_json: JSON.stringify(skillsArray.length > 0 ? skillsArray : ['React Native', 'TypeScript']),
      team_size_target: parseInt(targetSize, 10) || 4,
      members_count: 1,
      visibility,
      creator_name: 'Varun Dulam'
    };

    try {
      await sqliteService.insertTeam(newTeam);
      setMyTeamIds(prev => [...prev, newTeam.id]);
      await loadTeams();
      setCreateModalVisible(false);
      setTeamTitle('');
      setProjectName('');
      setDescription('');
      setSkillsInput('');
      showFeedback('Hackathon team created successfully!', 'success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create team';
      showFeedback(message, 'error');
    }
  };

  const handleJoinTeam = (teamId: string, teamTitleStr: string) => {
    if (myTeamIds.includes(teamId)) {
      showFeedback(`You are already a member of ${teamTitleStr}`, 'info');
      return;
    }
    setMyTeamIds(prev => [...prev, teamId]);
    showFeedback(`Application sent to join ${teamTitleStr}!`, 'success');
  };

  const filteredTeams = teams.filter(team => {
    if (activeTab === 'all') return true;
    if (activeTab === 'college') return team.visibility === 'college_only';
    if (activeTab === 'cross_college') return team.visibility === 'open_to_all';
    if (activeTab === 'my_teams') return myTeamIds.includes(team.id);
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Hackathon Teams</Text>
          <Text style={styles.headerSubtitle}>Cross-College & In-Campus Squads</Text>
        </View>
        <TouchableOpacity
          style={styles.createBtn}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.createBtnText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'all' && styles.tabItemActive]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            All ({teams.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'college' && styles.tabItemActive]}
          onPress={() => setActiveTab('college')}
        >
          <Text style={[styles.tabText, activeTab === 'college' && styles.tabTextActive]}>
            Campus Only
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'cross_college' && styles.tabItemActive]}
          onPress={() => setActiveTab('cross_college')}
        >
          <Text style={[styles.tabText, activeTab === 'cross_college' && styles.tabTextActive]}>
            Cross-College
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'my_teams' && styles.tabItemActive]}
          onPress={() => setActiveTab('my_teams')}
        >
          <Text style={[styles.tabText, activeTab === 'my_teams' && styles.tabTextActive]}>
            My Teams
          </Text>
        </TouchableOpacity>
      </View>

      {/* Teams List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredTeams.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚀</Text>
            <Text style={styles.emptyTitle}>No Teams Found</Text>
            <Text style={styles.emptySubtitle}>
              Be the first to create a hackathon team and recruit talented campus coders!
            </Text>
            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={() => setCreateModalVisible(true)}
            >
              <Text style={styles.emptyActionBtnText}>Create Team</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTeams.map(team => {
            let skills: string[] = [];
            try {
              skills = JSON.parse(team.required_skills_json || '[]');
            } catch {
              skills = [];
            }
            const isJoined = myTeamIds.includes(team.id);
            const isCrossCollege = team.visibility === 'open_to_all';

            return (
              <View key={team.id} style={styles.teamCard}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.teamTitle}>{team.title}</Text>
                    <Text style={styles.projectName}>Project: {team.project_name}</Text>
                  </View>

                  <View
                    style={[
                      styles.visibilityBadge,
                      isCrossCollege ? styles.badgeCross : styles.badgeCollege
                    ]}
                  >
                    <Text
                      style={[
                        styles.visibilityText,
                        isCrossCollege ? styles.badgeTextCross : styles.badgeTextCollege
                      ]}
                    >
                      {isCrossCollege ? '🌐 Cross-College' : '🏛️ Campus Only'}
                    </Text>
                  </View>
                </View>

                {team.description ? (
                  <Text style={styles.teamDescription}>{team.description}</Text>
                ) : null}

                {/* Skills tags */}
                {skills.length > 0 && (
                  <View style={styles.skillsRow}>
                    {skills.map((skill, idx) => (
                      <View key={idx} style={styles.skillChip}>
                        <Text style={styles.skillText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Progress bar */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>
                      Members: {team.members_count} / {team.team_size_target}
                    </Text>
                    <Text style={styles.creatorText}>Lead: {team.creator_name}</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            100,
                            Math.round((team.members_count / team.team_size_target) * 100)
                          )}%`
                        }
                      ]}
                    />
                  </View>
                </View>

                {/* Card Action */}
                <TouchableOpacity
                  style={[styles.joinBtn, isJoined && styles.joinedBtn]}
                  onPress={() => handleJoinTeam(team.id, team.title)}
                >
                  <Text style={[styles.joinBtnText, isJoined && styles.joinedBtnText]}>
                    {isJoined ? '✓ Member of Squad' : 'Apply to Join Squad'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Create Team Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Hackathon Squad</Text>
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formScroll}>
              <Text style={styles.inputLabel}>Hackathon / Team Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., SIH 2025 AI Solutions"
                placeholderTextColor={colors.textMuted}
                value={teamTitle}
                onChangeText={setTeamTitle}
              />

              <Text style={styles.inputLabel}>Project Name / Pitch *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Campus Autonomous Drone"
                placeholderTextColor={colors.textMuted}
                value={projectName}
                onChangeText={setProjectName}
              />

              <Text style={styles.inputLabel}>Required Skills (comma-separated)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Python, React Native, ROS, PyTorch"
                placeholderTextColor={colors.textMuted}
                value={skillsInput}
                onChangeText={setSkillsInput}
              />

              <Text style={styles.inputLabel}>Target Team Size</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="e.g., 4"
                placeholderTextColor={colors.textMuted}
                value={targetSize}
                onChangeText={setTargetSize}
              />

              <Text style={styles.inputLabel}>Project Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your project, roadmap, and what roles you need filled..."
                placeholderTextColor={colors.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.inputLabel}>Visibility & Eligibility Scope</Text>
              <View style={styles.visibilityOptions}>
                <TouchableOpacity
                  style={[
                    styles.visOption,
                    visibility === 'open_to_all' && styles.visOptionActive
                  ]}
                  onPress={() => setVisibility('open_to_all')}
                >
                  <Text style={styles.visOptionTitle}>🌐 Cross-College (Recommended)</Text>
                  <Text style={styles.visOptionDesc}>
                    Students from any verified college can discover and apply.
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.visOption,
                    visibility === 'college_only' && styles.visOptionActive
                  ]}
                  onPress={() => setVisibility('college_only')}
                >
                  <Text style={styles.visOptionTitle}>🏛️ Campus Only</Text>
                  <Text style={styles.visOptionDesc}>
                    Restricted strictly to students verified at your campus.
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleCreateTeam}
              >
                <Text style={styles.submitBtnText}>Publish Hackathon Squad</Text>
              </TouchableOpacity>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
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
  createBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10
  },
  createBtnText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 13
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: colors.bg
  },
  tabItem: {
    paddingHorizontal: 12,
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
    gap: 14,
    paddingBottom: 40
  },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8
  },
  teamTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  projectName: {
    fontSize: 13,
    color: colors.accentBlue,
    fontWeight: '600',
    marginTop: 2
  },
  visibilityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  badgeCross: {
    backgroundColor: colors.badgeBlue
  },
  badgeCollege: {
    backgroundColor: colors.badgeGreen
  },
  visibilityText: {
    fontSize: 11,
    fontWeight: '700'
  },
  badgeTextCross: {
    color: colors.badgeBlueText
  },
  badgeTextCollege: {
    color: colors.badgeGreenText
  },
  teamDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  skillChip: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.inputBorder
  },
  skillText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '600'
  },
  progressContainer: {
    gap: 6
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary
  },
  creatorText: {
    fontSize: 12,
    color: colors.textMuted
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: colors.inputBg,
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3
  },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4
  },
  joinBtnText: {
    color: colors.bg,
    fontSize: 13,
    fontWeight: '800'
  },
  joinedBtn: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.primary
  },
  joinedBtnText: {
    color: colors.primary
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24
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
    lineHeight: 18,
    marginBottom: 20
  },
  emptyActionBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  emptyActionBtnText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtnText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  formScroll: {
    padding: 18,
    gap: 12
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: colors.textPrimary,
    fontSize: 14
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  visibilityOptions: {
    gap: 8,
    marginVertical: 4
  },
  visOption: {
    backgroundColor: colors.inputBg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.cardBorder
  },
  visOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#0D2818'
  },
  visOptionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 2
  },
  visOptionDesc: {
    fontSize: 12,
    color: colors.textSecondary
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8
  },
  submitBtnText: {
    color: colors.bg,
    fontSize: 15,
    fontWeight: '900'
  }
});