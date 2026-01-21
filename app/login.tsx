// Phone OTP Authentication Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useAlert } from '@/template';
import { Button, Input } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { config } from '@/constants/config';

export default function LoginScreen() {
  const { sendOTP, verifyOTPAndLogin, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  const router = useRouter();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = async () => {
    // Basic phone validation (digits only, at least 10)
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      showAlert('Invalid Phone', 'Please enter a valid phone number (10 digits)');
      return;
    }
    
    // Format phone number with country code if needed
    // Assuming India (+91) if no country code provided
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+91${cleanPhone.slice(-10)}`;
    }

    const { error } = await sendOTP(formattedPhone);

    if (error) {
      showAlert('Error', error);
      return;
    }

    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      showAlert('Invalid OTP', 'Please enter a 6-digit OTP');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    let formattedPhone = phone;
    if (!phone.startsWith('+')) {
      formattedPhone = `+91${cleanPhone.slice(-10)}`;
    }

    const { error } = await verifyOTPAndLogin(formattedPhone, otp);

    if (error) {
      showAlert('Login Failed', error);
      return;
    }

    // Success - AuthRouter will handle navigation
  };

  const handleChangePhone = () => {
    setStep('phone');
    setOtp('');
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
              {step === 'phone' ? 'Login with Phone' : 'Enter OTP'}
            </Text>
            <Text style={styles.formSubtitle}>
              {step === 'phone' 
                ? 'Enter your mobile number to receive a verification code' 
                : `We sent a code to ${phone}`}
            </Text>

            {step === 'phone' ? (
              <Input
                label="Phone Number"
                placeholder="+91 98765 43210"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoFocus
              />
            ) : (
              <Input
                label="Verification Code"
                placeholder="123456"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />
            )}

            <Button
              title={step === 'phone' ? "Get OTP" : "Verify & Login"}
              onPress={step === 'phone' ? handleSendOTP : handleVerifyOTP}
              loading={operationLoading}
              style={styles.submitButton}
            />

            {step === 'otp' && (
              <Button
                title="Change Phone Number"
                variant="outline"
                onPress={handleChangePhone}
                disabled={operationLoading}
                style={styles.changePhoneButton}
              />
            )}
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: typography.h1,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  formTitle: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  changePhoneButton: {
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    maxWidth: 250,
  },
});
