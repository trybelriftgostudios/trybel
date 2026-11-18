import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleProp,
  ViewStyle,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
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
  itemWidth = SCREEN_WIDTH - 44,
  containerStyle,
  onIndexChange
}: PanCarouselProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<any>(null);
  const itemGap = 12;
  const snapInterval = itemWidth + itemGap;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / snapInterval);
    if (newIndex >= 0 && newIndex < data.length && newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      if (onIndexChange) onIndexChange(newIndex);
      if (Platform.OS !== 'web') {
        try {
          Haptics.selectionAsync();
        } catch {}
      }
    }
  };

  if (!data || data.length === 0) return null;

  return (
    <View style={[styles.container, containerStyle]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapInterval}
        snapToAlignment="center"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={true}
      >
        {data.map((item, index) => (
          <View
            key={index}
            style={[
              styles.cardWrapper,
              { width: itemWidth, marginRight: index === data.length - 1 ? 0 : itemGap }
            ]}
          >
            {renderItem(item, index)}
          </View>
        ))}
      </ScrollView>

      {/* Apple-style Smooth Pill Indicators */}
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
    marginVertical: 14
  },
  scrollContent: {
    paddingHorizontal: 18,
    alignItems: 'center'
  },
  cardWrapper: {
    borderRadius: 20,
    overflow: 'hidden'
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6
  },
  indicator: {
    height: 5,
    borderRadius: 2.5
  },
  activeIndicator: {
    width: 20,
    backgroundColor: colors.primary
  },
  inactiveIndicator: {
    width: 5,
    backgroundColor: colors.cardBorder
  }
});
