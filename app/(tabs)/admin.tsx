// Admin dashboard screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/template';
import { Button } from '@/components';
import { adminService } from '@/services/adminService';
import { listingService } from '@/services/listingService';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import type { DashboardStats, Listing } from '@/types';

export default function AdminScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    // Load stats
    const { data: statsData } = await adminService.getDashboardStats();
    if (statsData) {
      setStats(statsData);
    }

    // Load pending listings
    const { data: pendingData } = await listingService.getPendingListings();
    if (pendingData) {
      setPendingListings(pendingData);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : spacing.sm }]}>
          <MaterialIcons name="admin-panel-settings" size={40} color={colors.primary} />
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Manage platform & listings</Text>
        </View>

        {/* Stats cards */}
        {stats && (
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.primaryCard]}>
              <MaterialIcons name="pending-actions" size={32} color={colors.warning} />
              <Text style={styles.statValue}>{stats.pending_listings}</Text>
              <Text style={styles.statLabel}>Pending Approval</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="verified" size={32} color={colors.verified} />
              <Text style={styles.statValue}>{stats.verified_listings}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="list" size={32} color={colors.primary} />
              <Text style={styles.statValue}>{stats.total_listings}</Text>
              <Text style={styles.statLabel}>Total Listings</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="people" size={32} color={colors.info} />
              <Text style={styles.statValue}>{stats.total_users}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="home" size={32} color={colors.textSecondary} />
              <Text style={styles.statValue}>{stats.total_rooms}</Text>
              <Text style={styles.statLabel}>Rooms/PG</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="restaurant" size={32} color={colors.textSecondary} />
              <Text style={styles.statValue}>{stats.total_mess}</Text>
              <Text style={styles.statLabel}>Mess/Tiffin</Text>
            </View>
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <Pressable
            onPress={() => router.push('/admin/pending-approvals')}
            style={styles.actionCard}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="approval" size={28} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Review Pending Listings</Text>
              <Text style={styles.actionDescription}>
                {pendingListings.length} listings waiting for approval
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/admin/all-listings')}
            style={styles.actionCard}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="list-alt" size={28} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage All Listings</Text>
              <Text style={styles.actionDescription}>
                View, edit, or remove any listing
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/admin/users')}
            style={styles.actionCard}
          >
            <View style={styles.actionIcon}>
              <MaterialIcons name="people-outline" size={28} color={colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Manage Users</Text>
              <Text style={styles.actionDescription}>
                View and moderate user accounts
              </Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
          </Pressable>
        </View>

        {/* Recent pending preview */}
        {pendingListings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Pending Listings</Text>
            {pendingListings.slice(0, 3).map(listing => (
              <Pressable
                key={listing.id}
                onPress={() => router.push(`/admin/review/${listing.id}`)}
                style={styles.pendingItem}
              >
                <View>
                  <Text style={styles.pendingTitle} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <Text style={styles.pendingMeta}>
                    {listing.type} • {listing.city} • ₹{listing.price.toLocaleString('en-IN')}
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  primaryCard: {
    backgroundColor: colors.warning + '10',
    borderWidth: 2,
    borderColor: colors.warning,
  },
  statValue: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  statLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  actionDescription: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  pendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  pendingTitle: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pendingMeta: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
