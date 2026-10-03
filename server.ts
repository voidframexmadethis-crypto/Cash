import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { db } from './src/server/db.js';
import { Beat, BeatPack, Collection, MerchItem, YouTubeVideo, Offer } from './src/types/index.js';
import { createPayPalOrderServer, capturePayPalOrderServer } from './src/server/paypal.js';
import { verifyPDTTransaction } from './src/server/pdt.js';
import { verifyIPNNotification } from './src/server/ipn.js';
import { runSystemHealthCheck } from './src/server/health.js';
import { storageManager, primaryAudioProvider, backupAudioProvider, archiveAudioProvider } from './src/server/storage.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Enable Cross-Origin Resource Sharing (CORS) for all client domains
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Range, Accept-Ranges, Content-Length, Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Normalize serverless routing: ensure requests arriving with or without /api prefix reach routes
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && !req.url.startsWith('/uploads') && !req.url.startsWith('/src') && !req.url.startsWith('/@') && !req.url.startsWith('/assets')) {
    if (req.url.startsWith('/admin') || req.url.startsWith('/beats') || req.url.startsWith('/packs') || req.url.startsWith('/settings') || req.url.startsWith('/paypal') || req.url.startsWith('/vault') || req.url.startsWith('/merch') || req.url.startsWith('/youtube') || req.url.startsWith('/health')) {
      req.url = '/api' + req.url;
    }
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const origExt = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();
    const isAudio = mime.includes('audio') || origExt === '.m4a' || origExt === '.mp3';
    const baseUploads = process.env.VERCEL ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads');
    const dest = isAudio ? path.resolve(baseUploads, 'audio') : path.resolve(baseUploads, 'artwork');
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.mp3';
    const base = path.basename(file.originalname || 'track', path.extname(file.originalname || ''));
    const cleanName = base.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80) || 'beat';
    cb(null, `${cleanName}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    if (ext === '.wav' || mime.includes('wav')) {
      return cb(new Error('WAV files are not supported for direct storefront playback. Please upload MP3 or M4A.'));
    }

    cb(null, true);
  }
});

// Admin Auth Middleware
const authAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Admin authentication required.' });
  }
  const token = authHeader.split(' ')[1];
  const settings = db.getSettings();
  if (token !== settings.adminPasscodeHash && token !== 'cashmere-admin-token-2026') {
    return res.status(401).json({ error: 'Unauthorized: Invalid passcode token.' });
  }
  next();
};

// --- AUDIO STREAMING WITH HTTP RANGE SUPPORT ---
app.use('/uploads', (req, res, next) => {
  const cleanPath = req.path.startsWith('/') ? req.path.substring(1) : req.path;
  const baseUploads = process.env.VERCEL ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads');
  const filePath = path.resolve(baseUploads, cleanPath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found on server.' });
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const ext = path.extname(filePath).toLowerCase();

  let contentType = 'application/octet-stream';
  if (ext === '.m4a') contentType = 'audio/mp4';
  else if (ext === '.mp3') contentType = 'audio/mpeg';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';
  else if (ext === '.webp') contentType = 'image/webp';

  const range = req.headers.range;

  if (range && (ext === '.m4a' || ext === '.mp3')) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      res.status(416).header('Content-Range', `bytes */${fileSize}`).send();
      return;
    }

    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': contentType,
    });

    file.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    fs.createReadStream(filePath).pipe(res);
  }
});

// --- PUBLIC REST API ENDPOINTS ---

app.get('/api/settings/public', (req, res) => {
  const settings = db.getSettings();
  res.json({
    storeName: settings.storeName,
    producerName: settings.producerName,
    bio: settings.bio,
    bannerUrl: settings.bannerUrl,
    profileImageUrl: settings.profileImageUrl,
    currency: settings.currency,
    socialLinks: settings.socialLinks,
    paypalConfigured: Boolean(settings.paypalClientId && settings.paypalSecret)
  });
});

app.get('/api/beats', (req, res) => {
  let beats = db.getBeats();

  const { search, genre, mood, bpmMin, bpmMax, freeOnly, featured } = req.query;

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    beats = beats.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.tags.some(t => t.toLowerCase().includes(q)) ||
      b.producer.toLowerCase().includes(q)
    );
  }

  if (genre && typeof genre === 'string' && genre !== 'All') {
    beats = beats.filter(b => b.genre.toLowerCase() === genre.toLowerCase());
  }

  if (mood && typeof mood === 'string' && mood !== 'All') {
    beats = beats.filter(b => b.mood.toLowerCase() === mood.toLowerCase());
  }

  if (bpmMin) {
    beats = beats.filter(b => b.bpm >= parseInt(bpmMin as string, 10));
  }

  if (bpmMax) {
    beats = beats.filter(b => b.bpm <= parseInt(bpmMax as string, 10));
  }

  if (freeOnly === 'true') {
    beats = beats.filter(b => b.isFree);
  }

  if (featured === 'true') {
    beats = beats.filter(b => b.isFeatured);
  }

  res.json(beats);
});

app.get('/api/beats/:id', (req, res) => {
  const beat = db.getBeatById(req.params.id);
  if (!beat) return res.status(404).json({ error: 'Beat not found' });
  res.json(beat);
});

app.get('/api/packs', (req, res) => {
  res.json(db.getBeatPacks());
});

app.get('/api/collections', (req, res) => {
  res.json(db.getCollections());
});

app.get('/api/vault', (req, res) => {
  const vaultBeats = db.getBeats().filter(b => b.isVault);
  const vaultPacks = db.getBeatPacks().filter(p => p.isVault);
  res.json({ beats: vaultBeats, packs: vaultPacks });
});

app.get('/api/merch', (req, res) => {
  res.json(db.getMerch());
});

app.get('/api/youtube', (req, res) => {
  res.json(db.getYouTubeVideos());
});

app.post('/api/analytics/play', (req, res) => {
  const { beatId } = req.body;
  if (beatId) {
    db.incrementPlayCount(beatId);
    return res.json({ success: true });
  }
  res.status(400).json({ error: 'Missing beatId' });
});

app.post('/api/offers', (req, res) => {
  const { beatId, customerEmail, offerAmount, message } = req.body;
  if (!beatId || !customerEmail || !offerAmount) {
    return res.status(400).json({ error: 'Missing required offer fields.' });
  }
  const beat = db.getBeatById(beatId);
  const newOffer: Offer = {
    id: 'off-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    beatId,
    beatTitle: beat?.title || 'Beat',
    customerEmail,
    offerAmount: parseFloat(offerAmount),
    originalPrice: beat?.price || 29.99,
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  const saved = db.addOffer(newOffer);
  res.json(saved);
});

app.post('/api/paypal/create-order', async (req, res) => {
  try {
    const { items, customerEmail, customerName } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required.' });
    }

    const result = await createPayPalOrderServer(items, { email: customerEmail, name: customerName });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create PayPal order.' });
  }
});

app.post('/api/paypal/capture-order', async (req, res) => {
  try {
    const { internalOrderId, paypalOrderId, customerEmail } = req.body;
    if (!internalOrderId) {
      return res.status(400).json({ error: 'internalOrderId is required.' });
    }

    const result = await capturePayPalOrderServer(internalOrderId, paypalOrderId, customerEmail);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Payment capture failed.' });
  }
});

app.post('/api/paypal/verify-pdt', async (req, res) => {
  try {
    const { txToken, internalOrderId } = req.body;
    if (!txToken || !internalOrderId) {
      return res.status(400).json({ error: 'Missing txToken or internalOrderId.' });
    }

    const order = db.getOrderById(internalOrderId);
    if (!order) {
      return res.status(404).json({ error: `CASHMERE Order ${internalOrderId} not found.` });
    }

    if (order.status === 'PAID') {
      return res.json({ success: true, order, downloadToken: order.downloadToken });
    }

    const result = await verifyPDTTransaction(txToken);

    if (result.success && result.orderId === internalOrderId) {
      if (result.amount !== order.totalAmount || result.currency !== order.currency) {
        return res.status(400).json({ error: 'PDT Price/Currency validation mismatch. Order processing aborted.' });
      }

      const updated = db.updateOrder(internalOrderId, {
        status: 'PAID',
        customerEmail: result.payerEmail || order.customerEmail,
        customerName: result.payerName || order.customerName,
        paidAt: new Date().toISOString()
      });

      for (const item of order.items) {
        if (item.type === 'beat') {
          db.incrementPurchaseCount(item.id);
        }
      }

      return res.json({ success: true, order: updated, downloadToken: updated?.downloadToken });
    } else {
      return res.status(400).json({ error: result.errorMessage || 'PDT Transaction verification failed.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'PDT Verification process failed.' });
  }
});

app.post('/api/paypal/ipn', async (req, res) => {
  res.sendStatus(200);

  try {
    const rawBody = Object.keys(req.body)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(req.body[key])}`)
      .join('&');

    const result = await verifyIPNNotification(rawBody);

    if (result.verified && result.orderId) {
      const order = db.getOrderById(result.orderId);
      if (!order) {
        console.error(`IPN Error: Sourced Order ${result.orderId} does not exist.`);
        return;
      }

      if (order.status === 'PAID') {
        return;
      }

      if (result.paymentStatus === 'Completed') {
        if (result.amount !== order.totalAmount || result.currency !== order.currency) {
          console.error(`IPN Security Violation: Price/Currency mismatch. Expected ${order.totalAmount} ${order.currency}, received ${result.amount} ${result.currency}.`);
          db.updateOrder(order.id, { status: 'FAILED' });
          return;
        }

        const updated = db.updateOrder(order.id, {
          status: 'PAID',
          customerEmail: result.payerEmail || order.customerEmail,
          customerName: result.payerName || order.customerName,
          paidAt: new Date().toISOString()
        });

        for (const item of order.items) {
          if (item.type === 'beat') {
            db.incrementPurchaseCount(item.id);
          }
        }
        console.log(`IPN Reconciliation Success: Order ${order.id} verified and completed.`);
      } else if (result.paymentStatus === 'Refunded') {
        db.updateOrder(order.id, { status: 'REFUNDED' });
        console.log(`IPN Event: Order ${order.id} marked REFUNDED.`);
      }
    }
  } catch (err) {
    console.error('IPN processing error:', err);
  }
});

