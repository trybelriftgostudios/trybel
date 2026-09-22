import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';

interface DiscoverScreenProps {
  onNavigate: (screen: string) => void;
}

const suggestedPeople = [
  {
    id: 'sana',
    name: 'Sana Khan',
    meta: 'CSE • 3rd Year',
    skills: 'Machine Learning, Python',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120'
  },
  {
    id: 'venkatesh',
    name: 'Venkatesh',
    meta: 'ECE • 2nd Year',
    skills: 'IoT, Embedded',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'
  },
  {
    id: 'rahul',
    name: 'Rahul Mehta',
    meta: 'IT • 3rd Year',
    skills: 'Web Development, React',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120'
  }
];

export const DiscoverScreen: React.FC<DiscoverScreenProps> = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'people' | 'teams' | 'clubs' | 'events'>('all');
  const [connected, setConnected] = useState<Record<string, boolean>>({});

  const handleConnect = (id: string) => {
    setConnected(prev => ({ ...prev, [id]: true }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Discover</Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search people, events, clubs..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {(['all', 'people', 'teams', 'clubs', 'events'] as const).map(chip => (
          <TouchableOpacity
            key={chip}
            style={[styles.chip, activeFilter === chip && styles.activeChip]}
            onPress={() => setActiveFilter(chip)}
          >
            <Text style={[styles.chipText, activeFilter === chip && styles.activeChipText]}>
              {chip.charAt(0).toUpperCase() + chip.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Suggested for You */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Suggested for you</Text>
          <TouchableOpacity onPress={() => onNavigate('Friends')}>
            <Text style={styles.seeAllText}>See all</Text>
          </TouchableOpacity>
        </View>

        {suggestedPeople.map(person => (
          <View key={person.id} style={styles.personCard}>
            <Image source={{ uri: person.avatar }} style={styles.personAvatar} />
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{person.name}</Text>
              <Text style={styles.personMeta}>{person.meta}</Text>
              <Text style={styles.personSkills}>{person.skills}</Text>
            </View>
            <TouchableOpacity
              style={[styles.connectBtn, connected[person.id] && styles.connectedBtn]}
              onPress={() => handleConnect(person.id)}
            >
              <Text style={[styles.connectBtnText, connected[person.id] && styles.connectedBtnText]}>
                {connected[person.id] ? 'Requested' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Explore Category Tiles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.tilesGrid}>
          <TouchableOpacity style={styles.tile} onPress={() => onNavigate('StudyPartners')}>
            <Text style={styles.tileEmoji}>👥</Text>
            <Text style={styles.tileTitle}>Study Partners</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => onNavigate('Teams')}>
            <Text style={styles.tileEmoji}>💻</Text>
            <Text style={styles.tileTitle}>Hackathon Teams</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => onNavigate('ClubsEvents')}>
            <Text style={styles.tileEmoji}>🎪</Text>
            <Text style={styles.tileTitle}>Clubs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tile} onPress={() => onNavigate('ClubsEvents')}>
            <Text style={styles.tileEmoji}>📅</Text>
            <Text style={styles.tileTitle}>Events</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trending */}
      <View style={[styles.section, { marginBottom: 90 }]}>
        <Text style={styles.sectionTitle}>Trending</Text>
        <View style={styles.trendingCard}>
          <View style={styles.trendingIconBox}>
            <Text style={styles.trendingEmoji}>🚀</Text>
          </View>
          <View style={styles.trendingInfo}>
            <Text style={styles.trendingTitle}>Tech Fest 2025</Text>
            <Text style={styles.trendingMeta}>St. Peter's Engineering College • 25 Sep</Text>
          </View>
          <TouchableOpacity style={styles.registerBtn} onPress={() => onNavigate('ClubsEvents')}>
            <Text style={styles.registerBtnText}>Register</Text>
          </TouchableOpacity>
        </View>
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
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 16
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
    color: colors.textMuted
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 24
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 8
  },
  activeChip: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8'
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary
  },
  activeChipText: {
    color: colors.textPrimary
  },
  section: {
    marginBottom: 24
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38BDF8'
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12
  },
  personInfo: {
    flex: 1
  },
  personName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  personMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2
  },
  personSkills: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2
  },
  connectBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155'
  },
  connectedBtn: {
    backgroundColor: 'transparent',
    borderColor: colors.primary
  },
  connectBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  },
  connectedBtnText: {
    color: colors.primary
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  tile: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center'
  },
  tileEmoji: {
    fontSize: 26,
    marginBottom: 8
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary
  },
  trendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  trendingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#8B5CF622',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  trendingEmoji: {
    fontSize: 20
  },
  trendingInfo: {
    flex: 1
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary
  },
  trendingMeta: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2
  },
  registerBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8
  },
  registerBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600'
  }
});
