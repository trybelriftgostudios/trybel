import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

interface BottomNavBarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  onCreatePress: () => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentScreen, onNavigate, onCreatePress }) => {
  const tabs = [
    { key: 'Home', label: 'Home', icon: '🏠' },
    { key: 'Discover', label: 'Discover', icon: '🧭' },
    { key: 'create', label: '', icon: '+', isCreate: true },
    { key: 'Chat', label: 'Chat', icon: '💬' },
    { key: 'Profile', label: 'Profile', icon: '👤' }
  ];

  return (
    <View style={styles.navBar}>
      {tabs.map((tab, idx) => {
        if (tab.isCreate) {
          return (
            <TouchableOpacity
              key={idx}
              style={styles.createBtn}
              onPress={onCreatePress}
              activeOpacity={0.85}
            >
              <Text style={styles.createIcon}>+</Text>
            </TouchableOpacity>
          );
        }

        const isActive = currentScreen === tab.key;
        return (
          <TouchableOpacity
            key={idx}
            style={styles.tabBtn}
            onPress={() => onNavigate(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#0E1422',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 8,
    zIndex: 100
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 3
  },
  activeTabIcon: {
    transform: [{ scale: 1.1 }]
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted
  },
  activeTabLabel: {
    color: '#38BDF8',
    fontWeight: '700'
  },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6
  },
  createIcon: {
    fontSize: 26,
    color: '#0A0E17',
    fontWeight: '900',
    lineHeight: 28
  }
});