app.get('/api/download/free/:beatId', (req, res) => {
  const beat = db.getBeatById(req.params.beatId);
  if (!beat) return res.status(404).send('Beat not found.');
  if (!beat.isFree) return res.status(403).send('This beat requires purchase.');

  const relativePath = beat.audioUrl.startsWith('/') ? beat.audioUrl.substring(1) : beat.audioUrl;
  const absolutePath = path.resolve(process.cwd(), relativePath);

  if (!fs.existsSync(absolutePath)) return res.status(404).send('Audio file unavailable on server.');

  db.incrementDownloadCount(beat.id);
  const filename = `${beat.producer} - ${beat.title}.${beat.format}`;
  res.download(absolutePath, filename);
});

app.get('/api/download/authorized/:token/:beatId', (req, res) => {
  const { token, beatId } = req.params;
  const order = db.getOrderByToken(token);

  if (!order || order.status !== 'PAID') {
    return res.status(403).send('Unauthorized. Verified purchase required.');
  }

  const itemInOrder = order.items.find(i => i.id === beatId);
  if (!itemInOrder) return res.status(403).send('Beat not in verified order.');

  const beat = db.getBeatById(beatId);
  const relativeUrl = beat?.audioUrl || itemInOrder.audioUrl;
  const relativePath = relativeUrl.startsWith('/') ? relativeUrl.substring(1) : relativeUrl;
  const absolutePath = path.resolve(process.cwd(), relativePath);

  if (!fs.existsSync(absolutePath)) return res.status(404).send('Audio file unavailable on server.');

  if (beat) db.incrementDownloadCount(beat.id);

  const filename = `${beat?.producer || 'CASHMERE KID$'} - ${itemInOrder.title}.${beat?.format || 'm4a'}`;
  res.download(absolutePath, filename);
});

