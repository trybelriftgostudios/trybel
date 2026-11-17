import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export type FeedbackType = 'success' | 'info' | 'warning' | 'error';

interface FeedbackContextType {
  showFeedback: (message: string, type?: FeedbackType, duration?: number) => void;
}

const FeedbackContext = createContext<FeedbackContextType>({
  showFeedback: () => {}
});

export const useFeedback = () => useContext(FeedbackContext);

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [feedback, setFeedback] = useState<{ message: string; type: FeedbackType } | null>(null);
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(-30)).current;
  const timeoutRef = useRef<any>(null);

  const showFeedback = useCallback((message: string, type: FeedbackType = 'success', duration = 3000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setFeedback({ message, type });

    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true
      }),
      Animated.spring(translateYAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true
      })
    ]).start();

    timeoutRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.timing(translateYAnim, {
          toValue: -30,
          duration: 250,
          useNativeDriver: true
        })
      ]).start(() => setFeedback(null));
    }, duration);
  }, [opacityAnim, translateYAnim]);

  const getBorderColor = (type: FeedbackType) => {
    switch (type) {
      case 'success': return colors.primary;
      case 'warning': return colors.badgeOrangeText;
      case 'error': return colors.danger;
      default: return colors.accentBlue;
    }
  };

  const getIcon = (type: FeedbackType) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '⚠️';
      case 'error': return '✕';
      default: return 'ℹ';
    }
  };

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      {feedback && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.toastContainer,
            {
              opacity: opacityAnim,
              transform: [{ translateY: translateYAnim }],
              borderColor: getBorderColor(feedback.type)
            }
          ]}
        >
          <View style={[styles.iconDot, { backgroundColor: getBorderColor(feedback.type) }]}>
            <Text style={styles.iconText}>{getIcon(feedback.type)}</Text>
          </View>
          <Text style={styles.messageText}>{feedback.message}</Text>
        </Animated.View>
      )}
    </FeedbackContext.Provider>
  );
};

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 55,
    left: 20,
    right: 20,
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 10,
    zIndex: 99999
  },
  iconDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  iconText: {
    color: '#0A0E17',
    fontSize: 13,
    fontWeight: '800'
  },
  messageText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    flex: 1
  }
});
