// Listing card component
import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import type { Listing } from '@/types';

interface ListingCardProps {
  listing: Listing;
  onPress: () => void;
  onSaveToggle?: () => void;
  showSaveButton?: boolean;
}

export function ListingCard({ listing, onPress, onSaveToggle, showSaveButton = true }: ListingCardProps) {
  const isRoom = listing.type === 'room';
  const primaryPhoto = listing.photos?.[0];

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}>
      {/* Photo */}
      <View style={styles.photoContainer}>
        {primaryPhoto ? (
          <Image source={{ uri: primaryPhoto }} style={styles.photo} resizeMode="cover" />
        ) : (
          <View style={[styles.photo, styles.photoPlaceholder]}>
            <MaterialIcons name={isRoom ? 'home' : 'restaurant'} size={40} color={colors.textTertiary} />
          </View>
        )}
        
        {/* Verified badge */}
        {listing.is_verified && (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={16} color={colors.verified} />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        )}

        {/* Save button */}
        {showSaveButton && onSaveToggle && (
          <Pressable onPress={onSaveToggle} style={styles.saveButton}>
            <MaterialIcons
              name={listing.is_saved ? 'bookmark' : 'bookmark-border'}
              size={24}
              color={listing.is_saved ? colors.primary : '#FFF'}
            />
          </Pressable>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {listing.title}
          </Text>
          <Text style={styles.price}>₹{listing.price.toLocaleString('en-IN')}/mo</Text>
        </View>

        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <MaterialIcons name="location-on" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText} numberOfLines={1}>
              {listing.area}, {listing.city}
            </Text>
          </View>

          {listing.gender && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.gender}</Text>
            </View>
          )}

          {listing.food_type && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{listing.food_type}</Text>
            </View>
          )}
        </View>

        {listing.category && (
          <Text style={styles.category}>
            {isRoom ? listing.category.toUpperCase() : listing.category}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.md,
    marginBottom: spacing.md,
  },
  cardPressed: {
    opacity: 0.9,
  },
  photoContainer: {
    position: 'relative',
    height: 180,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.verifiedBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  verifiedText: {
    fontSize: typography.tiny,
    fontWeight: typography.bold,
    color: colors.verified,
  },
  saveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  content: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.primary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 120,
  },
  metaText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.caption,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  category: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
  },
});
