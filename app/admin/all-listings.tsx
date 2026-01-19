// Admin all listings screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ListingCard, EmptyState, FilterChip } from '@/components';
import { adminService } from '@/services/adminService';
import { colors, spacing, typography } from '@/constants/theme';
import type { Listing } from '@/types';
import { ScrollView } from 'react-native';

export default function AllListingsScreen() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'rejected'>('all');

  const loadListings = async () => {
    const { data } = await adminService.getAllListings();
    if (data) {
      setListings(data);
      applyFilter(data, filter);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const applyFilter = (data: Listing[], filterType: typeof filter) => {
    let filtered = data;
    
    if (filterType === 'verified') {
      filtered = data.filter(l => l.is_verified);
    } else if (filterType === 'pending') {
      filtered = data.filter(l => !l.is_verified && !l.rejection_reason);
    } else if (filterType === 'rejected') {
      filtered = data.filter(l => l.rejection_reason);
    }

    setFilteredListings(filtered);
  };

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    applyFilter(listings, filter);
  }, [filter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadListings();
  };

  const renderItem = ({ item }: { item: Listing }) => (
    <ListingCard
      listing={item}
      onPress={() => router.push(`/listing/${item.id}`)}
      showSaveButton={false}
    />
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
      {/* Filters */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <FilterChip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <FilterChip label="Verified" selected={filter === 'verified'} onPress={() => setFilter('verified')} />
          <FilterChip label="Pending" selected={filter === 'pending'} onPress={() => setFilter('pending')} />
          <FilterChip label="Rejected" selected={filter === 'rejected'} onPress={() => setFilter('rejected')} />
        </ScrollView>
      </View>

      {filteredListings.length === 0 ? (
        <EmptyState
          icon="search-off"
          title="No listings"
          message="No listings match the selected filter"
        />
      ) : (
        <FlatList
          data={filteredListings}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          ListHeaderComponent={
            <View style={styles.header}>
              <Text style={styles.headerTitle}>All Listings</Text>
              <Text style={styles.headerSubtitle}>{filteredListings.length} listings</Text>
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
  filterSection: {
    minHeight: 54,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
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
});
