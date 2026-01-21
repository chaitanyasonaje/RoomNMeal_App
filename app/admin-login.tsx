// Admin-only login screen with fixed credentials
import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth, useAlert } from '@/template';
import { Button, Input } from '@/components';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const ADMIN_EMAIL = 'admin@roomnmeal.com';
const ADMIN_PASSWORD = 'admin123';

export default function AdminLoginScreen() {
  const router = useRouter();
  const { signInWithPassword, operationLoading } = useAuth();
  const { showAlert } = useAlert();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAdminLogin = async () => {
    // Check credentials
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      showAlert('Access Denied', 'Invalid admin credentials');
      return;
    }

    // Authenticate with backend
    const { error } = await signInWithPassword(email, password);

    if (error) {
      showAlert('Login Failed', error);
      return;
    }

    // Success - will redirect to admin dashboard
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="admin-panel-settings" size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>Admin Access</Text>
            <Text style={styles.subtitle}>RoomNMeal Platform Management</Text>
          </View>

          {/* Credentials Display */}
          <View style={styles.credentialsBox}>
            <Text style={styles.credentialsTitle}>🔐 Admin Credentials</Text>
            <View style={styles.credentialRow}>
              <Text style={styles.credentialLabel}>Email:</Text>
              <Text style={styles.credentialValue}>{ADMIN_EMAIL}</Text>
            </View>
            <View style={styles.credentialRow}>
              <Text style={styles.credentialLabel}>Password:</Text>
              <Text style={styles.credentialValue}>{ADMIN_PASSWORD}</Text>
            </View>
          </View>

          {/* Login Form */}
          <View style={styles.form}>
            <Input
              label="Admin Email"
              placeholder="admin@roomnmeal.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Input
              label="Password"
              placeholder="Enter admin password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Button
              title="Login as Admin"
              onPress={handleAdminLogin}
              loading={operationLoading}
            />
          </View>

          {/* Warning */}
          <View style={styles.warningBox}>
            <MaterialIcons name="warning" size={24} color={colors.warning} />
            <Text style={styles.warningText}>
              This is a restricted area. Only authorized platform administrators should access this portal.
            </Text>
          </View>

          {/* Back button */}
          <Button
            title="Back to Regular Login"
            onPress={() => router.back()}
            variant="outline"
          />
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
  iconContainer: {
    width: 120,
    height: 120,
    backgroundColor: colors.primaryLight,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  credentialsBox: {
    backgroundColor: colors.primaryLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  credentialsTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  credentialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  credentialLabel: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    width: 80,
  },
  credentialValue: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: '#FFFFFF',
    flex: 1,
  },
  form: {
    marginBottom: spacing.xl,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '15',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
    lineHeight: 20,
  },
});
