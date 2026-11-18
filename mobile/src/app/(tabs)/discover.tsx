import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../theme/colors';
import { useFeedback } from '../../context/FeedbackContext';
import { SwipeCardDeck } from '../../components/SwipeCardDeck';

const triggerHaptic = (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS !== 'web') {
    try {
      Haptics.impactAsync(style);
    } catch {}
  }
};

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
      {/* Header Search */}
      <View style={styles.header}>
        <Text style={styles.title}>Discover Campus</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search peers, skills, hackathon teams..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Category Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryChip,
                activeCategory === cat && styles.categoryChipActive
              ]}
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic();
                setActiveCategory(cat);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === cat && styles.categoryTextActive
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Swipeable Peer Connect Card Deck */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Suggested Connections</Text>
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
                    <Ionicons name="close" size={20} color={colors.textMuted} />
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

        {/* Explore Hub Tiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Hubs</Text>
          <View style={styles.tilesGrid}>
            <TouchableOpacity
              style={styles.hubTile}
              onPress={() => router.push('/study-partners')}
            >
              <Ionicons name="book-outline" size={24} color={colors.primary} style={styles.hubIcon} />
              <Text style={styles.hubTitle}>Study Partners</Text>
              <Text style={styles.hubDesc}>Find exam & subject study buddies (College Only)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hubTile}
              onPress={() => router.push('/teams')}
            >
              <Ionicons name="people-outline" size={24} color={colors.primary} style={styles.hubIcon} />
              <Text style={styles.hubTitle}>Hackathon Teams</Text>
              <Text style={styles.hubDesc}>Form or join SIH 2025 squads (Dual Visibility)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hubTile}
              onPress={() => router.push('/clubs')}
            >
              <Ionicons name="flag-outline" size={24} color={colors.primary} style={styles.hubIcon} />
              <Text style={styles.hubTitle}>Clubs & Events</Text>
              <Text style={styles.hubDesc}>Workshops, tech fests, and verified RSVP feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hubTile}
              onPress={() => router.push('/challenges')}
            >
              <Ionicons name="trophy-outline" size={24} color={colors.primary} style={styles.hubIcon} />
              <Text style={styles.hubTitle}>Daily Challenge</Text>
              <Text style={styles.hubDesc}>Daily engineering puzzle with campus ranking</Text>
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.bg,
    zIndex: 10,
    elevation: 4
  },
  scrollView: {
    flex: 1
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.3
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    paddingVertical: 10
  },
  scrollContent: {
    paddingBottom: 110
  },
  categoriesRow: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 8
  },
  categoryChip: {
    backgroundColor: colors.card,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  categoryText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '600'
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '800'
  },
  section: {
    marginTop: 18,
    paddingHorizontal: 18
  },
  sectionHeader: {
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary
  },
  sectionSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  suggestedCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.cardBorder,
    width: '100%',
    maxWidth: 340
  },
  cardAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: colors.primary
  },
  cardName: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800'
  },
  cardDept: {
    color: colors.textSecondary,
    fontSize: 12,
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
    marginVertical: 12
  },
  cardSkillTag: {
    backgroundColor: colors.tagBg,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.cardBorder
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
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.cardBorder
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
    fontSize: 13,
    fontWeight: '800'
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12
  },
  hubTile: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  hubIcon: {
    marginBottom: 8
  },
  hubTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700'
  },
  hubDesc: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 15
  }
});
