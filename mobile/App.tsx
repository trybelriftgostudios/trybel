import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Text, TouchableOpacity, StatusBar } from 'react-native';
import { colors } from './src/theme/colors';
import { api } from './src/services/api';

// 18 Screens
import { SplashScreen } from './src/screens/SplashScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { VerifyScreen } from './src/screens/VerifyScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { DiscoverScreen } from './src/screens/DiscoverScreen';
import { StudyPartnerScreen } from './src/screens/StudyPartnerScreen';
import { TeamsScreen } from './src/screens/TeamsScreen';
import { ClubsEventsScreen } from './src/screens/ClubsEventsScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { FriendsPhotosScreen } from './src/screens/FriendsPhotosScreen';
import { ChallengesScreen } from './src/screens/ChallengesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { ChatbotScreen } from './src/screens/ChatbotScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { AdminScreen } from './src/screens/AdminScreen';
import { MenuScreen } from './src/screens/MenuScreen';

import { BottomNavBar } from './src/components/BottomNavBar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('Splash');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [createModalVisible, setCreateModalVisible] = useState<boolean>(false);

  // Auto-login test pilot user in dev mode
  useEffect(() => {
    // Attempt background session verify
    api.verifyToken({ email: 'sritan@stpeters.edu', otp: '123456' })
      .then(() => {
        setIsAuthenticated(true);
      })
      .catch(() => {
        // Fallback to Splash screen
      });
  }, []);

  const handleLogout = () => {
    api.setToken(null);
    setIsAuthenticated(false);
    setCurrentScreen('Splash');
  };

  const isMainTabScreen = ['Home', 'Discover', 'Chat', 'Friends', 'Profile'].includes(currentScreen);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg} />

      {/* Screen Routing */}
      {currentScreen === 'Splash' && (
        <SplashScreen onGetStarted={() => setCurrentScreen('Onboarding')} />
      )}

      {currentScreen === 'Onboarding' && (
        <OnboardingScreen onComplete={() => setCurrentScreen('Verify')} />
      )}

      {currentScreen === 'Verify' && (
        <VerifyScreen
          onVerified={() => {
            setIsAuthenticated(true);
            setCurrentScreen('Home');
          }}
        />
      )}

      {currentScreen === 'Home' && (
        <HomeScreen onNavigate={(screen) => setCurrentScreen(screen)} />
      )}

      {currentScreen === 'Discover' && (
        <DiscoverScreen onNavigate={(screen) => setCurrentScreen(screen)} />
      )}

      {currentScreen === 'StudyPartners' && (
        <StudyPartnerScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Teams' && (
        <TeamsScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'ClubsEvents' && (
        <ClubsEventsScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Chat' && (
        <ChatScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Friends' && (
        <FriendsPhotosScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Challenges' && (
        <ChallengesScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Profile' && (
        <ProfileScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Chatbot' && (
        <ChatbotScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Notifications' && (
        <NotificationsScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Settings' && (
        <SettingsScreen
          onBack={() => setCurrentScreen('Home')}
          onLogout={handleLogout}
          onNavigate={(screen) => setCurrentScreen(screen)}
        />
      )}

      {currentScreen === 'Report' && (
        <ReportScreen
          onBack={() => setCurrentScreen('Home')}
        />
      )}

      {currentScreen === 'Admin' && (
        <AdminScreen
          onBack={() => setCurrentScreen('Home')}
        />
      )}

      {currentScreen === 'Menu' && (
        <MenuScreen
          onBack={() => setCurrentScreen('Home')}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onLogout={handleLogout}
        />
      )}

      {/* Bottom Navigation Bar visible on main logged-in tabs */}
      {isAuthenticated && isMainTabScreen && (
        <BottomNavBar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onCreatePress={() => setCreateModalVisible(true)}
        />
      )}

      {/* Central Quick Create Modal */}
      <Modal visible={createModalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCreateModalVisible(false)}
        >
          <View style={styles.createSheet}>
            <Text style={styles.createTitle}>Create or Discover</Text>

            <TouchableOpacity
              style={styles.createOption}
              onPress={() => {
                setCreateModalVisible(false);
                setCurrentScreen('StudyPartners');
              }}
            >
              <Text style={styles.createEmoji}>👥</Text>
              <View style={styles.createOptionText}>
                <Text style={styles.createOptionTitle}>Post Study Request</Text>
                <Text style={styles.createOptionDesc}>Strictly locked to your college classmates</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createOption}
              onPress={() => {
                setCreateModalVisible(false);
                setCurrentScreen('Teams');
              }}
            >
              <Text style={styles.createEmoji}>💻</Text>
              <View style={styles.createOptionText}>
                <Text style={styles.createOptionTitle}>Form Hackathon Team</Text>
                <Text style={styles.createOptionDesc}>Choose College-only or Open to other colleges</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createOption}
              onPress={() => {
                setCreateModalVisible(false);
                setCurrentScreen('ClubsEvents');
              }}
            >
              <Text style={styles.createEmoji}>📅</Text>
              <View style={styles.createOptionText}>
                <Text style={styles.createOptionTitle}>Explore Campus Events</Text>
                <Text style={styles.createOptionDesc}>Workshops, tech talks, and cultural events</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createOption}
              onPress={() => {
                setCreateModalVisible(false);
                setCurrentScreen('Challenges');
              }}
            >
              <Text style={styles.createEmoji}>🧩</Text>
              <View style={styles.createOptionText}>
                <Text style={styles.createOptionTitle}>Solve Daily Challenge</Text>
                <Text style={styles.createOptionDesc}>Earn points and compete on the campus leaderboard</Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end'
  },
  createSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: colors.cardBorder,
    paddingBottom: 40
  },
  createTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 20
  },
  createOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  createEmoji: {
    fontSize: 24,
    marginRight: 16
  },
  createOptionText: {
    flex: 1
  },
  createOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary
  },
  createOptionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2
  }
});
