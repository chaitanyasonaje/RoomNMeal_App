// Saved listings service
import { getSupabaseClient } from '@/template';
import type { Listing, SavedListing } from '@/types';

const supabase = getSupabaseClient();

export const savedService = {
  // Get user's saved listings
  async getSavedListings(userId: string) {
    try {
      const { data, error } = await supabase
        .from('saved_listings')
        .select(`
          *,
          listing:listings(
            *,
            owner:user_profiles!listings_owner_id_fkey(name, phone)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data: data as SavedListing[], error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Check if listing is saved
  async isSaved(userId: string, listingId: string) {
    try {
      const { data, error } = await supabase
        .from('saved_listings')
        .select('id')
        .eq('user_id', userId)
        .eq('listing_id', listingId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return { data: !!data, error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  },

  // Save listing
  async saveListing(userId: string, listingId: string) {
    try {
      const { data, error } = await supabase
        .from('saved_listings')
        .insert([{ user_id: userId, listing_id: listingId }])
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Unsave listing
  async unsaveListing(userId: string, listingId: string) {
    try {
      const { error } = await supabase
        .from('saved_listings')
        .delete()
        .eq('user_id', userId)
        .eq('listing_id', listingId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },
};
