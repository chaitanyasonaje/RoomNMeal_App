// Admin pending approvals screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth, useAlert } from '@/template';
import { ListingCard, EmptyState } from '@/components';
import { listingService } from '@/services/listingService';
import { adminService } from '@/services/adminService';
import { colors, spacing, typography } from '@/constants/theme';
import type { Listing } from '@/types';

export default function PendingApprovalsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = async () => {
    const { data } = await listingService.getPendingListings();
    if (data) {
      setListings(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const handleApprove = async (listing: Listing) => {
    if (!user) return;

    Alert.alert(
      'Approve Listing',
      `Approve "${listing.title}"? This will make it visible to all users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            const { error } = await adminService.approveListing(listing.id, user.id);
            if (error) {
              showAlert('Error', error);
            } else {
              showAlert('Success', 'Listing approved');
              loadListings();
            }
          },
        },
      ]
    );
  };

  const handleReject = (listing: Listing) => {
    if (!user) return;

    Alert.prompt(
      'Reject Listing',
      `Enter rejection reason for "${listing.title}":`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason) => {
            if (!reason || reason.trim().length === 0) {
              showAlert('Error', 'Please provide a rejection reason');
              return;
            }
            const { error } = await adminService.rejectListing(listing.id, user.id, reason.trim());
            if (error) {
              showAlert('Error', error);
            } else {
              showAlert('Success', 'Listing rejected');
              loadListings();
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.listingItem}>
      <ListingCard
        listing={item}
        onPress={() => router.push(`/listing/${item.id}`)}
        showSaveButton={false}
      />
      
      {/* Owner info */}
      <View style={styles.ownerInfo}>
        <MaterialIcons name="person" size={16} color={colors.textSecondary} />
        <Text style={styles.ownerText}>
          Owner: {item.owner?.name || 'Unknown'} • {item.owner?.phone}
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => handleApprove(item)}
          style={[styles.actionButton, styles.approveButton]}
        >
          <MaterialIcons name="check-circle" size={20} color="#FFF" />
          <Text style={styles.approveText}>Approve</Text>
        </Pressable>

        <Pressable
          onPress={() => handleReject(item)}
          style={[styles.actionButton, styles.rejectButton]}
        >
          <MaterialIcons name="cancel" size={20} color="#FFF" />
          <Text style={styles.rejectText}>Reject</Text>
        </Pressable>
      </View>
    </View>
  );

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
      {listings.length === 0 ? (
        <EmptyState
          icon="check-circle-outline"
          title="All caught up!"
          message="No pending listings to review"
        />
      ) : (
        <FlatList
          data={listings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Pending Approvals</Text>
              <Text style={styles.headerSubtitle}>{listings.length} listings</Text>
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
  listingItem: {
    marginBottom: spacing.xl,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  ownerText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    gap: spacing.sm,
  },
  approveButton: {
    backgroundColor: colors.verified,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  approveText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: '#FFF',
  },
  rejectText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: '#FFF',
  },
});
