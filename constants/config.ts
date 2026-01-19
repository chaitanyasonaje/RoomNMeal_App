// RoomNMeal Configuration

export const config = {
  appName: 'RoomNMeal',
  tagline: 'Verified rooms & mess near you — no brokers',
  
  // Indian cities (Tier-2 & Tier-3 focus)
  cities: [
    'Pune',
    'Nagpur',
    'Nashik',
    'Aurangabad',
    'Jaipur',
    'Indore',
    'Bhopal',
    'Lucknow',
    'Kanpur',
    'Patna',
    'Ranchi',
    'Raipur',
    'Chandigarh',
    'Kota',
    'Coimbatore',
    'Madurai',
    'Vijayawada',
    'Visakhapatnam',
    'Mysore',
    'Mangalore',
  ].sort(),
  
  // Listing types
  listingTypes: {
    room: 'Room/PG',
    mess: 'Mess/Tiffin',
  },
  
  // Room categories
  roomCategories: [
    { value: 'single', label: 'Single Room' },
    { value: 'shared', label: 'Shared Room' },
    { value: 'pg', label: 'PG (Paying Guest)' },
  ],
  
  // Mess categories
  messCategories: [
    { value: 'veg', label: 'Pure Veg' },
    { value: 'nonveg', label: 'Non-Veg' },
    { value: 'both', label: 'Veg & Non-Veg' },
  ],
  
  // Gender filters
  genderOptions: [
    { value: 'boys', label: 'Boys' },
    { value: 'girls', label: 'Girls' },
    { value: 'unisex', label: 'Unisex' },
  ],
  
  // Food type filters
  foodTypes: [
    { value: 'veg', label: 'Veg' },
    { value: 'nonveg', label: 'Non-Veg' },
    { value: 'both', label: 'Both' },
  ],
  
  // Price ranges (in INR)
  priceRanges: [
    { min: 0, max: 3000, label: 'Under ₹3,000' },
    { min: 3000, max: 5000, label: '₹3,000 - ₹5,000' },
    { min: 5000, max: 8000, label: '₹5,000 - ₹8,000' },
    { min: 8000, max: 12000, label: '₹8,000 - ₹12,000' },
    { min: 12000, max: 999999, label: 'Above ₹12,000' },
  ],
  
  // Max photos per listing
  maxPhotos: 5,
  
  // Contact methods
  contactMethods: {
    whatsapp: true,
    phone: true,
  },
};
