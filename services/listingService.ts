// Listing data service
import { getSupabaseClient } from '@/template';
import type { Listing, ListingFilters } from '@/types';

const supabase = getSupabaseClient();

export const listingService = {
  // Fetch listings with filters
  async getListings(filters: ListingFilters = {}) {
    try {
      let query = supabase
        .from('listings')
        .select(`
          *,
          owner:user_profiles!listings_owner_id_fkey(name, phone)
        `)
        .eq('is_active', true)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.city) {
        query = query.eq('city', filters.city);
      }
      
      if (filters.gender) {
        query = query.eq('gender', filters.gender);
      }
      
      if (filters.foodType) {
        query = query.eq('food_type', filters.foodType);
      }
      
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      
      if (filters.verified !== undefined) {
        query = query.eq('is_verified', filters.verified);
      }
      
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { data: data as Listing[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Get single listing by ID
  async getListingById(id: string) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          owner:user_profiles!listings_owner_id_fkey(name, phone)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data: data as Listing, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Get owner's listings
  async getOwnerListings(ownerId: string) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Listing[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Create new listing
  async createListing(listing: Partial<Listing>) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .insert([listing])
        .select()
        .single();

      if (error) throw error;
      return { data: data as Listing, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Update listing
  async updateListing(id: string, updates: Partial<Listing>) {
    try {
      const { data, error } = await supabase
        .from('listings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data: data as Listing, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Delete listing
  async deleteListing(id: string) {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Increment view count
  async incrementViews(id: string) {
    try {
      await supabase.rpc('increment_listing_views', { listing_uuid: id });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Increment contact count
  async incrementContacts(id: string) {
    try {
      await supabase.rpc('increment_listing_contacts', { listing_uuid: id });
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Upload listing photo
  async uploadPhoto(file: { uri: string; type: string; name: string }, userId: string) {
    try {
      // Convert file URI to blob for web, use base64 for mobile
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      
      // For mobile (file:// protocol), use base64
      if (file.uri.startsWith('file://')) {
        const response = await fetch(file.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        return new Promise<{ data: string | null; error: string | null }>((resolve) => {
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            const base64Data = base64.split(',')[1];
            
            const { data, error } = await supabase.storage
              .from('listing-photos')
              .upload(fileName, decode(base64Data), {
                contentType: file.type,
              });

            if (error) {
              resolve({ data: null, error: error.message });
            } else {
              const { data: urlData } = supabase.storage
                .from('listing-photos')
                .getPublicUrl(fileName);
              resolve({ data: urlData.publicUrl, error: null });
            }
          };
          reader.readAsDataURL(blob);
        });
      } else {
        // For web
        const response = await fetch(file.uri);
        const blob = await response.blob();
        
        const { data, error } = await supabase.storage
          .from('listing-photos')
          .upload(fileName, blob, {
            contentType: file.type,
          });

        if (error) throw error;

        const { data: urlData } = supabase.storage
          .from('listing-photos')
          .getPublicUrl(fileName);

        return { data: urlData.publicUrl, error: null };
      }
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Get pending listings (for admin)
  async getPendingListings() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          owner:user_profiles!listings_owner_id_fkey(name, phone)
        `)
        .eq('is_active', true)
        .eq('is_verified', false)
        .is('rejection_reason', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as Listing[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};

// Helper function to decode base64
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
