// Email + Password Authentication Screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useAlert } from '@/template';
import { Button, Input } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { config } from '@/constants/config';

export default function LoginScreen() {
  const { signInWithPassword, signUpWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      showAlert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    const { error } = await signInWithPassword(email, password);

    if (error) {
      showAlert('Login Failed', error);
      return;
    }

    // Success - AuthRouter will handle navigation
  };

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      showAlert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      showAlert('Invalid Password', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Password Mismatch', 'Passwords do not match');
      return;
    }

    const { error, needsEmailConfirmation } = await signUpWithPassword(email, password);

    if (error) {
      showAlert('Signup Failed', error);
      return;
    }

    if (needsEmailConfirmation) {
      showAlert('Success', 'Please check your email to confirm your account');
    } else {
      // Success - AuthRouter will handle navigation
    }
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
              {isLogin ? 'Login' : 'Create Account'}
            </Text>

            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus={isLogin}
            />
            <Input
              label="Password"
              placeholder="Enter password (min 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            {!isLogin && (
              <Input
                label="Confirm Password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
            )}

            <Button
              title={isLogin ? 'Login' : 'Sign Up'}
              onPress={isLogin ? handleLogin : handleSignup}
              loading={operationLoading}
            />

            {/* Toggle between login and signup */}
            <Pressable
              onPress={() => {
                setIsLogin(!isLogin);
                setPassword('');
                setConfirmPassword('');
              }}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleText}>
                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                <Text style={styles.toggleTextBold}>
                  {isLogin ? 'Sign Up' : 'Login'}
                </Text>
              </Text>
            </Pressable>
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
  toggleButton: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  toggleTextBold: {
    fontWeight: typography.semibold,
    color: colors.primary,
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
