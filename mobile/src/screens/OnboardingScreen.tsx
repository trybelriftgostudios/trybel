import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const features = [
  {
    icon: '👥',
    color: '#8B5CF6',
    title: 'Find Study Partners',
    subtitle: 'Connect with students for subjects, projects and study groups in your campus.'
  },
  {
    icon: '💻',
    color: '#10B981',
    title: 'Build Hackathon Teams',
    subtitle: 'Find teammates with complementary skills for SIH and open hackathons.'
  },
  {
    icon: '📅',
    color: '#F59E0B',
    title: 'Explore Clubs & Events',
    subtitle: 'Discover campus workshops, tech talks, and cultural festivals.'
  },
  {
    icon: '💬',
    color: '#3B82F6',
    title: 'Campus Community',
    subtitle: 'Chat, share photos with accepted friends, and compete in daily campus puzzles.'
  },
  {
    icon: '🤖',
    color: '#EC4899',
    title: 'AI Campus Assistant',
    subtitle: 'Get instant verified answers to exam timetables, room locations, and club rules.'
  }
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headingTitle}>More than a social app.</Text>
        <Text style={styles.headingSubtitle}>A campus for everything.</Text>
      </View>

      <ScrollView style={styles.cardList} showsVerticalScrollIndicator={false}>
        {features.map((item, idx) => (
          <View key={idx} style={[styles.card, idx === currentSlide && styles.activeCard]}>
            <View style={[styles.iconBox, { backgroundColor: item.color + '22' }]}>
              <Text style={styles.icon}>{item.icon}</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Footer controls */}
      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {features.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide ? styles.activeDot : styles.inactiveDot
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextText}>
            {currentSlide === features.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipBtn} onPress={onComplete}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 54,
    paddingHorizontal: 20
  },
  header: {
    marginBottom: 24
  },
  headingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5
  },
  headingSubtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4
  },
  cardList: {
    flex: 1
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder
  },
  activeCard: {
    borderColor: colors.primary,
    backgroundColor: '#121C2B'
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14
  },
  icon: {
    fontSize: 22
  },
  cardContent: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary
  },
  footer: {
    paddingVertical: 18,
    alignItems: 'center'
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: 16
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#334155'
  },
  nextBtn: {
    width: '100%',
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10
  },
  nextText: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '700'
  },
  skipBtn: {
    paddingVertical: 6
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '500'
  }
});
