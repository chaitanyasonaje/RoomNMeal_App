// Owner's listing management screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/template';
import { ListingCard, EmptyState, Button } from '@/components';
import { listingService } from '@/services/listingService';
import { colors, spacing, typography } from '@/constants/theme';
import type { Listing } from '@/types';

export default function MyListingsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadListings = async () => {
    if (!user) return;

    const { data } = await listingService.getOwnerListings(user.id);
    if (data) {
      setListings(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadListings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const handleToggleAvailability = async (listing: Listing) => {
    await listingService.updateListing(listing.id, {
      is_available: !listing.is_available,
    });
    loadListings();
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <View style={styles.listingItem}>
      <ListingCard
        listing={item}
        onPress={() => router.push(`/listing/${item.id}`)}
        showSaveButton={false}
      />
      
      {/* Status badges */}
      <View style={styles.statusRow}>
        {!item.is_verified && !item.rejection_reason && (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Text style={styles.statusText}>Pending Approval</Text>
          </View>
        )}
        {item.rejection_reason && (
          <View style={[styles.statusBadge, styles.rejectedBadge]}>
            <Text style={styles.statusText}>Rejected: {item.rejection_reason}</Text>
          </View>
        )}
        {!item.is_available && (
          <View style={[styles.statusBadge, styles.unavailableBadge]}>
            <Text style={styles.statusText}>Unavailable</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          onPress={() => router.push(`/edit-listing/${item.id}`)}
          style={styles.actionButton}
        >
          <MaterialIcons name="edit" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Edit</Text>
        </Pressable>

        <Pressable
          onPress={() => handleToggleAvailability(item)}
          style={styles.actionButton}
        >
          <MaterialIcons
            name={item.is_available ? 'visibility-off' : 'visibility'}
            size={20}
            color={colors.textSecondary}
          />
          <Text style={styles.actionText}>
            {item.is_available ? 'Mark Unavailable' : 'Mark Available'}
          </Text>
        </Pressable>

        <View style={styles.stats}>
          <Text style={styles.statText}>{item.view_count} views</Text>
          <Text style={styles.statText}>{item.contact_count} contacts</Text>
        </View>
      </View>
    </View>
  );

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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : spacing.sm }]}>
        <Text style={styles.headerTitle}>My Listings</Text>
        <Text style={styles.headerSubtitle}>{listings.length} total listings</Text>
      </View>

      {listings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <EmptyState
            icon="add-home"
            title="No listings yet"
            message="Add your first room/PG or mess listing to get started"
          />
          <View style={styles.addButtonContainer}>
            <Button
              title="Add Your First Listing"
              onPress={() => router.push('/add-listing')}
              icon={<MaterialIcons name="add" size={20} color="#FFF" />}
            />
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={listings}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
            }
          />
          
          {/* FAB */}
          <Pressable
            onPress={() => router.push('/add-listing')}
            style={styles.fab}
          >
            <MaterialIcons name="add" size={28} color="#FFF" />
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  addButtonContainer: {
    padding: spacing.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  listingItem: {
    marginBottom: spacing.lg,
  },
  statusRow: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  pendingBadge: {
    backgroundColor: colors.warning + '20',
  },
  rejectedBadge: {
    backgroundColor: colors.error + '20',
  },
  unavailableBadge: {
    backgroundColor: colors.textTertiary + '20',
  },
  statusText: {
    fontSize: typography.caption,
    fontWeight: typography.medium,
    color: colors.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  stats: {
    marginLeft: 'auto',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});
