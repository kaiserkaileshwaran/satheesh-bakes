import { Product, Category, Branch, Review, Offer, HomepageCMS, UserProfile, ActivityLog, AuditLog, FranchiseEnquiry } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_BRANCHES, INITIAL_OFFERS, INITIAL_CMS } from '../firebase/seedData';
import { FirebaseService } from './firebaseService';
import { db, ref, onValue } from '../firebase/firebase';

const STORAGE_KEYS = {
  PRODUCTS: 'sb_products_v1',
  CATEGORIES: 'sb_categories_v1',
  BRANCHES: 'sb_branches_v1',
  ORDERS: 'sb_orders_v1',
  REVIEWS: 'sb_reviews_v1',
  OFFERS: 'sb_offers_v1',
  CMS: 'sb_cms_v1',
  THEME: 'sb_theme_v1',
  USERS: 'sb_users_v1',
  CURRENT_USER: 'sb_current_user_v1',
  FRANCHISE: 'sb_franchise_v1',
  LOGS: 'sb_logs_v1',
  AUDIT: 'sb_audit_v1',
};

const DEFAULT_USERS: UserProfile[] = [
  {
    uid: 'admin-1',
    role: 'admin',
    fullName: 'Satheesh Bakery Admin',
    username: 'admin',
    email: 'admin@satheeshbakery.com',
    password: 'admin@test123',
    avatar: { text: 'SA', background: '#6B3A2A', textColor: '#FFFFFF', shape: 'circle' },
    preferredBranch: 'branch-anna-nagar',
    provider: 'local',
    status: 'active',
    createdAt: Date.now(),
    lastLogin: Date.now(),
  },
];

// Helper for local storage with initial fallback seeding
function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn(`LocalStorage read error for ${key}:`, err);
    return fallback;
  }
}

const FIREBASE_PATHS: Record<string, string> = {
  [STORAGE_KEYS.USERS]: '/users',
  [STORAGE_KEYS.PRODUCTS]: '/products',
  [STORAGE_KEYS.CATEGORIES]: '/categories',
  [STORAGE_KEYS.BRANCHES]: '/branches',
  [STORAGE_KEYS.ORDERS]: '/orders',
  [STORAGE_KEYS.REVIEWS]: '/reviews',
  [STORAGE_KEYS.OFFERS]: '/offers',
  [STORAGE_KEYS.CMS]: '/homepageCMS',
  [STORAGE_KEYS.FRANCHISE]: '/franchise',
  [STORAGE_KEYS.LOGS]: '/logs',
  [STORAGE_KEYS.AUDIT]: '/audit',
};

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    const firebasePath = FIREBASE_PATHS[key as keyof typeof FIREBASE_PATHS];
    if (firebasePath) {
      void FirebaseService.setDbData(firebasePath, value);
    }
    // Dispatch event for local instant updates across components
    window.dispatchEvent(new CustomEvent('sb_data_change', { detail: { key } }));
  } catch (err) {
    console.error(`LocalStorage write error for ${key}:`, err);
  }
}

async function syncDataFromFirebase<T>(key: string, fallback: T): Promise<void> {
  const firebasePath = FIREBASE_PATHS[key as keyof typeof FIREBASE_PATHS];
  if (!firebasePath) return;

  const remoteData = await FirebaseService.getDbData<T>(firebasePath);
  if (remoteData !== null) {
    localStorage.setItem(key, JSON.stringify(remoteData));
  } else {
    const localData = getStoredItem<T>(key, fallback);
    void FirebaseService.setDbData(firebasePath, localData);
  }
}

