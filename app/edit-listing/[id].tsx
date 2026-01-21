// Edit listing screen
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useAlert } from '@/template';
import { Button, Input } from '@/components';
import { listingService } from '@/services/listingService';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { config } from '@/constants/config';
import type { ListingType, Listing } from '@/types';

export default function EditListingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { showAlert } = useAlert();

  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<ListingType>('room');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [gender, setGender] = useState('');
  const [foodType, setFoodType] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    if (!id) return;
    const { data } = await listingService.getListingById(id);
    if (data) {
      if (user && data.owner_id !== user.id) {
        showAlert('Error', 'You do not have permission to edit this listing');
        router.back();
        return;
      }
      populateForm(data);
    } else {
      showAlert('Error', 'Listing not found');
      router.back();
    }
    setLoading(false);
  };

  const populateForm = (data: Listing) => {
    setType(data.type);
    setTitle(data.title);
    setCategory(data.category || '');
    setPrice(data.price.toString());
    setDeposit(data.deposit?.toString() || '');
    setDescription(data.description || '');
    setRules(data.rules || '');
    setCity(data.city);
    setArea(data.area);
    setLandmark(data.landmark || '');
    setFullAddress(data.full_address || '');
    setGender(data.gender || '');
    setFoodType(data.food_type || '');
    setPhotos(data.photos || []);
  };

  const handlePickImage = async () => {
    if (photos.length >= config.maxPhotos) {
      showAlert('Limit Reached', `Maximum ${config.maxPhotos} photos allowed`);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Required', 'Please grant photo library access');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploading(true);
      const asset = result.assets[0];
      
      const file = {
        uri: asset.uri,
        type: 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      };

      const { data: url, error } = await listingService.uploadPhoto(file, user?.id || '');
      
      setUploading(false);

      if (error) {
        showAlert('Upload Failed', error);
      } else if (url) {
        setPhotos([...photos, url]);
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      showAlert('Error', 'Please enter a title');
      return;
    }
    if (!price || parseInt(price) <= 0) {
      showAlert('Error', 'Please enter a valid price');
      return;
    }
    if (!city.trim() || !area.trim()) {
      showAlert('Error', 'Please enter city and area');
      return;
    }
    if (!user || !id) {
      showAlert('Error', 'User or ID not found');
      return;
    }

    setSubmitting(true);

    const listingData: Partial<Listing> = {
      title: title.trim(),
      type,
      category: category || undefined,
      price: parseInt(price),
      deposit: deposit ? parseInt(deposit) : 0,
      description: description.trim() || undefined,
      rules: rules.trim() || undefined,
      photos,
      city: city.trim(),
      area: area.trim(),
      landmark: landmark.trim() || undefined,
      full_address: fullAddress.trim() || undefined,
      gender: (gender as any) || undefined,
      food_type: (foodType as any) || undefined,
      is_verified: false, // Re-verification required after edit
      rejection_reason: undefined, // Clear rejection reason
    };

    const { error } = await listingService.updateListing(id, listingData);
    
    setSubmitting(false);

    if (error) {
      showAlert('Error', error);
    } else {
      showAlert('Success', 'Listing updated and submitted for review');
      router.back();
    }
  };

  const isRoom = type === 'room';
  const categories = isRoom ? config.roomCategories : config.messCategories;

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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Edit Listing</Text>
          </View>

          {/* Type selector (disabled for edit) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Type</Text>
            <View style={styles.typeSelector}>
              <View style={[styles.typeButton, styles.typeButtonSelected]}>
                <MaterialIcons name={isRoom ? "home" : "restaurant"} size={32} color="#FFF" />
                <Text style={styles.typeTextSelected}>
                  {isRoom ? 'Room/PG' : 'Mess/Tiffin'}
                </Text>
              </View>
            </View>
            <Text style={styles.helperText}>Type cannot be changed after creation</Text>
          </View>

          {/* Basic info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            <Input
              label="Title*"
              placeholder={isRoom ? 'e.g., Spacious Single Room near XYZ College' : 'e.g., Home-style Veg Tiffin Service'}
              value={title}
              onChangeText={setTitle}
            />
            
            {/* Category picker */}
            <Text style={styles.label}>Category</Text>
            <View style={styles.optionGrid}>
              {categories.map(cat => (
                <Pressable
                  key={cat.value}
                  onPress={() => setCategory(cat.value)}
                  style={[styles.optionChip, category === cat.value && styles.optionChipSelected]}
                >
                  <Text style={[styles.optionText, category === cat.value && styles.optionTextSelected]}>
                    {cat.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Input
              label="Monthly Price (₹)*"
              placeholder="e.g., 5000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <Input
              label="Deposit (₹)"
              placeholder="e.g., 5000"
              value={deposit}
              onChangeText={setDeposit}
              keyboardType="numeric"
            />
          </View>

          {/* Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filters</Text>
            
            {isRoom && (
              <>
                <Text style={styles.label}>For</Text>
                <View style={styles.optionGrid}>
                  {config.genderOptions.map(opt => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setGender(opt.value)}
                      style={[styles.optionChip, gender === opt.value && styles.optionChipSelected]}
                    >
                      <Text style={[styles.optionText, gender === opt.value && styles.optionTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {!isRoom && (
              <>
                <Text style={styles.label}>Food Type</Text>
                <View style={styles.optionGrid}>
                  {config.foodTypes.map(opt => (
                    <Pressable
                      key={opt.value}
                      onPress={() => setFoodType(opt.value)}
                      style={[styles.optionChip, foodType === opt.value && styles.optionChipSelected]}
                    >
                      <Text style={[styles.optionText, foodType === opt.value && styles.optionTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <Input
              label="City*"
              placeholder="e.g., Pune"
              value={city}
              onChangeText={setCity}
            />
            <Input
              label="Area*"
              placeholder="e.g., Kothrud, Near MIT College"
              value={area}
              onChangeText={setArea}
            />
            <Input
              label="Landmark"
              placeholder="e.g., Near Pancard Club"
              value={landmark}
              onChangeText={setLandmark}
            />
            <Input
              label="Full Address"
              placeholder="Complete address (optional)"
              value={fullAddress}
              onChangeText={setFullAddress}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Details</Text>
            <Input
              label="Description"
              placeholder="Describe your room/mess..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
            <Input
              label="Rules & Terms"
              placeholder="e.g., No smoking, 1 month notice"
              value={rules}
              onChangeText={setRules}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({photos.length}/{config.maxPhotos})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoContainer}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <Pressable
                    style={styles.removePhoto}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <MaterialIcons name="close" size={16} color="#FFF" />
                  </Pressable>
                </View>
              ))}
              
              {photos.length < config.maxPhotos && (
                <Pressable
                  style={styles.addPhoto}
                  onPress={handlePickImage}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <MaterialIcons name="add-a-photo" size={32} color={colors.textSecondary} />
                  )}
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </Pressable>
              )}
            </ScrollView>
          </View>

          <View style={styles.footer}>
            <Button
              title="Update Listing"
              onPress={handleSubmit}
              loading={submitting}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl * 2,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  section: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      },
    }),
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  typeTextSelected: {
    marginTop: spacing.xs,
    fontSize: typography.bodySmall,
    fontWeight: 'bold',
    color: '#FFF',
  },
  helperText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  label: {
    fontSize: typography.bodySmall,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  photoList: {
    flexDirection: 'row',
  },
  photoContainer: {
    width: 100,
    height: 100,
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: borderRadius.pill,
    padding: 4,
  },
  addPhoto: {
    width: 100,
    height: 100,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footer: {
    marginTop: spacing.lg,
  },
});
