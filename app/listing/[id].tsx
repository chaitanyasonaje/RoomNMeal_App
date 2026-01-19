// Listing detail screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth } from '@/template';
import { Button } from '@/components';
import { listingService } from '@/services/listingService';
import { savedService } from '@/services/savedService';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import type { Listing } from '@/types';

const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = 300;

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  useEffect(() => {
    loadListing();
    checkIfSaved();
    // Increment view count
    if (id) {
      listingService.incrementViews(id);
    }
  }, [id]);

  const loadListing = async () => {
    if (!id) return;
    const { data } = await listingService.getListingById(id);
    if (data) {
      setListing(data);
    }
    setLoading(false);
  };

  const checkIfSaved = async () => {
    if (!user || !id) return;
    const { data } = await savedService.isSaved(user.id, id);
    setIsSaved(!!data);
  };

  const handleSaveToggle = async () => {
    if (!user || !id) return;

    if (isSaved) {
      await savedService.unsaveListing(user.id, id);
      setIsSaved(false);
    } else {
      await savedService.saveListing(user.id, id);
      setIsSaved(true);
    }
  };

  const handleContact = async (method: 'whatsapp' | 'phone') => {
    if (!listing?.owner?.phone || !id) return;

    // Increment contact count
    await listingService.incrementContacts(id);

    const phone = listing.owner.phone;

    if (method === 'whatsapp') {
      const message = `Hi, I am interested in your listing: ${listing.title}`;
      const url = `whatsapp://send?phone=91${phone}&text=${encodeURIComponent(message)}`;
      Linking.openURL(url).catch(() => {
        Linking.openURL(`https://wa.me/91${phone}?text=${encodeURIComponent(message)}`);
      });
    } else {
      Linking.openURL(`tel:${phone}`);
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

  if (!listing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={colors.textTertiary} />
          <Text style={styles.errorText}>Listing not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const hasPhotos = listing.photos && listing.photos.length > 0;
  const isRoom = listing.type === 'room';

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photos */}
        {hasPhotos ? (
          <View style={styles.photoSection}>
            <Image
              source={{ uri: listing.photos[selectedPhotoIndex] }}
              style={styles.mainPhoto}
              contentFit="cover"
            />
            {listing.photos.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.thumbnailScroll}
                contentContainerStyle={styles.thumbnailContent}
              >
                {listing.photos.map((photo, index) => (
                  <Pressable
                    key={index}
                    onPress={() => setSelectedPhotoIndex(index)}
                    style={[
                      styles.thumbnail,
                      selectedPhotoIndex === index && styles.thumbnailSelected,
                    ]}
                  >
                    <Image source={{ uri: photo }} style={styles.thumbnailImage} contentFit="cover" />
                  </Pressable>
                ))}
              </ScrollView>
            )}
            
            {/* Verified badge */}
            {listing.is_verified && (
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={20} color={colors.verified} />
                <Text style={styles.verifiedText}>VERIFIED</Text>
              </View>
            )}

            {/* Save button */}
            <Pressable onPress={handleSaveToggle} style={styles.saveButton}>
              <MaterialIcons
                name={isSaved ? 'bookmark' : 'bookmark-border'}
                size={28}
                color={isSaved ? colors.primary : '#FFF'}
              />
            </Pressable>
          </View>
        ) : (
          <View style={[styles.mainPhoto, styles.photoPlaceholder]}>
            <MaterialIcons name={isRoom ? 'home' : 'restaurant'} size={80} color={colors.textTertiary} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Price */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>₹{listing.price.toLocaleString('en-IN')}/month</Text>
            {listing.deposit > 0 && (
              <Text style={styles.deposit}>Deposit: ₹{listing.deposit.toLocaleString('en-IN')}</Text>
            )}
          </View>

          {/* Tags */}
          <View style={styles.tags}>
            <View style={styles.tag}>
              <Text style={styles.tagText}>{isRoom ? 'Room/PG' : 'Mess/Tiffin'}</Text>
            </View>
            {listing.category && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{listing.category}</Text>
              </View>
            )}
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

          {/* Location */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="location-on" size={24} color={colors.primary} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Text style={styles.locationText}>{listing.area}, {listing.city}</Text>
            {listing.landmark && <Text style={styles.locationDetail}>Near {listing.landmark}</Text>}
            {listing.full_address && <Text style={styles.locationDetail}>{listing.full_address}</Text>}
          </View>

          {/* Description */}
          {listing.description && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="description" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              <Text style={styles.descriptionText}>{listing.description}</Text>
            </View>
          )}

          {/* Rules */}
          {listing.rules && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="rule" size={24} color={colors.primary} />
                <Text style={styles.sectionTitle}>Rules & Terms</Text>
              </View>
              <Text style={styles.rulesText}>{listing.rules}</Text>
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsSection}>
            <View style={styles.stat}>
              <MaterialIcons name="visibility" size={20} color={colors.textSecondary} />
              <Text style={styles.statText}>{listing.view_count} views</Text>
            </View>
            <View style={styles.stat}>
              <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
              <Text style={styles.statText}>{listing.contact_count} contacts</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Contact buttons */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.contactButtons}>
          <Pressable
            onPress={() => handleContact('phone')}
            style={[styles.contactButton, styles.phoneButton]}
          >
            <MaterialIcons name="phone" size={24} color="#FFF" />
            <Text style={styles.contactButtonText}>Call</Text>
          </Pressable>
          <Pressable
            onPress={() => handleContact('whatsapp')}
            style={[styles.contactButton, styles.whatsappButton]}
          >
            <MaterialIcons name="chat" size={24} color="#FFF" />
            <Text style={styles.contactButtonText}>WhatsApp</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  photoSection: {
    position: 'relative',
  },
  mainPhoto: {
    width: '100%',
    height: PHOTO_HEIGHT,
  },
  photoPlaceholder: {
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailScroll: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  thumbnailContent: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: colors.primary,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  verifiedBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.verifiedBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  verifiedText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.bold,
    color: colors.verified,
  },
  saveButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  content: {
    padding: spacing.md,
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  price: {
    fontSize: typography.h1,
    fontWeight: typography.bold,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  deposit: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  tagText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  locationText: {
    fontSize: typography.h4,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  locationDetail: {
    fontSize: typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  descriptionText: {
    fontSize: typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  rulesText: {
    fontSize: typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  statsSection: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  statText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  footer: {
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  contactButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  phoneButton: {
    backgroundColor: colors.primary,
  },
  whatsappButton: {
    backgroundColor: colors.whatsapp,
  },
  contactButtonText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: '#FFF',
  },
});
