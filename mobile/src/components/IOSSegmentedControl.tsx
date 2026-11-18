import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

interface IOSSegmentedControlProps<T extends string> {
  values: readonly T[] | T[];
  selectedIndex: number;
  onChange: (value: T, index: number) => void;
  formatLabel?: (value: T) => string;
}

export function IOSSegmentedControl<T extends string>({
  values,
  selectedIndex,
  onChange,
  formatLabel
}: IOSSegmentedControlProps<T>) {
  const handleSelect = (val: T, idx: number) => {
    if (idx === selectedIndex) return;
    if (Platform.OS !== 'web') {
      try {
        Haptics.selectionAsync();
      } catch {
        // Safe fallback
      }
    }
    onChange(val, idx);
  };

  return (
    <View style={styles.container}>
      {values.map((val, idx) => {
        const isSelected = idx === selectedIndex;
        const label = formatLabel ? formatLabel(val) : val;

        return (
          <TouchableOpacity
            key={val}
            style={[styles.segment, isSelected && styles.segmentSelected]}
            onPress={() => handleSelect(val, idx)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected && styles.segmentTextSelected
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(118, 118, 128, 0.24)',
    borderRadius: 9,
    padding: 2,
    alignItems: 'center'
  },
  segment: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentSelected: {
    backgroundColor: '#636366',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2
      },
      android: {
        elevation: 2
      },
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
      }
    })
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    letterSpacing: -0.08
  },
  segmentTextSelected: {
    fontWeight: '600',
    color: '#FFFFFF'
  }
});
