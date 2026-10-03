export interface BeatDNA {
  energy?: number; // 0 - 100
  darkness?: number; // 0 - 100
  aggression?: number; // 0 - 100
  melodicIntensity?: number; // 0 - 100
  drumIntensity?: number; // 0 - 100
  cinematicIntensity?: number; // 0 - 100
}

export interface AudioAsset {
  id: string;
  beatId: string;
  format: 'm4a' | 'mp3';
  mimeType: string;
  fileSize: number;
  duration?: number;
  storageProvider: string;
  storageObjectId: string;
  checksum?: string;
  status: 'active' | 'archived' | 'missing' | 'error';
  createdAt: string;
}

export interface ArtworkAsset {
  id: string;
  beatId?: string;
  storageProvider: string;
  storageObjectId: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
}

export interface BackupRecord {
  id: string;
  audioAssetId: string;
  backupProvider: string;
  backupObjectId: string;
  status: 'healthy' | 'pending' | 'failed' | 'corrupted';
  checksum?: string;
  createdAt: string;
  lastVerifiedAt?: string;
}

export interface LicenseVersion {
  id: string;
  licenseId: string;
  versionNumber: number;
  name: string;
  price: number;
  description: string;
  fileTypes: string[];
  streamingLimit?: string;
  distributionLimit?: string;
  commercialRights: boolean;
  performanceRights: boolean;
  isExclusive: boolean;
  termsText: string;
  createdAt: string;
}

export interface LicenseTemplate {
  id: string;
  name: string;
  price: number;
  description: string;
  fileTypes: string[];
  streamingLimit?: string;
  distributionLimit?: string;
  commercialRights: boolean;
  performanceRights: boolean;
  isExclusive: boolean;
  activeVersionId?: string;
}

export interface BeatPassport {
  id: string;
  beatId: string;
  beatTitle: string;
  producer: string;
  customerEmail: string;
  orderId: string;
  purchaseDate: string;
  licenseName: string;
  licenseVersionId: string;
  licensePrice: number;
  downloadToken: string;
  includedFiles: string[];
}

export interface Beat {
  id: string;
  title: string;
  producer: string;
  artworkUrl: string;
  artworkAssetId?: string;
  audioAssetId?: string;
  description: string;
  bpm: number;
  key: string;
  genre: string;
  subgenre: string;
  tags: string[];
  mood: string;
  dna?: BeatDNA;
  isFeatured: boolean;
  isVault: boolean;
  isFree: boolean;
  isDraft?: boolean;
  isArchived?: boolean;
  isTrash?: boolean;
  price: number;
  audioUrl: string;
  format: 'm4a' | 'mp3';
  duration: number;
  createdAt: string;
  updatedAt: string;
  playCount: number;
  downloadCount: number;
  purchaseCount: number;
  licenses?: LicenseTemplate[];
}

export interface BeatPackTrack {
  id: string;
  title: string;
  audioUrl: string;
  audioAssetId?: string;
  format: 'm4a' | 'mp3';
  duration: number;
  bpm: number;
  key: string;
}

export interface BeatPack {
  id: string;
  title: string;
  description: string;
  artworkUrl: string;
  artworkAssetId?: string;
  price: number;
  isFree: boolean;
  isVault: boolean;
  tracks: BeatPackTrack[];
  tags: string[];
  category: string;
  createdAt: string;
  playCount: number;
  purchaseCount: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  artworkUrl?: string;
  beatIds: string[];
  createdAt: string;
}

export interface BeatStack {
  id: string;
  name: string;
  beatIds: string[];
  totalDuration: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  type: 'beat' | 'pack';
  title: string;
  price: number;
  audioUrl: string;
  audioAssetId?: string;
  format: string;
  licenseName?: string;
  licenseVersionId?: string;
}

export interface Order {
  id: string;
  paypalOrderId?: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FAILED' | 'REFUNDED';
  downloadToken: string;
  createdAt: string;
  paidAt?: string;
  passports?: BeatPassport[];
}

export interface Offer {
  id: string;
  beatId: string;
  beatTitle: string;
  customerEmail: string;
  offerAmount: number;
  originalPrice: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired' | 'cancelled';
  counterAmount?: number;
  createdAt: string;
}

export interface CustomerMessage {
  id: string;
  conversationId: string;
  senderEmail: string;
  senderName: string;
  isOwner: boolean;
  message: string;
  timestamp: string;
  isRead: boolean;
  beatId?: string;
}

export interface ProjectTrack {
  id: string;
  beatId: string;
  title: string;
  licenseName: string;
  audioAssetId?: string;
  notes?: string;
  addedAt: string;
}

export interface Project {
  id: string;
  title: string;
  customerEmail: string;
  description?: string;
  status: 'in_progress' | 'completed' | 'archived';
  tracks: ProjectTrack[];
  createdAt: string;
  updatedAt: string;
}

export interface MerchItem {
  id: string;
  title: string;
  price: number;
  description: string;
  imageUrl: string;
  sizes: string[];
  stock: number;
  link?: string;
}

export interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
}

export interface StoreSettings {
  storeName: string;
  producerName: string;
  bio: string;
  bannerUrl: string;
  profileImageUrl: string;
  currency: string;
  paypalClientId?: string;
  paypalSecret?: string;
  paypalMode?: 'sandbox' | 'live';
  adminPasscodeHash?: string;
  socialLinks: {
    youtube?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    spotify?: string;
  };
  paypalConfigured?: boolean;
  r2SafetyThresholdGb?: number;
  r2StorageUsageBytes?: number;
}

export interface CartItem {
  id: string;
  type: 'beat' | 'pack';
  item: Beat | BeatPack;
  price: number;
  selectedLicense?: LicenseTemplate;
  selectedLicenseVersionId?: string;
}

export interface AuditEvent {
  id: string;
  eventType: string;
  entityType: 'beat' | 'audio' | 'license' | 'cart' | 'order' | 'payment' | 'download' | 'backup';
  entityId: string;
  details: string;
  actor: string;
  timestamp: string;
}

export interface SystemNotification {
  id: string;
  type: 'order' | 'payment' | 'download' | 'beat' | 'security' | 'promo' | 'system' | 'health' | 'offer' | 'message';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface NotificationPreferences {
  browserNotifications: boolean;
  orderAlerts: boolean;
  paymentAlerts: boolean;
  beatActivityAlerts: boolean;
  securityAlerts: boolean;
  promotionalAlerts: boolean;
}

export interface SystemHealthStatus {
  subsystem: 'audio' | 'storage' | 'commerce' | 'store' | 'downloads' | 'licenses' | 'offers' | 'messages' | 'backups';
  status: 'GREEN' | 'YELLOW' | 'RED';
  message: string;
  lastChecked: string;
  details?: string;
}

export type RadioMode = 'DISCOVERY' | 'DARK' | 'HARD' | 'MELODIC' | 'CINEMATIC' | 'FAVORITES' | 'VAULT';
