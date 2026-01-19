// Phone OTP Authentication Screen
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

  const [phone, setPhone] = useState('');
  const [otp, setOTP] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      showAlert('Invalid phone number', 'Please enter a valid 10-digit phone number');
      return;
    }

    const email = `${phone}@roommeal.app`;
    const { error } = await sendOTP(email);

    if (error) {
      showAlert('Error', error);
      return;
    }

    setShowOTPInput(true);
    showAlert('OTP Sent', `Verification code sent to ${phone}`);
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 4) {
      showAlert('Invalid OTP', 'Please enter the 4-digit OTP');
      return;
    }

    const email = `${phone}@roommeal.app`;
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
              {showOTPInput ? 'Enter OTP' : 'Login with Phone'}
            </Text>

            {!showOTPInput ? (
              <>
                <Input
                  label="Phone Number"
                  placeholder="Enter 10-digit phone number"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  maxLength={10}
                  autoFocus
                />
                <Button
                  title="Send OTP"
                  onPress={handleSendOTP}
                  loading={operationLoading}
                  disabled={phone.length < 10}
                />
              </>
            ) : (
              <>
                <Text style={styles.otpHint}>
                  Enter the 4-digit code sent to {phone}
                </Text>
                <Input
                  label="OTP"
                  placeholder="Enter 4-digit OTP"
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
                  title="Change Number"
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
    marginBottom: spacing.md,
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
