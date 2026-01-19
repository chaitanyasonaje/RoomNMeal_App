// Home screen - Browse listings
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/template';
import { ListingCard, FilterChip, EmptyState } from '@/components';
import { listingService } from '@/services/listingService';
import { savedService } from '@/services/savedService';
import { colors, spacing, typography } from '@/constants/theme';
import { config } from '@/constants/config';
import type { Listing, ListingType, ListingFilters } from '@/types';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Filters
  const [selectedType, setSelectedType] = useState<ListingType | undefined>(undefined);
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const loadListings = async () => {
    const filters: ListingFilters = {
      type: selectedType,
      city: selectedCity,
      verified: verifiedOnly || undefined,
    };

    const { data, error } = await listingService.getListings(filters);
    if (data) {
      setListings(data);
    }
    setLoading(false);
    setRefreshing(false);
  };

  const loadSavedListings = async () => {
    if (!user) return;
    const { data } = await savedService.getSavedListings(user.id);
    if (data) {
      const ids = new Set(data.map(s => s.listing_id));
      setSavedIds(ids);
    }
  };

  useEffect(() => {
    loadListings();
    loadSavedListings();
  }, [selectedType, selectedCity, verifiedOnly]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadListings();
    loadSavedListings();
  };

  const handleSaveToggle = async (listing: Listing) => {
    if (!user) return;

    const isSaved = savedIds.has(listing.id);
    
    if (isSaved) {
      await savedService.unsaveListing(user.id, listing.id);
      setSavedIds(prev => {
        const next = new Set(prev);
        next.delete(listing.id);
        return next;
      });
    } else {
      await savedService.saveListing(user.id, listing.id);
      setSavedIds(prev => new Set(prev).add(listing.id));
    }
  };

  const renderListingItem = ({ item }: { item: Listing }) => (
    <ListingCard
      listing={{ ...item, is_saved: savedIds.has(item.id) }}
      onPress={() => router.push(`/listing/${item.id}`)}
      onSaveToggle={() => handleSaveToggle(item)}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top > 0 ? 0 : spacing.sm }]}>
        <View>
          <Text style={styles.headerTitle}>🏠 {config.appName}</Text>
          <Text style={styles.headerSubtitle}>Find your perfect room & mess</Text>
        </View>
      </View>

      {/* Type filter */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <FilterChip
            label="All"
            selected={!selectedType}
            onPress={() => setSelectedType(undefined)}
          />
          <FilterChip
            label="Rooms/PG"
            selected={selectedType === 'room'}
            onPress={() => setSelectedType('room')}
          />
          <FilterChip
            label="Mess/Tiffin"
            selected={selectedType === 'mess'}
            onPress={() => setSelectedType('mess')}
          />
          <FilterChip
            label="Verified Only"
            selected={verifiedOnly}
            onPress={() => setVerifiedOnly(!verifiedOnly)}
          />
        </ScrollView>
      </View>

      {/* City selector */}
      <View style={styles.citySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <Pressable
            onPress={() => setSelectedCity(undefined)}
            style={[styles.cityChip, !selectedCity && styles.cityChipSelected]}
          >
            <Text style={[styles.cityChipText, !selectedCity && styles.cityChipTextSelected]}>
              All Cities
            </Text>
          </Pressable>
          {config.cities.slice(0, 10).map(city => (
            <Pressable
              key={city}
              onPress={() => setSelectedCity(city)}
              style={[styles.cityChip, selectedCity === city && styles.cityChipSelected]}
            >
              <Text style={[styles.cityChipText, selectedCity === city && styles.cityChipTextSelected]}>
                {city}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Listings */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="search-off"
          title="No listings found"
          message="Try adjusting your filters or check back later for new listings"
        />
      ) : (
        <FlatList
          data={listings}
          renderItem={renderListingItem}
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
  filterSection: {
    minHeight: 54,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterScrollContent: {
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  citySection: {
    minHeight: 48,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cityChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cityChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  cityChipText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  cityChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: typography.semibold,
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
