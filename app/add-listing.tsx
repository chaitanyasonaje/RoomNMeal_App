// Add new listing screen
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth, useAlert } from '@/template';
import { Button, Input } from '@/components';
import { listingService } from '@/services/listingService';
import { colors, spacing, typography, borderRadius } from '@/constants/theme';
import { config } from '@/constants/config';
import type { ListingType } from '@/types';

export default function AddListingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { showAlert } = useAlert();

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
    if (!user) {
      showAlert('Error', 'User not found');
      return;
    }

    setSubmitting(true);

    const listingData = {
      owner_id: user.id,
      title: title.trim(),
      type,
      category: category || null,
      price: parseInt(price),
      deposit: deposit ? parseInt(deposit) : 0,
      description: description.trim() || null,
      rules: rules.trim() || null,
      photos,
      city: city.trim(),
      area: area.trim(),
      landmark: landmark.trim() || null,
      full_address: fullAddress.trim() || null,
      gender: gender || null,
      food_type: foodType || null,
    };

    const { error } = await listingService.createListing(listingData);
    
    setSubmitting(false);

    if (error) {
      showAlert('Error', error);
    } else {
      showAlert('Success', 'Listing submitted for review');
      router.back();
    }
  };

  const isRoom = type === 'room';
  const categories = isRoom ? config.roomCategories : config.messCategories;

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
          {/* Type selector */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Listing Type</Text>
            <View style={styles.typeSelector}>
              <Pressable
                onPress={() => setType('room')}
                style={[styles.typeButton, type === 'room' && styles.typeButtonSelected]}
              >
                <MaterialIcons name="home" size={32} color={type === 'room' ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.typeText, type === 'room' && styles.typeTextSelected]}>
                  Room/PG
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setType('mess')}
                style={[styles.typeButton, type === 'mess' && styles.typeButtonSelected]}
              >
                <MaterialIcons name="restaurant" size={32} color={type === 'mess' ? '#FFF' : colors.textSecondary} />
                <Text style={[styles.typeText, type === 'mess' && styles.typeTextSelected]}>
                  Mess/Tiffin
                </Text>
              </Pressable>
            </View>
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
              placeholder="e.g., No smoking, 11 PM deadline..."
              value={rules}
              onChangeText={setRules}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Photos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Photos ({photos.length}/{config.maxPhotos})</Text>
            <View style={styles.photoGrid}>
              {photos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image source={{ uri: photo }} style={styles.photo} />
                  <Pressable onPress={() => handleRemovePhoto(index)} style={styles.removeButton}>
                    <MaterialIcons name="close" size={18} color="#FFF" />
                  </Pressable>
                </View>
              ))}
              {photos.length < config.maxPhotos && (
                <Pressable onPress={handlePickImage} style={styles.addPhotoButton} disabled={uploading}>
                  {uploading ? (
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  ) : (
                    <>
                      <MaterialIcons name="add-a-photo" size={32} color={colors.textTertiary} />
                      <Text style={styles.addPhotoText}>Add Photo</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </View>

          {/* Submit */}
          <View style={styles.submitSection}>
            <Text style={styles.noteText}>
              ℹ️ Your listing will be reviewed by our team before going live
            </Text>
            <Button
              title="Submit for Review"
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
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
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
  typeSelector: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeText: {
    fontSize: typography.body,
    fontWeight: typography.medium,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  typeTextSelected: {
    color: '#FFF',
    fontWeight: typography.semibold,
  },
  label: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  optionChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: typography.bodySmall,
    fontWeight: typography.medium,
    color: colors.textSecondary,
  },
  optionTextSelected: {
    color: '#FFF',
    fontWeight: typography.semibold,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  uploadingText: {
    fontSize: typography.caption,
    color: colors.primary,
  },
  submitSection: {
    marginTop: spacing.lg,
  },
  noteText: {
    fontSize: typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
