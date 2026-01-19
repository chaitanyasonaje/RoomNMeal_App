// Profile and settings screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { Button, Input } from '@/components';
import { userService } from '@/services/userService';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { config } from '@/constants/config';
import type { UserRole } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, operationLoading } = useAuth();
  const { showAlert } = useAlert();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name || '');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await userService.updateProfile(user.id, { name });
    setSaving(false);

    if (error) {
      showAlert('Error', error);
      return;
    }

    showAlert('Success', 'Profile updated successfully');
    setEditing(false);
  };

  const handleSwitchToOwner = async () => {
    if (!user) return;

    Alert.alert(
      'Switch to Owner Account',
      'You will be able to add and manage listings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Switch',
          onPress: async () => {
            const { error } = await userService.updateRole(user.id, 'owner');
            if (error) {
              showAlert('Error', error);
            } else {
              showAlert('Success', 'You can now add listings');
              router.replace('/(tabs)/my-listings');
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    const { error } = await logout();
    if (error) {
      showAlert('Error', error);
    }
  };

  const isOwner = user?.role === 'owner';
  const isAdmin = user?.role === 'admin';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : spacing.sm }]}>
          <View style={styles.avatarContainer}>
            <MaterialIcons name="person" size={48} color={colors.primary} />
          </View>
          <Text style={styles.phone}>{user?.phone || 'Not set'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {isAdmin ? 'ADMIN' : isOwner ? 'OWNER' : 'USER'}
            </Text>
          </View>
        </View>

        {/* Profile Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          {editing ? (
            <>
              <Input
                label="Name"
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
              />
              <View style={styles.buttonRow}>
                <View style={styles.buttonHalf}>
                  <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" />
                </View>
                <View style={styles.buttonHalf}>
                  <Button title="Save" onPress={handleSaveProfile} loading={saving} />
                </View>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{name || 'Not set'}</Text>
              </View>
              <Button title="Edit Profile" onPress={() => setEditing(true)} variant="outline" />
            </>
          )}
        </View>

        {/* Owner actions */}
        {isOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Owner Actions</Text>
            <Button
              title="Add New Listing"
              onPress={() => router.push('/add-listing')}
              icon={<MaterialIcons name="add" size={20} color="#FFF" />}
            />
          </View>
        )}

        {/* Switch to owner */}
        {!isOwner && !isAdmin && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Become an Owner</Text>
            <Text style={styles.sectionDescription}>
              Have a room/PG or mess service? Switch to owner mode to add your listings.
            </Text>
            <Button title="Switch to Owner Account" onPress={handleSwitchToOwner} variant="outline" />
          </View>
        )}

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>{config.tagline}</Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>

        {/* Logout */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
          loading={operationLoading}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Made with ❤️ for Indian students</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  phone: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  roleText: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionDescription: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  buttonHalf: {
    flex: 1,
  },
  aboutText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  versionText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  footer: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.bodySmall,
    color: colors.textTertiary,
  },
});
