import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SecurityProvider } from '../context/SecurityContext';
import { FeedbackProvider } from '../context/FeedbackContext';
import { AppLockOverlay } from '../components/AppLockOverlay';
import { sqliteService } from '../services/sqlite.service';
import { notificationsService } from '../services/notifications.service';
import { colors } from '../theme/colors';

export default function RootLayout() {
  useEffect(() => {
    // Initialize offline SQLite DB and notifications on startup
    sqliteService.init();
    notificationsService.init();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" backgroundColor={colors.bg} />
      <FeedbackProvider>
        <SecurityProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg }
            }}
          >
            {/* Main Bottom Tabs */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            {/* Modal & Stack Sub-Routes */}
            <Stack.Screen
              name="study-partners"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="teams"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="clubs"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="challenges"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="chatbot"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="notifications"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="report"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="admin"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="onboarding"
              options={{
                presentation: 'modal',
                headerShown: false
              }}
            />
            <Stack.Screen
              name="verify"
              options={{
                presentation: 'modal',
                headerShown: false
              }}
            />
          </Stack>

          {/* Secure App Lock Overlay (Auto-Lock & Biometrics) */}
          <AppLockOverlay />
        </SecurityProvider>
      </FeedbackProvider>
    </SafeAreaProvider>
  );
}
