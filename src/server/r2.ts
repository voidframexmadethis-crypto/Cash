import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { IStorageProvider, StorageObjectMetadata, StorageHealthReport } from './storage.js';

export class CloudflareR2StorageAdapter implements IStorageProvider {
  public name: string;
  public role: 'PRIMARY' | 'BACKUP' | 'ARCHIVE';
  private s3Client: S3Client | null = null;
  private bucketName: string;

  constructor(
    name: string,
    role: 'PRIMARY' | 'BACKUP' | 'ARCHIVE',
    credentials: {
      endpoint: string;
      accessKeyId: string;
      secretAccessKey: string;
      bucketName: string;
    }
  ) {
    this.name = name;
    this.role = role;
    this.bucketName = credentials.bucketName;

    try {
      let endpoint = credentials.endpoint;
      if (endpoint && !endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
        endpoint = `https://${endpoint}`;
      }
      // Ensure endpoint is a valid URL string
      if (endpoint) {
        new URL(endpoint);
      }

      this.s3Client = new S3Client({
        region: 'auto',
        endpoint: endpoint || undefined,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey
        }
      });
    } catch (err) {
      console.error(`Failed to initialize Cloudflare R2 S3 Client for ${name}:`, err);
      this.s3Client = null;
    }
  }

  public isReady(): boolean {
    return this.s3Client !== null;
  }

  async putObject(fileBuffer: Buffer, canonicalKey: string, mimeType: string): Promise<StorageObjectMetadata> {
    if (!this.s3Client) throw new Error('R2 S3 Client is not initialized.');

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: canonicalKey,
      Body: fileBuffer,
      ContentType: mimeType
    });

    await this.s3Client.send(command);

    const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

    return {
      objectId: canonicalKey,
      providerName: this.name,
      size: fileBuffer.length,
      checksum,
      mimeType,
      createdAt: new Date().toISOString()
    };
  }

  async getObject(objectId: string): Promise<Buffer | null> {
    if (!this.s3Client) return null;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectId
      });

      const response = await this.s3Client.send(command);
      if (!response.Body) return null;

      const bytes = await response.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch (err) {
      console.error(`R2 getObject Error for key ${objectId}:`, err);
      return null;
    }
  }

  getObjectPath(objectId: string): string {
    return objectId;
  }

  async headObject(objectId: string): Promise<StorageObjectMetadata | null> {
    if (!this.s3Client) return null;

    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: objectId
      });

      const response = await this.s3Client.send(command);
      const ext = objectId.split('.').pop()?.toLowerCase();
      const mimeType = ext === 'm4a' ? 'audio/mp4' : ext === 'mp3' ? 'audio/mpeg' : 'application/octet-stream';

      return {
        objectId,
        providerName: this.name,
        size: response.ContentLength || 0,
        checksum: response.ETag ? response.ETag.replace(/"/g, '') : 'unknown',
        mimeType,
        createdAt: response.LastModified ? response.LastModified.toISOString() : new Date().toISOString()
      };
    } catch (err) {
      return null;
    }
  }

  async exists(objectId: string): Promise<boolean> {
    const meta = await this.headObject(objectId);
    return meta !== null;
  }

  async deleteObject(objectId: string): Promise<boolean> {
    if (!this.s3Client) return false;

    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: objectId
      });
      await this.s3Client.send(command);
      return true;
    } catch (err) {
      console.error(`R2 deleteObject Error for key ${objectId}:`, err);
      return false;
    }
  }

  async copyObject(sourceObjectId: string, destProvider: IStorageProvider, destKey: string): Promise<StorageObjectMetadata | null> {
    const buffer = await this.getObject(sourceObjectId);
    if (!buffer) return null;

    const ext = sourceObjectId.split('.').pop()?.toLowerCase();
    const mimeType = ext === 'm4a' ? 'audio/mp4' : ext === 'mp3' ? 'audio/mpeg' : 'application/octet-stream';

    return await destProvider.putObject(buffer, destKey, mimeType);
  }

  async listObjects(): Promise<StorageObjectMetadata[]> {
    if (!this.s3Client) return [];

    try {
      const command = new ListObjectsV2Command({
        Bucket: this.bucketName
      });

      const response = await this.s3Client.send(command);
      const results: StorageObjectMetadata[] = [];

      if (response.Contents) {
        for (const obj of response.Contents) {
          if (!obj.Key) continue;
          const ext = obj.Key.split('.').pop()?.toLowerCase();
          const mimeType = ext === 'm4a' ? 'audio/mp4' : ext === 'mp3' ? 'audio/mpeg' : 'application/octet-stream';

          results.push({
            objectId: obj.Key,
            providerName: this.name,
            size: obj.Size || 0,
            checksum: obj.ETag ? obj.ETag.replace(/"/g, '') : 'deferred',
            mimeType,
            createdAt: obj.LastModified ? obj.LastModified.toISOString() : new Date().toISOString()
          });
        }
      }

      return results;
    } catch (err) {
      console.error('R2 listObjects Error:', err);
      return [];
    }
  }

  async checksum(objectId: string): Promise<string | null> {
    const meta = await this.headObject(objectId);
    return meta ? meta.checksum : null;
  }

  generateAuthorizedDownload(objectId: string, token: string): string {
    return `/api/download/authorized/${token}/${encodeURIComponent(objectId)}`;
  }

  async generatePresignedGetUrl(objectId: string, expiresInSeconds = 3600): Promise<string | null> {
    if (!this.s3Client) return null;

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: objectId
      });

      return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
    } catch (err) {
      console.error(`Error generating presigned GET url for ${objectId}:`, err);
      return null;
    }
  }

  async healthCheck(): Promise<StorageHealthReport> {
    if (!this.s3Client) {
      return {
        providerName: this.name,
        status: 'ERROR',
        totalObjects: 0,
        totalBytes: 0,
        details: 'Cloudflare R2 is offline. Missing backend credentials.'
      };
    }

    try {
      const objects = await this.listObjects();
      const totalBytes = objects.reduce((acc, o) => acc + o.size, 0);

      return {
        providerName: this.name,
        status: 'HEALTHY',
        totalObjects: objects.length,
        totalBytes,
        details: `Cloudflare R2 active with ${objects.length} verified objects.`
      };
    } catch (err: any) {
      return {
        providerName: this.name,
        status: 'ERROR',
        totalObjects: 0,
        totalBytes: 0,
        details: `R2 Connection failed: ${err.message}`
      };
    }
  }
}
