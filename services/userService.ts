// User profile service
import { getSupabaseClient } from '@/template';
import type { User, UserRole } from '@/types';

const supabase = getSupabaseClient();

export const userService = {
  // Get user profile
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Update user profile
  async updateProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Update user role
  async updateRole(userId: string, role: UserRole) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data: data as User, error: null };
    } catch (error: any) {
      return { data: null, error: error.message };
    }
  },

  // Check if user is admin
  async isAdmin(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data: data?.role === 'admin', error: null };
    } catch (error: any) {
      return { data: false, error: error.message };
    }
  },
};
