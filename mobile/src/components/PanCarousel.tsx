import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle
} from 'react-native';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PanCarouselProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemWidth?: number;
  containerStyle?: StyleProp<ViewStyle>;
  onIndexChange?: (index: number) => void;
}

export function PanCarousel<T>({
  data,
  renderItem,
  itemWidth = SCREEN_WIDTH - 48,
  containerStyle,
  onIndexChange
}: PanCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const panAnim = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        panAnim.setValue(gesture.dx);
      },
      onPanResponderRelease: (_, gesture) => {
        const threshold = itemWidth * 0.22;
        if (gesture.dx < -threshold && currentIndex < data.length - 1) {
          // Swipe Left -> Next
          Animated.timing(panAnim, {
            toValue: -itemWidth,
            duration: 180,
            useNativeDriver: true
          }).start(() => {
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            panAnim.setValue(0);
            if (onIndexChange) onIndexChange(nextIdx);
          });
        } else if (gesture.dx > threshold && currentIndex > 0) {
          // Swipe Right -> Prev
          Animated.timing(panAnim, {
            toValue: itemWidth,
            duration: 180,
            useNativeDriver: true
          }).start(() => {
            const prevIdx = currentIndex - 1;
            setCurrentIndex(prevIdx);
            panAnim.setValue(0);
            if (onIndexChange) onIndexChange(prevIdx);
          });
        } else {
          // Snap back
          Animated.spring(panAnim, {
            toValue: 0,
            friction: 7,
            tension: 50,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  if (!data || data.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            width: itemWidth,
            transform: [
              {
                translateX: panAnim
              }
            ]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {renderItem(data[currentIndex], currentIndex)}
      </Animated.View>

      {/* Pagination Indicators */}
      {data.length > 1 && (
        <View style={styles.paginationRow}>
          {data.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicator,
                i === currentIndex ? styles.activeIndicator : styles.inactiveIndicator
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12
  },
  cardWrapper: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    gap: 6
  },
  indicator: {
    height: 6,
    borderRadius: 3
  },
  activeIndicator: {
    width: 22,
    backgroundColor: colors.primary
  },
  inactiveIndicator: {
    width: 6,
    backgroundColor: '#334155'
  }
});
