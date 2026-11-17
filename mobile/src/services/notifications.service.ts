import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { AndroidImportance } from 'expo-notifications';

// Configure default notification presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

class NotificationsService {
  private isInitialized = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Wrap Android notification channel creation in try/catch for seamless Expo Go compatibility
    if (Platform.OS === 'android') {
      try {
        await Notifications.setNotificationChannelAsync('trybel_campus_reminders', {
          name: 'Campus Reminders & Events',
          importance: AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#22C55E',
          sound: 'default'
        });

        await Notifications.setNotificationChannelAsync('trybel_security', {
          name: 'Security & App Lock',
          importance: AndroidImportance.MAX,
          vibrationPattern: [0, 100, 200, 300],
          lightColor: '#38BDF8',
          sound: 'default'
        });
      } catch (err: any) {
        console.warn('[Notifications] Android channel warning (Expo Go safe fallback):', err.message);
      }
    }
  }

  public async requestPermissions(): Promise<boolean> {
    await this.init();
    if (Platform.OS === 'web') return false;

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      return finalStatus === 'granted';
    } catch {
      return false;
    }
  }

  public async scheduleLocalReminder(params: {
    title: string;
    body: string;
    secondsFromNow: number;
    data?: Record<string, any>;
  }): Promise<string | null> {
    await this.init();
    if (Platform.OS === 'web') return null;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: params.title,
          body: params.body,
          sound: true,
          data: params.data || {}
        },
        trigger: {
          seconds: Math.max(1, params.secondsFromNow),
          channelId: 'trybel_campus_reminders'
        }
      });
      return id;
    } catch (err: any) {
      console.warn('[Notifications] Schedule failed:', err.message);
      return null;
    }
  }

  public async scheduleDailyPuzzleReminder(): Promise<string | null> {
    await this.init();
    if (Platform.OS === 'web') return null;

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Daily Campus Puzzle is Live! 🧩',
          body: 'Test your engineering knowledge today to climb the college leaderboard.',
          sound: true,
          data: { route: '/challenges' }
        },
        trigger: {
          hour: 9,
          minute: 0,
          repeats: true,
          channelId: 'trybel_campus_reminders'
        }
      });
      return id;
    } catch (err: any) {
      console.warn('[Notifications] Daily puzzle schedule warning:', err.message);
      return null;
    }
  }

  public async triggerImmediateTestNotification(): Promise<string | null> {
    return this.scheduleLocalReminder({
      title: 'Trybel Campus Alert',
      body: 'Verified Campus Notification: Expo Go compatible and hardware-accelerated.',
      secondsFromNow: 1,
      data: { route: '/notifications' }
    });
  }

  public async cancelNotification(id: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {}
  }
}

export const notificationsService = new NotificationsService();
