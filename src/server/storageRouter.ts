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
  public static async selectProvider(fileSize: number, mimeType: string): Promise<any> {
    const usageBytes = this.getR2StorageUsageBytes();
    const thresholdGb = this.getSafetyThresholdGb();
    const thresholdBytes = thresholdGb * 1024 * 1024 * 1024;

    // Check if R2 is healthy and within limit
    let r2Healthy = false;
    try {
      const primaryHealth = await primaryAudioProvider.healthCheck();
      r2Healthy = primaryHealth.status === 'HEALTHY';
    } catch {
      r2Healthy = false;
    }

    // Determine the optimal provider based on usage and health
    if (r2Healthy && (usageBytes + fileSize) < thresholdBytes) {
      db.logAuditEvent(
        'STORAGE_ROUTED_TO_R2',
        'audio',
        'r2',
        `Routed file of size ${fileSize} to R2 (Usage: ${(usageBytes / (1024 * 1024)).toFixed(2)} MB)`,
        'StorageRouter'
      );
      return primaryAudioProvider;
    }

    // Attempt overflow/backup routing to Internet Archive
    let iaHealthy = false;
    try {
      const backupHealth = await archiveAudioProvider.healthCheck();
      iaHealthy = backupHealth.status === 'HEALTHY';
    } catch {
      iaHealthy = false;
    }

    if (iaHealthy) {
      db.logAuditEvent(
        'STORAGE_ROUTED_TO_INTERNET_ARCHIVE',
        'audio',
        'internet_archive',
        `R2 in OVERFLOW or HEALTH_FAILURE. Routed file of size ${fileSize} to Internet Archive.`,
        'StorageRouter'
      );
      return archiveAudioProvider;
    }

    // If both failed, try fallback or error
    db.logAuditEvent(
      'STORAGE_PROVIDER_RECOVERED',
      'audio',
      'fallback',
      `WARNING: Both remote providers failed. Resorting to local dynamic storage fallback.`,
      'StorageRouter'
    );

    return primaryAudioProvider; // Fall back to primary (which will use local disk if no cloud credentials exist)
  }
}
