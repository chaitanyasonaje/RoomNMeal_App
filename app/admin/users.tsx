// Admin users management screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { EmptyState } from '@/components';
import { adminService } from '@/services/adminService';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import type { User } from '@/types';

export default function UsersScreen() {
  const { user: currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = async () => {
    const { data } = await adminService.getAllUsers();
    if (data) {
      setUsers(data as User[]);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers();
  };

  const handleBlockUser = (user: User) => {
    if (currentUser?.id === user.id) {
      showAlert('Error', 'You cannot block yourself');
      return;
    }

    Alert.prompt(
      'Block User',
      `Enter reason for blocking ${user.name || user.phone}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason || reason.trim().length === 0) {
              showAlert('Error', 'Please provide a reason');
              return;
            }
            if (!currentUser) return;

            const { error } = await adminService.blockUser(user.id, currentUser.id, reason.trim());
            if (error) {
              showAlert('Error', error);
            } else {
              showAlert('Success', 'User blocked');
              loadUsers();
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleUnblockUser = async (user: User) => {
    Alert.alert(
      'Unblock User',
      `Unblock ${user.name || user.phone}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: async () => {
            const { error } = await adminService.unblockUser(user.id);
            if (error) {
              showAlert('Error', error);
            } else {
              showAlert('Success', 'User unblocked');
              loadUsers();
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: User }) => {
    const isCurrentUser = currentUser?.id === item.id;
    
    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={28} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name || 'Unnamed User'}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
            <View style={styles.badges}>
              <View style={[styles.badge, getRoleBadgeStyle(item.role)]}>
                <Text style={styles.badgeText}>{item.role.toUpperCase()}</Text>
              </View>
              {item.is_blocked && (
                <View style={[styles.badge, styles.blockedBadge]}>
                  <Text style={styles.badgeText}>BLOCKED</Text>
                </View>
              )}
              {isCurrentUser && (
                <View style={[styles.badge, styles.youBadge]}>
                  <Text style={styles.badgeText}>YOU</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {!isCurrentUser && (
          <View style={styles.actions}>
            {item.is_blocked ? (
              <Pressable
                onPress={() => handleUnblockUser(item)}
                style={[styles.actionButton, styles.unblockButton]}
              >
                <MaterialIcons name="check" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Unblock</Text>
              </Pressable>
            ) : (
              <Pressable
                onPress={() => handleBlockUser(item)}
                style={[styles.actionButton, styles.blockButton]}
              >
                <MaterialIcons name="block" size={18} color="#FFF" />
                <Text style={styles.actionButtonText}>Block</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    );
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'admin':
        return styles.adminBadge;
      case 'owner':
        return styles.ownerBadge;
      default:
        return styles.userBadge;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {users.length === 0 ? (
        <EmptyState icon="people-outline" title="No users" message="No users found" />
      ) : (
        <FlatList
          data={users}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Manage Users</Text>
              <Text style={styles.headerSubtitle}>{users.length} total users</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.md,
  },
  userCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  adminBadge: {
    backgroundColor: colors.error,
  },
  ownerBadge: {
    backgroundColor: colors.primary,
  },
  userBadge: {
    backgroundColor: colors.info,
  },
  blockedBadge: {
    backgroundColor: colors.textTertiary,
  },
  youBadge: {
    backgroundColor: colors.verified,
  },
  badgeText: {
    fontSize: typography.tiny,
    fontWeight: typography.bold,
    color: '#FFF',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    gap: spacing.xs,
  },
  blockButton: {
    backgroundColor: colors.error,
  },
  unblockButton: {
    backgroundColor: colors.verified,
  },
  actionButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.semibold,
    color: '#FFF',
  },
});
