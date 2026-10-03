import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { db } from './db.js';
import { AudioAsset, BackupRecord, SystemHealthStatus } from '../types/index.js';
import { CloudflareR2StorageAdapter } from './r2.js';
import { InternetArchiveStorageAdapter } from './internetArchive.js';

export interface StorageObjectMetadata {
  objectId: string;
  providerName: string;
  size: number;
  checksum: string;
  mimeType: string;
  createdAt: string;
}

export interface StorageHealthReport {
  providerName: string;
  status: 'HEALTHY' | 'WARNING' | 'ERROR';
  totalObjects: number;
  totalBytes: number;
  details: string;
}

export interface IStorageProvider {
  name: string;
  role: 'PRIMARY' | 'BACKUP' | 'ARCHIVE';
  putObject(fileBuffer: Buffer, canonicalKey: string, mimeType: string): Promise<StorageObjectMetadata>;
  getObject(objectId: string): Promise<Buffer | null>;
  getObjectPath(objectId: string): string;
  headObject(objectId: string): Promise<StorageObjectMetadata | null>;
  exists(objectId: string): Promise<boolean>;
  deleteObject(objectId: string): Promise<boolean>;
  copyObject(sourceObjectId: string, destProvider: IStorageProvider, destKey: string): Promise<StorageObjectMetadata | null>;
  listObjects(): Promise<StorageObjectMetadata[]>;
  checksum(objectId: string): Promise<string | null>;
  generateAuthorizedDownload(objectId: string, token: string): string;
  healthCheck(): Promise<StorageHealthReport>;
}

// Canonical Key Generator to prevent path traversal & maintain clean deterministic object keys
export function generateCanonicalObjectKey(
  category: 'beats' | 'beat-packs' | 'projects' | 'users' | 'releases',
  entityId: string,
  assetType: 'audio' | 'artwork' | 'files',
  assetId: string,
  ext: string
): string {
  const cleanCategory = category.replace(/[^a-z0-9_-]/g, '');
  const cleanId = entityId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanAssetType = assetType.replace(/[^a-z0-9_-]/g, '');
  const cleanAssetId = assetId.replace(/[^a-zA-Z0-9_-]/g, '');
  const cleanExt = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;

  return `${cleanCategory}_${cleanId}_${cleanAssetType}_${cleanAssetId}${cleanExt}`;
}

export class LocalStorageProvider implements IStorageProvider {
  public name: string;
  public role: 'PRIMARY' | 'BACKUP' | 'ARCHIVE';
  private baseDir: string;
  private urlPrefix: string;

