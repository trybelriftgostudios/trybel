import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { useSecurity } from '../context/SecurityContext';
import { colors } from '../theme/colors';

export const AppLockOverlay: React.FC = () => {
  const { isLocked, unlockWithPin, unlockWithBiometrics, biometricsAvailable, biometricsType } = useSecurity();
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  if (!isLocked) return null;

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
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
        setErrorMessage('Incorrect PIN. Please try again.');
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
        <View style={styles.shieldIcon}>
          <Text style={styles.lockEmoji}>🔒</Text>
        </View>

        <Text style={styles.title}>Trybel Campus Lock</Text>
        <Text style={styles.subtitle}>Enter your 4-digit security PIN to access your verified college network</Text>

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

        {/* Numeric Keypad */}
        <View style={styles.keypad}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9']
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.keypadRow}>
              {row.map((digit) => (
                <TouchableOpacity
                  key={digit}
                  style={styles.keyButton}
                  onPress={() => handlePressNumber(digit)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keyNumber}>{digit}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Bottom Row */}
          <View style={styles.keypadRow}>
            {biometricsAvailable && Platform.OS !== 'web' ? (
              <TouchableOpacity
                style={[styles.keyButton, styles.bioButton]}
                onPress={unlockWithBiometrics}
                activeOpacity={0.7}
              >
                <Text style={styles.bioIcon}>
                  {biometricsType === 'Face ID' ? '👤' : '👆'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.keyButtonEmpty} />
            )}

            <TouchableOpacity
              style={styles.keyButton}
              onPress={() => handlePressNumber('0')}
              activeOpacity={0.7}
            >
              <Text style={styles.keyNumber}>0</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.keyButton, styles.delButton]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Text style={styles.delIcon}>⌫</Text>
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
    backgroundColor: '#0A0E17',
    zIndex: 999999,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignItems: 'center',
    paddingHorizontal: 24
  },
  shieldIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#162032',
    borderWidth: 1.5,
    borderColor: '#2A3C58',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  lockEmoji: {
    fontSize: 32
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: -0.3
  },
  subtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
    lineHeight: 18
  },
  dotsRow: {
    flexDirection: 'row',
    marginVertical: 26,
    gap: 16
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#334155',
    backgroundColor: 'transparent'
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  dotError: {
    borderColor: colors.danger,
    backgroundColor: colors.danger
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 10
  },
  keypad: {
    width: '100%',
    maxWidth: 290,
    marginTop: 10
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  keyButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#161F30',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#26354D'
  },
  keyButtonEmpty: {
    width: 72,
    height: 72
  },
  keyNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: '#F8FAFC'
  },
  bioButton: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8'
  },
  bioIcon: {
    fontSize: 24
  },
  delButton: {
    backgroundColor: '#1E293B'
  },
  delIcon: {
    fontSize: 22,
    color: '#94A3B8'
  }
});