export class StorageService {
  static async initializeStorage(): Promise<void> {
    await Promise.all([
      syncDataFromFirebase<UserProfile[]>(STORAGE_KEYS.USERS, DEFAULT_USERS),
      syncDataFromFirebase<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS),
      syncDataFromFirebase<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES),
      syncDataFromFirebase<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES),
      syncDataFromFirebase<Review[]>(STORAGE_KEYS.REVIEWS, []),
      syncDataFromFirebase<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS),
      syncDataFromFirebase<HomepageCMS>(STORAGE_KEYS.CMS, INITIAL_CMS),
      syncDataFromFirebase<FranchiseEnquiry[]>(STORAGE_KEYS.FRANCHISE, []),
      syncDataFromFirebase<ActivityLog[]>(STORAGE_KEYS.LOGS, []),
      syncDataFromFirebase<AuditLog[]>(STORAGE_KEYS.AUDIT, []),
    ]);
    // Start real-time listeners after initial sync
    StorageService.startRealtimeListeners();
  }

  // Real-time Firebase listeners — pushes any remote change to localStorage and triggers UI update
  private static _listenersStarted = false;
  static startRealtimeListeners(): void {
    if (StorageService._listenersStarted) return;
    StorageService._listenersStarted = true;

    const listenPaths: Array<{ key: string; path: string }> = [
      { key: STORAGE_KEYS.PRODUCTS, path: '/products' },
      { key: STORAGE_KEYS.CATEGORIES, path: '/categories' },
      { key: STORAGE_KEYS.BRANCHES, path: '/branches' },
      { key: STORAGE_KEYS.REVIEWS, path: '/reviews' },
      { key: STORAGE_KEYS.OFFERS, path: '/offers' },
      { key: STORAGE_KEYS.CMS, path: '/homepageCMS' },
      { key: STORAGE_KEYS.FRANCHISE, path: '/franchise' },
      { key: STORAGE_KEYS.LOGS, path: '/logs' },
      { key: STORAGE_KEYS.AUDIT, path: '/audit' },
    ];

    listenPaths.forEach(({ key, path }) => {
      try {
        onValue(ref(db, path), (snapshot) => {
          if (snapshot.exists()) {
            const val = snapshot.val();
            const current = localStorage.getItem(key);
            const incoming = JSON.stringify(val);
            // Only update if the data actually changed (avoid re-render loops)
            if (current !== incoming) {
              localStorage.setItem(key, incoming);
              window.dispatchEvent(new CustomEvent('sb_data_change', { detail: { key } }));
            }
          }
        });
      } catch (err) {
        console.warn(`[StorageService] onValue listener failed for ${path}:`, err);
      }
    });
  }

  static getStoredUsers(): UserProfile[] {
    return getStoredItem<UserProfile[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }

  static getUserByEmail(email: string): UserProfile | undefined {
    return this.getStoredUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
  }

  static saveUser(user: UserProfile): UserProfile {
    const users = this.getStoredUsers();
    const idx = users.findIndex((u) => u.uid === user.uid || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      users[idx] = user;
    } else {
      users.unshift(user);
    }
    setStoredItem(STORAGE_KEYS.USERS, users);
    return user;
  }

  static getCurrentUser(): UserProfile | null {
    return getStoredItem<UserProfile | null>(STORAGE_KEYS.CURRENT_USER, null);
  }

  static setCurrentUser(user: UserProfile): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  static clearCurrentUser(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } catch {
      // ignore
    }
  }

  // PRODUCTS
  static getProducts(): Product[] {
    return getStoredItem<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  }

  static getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  static saveProduct(product: Product): Product {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      const oldProduct = products[index];
      products[index] = { ...product, updatedAt: Date.now() };
      this.addActivityLog('Admin', 'admin', 'Product Edited', 'Products', `Edited product: ${product.name}`);
      
      if (oldProduct.isAvailable !== product.isAvailable) {
        const action = product.isAvailable ? 'Product Activated' : 'Product Deactivated';
        const desc = product.isAvailable ? `Activated product: ${product.name}` : `Deactivated product: ${product.name}`;
        this.addActivityLog('Admin', 'admin', action, 'Products', desc);
      }
    } else {
      products.unshift({ ...product, createdAt: Date.now(), updatedAt: Date.now() });
      this.addActivityLog('Admin', 'admin', 'Product Created', 'Products', `Created product: ${product.name}`);
    }
    setStoredItem(STORAGE_KEYS.PRODUCTS, products);
    return product;
  }

  static deleteProduct(id: string): void {
    const products = this.getProducts().filter((p) => p.id !== id);
    setStoredItem(STORAGE_KEYS.PRODUCTS, products);
    this.addActivityLog('Admin', 'admin', 'Product Deleted', 'Products', `Deleted product ID: ${id}`);
  }

  // CATEGORIES
  static getCategories(): Category[] {
    return getStoredItem<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  }

  static saveCategory(category: Category): Category {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === category.id);
    const isNew = index < 0;
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    setStoredItem(STORAGE_KEYS.CATEGORIES, categories);
    this.addActivityLog('Admin', 'admin', isNew ? 'Category Created' : 'Category Updated', 'Categories', `${isNew ? 'Created' : 'Updated'} category: ${category.name}`);
    return category;
  }

  static deleteCategory(id: string): void {
    const cat = this.getCategories().find(c => c.id === id);
    const categories = this.getCategories().filter((c) => c.id !== id);
    setStoredItem(STORAGE_KEYS.CATEGORIES, categories);
    this.addActivityLog('Admin', 'admin', 'Category Deleted', 'Categories', `Deleted category: ${cat?.name || id}`);
  }

  // BRANCHES
  static getBranches(): Branch[] {
    return getStoredItem<Branch[]>(STORAGE_KEYS.BRANCHES, INITIAL_BRANCHES);
  }

  static saveBranch(branch: Branch): Branch {
    const branches = this.getBranches();
    const index = branches.findIndex((b) => b.id === branch.id);

    if (index >= 0) {
      const old = branches[index];
      branches[index] = branch;
      setStoredItem(STORAGE_KEYS.BRANCHES, branches);
      
      if (old.isOpen !== branch.isOpen) {
        this.addActivityLog('Admin', 'admin', branch.isOpen ? 'Branch Open' : 'Branch Close', 'Branches', `${branch.name} is now ${branch.isOpen ? 'Open' : 'Closed'}`);
      } else if (!old.isMain && branch.isMain) {
        this.addActivityLog('Admin', 'admin', 'Main Branch Changed', 'Branches', `${branch.name} was set as Main Branch`);
      } else {
        this.addActivityLog('Admin', 'admin', 'Branch Updated', 'Branches', `Updated branch: ${branch.name}`);
      }
    } else {
      branches.push(branch);
      setStoredItem(STORAGE_KEYS.BRANCHES, branches);
      this.addActivityLog('Admin', 'admin', 'Branch Created', 'Branches', `Created branch: ${branch.name}`);
    }
    return branch;
  }

  static deleteBranch(id: string): void {
    const branch = this.getBranches().find(b => b.id === id);
    const branches = this.getBranches().filter((b) => b.id !== id);
    setStoredItem(STORAGE_KEYS.BRANCHES, branches);
    this.addActivityLog('Admin', 'admin', 'Branch Deleted', 'Branches', `Deleted branch: ${branch?.name || id}`);
  }

  // FRANCHISE ENQUIRIES
  static getFranchiseEnquiries(): FranchiseEnquiry[] {
    return getStoredItem<FranchiseEnquiry[]>(STORAGE_KEYS.FRANCHISE, []);
  }

  static saveFranchiseEnquiry(enquiry: FranchiseEnquiry): FranchiseEnquiry {
    const enquiries = this.getFranchiseEnquiries();
    const index = enquiries.findIndex((e) => e.id === enquiry.id);
    if (index >= 0) {
      enquiries[index] = enquiry;
    } else {
      enquiries.unshift(enquiry);
    }
    setStoredItem(STORAGE_KEYS.FRANCHISE, enquiries);
    this.addActivityLog(enquiry.name, 'customer', 'Franchise Enquiry Submitted', 'Franchise', `New enquiry from ${enquiry.location}`);
    return enquiry;
  }

  static deleteFranchiseEnquiry(id: string): void {
    const enquiries = this.getFranchiseEnquiries().filter((e) => e.id !== id);
    setStoredItem(STORAGE_KEYS.FRANCHISE, enquiries);
    this.addAuditLog('Admin', 'Franchise', 'Deleted Enquiry', `Deleted enquiry ID: ${id}`);
  }

  // REVIEWS
  static getReviews(): Review[] {
    const initialReviews: Review[] = [
      {
        id: 'rev-1',
        productId: 'prod-choc-truffle',
        productName: 'Signature Chocolate Truffle Cake',
        customerId: 'user-demo-1',
        customerName: 'Ananya Ramesh',
        avatarText: 'AR',
        avatarBg: '#6F4E37',
        rating: 5,
        title: 'Best Chocolate Truffle in Chennai!',
        comment: 'Ordered for my daughter’s 10th birthday. The Dutch cocoa ganache was rich and super fresh. Anna Nagar branch pickup was ready right on time!',
        status: 'approved',
        createdAt: Date.now() - 86400000 * 2,
      },
      {
        id: 'rev-2',
        productId: 'prod-veg-puff',
        productName: 'Classic Hot Spicy Veg Puff',
        customerId: 'user-demo-2',
        customerName: 'Karthik Subramanian',
        avatarText: 'KS',
        avatarBg: '#D4A017',
        rating: 5,
        title: 'Crispy and Hot!',
        comment: 'The flaky layers and spice blend are unbeatable. Perfect evening snack with tea.',
        status: 'approved',
        createdAt: Date.now() - 86400000 * 4,
      }
    ];
    return getStoredItem<Review[]>(STORAGE_KEYS.REVIEWS, initialReviews);
  }

  static addReview(review: Review): Review {
    const reviews = this.getReviews();
    reviews.unshift(review);
    setStoredItem(STORAGE_KEYS.REVIEWS, reviews);
    return review;
  }

  static saveReview(review: Review): void {
    const reviews = this.getReviews();
    const idx = reviews.findIndex((r) => r.id === review.id);
    if (idx >= 0) reviews[idx] = review;
    else reviews.unshift(review);
    setStoredItem(STORAGE_KEYS.REVIEWS, reviews);
    this.addActivityLog('Admin', 'admin', 'Review Updated', 'Reviews', `Updated review by ${review.customerName}`);
  }

  static deleteReview(id: string): void {
    const reviews = this.getReviews().filter((r) => r.id !== id);
    setStoredItem(STORAGE_KEYS.REVIEWS, reviews);
    this.addActivityLog('Admin', 'admin', 'Review Deleted', 'Reviews', `Deleted review ID: ${id}`);
  }

  static updateReviewStatus(reviewId: string, status: 'approved' | 'hidden' | 'pending'): void {
    const reviews = this.getReviews();
    const rev = reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.status = status;
      setStoredItem(STORAGE_KEYS.REVIEWS, reviews);
      this.addActivityLog('Admin', 'admin', `Review ${status.charAt(0).toUpperCase() + status.slice(1)}`, 'Reviews', `Review by ${rev.customerName} set to ${status}`);
    }
  }

  // OFFERS
  static getAllOffers(): Offer[] {
    return getStoredItem<Offer[]>(STORAGE_KEYS.OFFERS, INITIAL_OFFERS);
  }

  static getOffers(): Offer[] {
    const all = this.getAllOffers();
    const now = new Date();
    return all.filter(o => {
      if (!o.enabled) return false;
      const start = new Date(`${o.startDate}T${o.startTime}`);
      const end = new Date(`${o.endDate}T${o.endTime}`);
      return now >= start && now <= end;
    });
  }

  static saveOffer(offer: Offer): Offer {
    const offers = this.getAllOffers();
    const idx = offers.findIndex((o) => o.id === offer.id);
    const isNew = idx < 0;
    if (idx >= 0) offers[idx] = offer;
    else offers.unshift(offer);
    setStoredItem(STORAGE_KEYS.OFFERS, offers);
    this.addActivityLog('Admin', 'admin', isNew ? 'Offer Created' : 'Offer Updated', 'Offers', `${isNew ? 'Created' : 'Updated'} offer: ${offer.title}`);
    return offer;
  }

  static deleteOffer(id: string): void {
    const offer = this.getAllOffers().find(o => o.id === id);
    const offers = this.getAllOffers().filter((o) => o.id !== id);
    setStoredItem(STORAGE_KEYS.OFFERS, offers);
    this.addActivityLog('Admin', 'admin', 'Offer Deleted', 'Offers', `Deleted offer: ${offer?.title || id}`);
  }

  // CMS
  static getCMS(): HomepageCMS {
    return getStoredItem<HomepageCMS>(STORAGE_KEYS.CMS, INITIAL_CMS);
  }

  static getHomepageCMS(): HomepageCMS {
    return this.getCMS();
  }

  static saveHomepageCMS(cms: HomepageCMS): HomepageCMS {
    setStoredItem(STORAGE_KEYS.CMS, cms);
    this.addActivityLog('Admin', 'admin', 'Homepage Updated', 'Homepage CMS', 'Homepage CMS settings saved');
    return cms;
  }

  static saveCMS(cms: HomepageCMS): HomepageCMS {
    setStoredItem(STORAGE_KEYS.CMS, cms);
    this.addActivityLog('Admin', 'admin', 'Homepage Updated', 'Homepage CMS', 'Homepage CMS settings saved');
    return cms;
  }

  // THEME
  static getThemeSettings(): Record<string, string> | null {
    return getStoredItem<Record<string, string> | null>(STORAGE_KEYS.THEME, null);
  }

  static saveThemeSettings(theme: Record<string, string>): void {
    setStoredItem(STORAGE_KEYS.THEME, theme);
  }

  // LOGS
  static getActivityLogs(): ActivityLog[] {
    return getStoredItem<ActivityLog[]>(STORAGE_KEYS.LOGS, [
      {
        id: 'log-1',
        userId: 'admin-1',
        userName: 'Satheesh Bakery Admin',
        userRole: 'admin',
        action: 'System Initialized',
        module: 'System',
        description: 'Satheesh Bakery Platform initialized successfully',
        timestamp: Date.now() - 3600000,
      }
    ]);
  }

  static addActivityLog(userName: string, role: 'customer' | 'admin' | 'staff', action: string, module: string, description: string): void {
    const logs = this.getActivityLogs();
    const currentUser = this.getCurrentUser();
    
    // Override with actual current user if available
    const finalUserName = currentUser?.fullName || userName;
    const finalRole = currentUser?.role || role;
    const finalEmail = currentUser?.email || '';

    logs.unshift({
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      userId: currentUser?.uid || 'user',
      userName: finalUserName,
      userRole: finalRole,
      action,
      module,
      description,
      timestamp: Date.now(),
      email: finalEmail, // Adding email as per prompt requirement
    });
    setStoredItem(STORAGE_KEYS.LOGS, logs.slice(0, 100)); // keep last 100 logs
  }

  static getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT, []);
  }

  static addAuditLog(adminId: string, entity: string, action: string, description: string): void {
    const audit = this.getAuditLogs();
    audit.unshift({
      id: `audit-${Date.now()}`,
      adminId,
      entity,
      action,
      description,
      timestamp: Date.now(),
    } as AuditLog);
    setStoredItem(STORAGE_KEYS.AUDIT, audit.slice(0, 100));
  }
}
