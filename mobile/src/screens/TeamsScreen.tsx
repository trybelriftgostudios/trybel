import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Modal } from 'react-native';
import { colors } from '../theme/colors';
import { AudienceBadge } from '../components/AudienceBadge';
import { api } from '../services/api';

interface TeamsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export const TeamsScreen: React.FC<TeamsScreenProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'find' | 'my_teams'>('find');
  const [filter, setFilter] = useState<'all' | 'my_college' | 'open_to_all'>('all');
  const [search, setSearch] = useState('');
  const [teams, setTeams] = useState<any[]>([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // New Team Form State
  const [title, setTitle] = useState('');
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [visibility, setVisibility] = useState<'college_only' | 'open_to_all'>('open_to_all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTeams();
  }, [activeTab, filter, search]);

  const loadTeams = async () => {
    try {
      const res = await api.getTeams({
        filter,
        search,
        myTeams: activeTab === 'my_teams'
      });
      setTeams(res.data || []);
    } catch (err: any) {
      console.warn('Error loading teams:', err);
    }
  };

  const handleCreateTeam = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Required', 'Please enter a team title and description');
      return;
    }

    setSubmitting(true);
    try {
      await api.createTeam({
        title: title.trim(),
        project_name: projectName.trim() || title.trim(),
        description: description.trim(),
        required_skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        visibility
      });
      Alert.alert('Success', 'Team listing created with team chat thread!');
      setCreateModalVisible(false);
      setTitle('');
      setProjectName('');
      setDescription('');
      setSkills('');
      loadTeams();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApply = async (team: any) => {
    try {
      await api.applyTeam(team.id, 'I am excited to contribute my skills to your team!');
      Alert.alert('Application Sent 🚀', `Your application and campus badge were sent to the team leader of ${team.title}.`);
    } catch (err: any) {
      Alert.alert('Application Notice', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hackathon Teams</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'find' && styles.activeTabBtn]}
          onPress={() => setActiveTab('find')}
        >
          <Text style={[styles.tabText, activeTab === 'find' && styles.activeTabText]}>Find Teams</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'my_teams' && styles.activeTabBtn]}
          onPress={() => setActiveTab('my_teams')}
        >
          <Text style={[styles.tabText, activeTab === 'my_teams' && styles.activeTabText]}>My Teams</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search hackathons, skills..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Scoping Filter Pills */}
      <View style={styles.filterPillsRow}>
        {(['all', 'my_college', 'open_to_all'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.pill, filter === f && styles.activePill]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.pillText, filter === f && styles.activePillText]}>
              {f === 'all' ? 'All' : f === 'my_college' ? 'My College' : 'Open to All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Teams List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {teams.map(team => (
          <View key={team.id} style={styles.teamCard}>
            <View style={styles.cardTopRow}>
              <View style={styles.teamIconBox}>
                <Text style={styles.teamIconEmoji}>💻</Text>
              </View>
              <View style={styles.teamTitleBox}>
                <Text style={styles.teamTitle}>{team.title}</Text>
                <Text style={styles.teamOrganizer}>
                  {team.creator?.name} • {team.creator?.college_name}
                </Text>
              </View>
              <AudienceBadge type={team.visibility} />
            </View>

            <Text style={styles.teamDesc}>{team.description}</Text>

            {/* Skills tags */}
            <View style={styles.skillsRow}>
              {team.required_skills?.map((sk: string, i: number) => (
                <View key={i} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{sk}</Text>
                </View>
              ))}
            </View>

            {/* Footer row */}
            <View style={styles.cardFooter}>
              <Text style={styles.membersCount}>
                👥 {team.current_members_count}/{team.team_size_target} members
              </Text>

              {activeTab === 'find' ? (
                <TouchableOpacity style={styles.applyBtn} onPress={() => handleApply(team)}>
                  <Text style={styles.applyBtnText}>Apply</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.chatBtn} onPress={() => onNavigate('Chat')}>
                  <Text style={styles.chatBtnText}>Team Chat</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Floating Create Team CTA */}
      <TouchableOpacity
        style={styles.floatingBtn}
        onPress={() => setCreateModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.floatingBtnText}>+ Create Team</Text>
      </TouchableOpacity>

      {/* Create Team Modal */}
      <Modal visible={createModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Hackathon Team</Text>

            <Text style={styles.modalLabel}>Team Title</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. SIH 2025 Visionaries"
              placeholderTextColor={colors.textMuted}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.modalLabel}>Project / Hackathon</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Smart India Hackathon"
              placeholderTextColor={colors.textMuted}
              value={projectName}
              onChangeText={setProjectName}
            />

            <Text style={styles.modalLabel}>Description & Needs</Text>
            <TextInput
              style={[styles.modalInput, { height: 70 }]}
              multiline
              placeholder="What are you building and who are you looking for?"
              placeholderTextColor={colors.textMuted}
              value={description}
              onChangeText={setDescription}
            />

            <Text style={styles.modalLabel}>Required Skills (comma-separated)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="React, Python, UI/UX"
              placeholderTextColor={colors.textMuted}
              value={skills}
              onChangeText={setSkills}
            />

            {/* Dual Visibility Toggle */}
            <Text style={styles.modalLabel}>Visibility Audience</Text>
            <View style={styles.visibilityToggleRow}>
              <TouchableOpacity
                style={[styles.visBtn, visibility === 'college_only' && styles.activeVisBtn]}
                onPress={() => setVisibility('college_only')}
              >
                <Text style={[styles.visBtnText, visibility === 'college_only' && styles.activeVisBtnText]}>
                  College only
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.visBtn, visibility === 'open_to_all' && styles.activeVisBtn]}
                onPress={() => setVisibility('open_to_all')}
              >
                <Text style={[styles.visBtnText, visibility === 'open_to_all' && styles.activeVisBtnText]}>
                  Open to other colleges
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setCreateModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleCreateTeam}
                disabled={submitting}
              >
                <Text style={styles.confirmBtnText}>Publish Team</Text>
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
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  backBtn: {
    padding: 6,
    marginRight: 10
  },
  backArrow: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: colors.textMuted
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 13
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  activePill: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8'
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activePillText: {
    color: colors.textPrimary
  },
  list: {
    flex: 1,
    marginBottom: 80
  },
  teamCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  teamIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#10B98122',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  teamIconEmoji: {
    fontSize: 18
  },
  teamTitleBox: {
    flex: 1
  },
  teamTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  teamOrganizer: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  teamDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
    marginBottom: 12
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14
  },
  skillBadge: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  skillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600'
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10
  },
  membersCount: {
    fontSize: 12,
    color: colors.textMuted
  },
  applyBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8
  },
  applyBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700'
  },
  chatBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8
  },
  chatBtnText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '700'
  },
  floatingBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  floatingBtnText: {
    color: '#0A0E17',
    fontSize: 15,
    fontWeight: '800'
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
    marginBottom: 16
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 42,
    color: colors.textPrimary,
    fontSize: 13
  },
  visibilityToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 16
  },
  visBtn: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  activeVisBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8'
  },
  visBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeVisBtnText: {
    color: '#38BDF8'
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10
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
