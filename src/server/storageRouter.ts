import { db } from './db.js';
import { primaryAudioProvider, archiveAudioProvider } from './storage.js';

export class StorageRouter {
  /**
   * Calculates the current R2 storage usage from the database and active metadata.
   */
  public static getR2StorageUsageBytes(): number {
    const audioAssets = db.getAudioAssets();
    const r2Assets = audioAssets.filter(a => a.storageProvider === 'cloudflare_r2_audio' || a.storageProvider === 's3');
    return r2Assets.reduce((sum, asset) => sum + (asset.fileSize || 0), 0);
  }

  /**
   * Retrieves the configured safety threshold (in GB). Defaults to 8 GB.
   */
  public static getSafetyThresholdGb(): number {
    const settings = db.getSettings();
    return settings.r2SafetyThresholdGb !== undefined ? settings.r2SafetyThresholdGb : 8;
  }

  /**
   * Determine the current storage mode based on R2 health and usage threshold.
   */
  public static async getStorageMode(): Promise<'NORMAL' | 'OVERFLOW'> {
    try {
      const usageBytes = this.getR2StorageUsageBytes();
      const thresholdGb = this.getSafetyThresholdGb();
      const thresholdBytes = thresholdGb * 1024 * 1024 * 1024;

      if (usageBytes >= thresholdBytes) {
        return 'OVERFLOW';
      }

      // Check primary health
      const health = await primaryAudioProvider.healthCheck();
      if (health.status === 'ERROR') {
        return 'OVERFLOW';
      }

      return 'NORMAL';
    } catch (err) {
      console.error('Error determining storage mode:', err);
      return 'OVERFLOW';
    }
  }

  /**
   * Central routing method that returns the appropriate healthy storage provider.
   */
  public static async selectProvider(fileSize: number, mimeType: string, assetType: 'audio' | 'artwork' | 'zip' = 'audio'): Promise<any> {
    const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
    const usageBytes = this.getR2StorageUsageBytes();
    const thresholdGb = this.getSafetyThresholdGb();
    const thresholdBytes = thresholdGb * 1024 * 1024 * 1024;

    // Check if R2 is healthy and within limit
    let r2Healthy = false;
    try {
      // Use the appropriate primary provider based on asset type
      const { primaryAudioProvider, primaryArtworkProvider } = await import('./storage.js');
      const primaryProvider = (assetType === 'artwork') ? primaryArtworkProvider : primaryAudioProvider;
      
      const primaryHealth = await primaryProvider.healthCheck();
      r2Healthy = primaryHealth.status === 'HEALTHY' && (primaryProvider.constructor.name !== 'LocalStorageProvider' || !isProduction);
    } catch {
      r2Healthy = false;
    }

    // Determine the optimal provider based on usage and health
    if (r2Healthy && (usageBytes + fileSize) < thresholdBytes) {
      const { primaryAudioProvider, primaryArtworkProvider } = await import('./storage.js');
      const primaryProvider = (assetType === 'artwork') ? primaryArtworkProvider : primaryAudioProvider;

      db.logAuditEvent(
        'STORAGE_ROUTED_TO_R2',
        assetType,
        'r2',
        `Routed ${assetType} file of size ${fileSize} to R2 (Usage: ${(usageBytes / (1024 * 1024)).toFixed(2)} MB)`,
        'StorageRouter'
      );
      return primaryProvider;
    }

    // Attempt overflow/backup routing to Internet Archive (Audio only usually, but let's allow it as overflow for all in this logic if configured)
    let iaHealthy = false;
    try {
      const { archiveAudioProvider } = await import('./storage.js');
      const backupHealth = await archiveAudioProvider.healthCheck();
      iaHealthy = backupHealth.status === 'HEALTHY' && (archiveAudioProvider.constructor.name !== 'LocalStorageProvider' || !isProduction);
    } catch {
      iaHealthy = false;
    }

    if (iaHealthy) {
      const { archiveAudioProvider } = await import('./storage.js');
      db.logAuditEvent(
        'STORAGE_ROUTED_TO_INTERNET_ARCHIVE',
        assetType,
        'internet_archive',
        `R2 in OVERFLOW or HEALTH_FAILURE. Routed ${assetType} file of size ${fileSize} to Internet Archive.`,
        'StorageRouter'
      );
      return archiveAudioProvider;
    }

    // If both failed, handle production fail-closed or development fallback
    if (isProduction) {
      db.logAuditEvent(
        'STORAGE_UPLOAD_FAILED',
        assetType,
        'fail-closed',
        `CRITICAL: No persistent storage provider available in production for ${assetType}. Upload aborted.`,
        'StorageRouter'
      );
      throw new Error('PERSISTENT_STORAGE_UNAVAILABLE');
    }

    // If both failed, try fallback or error
    const { primaryAudioProvider, primaryArtworkProvider } = await import('./storage.js');
    const primaryProvider = (assetType === 'artwork') ? primaryArtworkProvider : primaryAudioProvider;

    db.logAuditEvent(
      'STORAGE_PROVIDER_RECOVERED',
      assetType,
      'fallback',
      `WARNING: Both remote providers failed. Resorting to local dynamic storage fallback (Development Mode).`,
      'StorageRouter'
    );

    return primaryProvider;
  }
}
