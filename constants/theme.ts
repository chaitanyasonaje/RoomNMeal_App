// RoomNMeal Design System
// Indian UX-focused, trust-first, minimal design

export const colors = {
  // Primary brand
  primary: '#FF6B35', // Vibrant orange - trust & energy
  primaryDark: '#E55A2B',
  primaryLight: '#FF8A5C',
  
  // Verification badge
  verified: '#00C853', // Green checkmark
  verifiedBg: '#E8F5E9',
  
  // Backgrounds
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',
  
  // Dark mode
  backgroundDark: '#0A0A0A',
  surfaceDark: '#1A1A1A',
  surfaceElevatedDark: '#252525',
  
  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textPrimaryDark: '#FFFFFF',
  textSecondaryDark: '#B0B0B0',
  
  // Semantic
  success: '#00C853',
  error: '#FF3B30',
  warning: '#FF9500',
  info: '#007AFF',
  
  // Borders
  border: '#E0E0E0',
  borderDark: '#333333',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // WhatsApp integration
  whatsapp: '#25D366',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  // Font sizes
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,
  
  // Weights
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const layout = {
  screenPadding: spacing.md,
  cardPadding: spacing.md,
  sectionGap: spacing.lg,
};
