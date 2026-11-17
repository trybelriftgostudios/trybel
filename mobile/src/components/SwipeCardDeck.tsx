import React, { useRef } from 'react';
import {
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  StyleProp,
  ViewStyle
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SwipeCardDeckProps<T> {
  cards: T[];
  renderCard: (card: T, index: number) => React.ReactNode;
  onSwipeLeft?: (card: T, index: number) => void;
  onSwipeRight?: (card: T, index: number) => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export function SwipeCardDeck<T>({
  cards,
  renderCard,
  onSwipeLeft,
  onSwipeRight,
  containerStyle
}: SwipeCardDeckProps<T>) {
  const pan = useRef(new Animated.ValueXY()).current;
  const currentCardIndex = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false // Layout XY requires false for continuous responder moves or we use separate x/y transforms
      }),
      onPanResponderRelease: (_, gesture) => {
        const swipeThreshold = SCREEN_WIDTH * 0.28;
        const currentIdx = currentCardIndex.current;
        const card = cards[currentIdx];

        if (gesture.dx > swipeThreshold) {
          // Swipe Right
          Animated.timing(pan, {
            toValue: { x: SCREEN_WIDTH + 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            if (onSwipeRight && card) onSwipeRight(card, currentIdx);
            currentCardIndex.current = (currentIdx + 1) % cards.length;
          });
        } else if (gesture.dx < -swipeThreshold) {
          // Swipe Left
          Animated.timing(pan, {
            toValue: { x: -SCREEN_WIDTH - 100, y: gesture.dy },
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            pan.setValue({ x: 0, y: 0 });
            if (onSwipeLeft && card) onSwipeLeft(card, currentIdx);
            currentCardIndex.current = (currentIdx + 1) % cards.length;
          });
        } else {
          // Reset card
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            tension: 40,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  if (!cards || cards.length === 0) return null;

  const rotate = pan.x.interpolate({
    inputRange: [-SCREEN_WIDTH * 1.5, 0, SCREEN_WIDTH * 1.5],
    outputRange: ['-20deg', '0deg', '20deg']
  });

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        containerStyle,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      {renderCard(cards[0], 0)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  }
});
