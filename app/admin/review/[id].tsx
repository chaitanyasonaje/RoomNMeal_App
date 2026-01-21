// Admin listing review screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useAuth, useAlert } from '@/template';
import { listingService } from '@/services/listingService';
import { adminService } from '@/services/adminService';
import { colors, spacing, typography, borderRadius, shadows } from '@/constants/theme';
import type { Listing } from '@/types';

const { width } = Dimensions.get('window');
const PHOTO_HEIGHT = 300;

export default function AdminReviewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    if (!id) return;
    const { data } = await listingService.getListingById(id);
    if (data) {
      setListing(data);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    if (!user || !listing) return;

    Alert.alert(
      'Approve Listing',
      `Approve "${listing.title}"? This will make it visible to all users.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setProcessing(true);
            const { error } = await adminService.approveListing(listing.id, user.id);
            setProcessing(false);
            
            if (error) {
              showAlert('Error', error);
            } else {
              showAlert('Success', 'Listing approved');
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (!user || !listing) return;

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
            
            setProcessing(true);
            const { error } = await adminService.rejectListing(listing.id, user.id, reason.trim());
            setProcessing(false);

            if (error) {
              showAlert('Error', error);
            } else {
              showAlert('Success', 'Listing rejected');
              router.back();
            }
          },
        },
      ],
      'plain-text'
    );
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
                  <View
                    key={index}
                    onTouchEnd={() => setSelectedPhotoIndex(index)}
                    style={[
                      styles.thumbnail,
                      selectedPhotoIndex === index && styles.thumbnailSelected,
                    ]}
                  >
                    <Image source={{ uri: photo }} style={styles.thumbnailImage} contentFit="cover" />
                  </View>
                ))}
              </ScrollView>
            )}
            
            {/* Status Badge */}
            <View style={[
              styles.statusBadge, 
              listing.is_verified ? styles.statusVerified : 
              listing.rejection_reason ? styles.statusRejected : styles.statusPending
            ]}>
              <Text style={styles.statusText}>
                {listing.is_verified ? 'VERIFIED' : 
                 listing.rejection_reason ? 'REJECTED' : 'PENDING REVIEW'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.mainPhoto, styles.photoPlaceholder]}>
            <MaterialIcons name={isRoom ? 'home' : 'restaurant'} size={80} color={colors.textTertiary} />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Owner Info */}
          <View style={styles.ownerSection}>
            <Text style={styles.ownerTitle}>Owner Details</Text>
            <View style={styles.ownerRow}>
              <MaterialIcons name="person" size={20} color={colors.textSecondary} />
              <Text style={styles.ownerText}>{listing.owner?.name || 'Unknown'}</Text>
            </View>
            <View style={styles.ownerRow}>
              <MaterialIcons name="phone" size={20} color={colors.textSecondary} />
              <Text style={styles.ownerText}>{listing.owner?.phone || 'No phone'}</Text>
            </View>
            {listing.rejection_reason && (
              <View style={styles.rejectionBox}>
                <Text style={styles.rejectionLabel}>Rejection Reason:</Text>
                <Text style={styles.rejectionText}>{listing.rejection_reason}</Text>
              </View>
            )}
          </View>

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
        </View>
      </ScrollView>

      {/* Admin Actions */}
      <SafeAreaView edges={['bottom']} style={styles.footer}>
        <View style={styles.actionButtons}>
          <View 
            onTouchEnd={handleReject}
            style={[styles.actionButton, styles.rejectButton, processing && styles.disabledButton]}
          >
            <MaterialIcons name="cancel" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Reject</Text>
          </View>
          <View 
            onTouchEnd={handleApprove}
            style={[styles.actionButton, styles.approveButton, processing && styles.disabledButton]}
          >
            <MaterialIcons name="check-circle" size={24} color="#FFF" />
            <Text style={styles.actionButtonText}>Approve</Text>
          </View>
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
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusVerified: {
    backgroundColor: colors.verifiedBg,
  },
  statusRejected: {
    backgroundColor: colors.error + '20',
  },
  statusPending: {
    backgroundColor: colors.warning + '20',
  },
  statusText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  content: {
    padding: spacing.md,
  },
  ownerSection: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ownerTitle: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
    color: colors.textPrimary,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  ownerText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  rejectionBox: {
    marginTop: spacing.md,
    padding: spacing.sm,
    backgroundColor: colors.error + '10',
    borderRadius: borderRadius.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.error,
  },
  rejectionLabel: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
    color: colors.error,
    marginBottom: spacing.xs,
  },
  rejectionText: {
    fontSize: typography.bodySmall,
    color: colors.textPrimary,
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
  footer: {
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  approveButton: {
    backgroundColor: colors.verified,
  },
  rejectButton: {
    backgroundColor: colors.error,
  },
  disabledButton: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: '#FFF',
  },
});
