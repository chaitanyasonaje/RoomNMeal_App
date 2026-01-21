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
  const [selectedRole, setSelectedRole] = useState<'user' | 'owner'>('user');
  const [name, setName] = useState('');

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

    if (!name.trim()) {
      showAlert('Name Required', 'Please enter your name');
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

    // Pass role and name as metadata during signup
    const { error } = await signUpWithPassword(email, password, {
      role: selectedRole,
      name: name.trim(),
    });

    if (error) {
      showAlert('Signup Failed', error);
      return;
    }

    // Success - AuthRouter will handle navigation automatically
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

            {!isLogin && (
              <>
                <Text style={styles.roleLabel}>I want to:</Text>
                <View style={styles.roleSelector}>
                  <Pressable
                    onPress={() => setSelectedRole('user')}
                    style={[
                      styles.roleOption,
                      selectedRole === 'user' && styles.roleOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.roleOptionIcon,
                      selectedRole === 'user' && styles.roleOptionIconSelected
                    ]}>🔍</Text>
                    <Text style={[
                      styles.roleOptionTitle,
                      selectedRole === 'user' && styles.roleOptionTitleSelected
                    ]}>Find Room/Mess</Text>
                    <Text style={[
                      styles.roleOptionDesc,
                      selectedRole === 'user' && styles.roleOptionDescSelected
                    ]}>I'm looking for accommodation</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setSelectedRole('owner')}
                    style={[
                      styles.roleOption,
                      selectedRole === 'owner' && styles.roleOptionSelected
                    ]}
                  >
                    <Text style={[
                      styles.roleOptionIcon,
                      selectedRole === 'owner' && styles.roleOptionIconSelected
                    ]}>🏠</Text>
                    <Text style={[
                      styles.roleOptionTitle,
                      selectedRole === 'owner' && styles.roleOptionTitleSelected
                    ]}>List Property/Mess</Text>
                    <Text style={[
                      styles.roleOptionDesc,
                      selectedRole === 'owner' && styles.roleOptionDescSelected
                    ]}>I have rooms/mess to offer</Text>
                  </Pressable>
                </View>
              </>
            )}

            <Input
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus={isLogin}
            />
            
            {!isLogin && (
              <Input
                label="Full Name"
                placeholder="Enter your name"
                value={name}
                onChangeText={setName}
              />
            )}
            
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
                setName('');
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
  roleLabel: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleOption: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  roleOptionIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  roleOptionIconSelected: {
    transform: [{ scale: 1.1 }],
  },
  roleOptionTitle: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  roleOptionTitleSelected: {
    color: '#FFFFFF',
  },
  roleOptionDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  roleOptionDescSelected: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
