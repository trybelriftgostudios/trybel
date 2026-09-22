import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

interface AudienceBadgeProps {
  type: 'college_only' | 'open_to_all';
  label?: string;
}

export const AudienceBadge: React.FC<AudienceBadgeProps> = ({ type, label }) => {
  const isCollegeOnly = type === 'college_only';

  return (
    <View style={[styles.badge, isCollegeOnly ? styles.collegeOnlyBadge : styles.openBadge]}>
      <View style={[styles.dot, isCollegeOnly ? styles.collegeDot : styles.openDot]} />
      <Text style={[styles.badgeText, isCollegeOnly ? styles.collegeText : styles.openText]}>
        {label || (isCollegeOnly ? 'College only' : 'Open to other colleges')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start'
  },
  collegeOnlyBadge: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1
  },
  openBadge: {
    backgroundColor: '#0F2942',
    borderColor: '#1E4976',
    borderWidth: 1
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5
  },
  collegeDot: {
    backgroundColor: '#94A3B8'
  },
  openDot: {
    backgroundColor: '#38BDF8'
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600'
  },
  collegeText: {
    color: '#CBD5E1'
  },
  openText: {
    color: '#38BDF8'
  }
});
