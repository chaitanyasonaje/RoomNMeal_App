// Email OTP Authentication Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useAlert } from '@/template';
import { Button, Input } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { config } from '@/constants/config';

export default function LoginScreen() {
  const { sendOTP, verifyOTPAndLogin, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [otp, setOTP] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    const { error } = await sendOTP(email);

    if (error) {
      showAlert('Error', error);
      return;
    }

    setShowOTPInput(true);
    showAlert('OTP Sent', `Check your email: ${email}`);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      showAlert('Invalid OTP', 'Please enter the 4-digit OTP');
      return;
    }

    const { error } = await verifyOTPAndLogin(email, otp);

    if (error) {
      showAlert('Verification Failed', error);
      return;
    }

    // Success - AuthRouter will handle navigation
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Branding */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🏠</Text>
            </View>
            <Text style={styles.appName}>{config.appName}</Text>
            <Text style={styles.tagline}>{config.tagline}</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.formTitle}>
              {showOTPInput ? 'Enter OTP' : 'Login with Email'}
            </Text>

            {!showOTPInput ? (
              <>
                <Input
                  label="Email Address"
                  placeholder="your@email.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus
                />
                <Button
                  title="Send OTP"
                  onPress={handleSendOTP}
                  loading={operationLoading}
                />
                <Text style={styles.otpNote}>
                  💡 We'll send a 4-digit code to your email
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.otpHint}>
                  Check your email inbox for the 4-digit code
                </Text>
                <Text style={styles.emailDisplay}>{email}</Text>
                <Input
                  label="OTP Code"
                  placeholder="Enter 4-digit code"
                  value={otp}
                  onChangeText={setOTP}
                  keyboardType="number-pad"
                  maxLength={4}
                  autoFocus
                />
                <Button
                  title="Verify & Login"
                  onPress={handleVerifyOTP}
                  loading={operationLoading}
                  disabled={otp.length !== 4}
                />
                <Button
                  title="Change Email"
                  onPress={() => {
                    setShowOTPInput(false);
                    setOTP('');
                  }}
                  variant="outline"
                />
              </>
            )}
          </View>

          {/* Trust indicators */}
          <View style={styles.trustSection}>
            <Text style={styles.trustTitle}>Why RoomNMeal?</Text>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>✓</Text>
              <Text style={styles.trustText}>All listings manually verified</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>✓</Text>
              <Text style={styles.trustText}>No broker charges</Text>
            </View>
            <View style={styles.trustItem}>
              <Text style={styles.trustIcon}>✓</Text>
              <Text style={styles.trustText}>Direct contact with owners</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing.xl,
  },
  formTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  otpHint: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  otpNote: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  emailDisplay: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  trustSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  trustTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  trustIcon: {
    fontSize: 20,
    color: colors.verified,
    marginRight: spacing.sm,
    width: 24,
  },
  trustText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    flex: 1,
  },
});
