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
import { sqliteService, OfflineEvent } from '../services/sqlite.service';

interface CampusClub {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  lead: string;
  description: string;
  isMember: boolean;
  avatar: string;
}

export default function ClubsAndEventsModal() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [activeTab, setActiveTab] = useState<'events' | 'clubs' | 'registered'>('events');
  const [events, setEvents] = useState<OfflineEvent[]>([]);
  const [clubs, setClubs] = useState<CampusClub[]>([
    {
      id: 'c1',
      name: 'Google Developer Student Clubs (GDSC)',
      category: 'Tech & Open Source',
      memberCount: 380,
      lead: 'Aakash Verma',
      description: 'Building modern web, mobile apps, and cloud native microservices for community challenges.',
      isMember: true,
      avatar: '💻'
    },
    {
      id: 'c2',
      name: 'IEEE Student Branch',
      category: 'Robotics & Hardware',
      memberCount: 240,
      lead: 'Pooja Reddy',
      description: 'Hardware workshops, IoT automation, and international IEEE conference paper publications.',
      isMember: false,
      avatar: '⚡'
    },
    {
      id: 'c3',
      name: 'Rotaract Youth Club',
      category: 'Social Impact & Leadership',
      memberCount: 190,
      lead: 'Kiran Rao',
      description: 'Campus blood donation drives, tree plantation, and youth leadership development programs.',
      isMember: false,
      avatar: '🤝'
    },
    {
      id: 'c4',
      name: 'Literary & Debating Society',
      category: 'Arts & Culture',
      memberCount: 145,
      lead: 'Meera Sen',
      description: 'Parliamentary debates, campus MUN conferences, and creative writing workshops.',
      isMember: false,
      avatar: '🎭'
    }
  ]);

  // Feedback Modal
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [selectedEventForFeedback, setSelectedEventForFeedback] = useState<OfflineEvent | null>(null);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      const data = await sqliteService.getEvents();
      setEvents(data);
    } catch {
      // Keep default
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const toggleEventRegistration = (event: OfflineEvent) => {
    const isNowRegistered = event.is_registered === 1 ? 0 : 1;
    const diff = isNowRegistered === 1 ? 1 : -1;

    setEvents(prev =>
      prev.map(e =>
        e.id === event.id
          ? {
              ...e,
              is_registered: isNowRegistered,
              attendees_count: Math.max(0, e.attendees_count + diff)
            }
          : e
      )
    );

    if (isNowRegistered === 1) {
      showFeedback(`Registered for "${event.title}"! Ticket added to your profile.`, 'success');
    } else {
      showFeedback(`Cancelled registration for "${event.title}".`, 'info');
    }
  };

  const toggleClubMembership = (clubId: string, clubName: string) => {
    setClubs(prev =>
      prev.map(c => {
        if (c.id === clubId) {
          const nextState = !c.isMember;
          const nextCount = nextState ? c.memberCount + 1 : c.memberCount - 1;
          showFeedback(
            nextState ? `You joined ${clubName}!` : `Left ${clubName}.`,
            nextState ? 'success' : 'info'
          );
          return { ...c, isMember: nextState, memberCount: nextCount };
        }
        return c;
      })
    );
  };

  const handleOpenFeedback = (event: OfflineEvent) => {
    setSelectedEventForFeedback(event);
    setRating(5);
    setFeedbackComment('');
    setFeedbackModalVisible(true);
  };

  const handleSubmitFeedback = () => {
    if (!selectedEventForFeedback) return;
    setFeedbackModalVisible(false);
    showFeedback(
      `Thank you! Rated ${rating}★ for "${selectedEventForFeedback.title}". Feedback logged.`,
      'success'
    );
    setSelectedEventForFeedback(null);
  };

  const registeredEvents = events.filter(e => e.is_registered === 1);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Clubs & Events</Text>
          <Text style={styles.headerSubtitle}>Campus Activities & Dual-Scope RSVP</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'events' && styles.tabItemActive]}
          onPress={() => setActiveTab('events')}
        >
          <Text style={[styles.tabText, activeTab === 'events' && styles.tabTextActive]}>
            Upcoming Events ({events.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'clubs' && styles.tabItemActive]}
          onPress={() => setActiveTab('clubs')}
        >
          <Text style={[styles.tabText, activeTab === 'clubs' && styles.tabTextActive]}>
            Campus Clubs ({clubs.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'registered' && styles.tabItemActive]}
          onPress={() => setActiveTab('registered')}
        >
          <Text style={[styles.tabText, activeTab === 'registered' && styles.tabTextActive]}>
            My Tickets ({registeredEvents.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'events' && (
          <View style={styles.sectionWrap}>
            {events.map(event => {
              const isCrossCollege = event.visibility === 'everyone';
              const isEligibleCross = event.registration_eligibility === 'cross_college';
              const isRegistered = event.is_registered === 1;

              return (
                <View key={event.id} style={styles.eventCard}>
                  <View style={styles.eventBadgeRow}>
                    <View style={styles.clubBadge}>
                      <Text style={styles.clubBadgeText}>{event.club_name || 'Campus Club'}</Text>
                    </View>

                    {/* Dual Scope Indicators */}
                    <View style={styles.scopeBadgesWrap}>
                      <View
                        style={[
                          styles.scopeChip,
                          isCrossCollege ? styles.scopeCross : styles.scopeCollege
                        ]}
                      >
                        <Text
                          style={[
                            styles.scopeChipText,
                            isCrossCollege ? styles.scopeTextCross : styles.scopeTextCollege
                          ]}
                        >
                          {isCrossCollege ? '🌐 Open Visibility' : '🏛️ Campus Visibility'}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.scopeChip,
                          isEligibleCross ? styles.scopeCross : styles.scopeCollege
                        ]}
                      >
                        <Text
                          style={[
                            styles.scopeChipText,
                            isEligibleCross ? styles.scopeTextCross : styles.scopeTextCollege
                          ]}
                        >
                          {isEligibleCross ? '👥 All Colleges RSVP' : '🎓 St. Peter’s Only RSVP'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>

                  <View style={styles.eventMetaRow}>
                    <Text style={styles.metaText}>📍 {event.location}</Text>
                    <Text style={styles.metaText}>
                      📅 {new Date(event.start_time).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.metaText}>👥 {event.attendees_count} Attending</Text>
                  </View>

                  {/* Actions */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={[styles.rsvpBtn, isRegistered && styles.rsvpBtnActive]}
                      onPress={() => toggleEventRegistration(event)}
                    >
                      <Text
                        style={[
                          styles.rsvpBtnText,
                          isRegistered && styles.rsvpBtnTextActive
                        ]}
                      >
                        {isRegistered ? '✓ Ticket Confirmed (Cancel)' : 'Register / RSVP Now'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.feedbackBtn}
                      onPress={() => handleOpenFeedback(event)}
                    >
                      <Text style={styles.feedbackBtnText}>⭐ Feedback</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {activeTab === 'clubs' && (
          <View style={styles.sectionWrap}>
            {clubs.map(club => (
              <View key={club.id} style={styles.clubCard}>
                <View style={styles.clubTopRow}>
                  <View style={styles.clubIconBox}>
                    <Text style={styles.clubIconText}>{club.avatar}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clubName}>{club.name}</Text>
                    <Text style={styles.clubCategory}>{club.category}</Text>
                  </View>
                </View>

                <Text style={styles.clubDesc}>{club.description}</Text>

                <View style={styles.clubFooterRow}>
                  <Text style={styles.clubMembersText}>
                    👥 {club.memberCount} Members • Lead: {club.lead}
                  </Text>
                  <TouchableOpacity
                    style={[styles.joinClubBtn, club.isMember && styles.joinClubBtnActive]}
                    onPress={() => toggleClubMembership(club.id, club.name)}
                  >
                    <Text
                      style={[
                        styles.joinClubBtnText,
                        club.isMember && styles.joinClubBtnTextActive
                      ]}
                    >
                      {club.isMember ? '✓ Joined' : '+ Join Club'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'registered' && (
          <View style={styles.sectionWrap}>
            {registeredEvents.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🎟️</Text>
                <Text style={styles.emptyTitle}>No Active Tickets</Text>
                <Text style={styles.emptySubtitle}>
                  You haven’t registered for any campus events yet. Explore upcoming hackathons and workshops!
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => setActiveTab('events')}
                >
                  <Text style={styles.exploreBtnText}>Browse Upcoming Events</Text>
                </TouchableOpacity>
              </View>
            ) : (
              registeredEvents.map(event => (
                <View key={event.id} style={styles.ticketCard}>
                  <View style={styles.ticketBadgeRow}>
                    <Text style={styles.ticketConfirmedBadge}>✓ CONFIRMED ENTRY</Text>
                    <Text style={styles.ticketCollegeBadge}>St. Peter's College Pass</Text>
                  </View>
                  <Text style={styles.ticketTitle}>{event.title}</Text>
                  <Text style={styles.ticketDetail}>📍 {event.location}</Text>
                  <Text style={styles.ticketDetail}>
                    🕒 {new Date(event.start_time).toLocaleString()}
                  </Text>

                  <View style={styles.ticketActionRow}>
                    <TouchableOpacity
                      style={styles.cancelTicketBtn}
                      onPress={() => toggleEventRegistration(event)}
                    >
                      <Text style={styles.cancelTicketText}>Cancel Registration</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.submitReviewBtn}
                      onPress={() => handleOpenFeedback(event)}
                    >
                      <Text style={styles.submitReviewText}>Submit Feedback</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Post-Event Feedback Modal */}
      <Modal
        visible={feedbackModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.feedbackModalCard}>
            <Text style={styles.feedbackModalTitle}>Event Feedback Form</Text>
            <Text style={styles.feedbackModalSub}>
              {selectedEventForFeedback?.title}
            </Text>

            <Text style={styles.ratingLabel}>Rate your experience (1 to 5 Stars):</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starTouch}
                >
                  <Text
                    style={[
                      styles.starGlyph,
                      star <= rating ? styles.starFilled : styles.starEmpty
                    ]}
                  >
                    ★
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>What went well? Any suggestions?</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="The hands-on workshop session was great, would love more code exercises..."
              placeholderTextColor={colors.textMuted}
              value={feedbackComment}
              onChangeText={setFeedbackComment}
              multiline
              numberOfLines={4}
            />

            <View style={styles.feedbackBtnRow}>
              <TouchableOpacity
                style={styles.feedbackCancel}
                onPress={() => setFeedbackModalVisible(false)}
              >
                <Text style={styles.feedbackCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.feedbackSubmit}
                onPress={handleSubmitFeedback}
              >
                <Text style={styles.feedbackSubmitText}>Submit Feedback</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 40
  },
  sectionWrap: {
    gap: 14
  },
  eventCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10
  },
  eventBadgeRow: {
    flexDirection: 'column',
    gap: 6
  },
  clubBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  clubBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accentBlue
  },
  scopeBadgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  scopeChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  scopeCross: {
    backgroundColor: colors.badgeBlue
  },
  scopeCollege: {
    backgroundColor: colors.badgeGreen
  },
  scopeChipText: {
    fontSize: 10,
    fontWeight: '700'
  },
  scopeTextCross: {
    color: colors.badgeBlueText
  },
  scopeTextCollege: {
    color: colors.badgeGreenText
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  eventDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  },
  eventMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 4
  },
  metaText: {
    fontSize: 12,
    color: colors.textMuted
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  rsvpBtn: {
    flex: 2,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  rsvpBtnActive: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.primary
  },
  rsvpBtnText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 13
  },
  rsvpBtnTextActive: {
    color: colors.primary
  },
  feedbackBtn: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  feedbackBtnText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 12
  },
  clubCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 10
  },
  clubTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  clubIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  clubIconText: {
    fontSize: 22
  },
  clubName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary
  },
  clubCategory: {
    fontSize: 12,
    color: colors.accentBlue,
    marginTop: 2
  },
  clubDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18
  },
  clubFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4
  },
  clubMembersText: {
    fontSize: 12,
    color: colors.textMuted
  },
  joinClubBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8
  },
  joinClubBtnActive: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.primary
  },
  joinClubBtnText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 12
  },
  joinClubBtnTextActive: {
    color: colors.primary
  },
  ticketCard: {
    backgroundColor: '#0F1A2F',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1.5,
    borderColor: colors.accentBlue,
    gap: 8
  },
  ticketBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  ticketConfirmedBadge: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.badgeGreenText,
    backgroundColor: colors.badgeGreen,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  ticketCollegeBadge: {
    fontSize: 11,
    color: colors.accentBlue,
    fontWeight: '600'
  },
  ticketTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 4
  },
  ticketDetail: {
    fontSize: 13,
    color: colors.textSecondary
  },
  ticketActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  cancelTicketBtn: {
    flex: 1,
    backgroundColor: colors.inputBg,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  cancelTicketText: {
    color: colors.dangerText,
    fontSize: 12,
    fontWeight: '700'
  },
  submitReviewBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center'
  },
  submitReviewText: {
    color: colors.bg,
    fontSize: 12,
    fontWeight: '800'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20
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
  exploreBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10
  },
  exploreBtnText: {
    color: colors.bg,
    fontWeight: '800',
    fontSize: 14
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  feedbackModalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 12
  },
  feedbackModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary
  },
  feedbackModalSub: {
    fontSize: 13,
    color: colors.accentBlue,
    fontWeight: '600'
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 6
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingVertical: 8
  },
  starTouch: {
    padding: 4
  },
  starGlyph: {
    fontSize: 32
  },
  starFilled: {
    color: '#FBBF24'
  },
  starEmpty: {
    color: '#334155'
  },
  feedbackInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    padding: 12,
    color: colors.textPrimary,
    fontSize: 13,
    height: 80,
    textAlignVertical: 'top'
  },
  feedbackBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10
  },
  feedbackCancel: {
    flex: 1,
    backgroundColor: colors.inputBg,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  feedbackCancelText: {
    color: colors.textSecondary,
    fontWeight: '700',
    fontSize: 13
  },
  feedbackSubmit: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  feedbackSubmitText: {
    color: colors.bg,
    fontWeight: '900',
    fontSize: 13
  }
});