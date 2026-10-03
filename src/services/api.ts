import { Beat, BeatPack, Collection, Order, MerchItem, YouTubeVideo, StoreSettings } from '../types';

const API_BASE = '';

export async function fetchPublicSettings(): Promise<StoreSettings> {
  const res = await fetch(`${API_BASE}/api/settings/public`);
  if (!res.ok) throw new Error('Failed to load store settings');
  return res.json();
}

export async function fetchBeats(params?: Record<string, string>): Promise<Beat[]> {
  const query = new URLSearchParams(params || {}).toString();
  const res = await fetch(`${API_BASE}/api/beats?${query}`);
  if (!res.ok) throw new Error('Failed to fetch beats');
  return res.json();
}

export async function fetchBeatById(id: string): Promise<Beat> {
  const res = await fetch(`${API_BASE}/api/beats/${id}`);
  if (!res.ok) throw new Error('Beat not found');
  return res.json();
}

export async function fetchBeatPacks(): Promise<BeatPack[]> {
  const res = await fetch(`${API_BASE}/api/packs`);
  if (!res.ok) throw new Error('Failed to fetch beat packs');
  return res.json();
}

export async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_BASE}/api/collections`);
  if (!res.ok) throw new Error('Failed to fetch collections');
  return res.json();
}

export async function fetchVaultData(): Promise<{ beats: Beat[]; packs: BeatPack[] }> {
  const res = await fetch(`${API_BASE}/api/vault`);
  if (!res.ok) throw new Error('Failed to fetch vault contents');
  return res.json();
}

export async function fetchMerch(): Promise<MerchItem[]> {
  const res = await fetch(`${API_BASE}/api/merch`);
  if (!res.ok) throw new Error('Failed to fetch merch');
  return res.json();
}

export async function fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
  const res = await fetch(`${API_BASE}/api/youtube`);
  if (!res.ok) throw new Error('Failed to fetch YouTube videos');
  return res.json();
}

export async function recordPlayEvent(beatId: string) {
  try {
    await fetch(`${API_BASE}/api/analytics/play`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ beatId })
    });
  } catch (err) {
    console.error('Failed to log play event:', err);
  }
}

export async function createPayPalOrder(items: { id: string; type: 'beat' | 'pack' }[], customerInfo?: { email?: string; name?: string }) {
  const res = await fetch(`${API_BASE}/api/paypal/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, ...customerInfo })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Order creation failed');
  return data;
}

export async function capturePayPalOrder(internalOrderId: string, paypalOrderId?: string, customerEmail?: string) {
  const res = await fetch(`${API_BASE}/api/paypal/capture-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ internalOrderId, paypalOrderId, customerEmail })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Payment capture failed');
  return data;
}

export async function verifyPDTOrder(txToken: string, internalOrderId: string) {
  const res = await fetch(`${API_BASE}/api/paypal/verify-pdt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txToken, internalOrderId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'PDT Transaction verification failed');
  return data;
}

export async function lookupCustomerOrders(email?: string, orderId?: string): Promise<Order[]> {
  const params = new URLSearchParams();
  if (email) params.set('email', email);
  if (orderId) params.set('orderId', orderId);

  const res = await fetch(`${API_BASE}/api/orders/lookup?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to lookup orders');
  return res.json();
}

// ADMIN API CALLS
export async function adminLogin(passcode: string) {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode })
  });
  const contentType = res.headers.get('content-type') || '';
  let data: any;
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    const rawText = await res.text();
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Server returned non-JSON HTTP ${res.status}: ${rawText.slice(0, 100)}`);
    }
  }
  if (!res.ok) throw new Error(data?.error || 'Invalid passcode');
  return data;
}

export async function uploadAdminFile(token: string, file: File, fieldname: 'audio' | 'artwork') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fieldname', fieldname);

  const effectiveToken = token || localStorage.getItem('cashmere_admin_token') || 'cashmere-admin-token-2026';

  const res = await fetch(`${API_BASE}/api/admin/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${effectiveToken}`
    },
    body: formData
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (parseErr: any) {
      throw new Error(`JSON response parse failure (${res.status}): ${parseErr.message}`);
    }
  } else {
    const rawText = await res.text();
    if (!res.ok) {
      throw new Error(`Upload server error (HTTP ${res.status}): ${rawText.slice(0, 150)}`);
    }
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Unexpected non-JSON response from upload endpoint (HTTP ${res.status}): ${rawText.slice(0, 150)}`);
    }
  }

  if (!res.ok || !data?.success) {
    throw new Error(data?.error || `Upload failed with HTTP ${res.status}`);
  }

  return data;
}

export async function createAdminBeat(token: string, beatData: any) {
  const effectiveToken = token || localStorage.getItem('cashmere_admin_token') || 'cashmere-admin-token-2026';
  const res = await fetch(`${API_BASE}/api/admin/beats`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${effectiveToken}`
    },
    body: JSON.stringify(beatData)
  });

  const contentType = res.headers.get('content-type') || '';
  let data: any;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (parseErr: any) {
      throw new Error(`JSON response parse failure (${res.status}): ${parseErr.message}`);
    }
  } else {
    const rawText = await res.text();
    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}: ${rawText.slice(0, 150)}`);
    }
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Non-JSON response from server (HTTP ${res.status}): ${rawText.slice(0, 150)}`);
    }
  }

  if (!res.ok) throw new Error(data?.error || 'Failed to create beat');
  return data;
}

export async function deleteAdminBeat(token: string, id: string) {
  const res = await fetch(`${API_BASE}/api/admin/beats/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete beat');
  return data;
}

export async function createAdminCollection(token: string, colData: { name: string; description?: string; artworkUrl?: string }) {
  const res = await fetch(`${API_BASE}/api/admin/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(colData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create collection');
  return data;
}

export async function fetchAdminAnalytics(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/analytics`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchAdminOrders(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/orders`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function fetchAdminSettings(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateAdminSettings(token: string, settings: any) {
  const res = await fetch(`${API_BASE}/api/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data;
}
