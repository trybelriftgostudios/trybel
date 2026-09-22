import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface StudyPartnerScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export const StudyPartnerScreen: React.FC<StudyPartnerScreenProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'find' | 'my_requests'>('find');
  const [subject, setSubject] = useState('');
  const [preferredMode, setPreferredMode] = useState<'Online' | 'Offline' | 'Either'>('Either');
  const [availability, setAvailability] = useState('Weekday Evenings (5-7 PM)');
  const [lookingFor, setLookingFor] = useState<'one_partner' | 'small_group'>('one_partner');
  const [studyRequests, setStudyRequests] = useState<any[]>([]);
  const [connecting, setConnecting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadRequests();
  }, [activeTab]);

  const loadRequests = async () => {
    try {
      const res = await api.getStudyPartners({ myRequests: activeTab === 'my_requests' });
      setStudyRequests(res.data || []);
    } catch (err: any) {
      console.warn('Error loading study requests:', err);
    }
  };

  const handleCreateRequest = async () => {
    if (!subject.trim()) {
      Alert.alert('Required', 'Please specify a subject or skill');
      return;
    }

    try {
      await api.createStudyRequest({
        subject: subject.trim(),
        goal_description: `Looking for study partner/group in ${subject.trim()}`,
        preferred_mode: preferredMode.toLowerCase() as any,
        availability_slot: availability,
        looking_for: lookingFor
      });
      Alert.alert('Success', 'Study request created within your verified campus network!');
      setSubject('');
      loadRequests();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleConnect = async (requestId: string) => {
    setConnecting(prev => ({ ...prev, [requestId]: true }));
    try {
      await api.connectStudyRequest(requestId);
      Alert.alert('Connected! 🎉', 'Study chat thread created. You can now chat in your Scoped Chat tab.');
      onNavigate('Chat');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setConnecting(prev => ({ ...prev, [requestId]: false }));
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Study Partners</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'find' && styles.activeTabBtn]}
          onPress={() => setActiveTab('find')}
        >
          <Text style={[styles.tabText, activeTab === 'find' && styles.activeTabText]}>Find Partners</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'my_requests' && styles.activeTabBtn]}
          onPress={() => setActiveTab('my_requests')}
        >
          <Text style={[styles.tabText, activeTab === 'my_requests' && styles.activeTabText]}>My Study Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Form (only on 'find' tab) */}
      {activeTab === 'find' && (
        <View style={styles.formCard}>
          <Text style={styles.fieldLabel}>Subject / Skill</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. DBMS, Python, DSA"
            placeholderTextColor={colors.textMuted}
            value={subject}
            onChangeText={setSubject}
          />

          <Text style={styles.fieldLabel}>Preferred Mode</Text>
          <View style={styles.modeRow}>
            {(['Online', 'Offline', 'Either'] as const).map(mode => (
              <TouchableOpacity
                key={mode}
                style={[styles.modeBtn, preferredMode === mode && styles.activeModeBtn]}
                onPress={() => setPreferredMode(mode)}
              >
                <Text style={[styles.modeText, preferredMode === mode && styles.activeModeText]}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>Availability</Text>
          <View style={styles.dropdownPreview}>
            <Text style={styles.dropdownText}>{availability}</Text>
          </View>

          <Text style={styles.fieldLabel}>Looking for</Text>
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, lookingFor === 'one_partner' && styles.activeModeBtn]}
              onPress={() => setLookingFor('one_partner')}
            >
              <Text style={[styles.modeText, lookingFor === 'one_partner' && styles.activeModeText]}>One Partner</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modeBtn, lookingFor === 'small_group' && styles.activeModeBtn]}
              onPress={() => setLookingFor('small_group')}
            >
              <Text style={[styles.modeText, lookingFor === 'small_group' && styles.activeModeText]}>Small Group</Text>
            </TouchableOpacity>
          </View>

          {/* Hard college-only banner replacing toggle */}
          <View style={styles.collegeLockBanner}>
            <Text style={styles.lockIcon}>🔒</Text>
            <View style={styles.lockContent}>
              <Text style={styles.lockTitle}>Campus Verified Only</Text>
              <Text style={styles.lockDesc}>Study Partner Finder is strictly locked to students in your college.</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.findBtn} onPress={handleCreateRequest} activeOpacity={0.85}>
            <Text style={styles.findBtnText}>Post Study Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Suggested Matches Section */}
      <View style={styles.matchesSection}>
        <Text style={styles.sectionHeading}>
          {activeTab === 'find' ? 'Suggested Matches' : 'My Active Requests'}
        </Text>

        {studyRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No requests in this category yet.</Text>
          </View>
        ) : (
          studyRequests.map(req => (
            <View key={req.id} style={styles.matchCard}>
              <Image
                source={{ uri: req.user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100' }}
                style={styles.matchAvatar}
              />
              <View style={styles.matchInfo}>
                <Text style={styles.matchName}>{req.user?.name || 'Classmate'}</Text>
                <Text style={styles.matchMeta}>
                  {req.user?.department || 'Engineering'} • {req.preferred_mode}
                </Text>
                <Text style={styles.matchSubject}>{req.subject}</Text>
                <Text style={styles.matchAvailability}>⏰ {req.availability_slot}</Text>
              </View>

              {activeTab === 'find' && (
                <TouchableOpacity
                  style={[styles.connectBtn, connecting[req.id] && styles.connectedBtn]}
                  onPress={() => handleConnect(req.id)}
                  disabled={connecting[req.id]}
                >
                  <Text style={styles.connectBtnText}>Connect</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>
    </ScrollView>
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
    marginBottom: 20,
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
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 24
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
    marginTop: 10
  },
  input: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    color: colors.textPrimary,
    fontSize: 14
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8
  },
  modeBtn: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  activeModeBtn: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8'
  },
  modeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600'
  },
  activeModeText: {
    color: colors.textPrimary
  },
  dropdownPreview: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
    justifyContent: 'center'
  },
  dropdownText: {
    color: colors.textPrimary,
    fontSize: 13
  },
  collegeLockBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 14,
    marginBottom: 16
  },
  lockIcon: {
    fontSize: 18,
    marginRight: 10
  },
  lockContent: {
    flex: 1
  },
  lockTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700'
  },
  lockDesc: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2
  },
  findBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center'
  },
  findBtnText: {
    color: '#0A0E17',
    fontSize: 15,
    fontWeight: '700'
  },
  matchesSection: {
    marginBottom: 90
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  emptyCard: {
    backgroundColor: colors.card,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center'
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  matchAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12
  },
  matchInfo: {
    flex: 1
  },
  matchName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  matchMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  matchSubject: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    marginTop: 2
  },
  matchAvailability: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  connectBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  connectedBtn: {
    opacity: 0.6
  },
  connectBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  }
});