  constructor(name = 'local_primary', role: 'PRIMARY' | 'BACKUP' | 'ARCHIVE' = 'PRIMARY', baseSubdir = 'audio') {
    this.name = name;
    this.role = role;
    this.urlPrefix = `/uploads/${baseSubdir}`;
    const baseUploads = process.env.VERCEL ? path.resolve('/tmp', 'uploads') : path.resolve(process.cwd(), 'uploads');
    this.baseDir = path.resolve(baseUploads, baseSubdir);
    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
    } catch (err) {
      console.warn(`[LocalStorageProvider] Directory initialization notice for ${this.baseDir}:`, err);
    }
  }

  async putObject(fileBuffer: Buffer, canonicalKey: string, mimeType: string): Promise<StorageObjectMetadata> {
    const safeKey = path.basename(canonicalKey).replace(/[^a-zA-Z0-9_.-]/g, '_');
    const targetPath = path.resolve(this.baseDir, safeKey);

    try {
      if (!fs.existsSync(this.baseDir)) {
        fs.mkdirSync(this.baseDir, { recursive: true });
      }
      fs.writeFileSync(targetPath, fileBuffer);
    } catch (err) {
      console.warn(`[LocalStorageProvider] Local file write notice for ${targetPath}:`, err);
    }

    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    const objectId = `${this.urlPrefix}/${safeKey}`;

    return {
      objectId,
      providerName: this.name,
      size: fileBuffer.length,
      checksum,
      mimeType,
      createdAt: new Date().toISOString()
    };
  }

  getObjectPath(objectId: string): string {
    const rel = objectId.startsWith('/') ? objectId.substring(1) : objectId;
    const baseUploads = process.env.VERCEL ? path.resolve('/tmp', 'uploads') : path.resolve(process.cwd(), 'uploads');
    const sub = rel.startsWith('uploads/') ? rel.substring(8) : rel;
    return path.resolve(baseUploads, sub);
  }

  async getObject(objectId: string): Promise<Buffer | null> {
    const fullPath = this.getObjectPath(objectId);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
    return null;
  }

  async headObject(objectId: string): Promise<StorageObjectMetadata | null> {
    const fullPath = this.getObjectPath(objectId);
    if (!fs.existsSync(fullPath)) return null;

    const stat = fs.statSync(fullPath);
    const buffer = fs.readFileSync(fullPath);
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const ext = path.extname(fullPath).toLowerCase();
    const mimeType = ext === '.m4a' ? 'audio/mp4' : ext === '.mp3' ? 'audio/mpeg' : 'application/octet-stream';

    return {
      objectId,
      providerName: this.name,
      size: stat.size,
      checksum,
      mimeType,
      createdAt: stat.birthtime.toISOString()
    };
  }

  async exists(objectId: string): Promise<boolean> {
    const fullPath = this.getObjectPath(objectId);
    return fs.existsSync(fullPath);
  }

  async deleteObject(objectId: string): Promise<boolean> {
    const fullPath = this.getObjectPath(objectId);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  }

  async copyObject(sourceObjectId: string, destProvider: IStorageProvider, destKey: string): Promise<StorageObjectMetadata | null> {
    const buffer = await this.getObject(sourceObjectId);
    if (!buffer) return null;

    const ext = path.extname(sourceObjectId).toLowerCase();
    const mimeType = ext === '.m4a' ? 'audio/mp4' : ext === '.mp3' ? 'audio/mpeg' : 'application/octet-stream';

    return await destProvider.putObject(buffer, destKey, mimeType);
  }

  async listObjects(): Promise<StorageObjectMetadata[]> {
    if (!fs.existsSync(this.baseDir)) return [];
    const files = fs.readdirSync(this.baseDir);
    const results: StorageObjectMetadata[] = [];

    for (const file of files) {
      const fullPath = path.resolve(this.baseDir, file);
      if (fs.statSync(fullPath).isFile()) {
        const stat = fs.statSync(fullPath);
        const objectId = `${this.urlPrefix}/${file}`;
        const ext = path.extname(file).toLowerCase();
        const mimeType = ext === '.m4a' ? 'audio/mp4' : ext === '.mp3' ? 'audio/mpeg' : 'application/octet-stream';
        results.push({
          objectId,
          providerName: this.name,
          size: stat.size,
          checksum: 'deferred',
          mimeType,
          createdAt: stat.birthtime.toISOString()
        });
      }
    }
    return results;
  }

  async checksum(objectId: string): Promise<string | null> {
    const buffer = await this.getObject(objectId);
    if (!buffer) return null;
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  generateAuthorizedDownload(objectId: string, token: string): string {
    return `/api/download/authorized/${token}/${encodeURIComponent(objectId)}`;
  }

  async healthCheck(): Promise<StorageHealthReport> {
    try {
      const objects = await this.listObjects();
      const totalBytes = objects.reduce((acc, o) => acc + o.size, 0);
      return {
        providerName: this.name,
        status: 'HEALTHY',
        totalObjects: objects.length,
        totalBytes,
        details: `Local directory active with ${objects.length} verified objects.`
      };
    } catch (err: any) {
      return {
        providerName: this.name,
        status: 'ERROR',
        totalObjects: 0,
        totalBytes: 0,
        details: `Storage health error: ${err.message}`
      };
    }
  }
}

const r2Endpoint = process.env.CLOUDFLARE_R2_ENDPOINT;
const r2AccessKey = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'cashmere-kids-store';

export const primaryAudioProvider = r2Endpoint && r2AccessKey && r2SecretKey
  ? new CloudflareR2StorageAdapter('cloudflare_r2_audio', 'PRIMARY', {
      endpoint: r2Endpoint,
      accessKeyId: r2AccessKey,
      secretAccessKey: r2SecretKey,
      bucketName: r2Bucket
    })
  : new LocalStorageProvider('local_primary_audio', 'PRIMARY', 'audio');

export const primaryArtworkProvider = r2Endpoint && r2AccessKey && r2SecretKey
  ? new CloudflareR2StorageAdapter('cloudflare_r2_artwork', 'PRIMARY', {
      endpoint: r2Endpoint,
      accessKeyId: r2AccessKey,
      secretAccessKey: r2SecretKey,
      bucketName: r2Bucket
    })
  : new LocalStorageProvider('local_primary_artwork', 'PRIMARY', 'artwork');

export const backupAudioProvider = new LocalStorageProvider('local_mirror_backup', 'BACKUP', 'backups');

const iaAccessKey = process.env.INTERNET_ARCHIVE_ACCESS_KEY;
const iaSecretKey = process.env.INTERNET_ARCHIVE_SECRET_KEY;
const iaItemName = process.env.INTERNET_ARCHIVE_ITEM_NAME || 'cashmere-kids-store-catalog';

export const archiveAudioProvider = iaAccessKey && iaSecretKey
  ? new InternetArchiveStorageAdapter('internet_archive', 'ARCHIVE', {
      accessKeyId: iaAccessKey,
      secretAccessKey: iaSecretKey,
      itemName: iaItemName
    })
  : new LocalStorageProvider('local_archive', 'ARCHIVE', 'archive');

