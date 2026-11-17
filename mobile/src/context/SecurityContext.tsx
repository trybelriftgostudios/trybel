import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { securityService, AutoLockTimeout } from '../services/security.service';

interface SecurityContextType {
  isLocked: boolean;
  hasPin: boolean;
  biometricsEnabled: boolean;
  biometricsAvailable: boolean;
  biometricsType: string;
  autoLockTimeout: AutoLockTimeout;
  unlockWithPin: (pin: string) => Promise<boolean>;
  unlockWithBiometrics: () => Promise<boolean>;
  setupPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
  toggleBiometrics: (enabled: boolean) => Promise<void>;
  updateAutoLockTimeout: (timeout: AutoLockTimeout) => Promise<void>;
  lockApp: () => void;
}

const SecurityContext = createContext<SecurityContextType>({
  isLocked: false,
  hasPin: false,
  biometricsEnabled: false,
  biometricsAvailable: false,
  biometricsType: 'None',
  autoLockTimeout: '2m',
  unlockWithPin: async () => false,
  unlockWithBiometrics: async () => false,
  setupPin: async () => {},
  removePin: async () => {},
  toggleBiometrics: async () => {},
  updateAutoLockTimeout: async () => {},
  lockApp: () => {}
});

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [hasPin, setHasPin] = useState(false);
  const [biometricsEnabled, setBiometricsEnabled] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [biometricsType, setBiometricsType] = useState('Biometrics');
  const [autoLockTimeout, setAutoLockTimeoutState] = useState<AutoLockTimeout>('2m');

  const appState = useRef(AppState.currentState);

  const loadSecurityState = useCallback(async () => {
    const pin = await securityService.getPin();
    const pinExists = !!pin;
    setHasPin(pinExists);

    const bioStatus = await securityService.isBiometricsAvailable();
    setBiometricsAvailable(bioStatus.available && bioStatus.enrolled);
    setBiometricsType(bioStatus.type);

    const bioEnabled = await securityService.isBiometricsEnabled();
    setBiometricsEnabled(bioEnabled);

    const timeout = await securityService.getAutoLockTimeout();
    setAutoLockTimeoutState(timeout);

    // Initial check on cold start
    if (pinExists) {
      setIsLocked(true);
      // If biometrics is enabled, attempt automatic biometric prompt
      if (bioEnabled && bioStatus.available && bioStatus.enrolled) {
        setTimeout(async () => {
          const success = await securityService.authenticateWithBiometrics();
          if (success) setIsLocked(false);
        }, 400);
      }
    }
  }, []);

  useEffect(() => {
    loadSecurityState();

    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        // App has come to the foreground!
        const shouldLock = await securityService.shouldLockOnResume();
        if (shouldLock) {
          setIsLocked(true);
          const bioEnabled = await securityService.isBiometricsEnabled();
          if (bioEnabled) {
            setTimeout(async () => {
              const success = await securityService.authenticateWithBiometrics();
              if (success) setIsLocked(false);
            }, 300);
          }
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App is moving to background: store timestamp
        await securityService.updateLastActiveTimestamp();
      }
      appState.current = nextAppState;
    };

    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => sub.remove();
  }, [loadSecurityState]);

  const unlockWithPin = async (enteredPin: string): Promise<boolean> => {
    const valid = await securityService.verifyPin(enteredPin);
    if (valid) {
      setIsLocked(false);
      await securityService.updateLastActiveTimestamp();
      return true;
    }
    return false;
  };

  const unlockWithBiometrics = async (): Promise<boolean> => {
    const success = await securityService.authenticateWithBiometrics('Unlock Trybel Campus');
    if (success) {
      setIsLocked(false);
      await securityService.updateLastActiveTimestamp();
      return true;
    }
    return false;
  };

  const setupPin = async (pin: string): Promise<void> => {
    await securityService.setPin(pin);
    setHasPin(true);
  };

  const removePin = async (): Promise<void> => {
    await securityService.removePin();
    setHasPin(false);
    setIsLocked(false);
  };

  const toggleBiometrics = async (enabled: boolean): Promise<void> => {
    await securityService.setBiometricsEnabled(enabled);
    setBiometricsEnabled(enabled);
  };

  const updateAutoLockTimeout = async (timeout: AutoLockTimeout): Promise<void> => {
    await securityService.setAutoLockTimeout(timeout);
    setAutoLockTimeoutState(timeout);
  };

  const lockApp = () => {
    if (hasPin) {
      setIsLocked(true);
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        isLocked,
        hasPin,
        biometricsEnabled,
        biometricsAvailable,
        biometricsType,
        autoLockTimeout,
        unlockWithPin,
        unlockWithBiometrics,
        setupPin,
        removePin,
        toggleBiometrics,
        updateAutoLockTimeout,
        lockApp
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};
