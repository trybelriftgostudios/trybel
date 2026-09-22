import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { api } from '../services/api';

interface VerifyScreenProps {
  onVerified: () => void;
}

export const VerifyScreen: React.FC<VerifyScreenProps> = ({ onVerified }) => {
  const [email, setEmail] = useState('sritan@stpeters.edu'); // Pre-fill default pilot email for convenience
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [otp, setOtp] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  const handleSendLink = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.sendVerification(email.trim());
      setLinkSent(true);
      setSuccessInfo(`Verification link sent! Matched campus: ${res.college.name}`);
    } catch (err: any) {
      setError(err.message || 'Failed to verify email domain');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.verifyToken({ email: email.trim(), otp: otp.trim() });
      onVerified();
    } catch (err: any) {
      setError(err.message || 'Invalid verification token');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setError(null);
    setLoading(true);
    try {
      await api.oauthLogin(provider, email.trim(), 'Sritan Vesangi');
      onVerified();
    } catch (err: any) {
      setError(err.message || 'OAuth college domain mismatch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Text style={styles.iconCap}>🎓</Text>
      </View>

      <Text style={styles.title}>Verify Your College</Text>
      <Text style={styles.subtitle}>Enter your college email to join Trybel.</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {successInfo && (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{successInfo}</Text>
        </View>
      )}

      {!linkSent ? (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>✉</Text>
            <TextInput
              style={styles.input}
              placeholder="you@college.edu"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSendLink} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#0A0E17" /> : <Text style={styles.submitBtnText}>Send Verification Link</Text>}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <Text style={styles.inputIcon}>🔑</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit Code (Dev OTP: 123456)"
              placeholderTextColor={colors.textMuted}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleVerifyOtp} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator color="#0A0E17" /> : <Text style={styles.submitBtnText}>Confirm & Continue</Text>}
          </TouchableOpacity>
        </>
      )}

      {/* Or continue with OAuth */}
      <View style={styles.dividerRow}>
        <View style={styles.line} />
        <Text style={styles.orText}>or continue with</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.oauthRow}>
        <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('google')}>
          <Text style={styles.oauthIcon}>G</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.oauthBtn} onPress={() => handleOAuth('apple')}>
          <Text style={styles.oauthIcon}></Text>
        </TouchableOpacity>
      </View>

      <View style={styles.securityNote}>
        <Text style={styles.checkIcon}>✓</Text>
        <Text style={styles.securityText}>Only verified college students can join Trybel.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: 70,
    paddingHorizontal: 24,
    alignItems: 'center'
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  iconCap: {
    fontSize: 38
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center'
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.danger,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 16
  },
  errorText: {
    color: colors.dangerText,
    fontSize: 13,
    textAlign: 'center'
  },
  successBox: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    width: '100%',
    marginBottom: 16
  },
  successText: {
    color: '#34D399',
    fontSize: 13,
    textAlign: 'center'
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.inputBg,
    borderColor: colors.inputBorder,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 52
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    color: colors.textSecondary
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15
  },
  submitBtn: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32
  },
  submitBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700'
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  orText: {
    marginHorizontal: 12,
    color: colors.textMuted,
    fontSize: 12
  },
  oauthRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 44
  },
  oauthBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.card,
    borderColor: colors.cardBorder,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  oauthIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 30
  },
  checkIcon: {
    color: colors.primary,
    fontWeight: '800',
    marginRight: 6
  },
  securityText: {
    color: colors.textMuted,
    fontSize: 12
  }
});
