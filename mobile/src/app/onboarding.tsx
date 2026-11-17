import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

const ONBOARDING_SLIDES = [
  {
    icon: '🏛️',
    title: 'Verified Campus Exclusivity',
    desc: 'Connect strictly with verified college students. Every user is authenticated via student roll numbers and institutional emails.'
  },
  {
    icon: '🚀',
    title: 'Cross-College Hackathon Squads',
    desc: 'Form high-performing teams for SIH, build hackathon projects, and collaborate across collegiate boundaries.'
  },
  {
    icon: '🔒',
    title: 'Offline-First & Biometric Lock',
    desc: 'Local SQLite data persistence with full hardware-accelerated Face ID, Fingerprint, and 4-digit PIN security.'
  }
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < ONBOARDING_SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      router.replace('/(tabs)');
    }
  };

  const slide = ONBOARDING_SLIDES[currentSlide];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.skipRow}>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.slideContent}>
          <View style={styles.iconCircle}>
            <Text style={styles.slideIcon}>{slide.icon}</Text>
          </View>
          <Text style={styles.slideTitle}>{slide.title}</Text>
          <Text style={styles.slideDesc}>{slide.desc}</Text>
        </View>

        {/* Indicators */}
        <View style={styles.indicatorRow}>
          {ONBOARDING_SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentSlide && styles.dotActive
              ]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {currentSlide === ONBOARDING_SLIDES.length - 1 ? 'Enter Trybel Campus' : 'Continue →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between'
  },
  skipRow: {
    alignItems: 'flex-end'
  },
  skipText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700'
  },
  slideContent: {
    alignItems: 'center',
    paddingHorizontal: 20
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    marginBottom: 24
  },
  slideIcon: {
    fontSize: 48
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12
  },
  slideDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22
  },
  indicatorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.cardBorder
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary
  },
  nextBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center'
  },
  nextBtnText: {
    color: colors.bg,
    fontSize: 16,
    fontWeight: '900'
  }
});