import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useFeedback } from '../../context/FeedbackContext';
import { SwipeCardDeck } from '../../components/SwipeCardDeck';
import { IOSSegmentedControl } from '../../components/IOSSegmentedControl';

export default function DiscoverScreen() {
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'People' | 'Teams' | 'Clubs' | 'Events'>('All');

  const categories = ['All', 'People', 'Teams', 'Clubs', 'Events'] as const;

  const suggestedStudents = [
    {
      id: 'usr_sana',
      name: 'Sana Khan',
      department: 'CSE • 3rd Year',
      skills: ['PyTorch', 'Data Structures', 'Python'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
      college: "St. Peter's Engineering College"
    },
    {
      id: 'usr_arjun',
      name: 'Arjun Reddy',
      department: 'CSE • 3rd Year',
      skills: ['React Native', 'Node.js', 'System Design'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
      college: "St. Peter's Engineering College"
    },
    {
      id: 'usr_venkatesh',
      name: 'Venkatesh',
      department: 'ECE • 2nd Year',
      skills: ['IoT', 'Embedded C++', 'Firmware'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
      college: "St. Peter's Engineering College"
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* iOS Header with Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={17} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search peers, skills, hackathons..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* iOS Large Title */}
        <View style={styles.largeTitleSection}>
          <Text style={styles.largeTitle}>Discover</Text>
        </View>

        {/* Category Segmented Control */}
        <View style={styles.segmentedWrapper}>
          <IOSSegmentedControl
            values={categories}
            selectedIndex={categories.indexOf(activeCategory)}
            onChange={(cat) => setActiveCategory(cat)}
          />
        </View>

        {/* Swipeable Peer Connect Card Deck */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SUGGESTED PEERS</Text>
            <Text style={styles.sectionSub}>Swipe right to connect</Text>
          </View>

          <SwipeCardDeck
            cards={suggestedStudents}
            onSwipeRight={(student) => {
              showFeedback(`Connection request sent to ${student.name}!`, 'success');
            }}
            onSwipeLeft={(student) => {
              showFeedback(`Passed on ${student.name}`, 'info');
            }}
            renderCard={(student) => (
              <View style={styles.suggestedCard}>
                <Image source={{ uri: student.avatar }} style={styles.cardAvatar} />
                <Text style={styles.cardName}>{student.name}</Text>
                <Text style={styles.cardDept}>{student.department}</Text>
                <Text style={styles.cardCollege}>{student.college}</Text>

                <View style={styles.cardSkillsRow}>
                  {student.skills.map((s, i) => (
                    <View key={i} style={styles.cardSkillTag}>
                      <Text style={styles.cardSkillText}>{s}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.cardBtnSkip}
                    onPress={() => showFeedback(`Passed on ${student.name}`, 'info')}
                  >
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cardBtnConnect}
                    onPress={() => showFeedback(`Connection request sent to ${student.name}!`, 'success')}
                  >
                    <Ionicons name="person-add" size={15} color={colors.white} style={{ marginRight: 6 }} />
                    <Text style={styles.btnConnectText}>Connect</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        </View>

        {/* Inset Grouped Hub List (iOS Settings / HIG Style) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>EXPLORE HUBS</Text>
          <View style={styles.groupedList}>
            <TouchableOpacity
              style={styles.groupedRow}
              onPress={() => router.push('/study-partners')}
            >
              <View style={[styles.hubIconCircle, { backgroundColor: 'rgba(52, 199, 89, 0.18)' }]}>
                <Ionicons name="book" size={18} color="#32D74B" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Study Partners</Text>
                <Text style={styles.rowDesc}>Find exam & subject buddies (College Only)</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            <TouchableOpacity
              style={styles.groupedRow}
              onPress={() => router.push('/teams')}
            >
              <View style={[styles.hubIconCircle, { backgroundColor: 'rgba(10, 132, 255, 0.18)' }]}>
                <Ionicons name="people" size={18} color="#0A84FF" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Hackathon Teams</Text>
                <Text style={styles.rowDesc}>Form or join SIH 2025 squads (Dual Visibility)</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            <TouchableOpacity
              style={styles.groupedRow}
              onPress={() => router.push('/clubs')}
            >
              <View style={[styles.hubIconCircle, { backgroundColor: 'rgba(94, 92, 230, 0.18)' }]}>
                <Ionicons name="flag" size={18} color="#5E5CE6" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Clubs & Events</Text>
                <Text style={styles.rowDesc}>Workshops, tech fests, verified RSVP</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.rowSeparator} />

            <TouchableOpacity
              style={styles.groupedRow}
              onPress={() => router.push('/challenges')}
            >
              <View style={[styles.hubIconCircle, { backgroundColor: 'rgba(255, 159, 10, 0.18)' }]}>
                <Ionicons name="trophy" size={18} color="#FF9F0A" />
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>Daily Challenge</Text>
                <Text style={styles.rowDesc}>Daily engineering puzzle & campus ranking</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
    overflow: 'hidden'
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.separator,
    backgroundColor: colors.bg,
    zIndex: 10,
    elevation: 4
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38
  },
  searchIcon: {
    marginRight: 6
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16,
    paddingVertical: 0
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 110
  },
  largeTitleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.37
  },
  segmentedWrapper: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 16
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 16
  },
  sectionHeader: {
    marginBottom: 10
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 4,
    marginLeft: 4
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: 4
  },
  suggestedCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    width: '100%',
    maxWidth: 340
  },
  cardAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.primary
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  cardDept: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2
  },
  cardCollege: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2
  },
  cardSkillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginVertical: 14
  },
  cardSkillTag: {
    backgroundColor: colors.tagBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6
  },
  cardSkillText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600'
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 6
  },
  cardBtnSkip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.systemFill,
    justifyContent: 'center',
    alignItems: 'center'
  },
  cardBtnConnect: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  btnConnectText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600'
  },
  groupedList: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.cardBorder,
    overflow: 'hidden'
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  hubIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rowContent: {
    flex: 1
  },
  rowTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2
  },
  rowDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.separator,
    marginLeft: 56
  }
});
