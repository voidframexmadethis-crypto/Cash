import fs from 'fs';
import path from 'path';
import { 
  Beat, BeatPack, Collection, Order, MerchItem, YouTubeVideo, StoreSettings, 
  Offer, CustomerMessage, AudioAsset, ArtworkAsset, BackupRecord, LicenseVersion, 
  Project, AuditEvent 
} from '../types/index.js';
import { DEFAULT_LICENSE_TEMPLATES } from './licenses.js';

export interface DatabaseSchema {
  beats: Beat[];
  beatPacks: BeatPack[];
  collections: Collection[];
  orders: Order[];
  merch: MerchItem[];
  youtube: YouTubeVideo[];
  settings: StoreSettings;
  offers: Offer[];
  messages: CustomerMessage[];
  audioAssets: AudioAsset[];
  artworkAssets: ArtworkAsset[];
  backupRecords: BackupRecord[];
  licenseVersions: LicenseVersion[];
  projects: Project[];
  auditEvents: AuditEvent[];
  analytics: {
    id: string;
    type: 'play' | 'download' | 'purchase' | 'view';
    beatId?: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: "CASHMERE KID$",
  producerName: "CASHMERE KID$",
  bio: "Independent trap producer creating luxury underground beats, hard-hitting 808s, and ambient melodies.",
  bannerUrl: "/src/assets/images/hero_cashmere_kids_1790977501320.jpg",
  profileImageUrl: "/src/assets/images/producer_cashmere_kids_1790977511588.jpg",
  paypalClientId: "",
  paypalSecret: "",
  paypalMode: "sandbox",
  adminPasscodeHash: "199927",
  currency: "USD",
  socialLinks: {
    youtube: "https://youtube.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    spotify: "https://spotify.com"
  }
};

const DEFAULT_COLLECTIONS: Collection[] = [
  { id: 'col-1', name: 'Trap', slug: 'trap', description: 'Hard 808s and crisp hi-hats', artworkUrl: '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg', beatIds: [], createdAt: new Date().toISOString() },
  { id: 'col-2', name: 'Freestyle Trap', slug: 'freestyle-trap', description: 'Open space beats for raw delivery', artworkUrl: '/src/assets/images/hero_cashmere_kids_1790977501320.jpg', beatIds: [], createdAt: new Date().toISOString() },
  { id: 'col-3', name: 'Dark Trap', slug: 'dark-trap', description: 'Underground dark atmospheric beats', artworkUrl: '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg', beatIds: [], createdAt: new Date().toISOString() },
  { id: 'col-4', name: 'Future Trap', slug: 'future-trap', description: 'Futuristic synth driven trap', artworkUrl: '/src/assets/images/hero_cashmere_kids_1790977501320.jpg', beatIds: [], createdAt: new Date().toISOString() },
  { id: 'col-5', name: 'Melodic Trap', slug: 'melodic-trap', description: 'Catchy synth and piano melodies', artworkUrl: '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg', beatIds: [], createdAt: new Date().toISOString() },
  { id: 'col-6', name: 'Hard', slug: 'hard', description: 'Heavyweight bass & aggressive beats', artworkUrl: '/src/assets/images/hero_cashmere_kids_1790977501320.jpg', beatIds: [], createdAt: new Date().toISOString() },
  { id: 'col-7', name: 'Cinematic', slug: 'cinematic', description: 'Orchestral dark movie-score trap', artworkUrl: '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg', beatIds: [], createdAt: new Date().toISOString() },
  { id: 'col-8', name: 'Free Beats', slug: 'free-beats', description: 'Legitimate free download releases', artworkUrl: '/src/assets/images/hero_cashmere_kids_1790977501320.jpg', beatIds: [], createdAt: new Date().toISOString() }
];

class JsonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirs();
    this.data = this.load();
    this.seedDefaultLicenseVersions();
  }

  private ensureDirs() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const audioDir = path.resolve(uploadsDir, 'audio');
    const artworkDir = path.resolve(uploadsDir, 'artwork');
    const backupDir = path.resolve(uploadsDir, 'backups');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
    if (!fs.existsSync(artworkDir)) fs.mkdirSync(artworkDir, { recursive: true });
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          beats: (parsed.beats || []).map((b: any) => ({
            ...b,
            isVault: Boolean(b.isVault),
            isDraft: Boolean(b.isDraft),
            isArchived: Boolean(b.isArchived)
          })),
          beatPacks: (parsed.beatPacks || []).map((p: any) => ({ ...p, isVault: Boolean(p.isVault) })),
          collections: parsed.collections || DEFAULT_COLLECTIONS,
          orders: parsed.orders || [],
          merch: parsed.merch || [],
          youtube: parsed.youtube || [],
          settings: { ...DEFAULT_SETTINGS, adminPasscodeHash: "199927", ...(parsed.settings || {}) },
          offers: parsed.offers || [],
          messages: parsed.messages || [],
          audioAssets: parsed.audioAssets || [],
          artworkAssets: parsed.artworkAssets || [],
          backupRecords: parsed.backupRecords || [],
          licenseVersions: parsed.licenseVersions || [],
          projects: parsed.projects || [],
          auditEvents: parsed.auditEvents || [],
          analytics: parsed.analytics || []
        };
      }
    } catch (err) {
      console.error('Failed to load database, initializing defaults:', err);
    }

    const initialData: DatabaseSchema = {
      beats: [],
      beatPacks: [],
      collections: DEFAULT_COLLECTIONS,
      orders: [],
      merch: [],
      youtube: [],
      settings: DEFAULT_SETTINGS,
      offers: [],
      messages: [],
      audioAssets: [],
      artworkAssets: [],
      backupRecords: [],
      licenseVersions: [],
      projects: [],
      auditEvents: [],
      analytics: []
    };

    this.save(initialData);
    return initialData;
  }

  private seedDefaultLicenseVersions() {
    if (this.data.licenseVersions.length === 0) {
      DEFAULT_LICENSE_TEMPLATES.forEach(t => {
        this.data.licenseVersions.push({
          id: 'licver-' + t.id + '-v1',
          licenseId: t.id,
          versionNumber: 1,
          name: t.name,
          price: t.price,
          description: t.description,
          fileTypes: t.fileTypes,
          streamingLimit: t.streamingLimit,
          distributionLimit: t.distributionLimit,
          commercialRights: t.commercialRights,
          performanceRights: t.performanceRights,
          isExclusive: t.isExclusive,
          termsText: `Standard Cashmere Kid$ ${t.name} License Terms (v1.0)`,
          createdAt: new Date().toISOString()
        });
      });
      this.save();
    }
  }

  private save(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk:', err);
    }
  }

  // --- AUDIT TRAIL LOGGING ---
  public logAuditEvent(eventType: string, entityType: AuditEvent['entityType'], entityId: string, details: string, actor = 'system') {
    const event: AuditEvent = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      eventType,
      entityType,
      entityId,
      details,
      actor,
      timestamp: new Date().toISOString()
    };
    this.data.auditEvents.unshift(event);
    if (this.data.auditEvents.length > 2000) {
      this.data.auditEvents = this.data.auditEvents.slice(0, 2000);
    }
    this.save();
  }

  public getAuditEvents(): AuditEvent[] {
    return this.data.auditEvents;
  }

  // --- AUDIO ASSETS & BACKUP RECORDS ---
  public getAudioAssets(): AudioAsset[] {
    return this.data.audioAssets;
  }

  public getAudioAssetById(id: string): AudioAsset | undefined {
    return this.data.audioAssets.find(a => a.id === id);
  }

  public addAudioAsset(asset: AudioAsset): AudioAsset {
    this.data.audioAssets.unshift(asset);
    this.logAuditEvent('AUDIO_ASSET_CREATED', 'audio', asset.id, `Created audio asset for beat ${asset.beatId}`);
    this.save();
    return asset;
  }

  public updateAudioAsset(asset: AudioAsset): AudioAsset | null {
    const idx = this.data.audioAssets.findIndex(a => a.id === asset.id);
    if (idx !== -1) {
      this.data.audioAssets[idx] = asset;
      this.save();
      return asset;
    }
    return null;
  }

  public getBackupRecords(): BackupRecord[] {
    return this.data.backupRecords;
  }

  public addBackupRecord(backup: BackupRecord): BackupRecord {
    this.data.backupRecords.unshift(backup);
    this.logAuditEvent('BACKUP_RECORD_CREATED', 'backup', backup.id, `Created backup for audio asset ${backup.audioAssetId}`);
    this.save();
    return backup;
  }

  // --- LICENSE VERSIONS ---
  public getLicenseVersions(): LicenseVersion[] {
    return this.data.licenseVersions;
  }

  public getActiveLicenseVersion(licenseId: string): LicenseVersion | undefined {
    const versions = this.data.licenseVersions.filter(v => v.licenseId === licenseId);
    return versions.sort((a, b) => b.versionNumber - a.versionNumber)[0];
  }

  public createLicenseVersion(license: LicenseVersion): LicenseVersion {
    this.data.licenseVersions.unshift(license);
    this.logAuditEvent('LICENSE_VERSION_CREATED', 'license', license.id, `Created license version ${license.versionNumber} for ${license.name}`);
    this.save();
    return license;
  }

  // --- BEAT OPERATIONS ---
  public getBeats(includeDrafts = false, includeArchived = false): Beat[] {
    return this.data.beats.filter(b => {
      if (!includeDrafts && b.isDraft) return false;
      if (!includeArchived && b.isArchived) return false;
      return true;
    });
  }

  public getBeatById(id: string): Beat | undefined {
    return this.data.beats.find(b => b.id === id);
  }

  public addBeat(beat: Beat): Beat {
    this.data.beats.unshift(beat);
    this.logAuditEvent('BEAT_CREATED', 'beat', beat.id, `Created beat ${beat.title}`);
    this.save();
    return beat;
  }

  public updateBeat(id: string, update: Partial<Beat>): Beat | null {
    const idx = this.data.beats.findIndex(b => b.id === id);
    if (idx === -1) return null;
    this.data.beats[idx] = {
      ...this.data.beats[idx],
      ...update,
      updatedAt: new Date().toISOString()
    };
    this.logAuditEvent('BEAT_UPDATED', 'beat', id, `Updated beat attributes`);
    this.save();
    return this.data.beats[idx];
  }

  public bulkUpdateBeats(ids: string[], update: Partial<Beat>): number {
    let count = 0;
    this.data.beats.forEach(b => {
      if (ids.includes(b.id)) {
        Object.assign(b, update, { updatedAt: new Date().toISOString() });
        count++;
      }
    });
    if (count > 0) {
      this.logAuditEvent('BEATS_BULK_UPDATED', 'beat', 'bulk', `Bulk updated ${count} beats`);
      this.save();
    }
    return count;
  }

  public bulkDeleteBeats(ids: string[]): number {
    const initialLen = this.data.beats.length;
    this.data.beats = this.data.beats.filter(b => !ids.includes(b.id));
    const deleted = initialLen - this.data.beats.length;
    if (deleted > 0) {
      this.logAuditEvent('BEATS_BULK_DELETED', 'beat', 'bulk', `Deleted ${deleted} beats`);
      this.save();
    }
    return deleted;
  }

  public deleteBeat(id: string): boolean {
    const initialLen = this.data.beats.length;
    this.data.beats = this.data.beats.filter(b => b.id !== id);
    if (this.data.beats.length !== initialLen) {
      this.logAuditEvent('BEAT_DELETED', 'beat', id, `Deleted beat ${id}`);
      this.save();
      return true;
    }
    return false;
  }

  public incrementPlayCount(beatId: string) {
    const beat = this.getBeatById(beatId);
    if (beat) {
      beat.playCount = (beat.playCount || 0) + 1;
      this.save();
      this.logAnalytics({ type: 'play', beatId });
    }
  }

  public incrementDownloadCount(beatId: string) {
    const beat = this.getBeatById(beatId);
    if (beat) {
      beat.downloadCount = (beat.downloadCount || 0) + 1;
      this.save();
      this.logAnalytics({ type: 'download', beatId });
    }
  }

  public incrementPurchaseCount(beatId: string) {
    const beat = this.getBeatById(beatId);
    if (beat) {
      beat.purchaseCount = (beat.purchaseCount || 0) + 1;
      this.save();
      this.logAnalytics({ type: 'purchase', beatId });
    }
  }

  // --- BEAT PACK OPERATIONS ---
  public getBeatPacks(): BeatPack[] {
    return this.data.beatPacks;
  }

  public getBeatPackById(id: string): BeatPack | undefined {
    return this.data.beatPacks.find(p => p.id === id);
  }

  public addBeatPack(pack: BeatPack): BeatPack {
    this.data.beatPacks.unshift(pack);
    this.logAuditEvent('BEAT_PACK_CREATED', 'beat', pack.id, `Created beat pack ${pack.title}`);
    this.save();
    return pack;
  }

  public deleteBeatPack(id: string): boolean {
    const len = this.data.beatPacks.length;
    this.data.beatPacks = this.data.beatPacks.filter(p => p.id !== id);
    if (this.data.beatPacks.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- COLLECTIONS ---
  public getCollections(): Collection[] {
    return this.data.collections;
  }

  public createCollection(col: Collection): Collection {
    this.data.collections.push(col);
    this.save();
    return col;
  }

  public addBeatToCollection(collectionId: string, beatId: string) {
    const col = this.data.collections.find(c => c.id === collectionId);
    if (col && !col.beatIds.includes(beatId)) {
      col.beatIds.push(beatId);
      this.save();
    }
  }

  public removeBeatFromCollection(collectionId: string, beatId: string) {
    const col = this.data.collections.find(c => c.id === collectionId);
    if (col) {
      col.beatIds = col.beatIds.filter(id => id !== beatId);
      this.save();
    }
  }

  // --- OFFERS ---
  public getOffers(): Offer[] {
    return this.data.offers;
  }

  public addOffer(offer: Offer): Offer {
    this.data.offers.unshift(offer);
    this.save();
    return offer;
  }

  public updateOfferStatus(id: string, status: Offer['status'], counterAmount?: number): Offer | null {
    const idx = this.data.offers.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.offers[idx].status = status;
    if (counterAmount) this.data.offers[idx].counterAmount = counterAmount;
    this.save();
    return this.data.offers[idx];
  }

  // --- MESSAGES ---
  public getMessages(): CustomerMessage[] {
    return this.data.messages;
  }

  public addMessage(msg: CustomerMessage): CustomerMessage {
    this.data.messages.unshift(msg);
    this.save();
    return msg;
  }

  // --- PROJECTS ---
  public getProjects(customerEmail?: string): Project[] {
    if (customerEmail) {
      return this.data.projects.filter(p => p.customerEmail.toLowerCase() === customerEmail.toLowerCase());
    }
    return this.data.projects;
  }

  public createProject(project: Project): Project {
    this.data.projects.unshift(project);
    this.logAuditEvent('PROJECT_CREATED', 'order', project.id, `Created project ${project.title}`);
    this.save();
    return project;
  }

  // --- ORDERS & PAYMENTS ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id);
  }

  public getOrderByToken(token: string): Order | undefined {
    return this.data.orders.find(o => o.downloadToken === token);
  }

  public createOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.logAuditEvent('ORDER_CREATED', 'order', order.id, `Created order with subtotal $${order.subtotal || order.totalAmount}`);
    this.save();
    return order;
  }

  public updateOrder(id: string, update: Partial<Order>): Order | null {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx === -1) return null;
    this.data.orders[idx] = {
      ...this.data.orders[idx],
      ...update
    };
    if (update.status) {
      this.logAuditEvent('ORDER_STATUS_CHANGED', 'order', id, `Updated order status to ${update.status}`);
    }
    this.save();
    return this.data.orders[idx];
  }

  // --- MERCH ---
  public getMerch(): MerchItem[] {
    return this.data.merch;
  }

  public addMerchItem(item: MerchItem): MerchItem {
    this.data.merch.unshift(item);
    this.save();
    return item;
  }

  public deleteMerchItem(id: string): boolean {
    const len = this.data.merch.length;
    this.data.merch = this.data.merch.filter(m => m.id !== id);
    if (this.data.merch.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- YOUTUBE ---
  public getYouTubeVideos(): YouTubeVideo[] {
    return this.data.youtube;
  }

  public addYouTubeVideo(video: YouTubeVideo): YouTubeVideo {
    this.data.youtube.unshift(video);
    this.save();
    return video;
  }

  public deleteYouTubeVideo(id: string): boolean {
    const len = this.data.youtube.length;
    this.data.youtube = this.data.youtube.filter(y => y.id !== id);
    if (this.data.youtube.length !== len) {
      this.save();
      return true;
    }
    return false;
  }

  // --- SETTINGS ---
  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(update: Partial<StoreSettings>): StoreSettings {
    this.data.settings = {
      ...this.data.settings,
      ...update
    };
    this.save();
    return this.data.settings;
  }

  // --- ANALYTICS & RECORD PLAQUES ---
  public logAnalytics(event: { type: 'play' | 'download' | 'purchase' | 'view'; beatId?: string; metadata?: Record<string, any> }) {
    this.data.analytics.push({
      id: 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      ...event,
      timestamp: new Date().toISOString()
    });
    if (this.data.analytics.length > 5000) {
      this.data.analytics = this.data.analytics.slice(-5000);
    }
    this.save();
  }

  public getAnalyticsSummary(timeframe: 'today' | '7d' | '30d' | '90d' | 'all' = 'all') {
    const beats = this.data.beats;
    let orders = this.data.orders.filter(o => o.status === 'PAID');
    let events = this.data.analytics;

    const now = Date.now();
    let cutoff = 0;
    if (timeframe === 'today') cutoff = now - (24 * 60 * 60 * 1000);
    else if (timeframe === '7d') cutoff = now - (7 * 24 * 60 * 60 * 1000);
    else if (timeframe === '30d') cutoff = now - (30 * 24 * 60 * 60 * 1000);
    else if (timeframe === '90d') cutoff = now - (90 * 24 * 60 * 60 * 1000);

    if (cutoff > 0) {
      orders = orders.filter(o => new Date(o.createdAt).getTime() >= cutoff);
      events = events.filter(e => new Date(e.timestamp).getTime() >= cutoff);
    }

    const totalStreams = timeframe === 'all' 
      ? beats.reduce((acc, b) => acc + (b.playCount || 0), 0)
      : events.filter(e => e.type === 'play').length;

    const totalDownloads = timeframe === 'all'
      ? beats.reduce((acc, b) => acc + (b.downloadCount || 0), 0)
      : events.filter(e => e.type === 'download').length;

    const totalPurchases = orders.reduce((acc, o) => acc + o.items.length, 0);
    const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);

    return {
      timeframe,
      totalBeats: beats.length,
      totalStreams,
      totalDownloads,
      totalPurchases,
      totalOrders: orders.length,
      totalRevenue,
      topBeats: [...beats].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 5)
    };
  }
}

export const db = new JsonDatabase();
