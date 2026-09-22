import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { colors } from '../theme/colors';

interface SplashScreenProps {
  onGetStarted: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted }) => {
  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800' }}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.35 }}
      >
        <View style={styles.gradientOverlay} />

        <View style={styles.content}>
          {/* Logo icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>❖</Text>
          </View>

          <Text style={styles.brandTitle}>TRYBEL</Text>
          <Text style={styles.tagline}>Your People. Your Campus.</Text>

          <Text style={styles.description}>
            A verified, college-native network for collaboration, clubs, and community.
          </Text>

          <TouchableOpacity style={styles.ctaButton} onPress={onGetStarted} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Let's Get Started  →</Text>
          </TouchableOpacity>

          <Text style={styles.footerNote}>College-first. Brighter together.</Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 14, 23, 0.75)'
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 28,
    width: '100%',
    maxWidth: 420
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  iconText: {
    fontSize: 34,
    color: colors.primary
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 2,
    marginBottom: 6
  },
  tagline: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center'
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 44,
    paddingHorizontal: 12
  },
  ctaButton: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
    marginBottom: 24
  },
  ctaText: {
    color: '#0A0E17',
    fontSize: 16,
    fontWeight: '700'
  },
  footerNote: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500'
  }
});
