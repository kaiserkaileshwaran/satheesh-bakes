export type UserRole = 'customer' | 'admin' | 'staff';

export interface UserAvatar {
  text: string;
  background: string;
  textColor: string;
  shape: 'circle' | 'rounded' | 'square';
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  fullName: string;
  displayName?: string;
  username: string;
  email: string;
  password?: string;
  phone?: string;
  avatar: UserAvatar;
  provider: 'email' | 'google' | 'local';
  status: 'active' | 'suspended' | 'disabled';
  createdAt: number;
  lastLogin: number;
  preferredBranch?: string;
}

export interface ProductMetadata {
  sweetness: number; // 0-5
  spice: number;     // 0-5
  softness: number;  // 0-5
  crunchiness: number; // 0-5
  temperature: 'hot' | 'cold' | 'room';
  diet: 'eggless' | 'egg' | 'vegan';
  prepTime: number;  // in minutes
  occasion: string[]; // ['birthday', 'teaTime', 'party', 'breakfast', 'festival', 'kids']
  tags: string[];     // ['bestseller', 'new', 'spicy', 'cake', 'snack']
  allergens?: string[];
  taste?: {
    sweetness: number;
    spiciness: number;
  };
}

export interface Product {
  id: string;
  name: string;
  displayName?: string;
  description: string;
  ingredients: string[];
  price: number;
  offerPrice?: number;
  categoryId: string;
  rating: number;
  reviewCount: number;
  featured: boolean;
  bestSeller: boolean;
  isNewArrival?: boolean;
  status: 'published' | 'draft' | 'archived' | 'out_of_stock';
  images: string[];
  coverImage: string;
  metadata: ProductMetadata;
  createdAt: string | number;
  updatedAt: string | number;
  isAvailable?: boolean;
  isEggless?: boolean;
  isSpicy?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
  displayOrder: number;
  enabled: boolean;
  isActive?: boolean;
  productCount?: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  googleMapLink: string;
  mapEmbedUrl?: string;
  openingHours: string;
  closingHours: string;
  isOpen: boolean;
  isMain?: boolean;
  managerName?: string;
}

export interface BranchStock {
  productId: string;
  availableStock: number;
  reservedStock: number;
  status: 'available' | 'low_stock' | 'out_of_stock';
}



export interface Review {
  id: string;
  productId: string;
  productName?: string;
  customerId: string;
  customerName: string;
  avatarText: string;
  avatarBg: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  status: 'pending' | 'approved' | 'hidden';
  isApproved?: boolean;
  createdAt: number;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  discountPercentage: number;
  bannerUrl: string;
  eligibleProductIds?: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  enabled: boolean;
  isActive?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  enabled: boolean;
  priority: number;
  expiryDate?: string;
}

export interface HeroBanner {
  id: string;
  desktopImage: string;
  mobileImage: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  enabled: boolean;
  displayOrder: number;
}

export interface HomepageCMS {
  banners: HeroBanner[];
  announcement?: Announcement;
  featuredCategoryIds: string[];
  featuredProductIds: string[];
  bestSellerProductIds: string[];
}

export interface FranchiseEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  investmentBudget: string;
  hasExperience: boolean;
  message: string;
  status: 'pending' | 'contacted' | 'rejected';
  createdAt: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  logoUrl?: string;
  faviconUrl?: string;
  darkModeBanner: boolean;
  primaryBrown?: string;
  primaryGold?: string;
  primaryCream?: string;
  accentChocolate?: string;
  fontPrimary?: string;
  fontSecondary?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  email?: string;
  action: string;
  module: string;
  description: string;
  timestamp: number;
}

export interface AuditLog {
  id: string;
  // Legacy fields
  userId?: string;
  module?: string;
  previousValue?: string;
  newValue?: string;
  // New fields used by admin UI
  adminId?: string;
  entity?: string;
  action?: string;
  description?: string;
  timestamp: number;
}