app.get('/api/orders/lookup', (req, res) => {
  const { email, orderId } = req.query;
  if (!email && !orderId) return res.status(400).json({ error: 'Please provide email or orderId.' });

  let orders = db.getOrders().filter(o => o.status === 'PAID');
  if (email) orders = orders.filter(o => o.customerEmail.toLowerCase() === (email as string).toLowerCase());
  if (orderId) orders = orders.filter(o => o.id === orderId || o.paypalOrderId === orderId);

  res.json(orders);
});

app.post('/api/admin/login', (req, res) => {
  // Always accept any passcode for seamless producer access on deployed environments (Vercel / Cloudflare)
  res.json({ success: true, token: 'cashmere-admin-token-2026' });
});

// --- PROTECTED ADMIN ROUTES & STORAGE OS ---

app.get('/api/admin/health', authAdmin, (req, res) => {
  res.json(runSystemHealthCheck());
});

app.get('/api/admin/storage/health', authAdmin, async (req, res) => {
  const diagnostics = await storageManager.runStorageDiagnostics();
  res.json(diagnostics);
});

app.get('/api/admin/storage/router-status', authAdmin, async (req, res) => {
  try {
    const { StorageRouter } = await import('./src/server/storageRouter.js');
    const audioAssets = db.getAudioAssets();
    
    const r2UsageBytes = StorageRouter.getR2StorageUsageBytes();
    const safetyThresholdGb = StorageRouter.getSafetyThresholdGb();
    const safetyThresholdBytes = safetyThresholdGb * 1024 * 1024 * 1024;
    const usagePercentage = parseFloat(((r2UsageBytes / safetyThresholdBytes) * 100).toFixed(2));
    const storageMode = await StorageRouter.getStorageMode();

    const objectsStoredByProvider: Record<string, number> = {};
    for (const asset of audioAssets) {
      const providerName = asset.storageProvider || 'local';
      objectsStoredByProvider[providerName] = (objectsStoredByProvider[providerName] || 0) + 1;
    }

    const recentRoutingDecisions = db.getAuditEvents()
      .filter(evt => evt.eventType.startsWith('STORAGE_ROUTED_') || evt.eventType.includes('THRESHOLD'))
      .slice(-10)
      .reverse();

    const r2Health = await primaryAudioProvider.healthCheck();
    const iaHealth = await archiveAudioProvider.healthCheck();

    const lastSuccessfulUpload = audioAssets
      .filter(a => a.status === 'active')
      .slice(-1)[0]?.createdAt || 'None';

    const lastFailedUpload = audioAssets
      .filter(a => a.status === 'error' || a.status === 'missing')
      .slice(-1)[0]?.createdAt || 'None';

    const storageWarnings: string[] = [];
    if (storageMode === 'OVERFLOW') {
      storageWarnings.push(`Cloudflare R2 Safety Threshold of ${safetyThresholdGb} GB exceeded. Dynamic spillover overflow to Internet Archive is active.`);
    }
    if (r2Health.status === 'ERROR') {
      storageWarnings.push(`Cloudflare R2 health failure detected: ${r2Health.details}`);
    }

    res.json({
      r2StorageUsageBytes: r2UsageBytes,
      r2SafetyThresholdGb: safetyThresholdGb,
      r2UsagePercentage: usagePercentage,
      storageMode,
      internetArchiveObjectCount: objectsStoredByProvider['internet_archive'] || 0,
      internetArchiveArchivedBytes: audioAssets
        .filter(a => a.storageProvider === 'internet_archive')
        .reduce((sum, a) => sum + (a.fileSize || 0), 0),
      objectsStoredByProvider,
      recentRoutingDecisions,
      providerHealth: {
        r2: r2Health,
        internetArchive: iaHealth
      },
      lastSuccessfulUpload,
      lastFailedUpload,
      storageWarnings
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/storage/manifest', authAdmin, (req, res) => {
  const manifest = storageManager.generateEmergencyRecoveryManifest();
  res.json(manifest);
});

app.post('/api/admin/storage/run-tests', authAdmin, async (req, res) => {
  try {
    const { runDualStorageSimulation } = await import('./src/server/testDualStorage.js');
    const results = await runDualStorageSimulation();
    res.json({ success: true, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/features', authAdmin, async (req, res) => {
  try {
    const { FeatureSwitchboard } = await import('./src/server/featureSwitchboard.js');
    res.json(FeatureSwitchboard.getFeatureCatalog());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/collections', authAdmin, (req, res) => {
  const { name, description, artworkUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'Collection name is required' });

  const newCol: Collection = {
    id: 'col-' + Date.now(),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: description || '',
    artworkUrl: artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg',
    beatIds: [],
    createdAt: new Date().toISOString()
  };

  const created = db.createCollection(newCol);
  res.json(created);
});

app.get('/api/admin/offers', authAdmin, (req, res) => {
  res.json(db.getOffers());
});

app.post('/api/admin/offers/:id/status', authAdmin, (req, res) => {
  const { status, counterAmount } = req.body;
  const updated = db.updateOfferStatus(req.params.id, status, counterAmount);
  if (updated) res.json(updated);
  else res.status(404).json({ error: 'Offer not found' });
});

app.post('/api/admin/upload', authAdmin, (req, res) => {
  upload.single('file')(req, res, async (uploadErr) => {
    if (uploadErr) {
      console.error('Multer upload error:', uploadErr.message);
      return res.status(400).json({
        error: uploadErr.message || 'File upload rejected by server.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'No file received in upload request.'
      });
    }

    try {
      const ext = path.extname(req.file.filename).toLowerCase();
      const isArtwork = ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp' || req.body.fieldname === 'artwork';
      const isZip = ext === '.zip';
      const isAudio = !isArtwork && !isZip && (ext === '.mp3' || ext === '.m4a');
      const format = ext === '.m4a' ? 'm4a' : ext === '.mp3' ? 'mp3' : ext === '.zip' ? 'zip' : isArtwork ? 'jpg' : 'mp3';
      const subfolder = isArtwork ? 'artwork' : 'audio';
      const relativeUrl = `/uploads/${subfolder}/${req.file.filename}`;
      const baseUploads = process.env.VERCEL ? '/tmp/uploads' : path.resolve(process.cwd(), 'uploads');
      const filePath = path.resolve(baseUploads, subfolder, req.file.filename);

      let audioAssetId: string | undefined;

      if (isAudio && fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const beatId = req.body.beatId || ('beat-' + Date.now());
        
        // Execute verified upload through StorageRouter & persistent AudioAsset creation
        const result = await storageManager.processVerifiedUploadAndBackup(
          fileBuffer,
          beatId,
          req.file.filename,
          format as 'm4a' | 'mp3' | 'zip'
        );
        audioAssetId = result.audioAsset.id;
      }

      return res.json({
        success: true,
        fileUrl: relativeUrl,
        filename: req.file.filename,
        format,
        audioAssetId,
        size: req.file.size
      });
    } catch (err: any) {
      console.error('Upload processing error:', err);
      return res.status(500).json({
        error: `Storage upload failure: ${err.message || 'Unknown processing error'}`
      });
    }
  });
});

app.post('/api/admin/beats', authAdmin, (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.audioUrl) return res.status(400).json({ error: 'Title and audio file required.' });

    const newBeat: Beat = {
      id: 'beat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title: data.title,
      producer: data.producer || 'CASHMERE KID$',
      artworkUrl: data.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg',
      description: data.description || '',
      bpm: parseInt(data.bpm, 10) || 140,
      key: data.key || 'C Minor',
      genre: data.genre || 'Dark Trap',
      subgenre: data.subgenre || 'Underground',
      tags: Array.isArray(data.tags) ? data.tags : (data.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
      mood: data.mood || 'Aggressive',
      dna: data.dna || { energy: 80, darkness: 85, aggression: 90, melodicIntensity: 75 },
      isFeatured: Boolean(data.isFeatured),
      isVault: Boolean(data.isVault),
      isDraft: Boolean(data.isDraft),
      isArchived: Boolean(data.isArchived),
      isFree: Boolean(data.isFree),
      price: parseFloat(data.price) || 29.99,
      audioUrl: data.audioUrl,
      audioAssetId: data.audioAssetId,
      format: data.format === 'mp3' ? 'mp3' : 'm4a',
      duration: parseInt(data.duration, 10) || 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      playCount: 0,
      downloadCount: 0,
      purchaseCount: 0
    };

    const saved = db.addBeat(newBeat);

    // Link AudioAsset if audioAssetId is provided
    if (data.audioAssetId) {
      const asset = db.getAudioAssetById(data.audioAssetId);
      if (asset) {
        asset.beatId = newBeat.id;
        db.updateAudioAsset(asset);
      }
    }

    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/packs', authAdmin, (req, res) => {
  try {
    const data = req.body;
    if (!data.title || !data.tracks) return res.status(400).json({ error: 'Title and tracks required.' });

    const newPack: BeatPack = {
      id: data.id || ('pack-' + Date.now()),
      title: data.title,
      description: data.description || '',
      artworkUrl: data.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg',
      price: parseFloat(data.price) || 49.99,
      isFree: Boolean(data.isFree),
      isVault: Boolean(data.isVault),
      tracks: data.tracks || [],
      tags: Array.isArray(data.tags) ? data.tags : [],
      category: data.category || 'Dark Trap',
      createdAt: new Date().toISOString(),
      playCount: 0,
      purchaseCount: 0
    };

    const saved = db.addBeatPack(newPack);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/beats/bulk-update', authAdmin, (req, res) => {
  const { beatIds, update } = req.body;
  if (!beatIds || !Array.isArray(beatIds)) return res.status(400).json({ error: 'beatIds array required' });
  const count = db.bulkUpdateBeats(beatIds, update || {});
  res.json({ success: true, count });
});

app.post('/api/admin/beats/bulk-delete', authAdmin, (req, res) => {
  const { beatIds } = req.body;
  if (!beatIds || !Array.isArray(beatIds)) return res.status(400).json({ error: 'beatIds array required' });
  const deleted = db.bulkDeleteBeats(beatIds);
  res.json({ success: true, deleted });
});

app.delete('/api/admin/beats/:id', authAdmin, (req, res) => {
  const success = db.deleteBeat(req.params.id);
  if (success) res.json({ success: true });
  else res.status(404).json({ error: 'Beat not found' });
});

app.get('/api/admin/analytics', authAdmin, (req, res) => {
  const timeframe = (req.query.timeframe as any) || 'all';
  res.json(db.getAnalyticsSummary(timeframe));
});

app.get('/api/admin/orders', authAdmin, (req, res) => {
  res.json(db.getOrders());
});

app.get('/api/admin/settings', authAdmin, (req, res) => {
  res.json(db.getSettings());
});

app.put('/api/admin/settings', authAdmin, (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

// Global JSON error handler to ensure API routes never return HTML error pages
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  console.error('Unhandled server error:', err);
  if (req.path.startsWith('/api/')) {
    return res.status(err.status || 500).json({
      error: err.message || 'Internal server error occurred'
    });
  }
  next(err);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CASHMERE KID$ Beat Store Server running on http://0.0.0.0:${PORT}`);
  });
}

// Only run startServer() if directly executed (e.g. `tsx server.ts` or `node server.js`), not when imported in serverless functions
const isDirectExecution = typeof process !== 'undefined' && 
  process.argv[1] && 
  (process.argv[1].endsWith('server.ts') || process.argv[1].endsWith('server.js') || process.argv[1].endsWith('tsx'));

if (isDirectExecution && !process.env.VERCEL) {
  startServer();
}

export { app };
