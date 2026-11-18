import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSecurity } from '../context/SecurityContext';
import { colors } from '../theme/colors';

interface KeypadDigit {
  digit: string;
  letters?: string;
}

const KEYPAD_ROWS: KeypadDigit[][] = [
  [{ digit: '1' }, { digit: '2', letters: 'A B C' }, { digit: '3', letters: 'D E F' }],
  [{ digit: '4', letters: 'G H I' }, { digit: '5', letters: 'J K L' }, { digit: '6', letters: 'M N O' }],
  [{ digit: '7', letters: 'P Q R S' }, { digit: '8', letters: 'T U V' }, { digit: '9', letters: 'W X Y Z' }],
];

export const AppLockOverlay: React.FC = () => {
  const { isLocked, unlockWithPin, unlockWithBiometrics, biometricsAvailable, biometricsType } = useSecurity();
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  if (!isLocked) return null;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true })
    ]).start();
  };

  const handlePressNumber = async (digit: string) => {
    if (enteredPin.length >= 4) return;
    const nextPin = enteredPin + digit;
    setEnteredPin(nextPin);
    setErrorMessage('');

    if (nextPin.length === 4) {
      const success = await unlockWithPin(nextPin);
      if (!success) {
        triggerShake();
        setErrorMessage('Incorrect Passcode');
        setTimeout(() => setEnteredPin(''), 300);
      }
    }
  };

  const handleDelete = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
      setErrorMessage('');
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.content}>
        <View style={styles.lockIconContainer}>
          <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>Enter Passcode</Text>
        <Text style={styles.subtitle}>Unlock Trybel to access your campus network</Text>

        {/* PIN Dots with Shake */}
        <Animated.View style={[styles.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
          {[0, 1, 2, 3].map((index) => {
            const isFilled = index < enteredPin.length;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  isFilled && styles.dotFilled,
                  errorMessage ? styles.dotError : null
                ]}
              />
            );
          })}
        </Animated.View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        {/* Apple Style Numeric Keypad */}
        <View style={styles.keypad}>
          {KEYPAD_ROWS.map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((item) => (
                <TouchableOpacity
                  key={item.digit}
                  style={styles.keyButton}
                  onPress={() => handlePressNumber(item.digit)}
                  activeOpacity={0.4}
                >
                  <Text style={styles.keyNumber}>{item.digit}</Text>
                  {item.letters ? <Text style={styles.keySubtext}>{item.letters}</Text> : null}
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Bottom Row */}
          <View style={styles.keypadRow}>
            {biometricsAvailable && Platform.OS !== 'web' ? (
              <TouchableOpacity
                style={[styles.keyButton, styles.transparentButton]}
                onPress={unlockWithBiometrics}
                activeOpacity={0.4}
              >
                <Ionicons
                  name={biometricsType === 'Face ID' ? 'scan' : 'finger-print'}
                  size={28}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            ) : (
              <View style={styles.keyButtonEmpty} />
            )}

            <TouchableOpacity
              style={styles.keyButton}
              onPress={() => handlePressNumber('0')}
              activeOpacity={0.4}
            >
              <Text style={styles.keyNumber}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.keyButton, styles.transparentButton]}
              onPress={handleDelete}
              activeOpacity={0.4}
            >
              <Ionicons name="backspace-outline" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    paddingHorizontal: 20
  },
  lockIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(235, 235, 245, 0.6)',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 24,
    lineHeight: 18
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 28,
    marginBottom: 24,
    gap: 18
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'transparent'
  },
  dotFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF'
  },
  dotError: {
    borderColor: '#FF453A',
    backgroundColor: '#FF453A'
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12
  },
  keypad: {
    width: '100%',
    maxWidth: 290,
    marginTop: 10
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  keyButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  transparentButton: {
    backgroundColor: 'transparent'
  },
  keyButtonEmpty: {
    width: 76,
    height: 76
  },
  keyNumber: {
    fontSize: 30,
    fontWeight: '400',
    color: '#FFFFFF'
  },
  keySubtext: {
    fontSize: 9,
    fontWeight: '600',
    color: 'rgba(235, 235, 245, 0.6)',
    letterSpacing: 1.5,
    marginTop: 1
  }
});
