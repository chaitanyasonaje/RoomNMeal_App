// Admin service for moderation and management
import { getSupabaseClient } from '@/template';
import type { DashboardStats, AdminAction } from '@/types';

const supabase = getSupabaseClient();

export const adminService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      // Get total listings
      const { count: totalListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true });

      // Get active listings
      const { count: activeListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_available', true);

      // Get pending listings
      const { count: pendingListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('is_verified', false)
        .is('rejection_reason', null);

      // Get verified listings
      const { count: verifiedListings } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('is_verified', true);

      // Get room listings
      const { count: totalRooms } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'room');

      // Get mess listings
      const { count: totalMess } = await supabase
        .from('listings')
        .select('*', { count: 'exact', head: true })
        .eq('type', 'mess');

      const stats: DashboardStats = {
        total_users: totalUsers || 0,
        total_listings: totalListings || 0,
        active_listings: activeListings || 0,
        pending_listings: pendingListings || 0,
        verified_listings: verifiedListings || 0,
        total_rooms: totalRooms || 0,
        total_mess: totalMess || 0,
      };

      return { data: stats, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Approve listing
  async approveListing(listingId: string, adminId: string) {
    try {
      // Update listing
      const { error: updateError } = await supabase
        .from('listings')
        .update({ is_verified: true, rejection_reason: null })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Log admin action
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          action_type: 'approve',
          target_type: 'listing',
          target_id: listingId,
        }]);

      if (logError) throw logError;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Reject listing
  async rejectListing(listingId: string, adminId: string, reason: string) {
    try {
      // Update listing
      const { error: updateError } = await supabase
        .from('listings')
        .update({ is_verified: false, rejection_reason: reason })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Log admin action
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          action_type: 'reject',
          target_type: 'listing',
          target_id: listingId,
          reason,
        }]);

      if (logError) throw logError;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Block user
  async blockUser(userId: string, adminId: string, reason: string) {
    try {
      // Update user
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ is_blocked: true })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Log admin action
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          action_type: 'block_user',
          target_type: 'user',
          target_id: userId,
          reason,
        }]);

      if (logError) throw logError;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Unblock user
  async unblockUser(userId: string) {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_blocked: false })
        .eq('id', userId);

      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Delete listing (admin)
  async deleteListing(listingId: string, adminId: string, reason: string) {
    try {
      // Soft delete by marking inactive
      const { error: updateError } = await supabase
        .from('listings')
        .update({ is_active: false })
        .eq('id', listingId);

      if (updateError) throw updateError;

      // Log admin action
      const { error: logError } = await supabase
        .from('admin_actions')
        .insert([{
          admin_id: adminId,
          action_type: 'delete_listing',
          target_type: 'listing',
          target_id: listingId,
          reason,
        }]);

      if (logError) throw logError;

      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  },

  // Get all users (for admin)
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Get all listings (for admin)
  async getAllListings() {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select(`
          *,
          owner:user_profiles!listings_owner_id_fkey(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },
};
