import React, { useState, useEffect } from 'react';
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
import { sqliteService, OfflineStudyRequest } from '../services/sqlite.service';

export default function StudyPartnersModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [activeTab, setActiveTab] = useState<'find' | 'my_requests'>('find');
  const [requests, setRequests] = useState<OfflineStudyRequest[]>([]);
  const [filterMode, setFilterMode] = useState<string>('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // Form
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [mode, setMode] = useState<'online' | 'offline' | 'either'>('offline');
  const [slot, setSlot] = useState('');

  const loadRequests = async () => {
    const list = await sqliteService.getStudyRequests();
    setRequests(list);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCreateRequest = async () => {
    if (!subject.trim() || !goal.trim()) {
      showFeedback('Subject and study goal are required', 'warning');
      return;
    }

    const newReq: OfflineStudyRequest = {
      id: `req_${Date.now()}`,
      college_id: 'col_stpeters_01',
      subject: subject.trim(),
      goal_description: goal.trim(),
      preferred_mode: mode,
      availability_slot: slot.trim() || 'Flexible',
      looking_for: 'one_partner',
      requester_name: 'Varun Dulam',
      created_at: new Date().toISOString()
    };

    await sqliteService.insertStudyRequest(newReq);
    await loadRequests();
    setCreateModalVisible(false);
    setSubject('');
    setGoal('');
    setSlot('');
    showFeedback('Study partner request posted (College Only)!', 'success');
  };

  const filteredRequests = requests.filter((r) => {
    if (filterMode === 'all') return true;
    return r.preferred_mode === filterMode;
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.headerTitle}>Study Partner Finder</Text>
          <View style={styles.lockedBadge}>
            <Text style={styles.lockedBadgeText}>🔒 Strictly St. Peter's Only</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setCreateModalVisible(true)}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'find' && styles.tabBtnActive]}
          onPress={() => setActiveTab('find')}
        >
          <Text style={[styles.tabText, activeTab === 'find' && styles.tabTextActive]}>
            Find Partners ({filteredRequests.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'my_requests' && styles.tabBtnActive]}
          onPress={() => setActiveTab('my_requests')}
        >
          <Text style={[styles.tabText, activeTab === 'my_requests' && styles.tabTextActive]}>
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode Filters */}
      <View style={styles.filterRow}>
        {(['all', 'offline', 'online', 'either'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.filterChip, filterMode === m && styles.filterChipActive]}
            onPress={() => setFilterMode(m)}
          >
            <Text style={[styles.filterChipText, filterMode === m && styles.filterChipTextActive]}>
              {m.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {filteredRequests.map((req) => (
          <View key={req.id} style={styles.requestCard}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardSubject}>{req.subject}</Text>
                <Text style={styles.cardRequester}>Posted by {req.requester_name}</Text>
              </View>
              <View style={styles.modeBadge}>
                <Text style={styles.modeBadgeText}>{req.preferred_mode.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.cardGoal}>{req.goal_description}</Text>

            <View style={styles.slotRow}>
              <Text style={styles.slotIcon}>🕒</Text>
              <Text style={styles.slotText}>{req.availability_slot}</Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.sameCampusNote}>
                <Text style={styles.sameCampusNoteText}>Verified Same Campus</Text>
              </View>
              <TouchableOpacity
                style={styles.connectBtn}
                onPress={() => showFeedback(`Connected with ${req.requester_name}! Scoped thread created.`, 'success')}
              >
                <Text style={styles.connectBtnText}>Connect &rarr;</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={createModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Study Request</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Subject / Course</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Machine Learning (CS601)"
              placeholderTextColor={colors.textMuted}
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={styles.inputLabel}>Study Goal & Topics</Text>
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              placeholder="What are you preparing for?"
              placeholderTextColor={colors.textMuted}
              value={goal}
              onChangeText={setGoal}
              multiline
            />

            <Text style={styles.inputLabel}>Preferred Mode</Text>
            <View style={styles.modeSelectRow}>
              {(['offline', 'online', 'either'] as const).map((md) => (
                <TouchableOpacity
                  key={md}
                  style={[styles.modeSelectBtn, mode === md && styles.modeSelectBtnActive]}
                  onPress={() => setMode(md)}
                >
                  <Text style={[styles.modeSelectText, mode === md && styles.modeSelectTextActive]}>
                    {md}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Availability Slot</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Evenings (6 PM - 8 PM)"
              placeholderTextColor={colors.textMuted}
              value={slot}
              onChangeText={setSlot}
            />

            <TouchableOpacity style={styles.submitPostBtn} onPress={handleCreateRequest}>
              <Text style={styles.submitPostText}>Post Request (College-Only)</Text>
            </TouchableOpacity>
          </View>
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161F30',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backBtnText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC'
  },
  lockedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#064E3B',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginTop: 2
  },
  lockedBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700'
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  addBtnText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '800'
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B'
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  tabBtnActive: {
    borderBottomColor: colors.primary
  },
  tabText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600'
  },
  tabTextActive: {
    color: '#F8FAFC',
    fontWeight: '800'
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 8
  },
  filterChip: {
    backgroundColor: '#131B2E',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  filterChipActive: {
    backgroundColor: '#1E293B',
    borderColor: colors.primary
  },
  filterChipText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700'
  },
  filterChipTextActive: {
    color: colors.primary
  },
  scrollContent: {
    padding: 18,
    gap: 14,
    paddingBottom: 40
  },
  requestCard: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  cardSubject: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC'
  },
  cardRequester: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2
  },
  modeBadge: {
    backgroundColor: '#1E293B',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  modeBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700'
  },
  cardGoal: {
    color: '#E2E8F0',
    fontSize: 13,
    lineHeight: 18,
    marginVertical: 10
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  slotIcon: {
    fontSize: 13
  },
  slotText: {
    color: '#94A3B8',
    fontSize: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B'
  },
  sameCampusNote: {
    backgroundColor: '#064E3B',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4
  },
  sameCampusNoteText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '700'
  },
  connectBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  connectBtnText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: '#111726',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800'
  },
  closeX: {
    color: '#94A3B8',
    fontSize: 18,
    padding: 4
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 6
  },
  modalInput: {
    backgroundColor: '#161F30',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#26354D'
  },
  modeSelectRow: {
    flexDirection: 'row',
    gap: 8
  },
  modeSelectBtn: {
    flex: 1,
    backgroundColor: '#161F30',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26354D'
  },
  modeSelectBtnActive: {
    borderColor: colors.primary,
    backgroundColor: '#064E3B'
  },
  modeSelectText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'capitalize'
  },
  modeSelectTextActive: {
    color: '#34D399',
    fontWeight: '800'
  },
  submitPostBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20
  },
  submitPostText: {
    color: '#0A0E17',
    fontSize: 14,
    fontWeight: '800'
  }
});
