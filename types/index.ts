// RoomNMeal TypeScript Types

export type UserRole = 'user' | 'owner' | 'admin';

export type ListingType = 'room' | 'mess';

export type Gender = 'boys' | 'girls' | 'unisex';

export type FoodType = 'veg' | 'nonveg' | 'both';

export type RoomCategory = 'single' | 'shared' | 'pg';

export type MessCategory = 'veg' | 'nonveg' | 'both';

export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name?: string;
  email?: string;
  username?: string;
  is_blocked: boolean;
  created_at: string;
}

export interface Listing {
  id: string;
  owner_id: string;
  title: string;
  type: ListingType;
  category?: string;
  price: number;
  deposit: number;
  description?: string;
  rules?: string;
  photos: string[];
  city: string;
  area: string;
  landmark?: string;
  full_address?: string;
  gender?: Gender;
  food_type?: FoodType;
  is_available: boolean;
  is_verified: boolean;
  is_active: boolean;
  rejection_reason?: string;
  view_count: number;
  contact_count: number;
  created_at: string;
  updated_at: string;
  owner?: {
    name?: string;
    phone: string;
  };
  is_saved?: boolean;
}

export interface SavedListing {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
  listing?: Listing;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: 'approve' | 'reject' | 'block_user' | 'edit_listing' | 'delete_listing';
  target_type: 'listing' | 'user';
  target_id: string;
  reason?: string;
  metadata?: any;
  created_at: string;
}

export interface DashboardStats {
  total_users: number;
  total_listings: number;
  active_listings: number;
  pending_listings: number;
  verified_listings: number;
  total_rooms: number;
  total_mess: number;
}

export interface ListingFilters {
  type?: ListingType;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  gender?: Gender;
  foodType?: FoodType;
  category?: string;
  verified?: boolean;
}