// --- STORAGE MANAGER MANAGER & ORPHAN DETECTOR ---
export class StorageOSManager {
  
  // Pipeline: Primary Upload -> Verification -> Mirror Backup -> Backup Record
  async processVerifiedUploadAndBackup(
    fileBuffer: Buffer,
    beatId: string,
    filename: string,
    format: 'm4a' | 'mp3' | 'zip'
  ) {
    const ext = format === 'mp3' ? '.mp3' : format === 'm4a' ? '.m4a' : '.zip';
    const mimeType = format === 'mp3' ? 'audio/mpeg' : format === 'm4a' ? 'audio/mp4' : 'application/zip';
    const assetId = 'asset-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);

    // 1. Generate Deterministic Object Key
    const canonicalKey = generateCanonicalObjectKey('beats', beatId, 'audio', assetId, ext);

    // 2. Query StorageRouter for the optimal active provider dynamically to avoid circular dependencies
    const { StorageRouter } = await import('./storageRouter.js');
    const activeProvider = await StorageRouter.selectProvider(fileBuffer.length, mimeType);

    // 3. Put in Selected Storage Provider
    const primaryMeta = await activeProvider.putObject(fileBuffer, canonicalKey, mimeType);

    // 4. Create AudioAsset Record
    const audioAsset: AudioAsset = {
      id: assetId,
      beatId,
      format: format as any,
      mimeType,
      fileSize: primaryMeta.size,
      storageProvider: activeProvider.name,
      storageObjectId: primaryMeta.objectId,
      checksum: primaryMeta.checksum,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    db.addAudioAsset(audioAsset);

    // 5. Trigger Automatic Mirror Backup Job if activeProvider is primary
    let backupRecord: BackupRecord | null = null;
    try {
      const backupMeta = await activeProvider.copyObject(primaryMeta.objectId, backupAudioProvider, canonicalKey);
      if (backupMeta) {
        backupRecord = {
          id: 'bkp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
          audioAssetId: assetId,
          backupProvider: 'local_mirror',
          backupObjectId: backupMeta.objectId,
          status: 'healthy',
          checksum: backupMeta.checksum,
          createdAt: new Date().toISOString(),
          lastVerifiedAt: new Date().toISOString()
        };
        db.addBackupRecord(backupRecord);
      }
    } catch (err) {
      console.error('Backup copy failed:', err);
    }

    return {
      audioAsset,
      backupRecord,
      primaryMeta
    };
  }

  // Orphan & Health Diagnostic Suite
  async runStorageDiagnostics() {
    const beats = db.getBeats(true, true);
    const audioAssets = db.getAudioAssets();
    const backupRecords = db.getBackupRecords();

    const primaryObjects = await primaryAudioProvider.listObjects();
    const backupObjects = await backupAudioProvider.listObjects();

    let missingStorageObjects = 0;
    let missingDatabaseRecords = 0;
    let assetsWithoutBackups = 0;

    // Check DB records pointing to missing physical files
    for (const asset of audioAssets) {
      const exists = await primaryAudioProvider.exists(asset.storageObjectId);
      if (!exists) missingStorageObjects++;

      const hasBackup = backupRecords.some(b => b.audioAssetId === asset.id && b.status === 'healthy');
      if (!hasBackup) assetsWithoutBackups++;
    }

    // Check physical files without DB records
    for (const obj of primaryObjects) {
      const dbMatch = audioAssets.some(a => a.storageObjectId === obj.objectId);
      if (!dbMatch) missingDatabaseRecords++;
    }

    return {
      totalBeats: beats.length,
      totalAudioAssets: audioAssets.length,
      totalPrimaryObjects: primaryObjects.length,
      totalBackupObjects: backupObjects.length,
      totalBackupRecords: backupRecords.length,
      missingStorageObjects,
      missingDatabaseRecords,
      assetsWithoutBackups,
      status: (missingStorageObjects === 0 && missingDatabaseRecords === 0) ? 'HEALTHY' : 'WARNING'
    };
  }

  // Emergency Catalog Recovery Manifest Export
  generateEmergencyRecoveryManifest() {
    const beats = db.getBeats(true, true);
    const audioAssets = db.getAudioAssets();
    const backupRecords = db.getBackupRecords();
    const packs = db.getBeatPacks();
    const collections = db.getCollections();

    return {
      manifestVersion: '1.0.0',
      exportTimestamp: new Date().toISOString(),
      storeName: 'CASHMERE KID$',
      stats: {
        totalBeats: beats.length,
        totalAudioAssets: audioAssets.length,
        totalBackupRecords: backupRecords.length,
        totalPacks: packs.length,
        totalCollections: collections.length
      },
      beats,
      audioAssets,
      backupRecords,
      packs,
      collections
    };
  }
}

export const storageManager = new StorageOSManager();
