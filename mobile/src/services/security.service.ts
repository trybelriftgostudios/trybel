import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

export type AutoLockTimeout = 'immediate' | '2m' | '5m' | 'never';

const KEYS = {
  PIN: 'trybel_app_pin',
  BIOMETRICS: 'trybel_biometrics_enabled',
  AUTO_LOCK: 'trybel_autolock_timeout',
  LAST_ACTIVE: 'trybel_last_active_timestamp',
  AUTH_TOKEN: 'trybel_auth_token'
};

class SecurityService {
  // Safe SecureStore abstraction (falls back to in-memory/localStorage on web)
  private async setSecureItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {}
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (err: any) {
      console.warn(`[SecureStore] Error setting ${key}:`, err.message);
    }
  }

  private async getSecureItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {}
      return null;
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  }

  private async deleteSecureItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {}
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  }

  // --- PIN MANAGEMENT ---
  public async getPin(): Promise<string | null> {
    return this.getSecureItem(KEYS.PIN);
  }

  public async setPin(pin: string): Promise<void> {
    await this.setSecureItem(KEYS.PIN, pin);
  }

  public async removePin(): Promise<void> {
    await this.deleteSecureItem(KEYS.PIN);
  }

  public async verifyPin(enteredPin: string): Promise<boolean> {
    const storedPin = await this.getPin();
    if (!storedPin) return true; // No pin set
    return storedPin.trim() === enteredPin.trim();
  }

  // --- BIOMETRICS ---
  public async isBiometricsAvailable(): Promise<{ available: boolean; enrolled: boolean; type: string }> {
    if (Platform.OS === 'web') {
      return { available: false, enrolled: false, type: 'None' };
    }
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      let type = 'Biometrics';
      if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        type = 'Face ID';
      } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        type = 'Fingerprint';
      }

      return { available: hasHardware, enrolled: isEnrolled, type };
    } catch {
      return { available: false, enrolled: false, type: 'None' };
    }
  }

  public async isBiometricsEnabled(): Promise<boolean> {
    const val = await this.getSecureItem(KEYS.BIOMETRICS);
    return val === 'true';
  }

  public async setBiometricsEnabled(enabled: boolean): Promise<void> {
    await this.setSecureItem(KEYS.BIOMETRICS, enabled ? 'true' : 'false');
  }

  public async authenticateWithBiometrics(promptMessage = 'Unlock Trybel Campus'): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const bioStatus = await this.isBiometricsAvailable();
      if (!bioStatus.available || !bioStatus.enrolled) return false;

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use PIN Instead',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel'
      });

      return result.success;
    } catch (err: any) {
      console.warn('[Biometrics] Auth error:', err.message);
      return false;
    }
  }

  // --- AUTO-LOCK TIMEOUT ---
  public async getAutoLockTimeout(): Promise<AutoLockTimeout> {
    const val = await this.getSecureItem(KEYS.AUTO_LOCK);
    if (val === 'immediate' || val === '2m' || val === '5m' || val === 'never') {
      return val;
    }
    return '2m'; // Default 2 minutes
  }

  public async setAutoLockTimeout(timeout: AutoLockTimeout): Promise<void> {
    await this.setSecureItem(KEYS.AUTO_LOCK, timeout);
  }

  // --- LAST ACTIVE TIMESTAMP ---
  public async updateLastActiveTimestamp(): Promise<void> {
    await this.setSecureItem(KEYS.LAST_ACTIVE, Date.now().toString());
  }

  public async shouldLockOnResume(): Promise<boolean> {
    const pin = await this.getPin();
    if (!pin) return false; // If no PIN is configured, do not lock

    const timeout = await this.getAutoLockTimeout();
    if (timeout === 'never') return false;
    if (timeout === 'immediate') return true;

    const lastActiveStr = await this.getSecureItem(KEYS.LAST_ACTIVE);
    if (!lastActiveStr) return true;

    const lastActive = parseInt(lastActiveStr, 10);
    const elapsedSeconds = (Date.now() - lastActive) / 1000;

    if (timeout === '2m') {
      return elapsedSeconds >= 120; // 2 minutes
    }
    if (timeout === '5m') {
      return elapsedSeconds >= 300; // 5 minutes
    }

    return false;
  }
}

export const securityService = new SecurityService();
