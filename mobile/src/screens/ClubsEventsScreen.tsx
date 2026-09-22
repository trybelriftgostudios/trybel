import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import { AudienceBadge } from '../components/AudienceBadge';
import { api } from '../services/api';

interface ClubsEventsScreenProps {
  onBack: () => void;
  onNavigate: (screen: string) => void;
}

export const ClubsEventsScreen: React.FC<ClubsEventsScreenProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'events' | 'clubs'>('events');
  const [filter, setFilter] = useState<'all' | 'my_college' | 'open_to_all'>('all');
  const [events, setEvents] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<any>(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [createEventModalVisible, setCreateEventModalVisible] = useState(false);

  // Event Creation Dual Toggles
  const [eventTitle, setEventTitle] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventVisibility, setEventVisibility] = useState<'college' | 'everyone'>('everyone');
  const [regEligibility, setRegEligibility] = useState<'college_only' | 'cross_college'>('cross_college');

  useEffect(() => {
    loadData();
  }, [activeTab, filter]);

  const loadData = async () => {
    try {
      if (activeTab === 'events') {
        const res = await api.getEvents({ filter });
        setEvents(res.data || []);
      } else {
        const res = await api.getClubs();
        setClubs(res.data || []);
      }
    } catch (err: any) {
      console.warn('Error loading clubs/events:', err);
    }
  };

  const handleRegister = async (event: any) => {
    try {
      await api.registerEvent(event.id);
      Alert.alert('Registered! 🎉', `You are registered for ${event.title}. Reminders will be sent.`);
      loadData();
    } catch (err: any) {
      Alert.alert('Registration Restricted', err.message);
    }
  };

  const openFeedback = async (event: any) => {
    try {
      // Check if user is authorized for feedback (server-side gated)
      await api.getEventFeedback(event.id);
      setSelectedEventForFeedback(event);
      setFeedbackModalVisible(true);
    } catch (err: any) {
      Alert.alert('Feedback Restricted', err.message);
    }
  };

  const submitFeedback = async () => {
    if (!selectedEventForFeedback) return;
    try {
      await api.submitEventFeedback(selectedEventForFeedback.id, feedbackRating, feedbackText);
      Alert.alert('Thank you!', 'Your feedback was saved and submitted to event organizers.');
      setFeedbackModalVisible(false);
      setFeedbackText('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clubs & Events</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'events' && styles.activeTabBtn]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.activeTabText]}>Events</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'clubs' && styles.activeTabBtn]}
          onPress={() => setActiveTab('clubs')}
        >
          <Text style={[styles.tabText, activeTab === 'clubs' && styles.activeTabText]}>Clubs</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Pills (Events) */}
      {activeTab === 'events' && (
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
      )}

      {/* Events List */}
      {activeTab === 'events' ? (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {events.map(event => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventTopRow}>
                <View style={styles.clubIconBox}>
                  <Text style={styles.clubEmoji}>🏛️</Text>
                </View>
                <View style={styles.eventTitleBox}>
                  <Text style={styles.clubName}>{event.club_name}</Text>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                </View>
                <AudienceBadge
                  type={event.visibility === 'everyone' ? 'open_to_all' : 'college_only'}
                  label={event.visibility === 'everyone' ? 'Open to All' : 'My College'}
                />
              </View>

              <View style={styles.eventDetails}>
                <Text style={styles.detailText}>🗓️ {event.start_time}</Text>
                <Text style={styles.detailText}>📍 {event.location}</Text>
              </View>

              {/* Registration Eligibility Tag */}
              <View style={styles.eligibilityRow}>
                <Text style={styles.eligibilityLabel}>
                  Registration:{' '}
                  <Text style={{ color: event.registration_eligibility === 'cross_college' ? '#38BDF8' : '#F59E0B' }}>
                    {event.registration_eligibility === 'cross_college' ? 'Cross-college open' : 'College-only'}
                  </Text>
                </Text>
              </View>

              <View style={styles.eventFooter}>
                <Text style={styles.interestText}>👥 {event.interested_count} registered</Text>

                <View style={styles.btnRow}>
                  {event.is_registered ? (
                    <>
                      <TouchableOpacity
                        style={styles.feedbackBtn}
                        onPress={() => openFeedback(event)}
                      >
                        <Text style={styles.feedbackBtnText}>Feedback</Text>
                      </TouchableOpacity>
                      <View style={styles.registeredBadge}>
                        <Text style={styles.registeredBadgeText}>✓ Registered</Text>
                      </View>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={[styles.registerBtn, !event.can_register && styles.disabledRegisterBtn]}
                      onPress={() => handleRegister(event)}
                    >
                      <Text style={styles.registerBtnText}>
                        {event.can_register ? 'Register' : 'Ineligible'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      ) : (
        /* Clubs List */
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {clubs.map(club => (
            <View key={club.id} style={styles.clubCard}>
              <View style={styles.clubHeader}>
                <View style={styles.clubLogoBox}>
                  <Text style={styles.clubEmoji}>🏛️</Text>
                </View>
                <View style={styles.clubInfo}>
                  <View style={styles.verifiedRow}>
                    <Text style={styles.clubTitle}>{club.name}</Text>
                    {club.is_verified && <Text style={styles.verifiedBadge}>✓</Text>}
                  </View>
                  <Text style={styles.clubCategory}>{club.category} • {club.member_count} members</Text>
                </View>
              </View>
              <Text style={styles.clubDesc}>{club.description}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Post-Event Feedback Modal */}
      <Modal visible={feedbackModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Event Feedback</Text>
            <Text style={styles.modalSub}>{selectedEventForFeedback?.title}</Text>
            <Text style={styles.feedbackNotice}>
              🔒 Visible only to registered attendees and verified organizers.
            </Text>

            <Text style={styles.fieldLabel}>Rating (1-5)</Text>
            <View style={styles.ratingRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)}>
                  <Text style={[styles.starIcon, star <= feedbackRating && styles.activeStar]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Feedback & Observations</Text>
            <TextInput
              style={[styles.modalInput, { height: 80 }]}
              multiline
              placeholder="What was great? What could be improved?"
              placeholderTextColor={colors.textMuted}
              value={feedbackText}
              onChangeText={setFeedbackText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={submitFeedback}>
                <Text style={styles.confirmBtnText}>Submit Feedback</Text>
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
    marginBottom: 70
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  eventTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  clubIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#8B5CF622',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10
  },
  clubEmoji: {
    fontSize: 20
  },
  eventTitleBox: {
    flex: 1
  },
  clubName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38BDF8'
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2
  },
  eventDetails: {
    marginBottom: 10
  },
  detailText: {
    fontSize: 12,
    color: '#CBD5E1',
    marginBottom: 4
  },
  eligibilityRow: {
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 12
  },
  eligibilityLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600'
  },
  eventFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10
  },
  interestText: {
    fontSize: 12,
    color: colors.textMuted
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  registerBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8
  },
  disabledRegisterBtn: {
    backgroundColor: '#334155'
  },
  registerBtnText: {
    color: '#0A0E17',
    fontSize: 12,
    fontWeight: '700'
  },
  registeredBadge: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  registeredBadgeText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700'
  },
  feedbackBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  feedbackBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600'
  },
  clubCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  clubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  clubLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#3B82F622',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  clubInfo: {
    flex: 1
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  clubTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  verifiedBadge: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '900'
  },
  clubCategory: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  clubDesc: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18
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
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  modalSub: {
    fontSize: 13,
    color: '#38BDF8',
    marginTop: 2,
    marginBottom: 8
  },
  feedbackNotice: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 16
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  starIcon: {
    fontSize: 28,
    color: '#334155'
  },
  activeStar: {
    color: '#F59E0B'
  },
  modalInput: {
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
