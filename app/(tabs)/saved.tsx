// Saved listings screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/template';
import { ListingCard, EmptyState } from '@/components';
import { savedService } from '@/services/savedService';
import { colors, spacing, typography } from '@/constants/theme';
import type { SavedListing } from '@/types';

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedListings = async () => {
    if (!user) return;
    
    const { data } = await savedService.getSavedListings(user.id);
    if (data) {
      setSavedListings(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    loadSavedListings();
  }, [user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedListings();
  };

  const handleUnsave = async (listingId: string) => {
    if (!user) return;
    await savedService.unsaveListing(user.id, listingId);
    setSavedListings(prev => prev.filter(s => s.listing_id !== listingId));
  };

  const renderItem = ({ item }: { item: SavedListing }) => {
    if (!item.listing) return null;
    
    return (
      <ListingCard
        listing={{ ...item.listing, is_saved: true }}
        onPress={() => router.push(`/listing/${item.listing_id}`)}
        onSaveToggle={() => handleUnsave(item.listing_id)}
      />
    );
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : spacing.sm }]}>
        <Text style={styles.headerTitle}>Saved Listings</Text>
        <Text style={styles.headerSubtitle}>{savedListings.length} saved</Text>
      </View>

      {/* List */}
      {savedListings.length === 0 ? (
        <EmptyState
          icon="bookmark-border"
          title="No saved listings"
          message="Start saving listings to view them here for quick access"
        />
      ) : (
        <FlatList
          data={savedListings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
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
  listContent: {
    padding: spacing.md,
  },
});
