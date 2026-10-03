import { db } from './db.js';
import { getOrCreateLicenseVersion, DEFAULT_LICENSE_TEMPLATES } from './licenses.js';

export async function getPayPalAccessToken(): Promise<string | null> {
  const settings = db.getSettings();
  const clientId = settings.paypalClientId || process.env.PAYPAL_CLIENT_ID;
  const secret = settings.paypalSecret || process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !secret) {
    return null;
  }

  const baseUrl = settings.paypalMode === 'live' 
    ? 'https://api-m.paypal.com' 
    : 'https://api-m.sandbox.paypal.com';

  const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');

  try {
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('PayPal OAuth Error:', errText);
      return null;
    }

    const data = await response.json();
    return data.access_token;
  } catch (err) {
    console.error('Failed to obtain PayPal Access Token:', err);
    return null;
  }
}

export async function createPayPalOrderServer(items: { id: string; type: 'beat' | 'pack'; selectedLicenseId?: string }[], customerInfo?: { email?: string; name?: string }) {
  // 1. Authoritative price calculation server-side
  let calculatedTotal = 0;
  const verifiedItems: any[] = [];

  for (const item of items) {
    if (item.type === 'beat') {
      const beat = db.getBeatById(item.id);
      if (!beat) {
        throw new Error(`Beat with ID ${item.id} not found.`);
      }

      const defaultLic = DEFAULT_LICENSE_TEMPLATES[0];
      const selectedLic = DEFAULT_LICENSE_TEMPLATES.find(l => l.id === item.selectedLicenseId) || defaultLic;
      const licVersion = getOrCreateLicenseVersion(selectedLic);

      const itemPrice = beat.isFree ? 0 : selectedLic.price;
      calculatedTotal += itemPrice;

      verifiedItems.push({
        id: beat.id,
        type: 'beat',
        title: beat.title,
        price: itemPrice,
        audioUrl: beat.audioUrl,
        audioAssetId: beat.audioAssetId,
        format: beat.format,
        licenseName: selectedLic.name,
        licenseVersionId: licVersion.id
      });
    } else if (item.type === 'pack') {
      const pack = db.getBeatPackById(item.id);
      if (!pack) {
        throw new Error(`Beat Pack with ID ${item.id} not found.`);
      }
      const itemPrice = pack.isFree ? 0 : pack.price;
      calculatedTotal += itemPrice;
      verifiedItems.push({
        id: pack.id,
        type: 'pack',
        title: pack.title,
        price: itemPrice,
        audioUrl: pack.tracks[0]?.audioUrl || '',
        format: pack.tracks[0]?.format || 'm4a'
      });
    }
  }

  const roundedTotal = Math.round(calculatedTotal * 100) / 100;
  const settings = db.getSettings();
  const token = await getPayPalAccessToken();

  const internalOrderId = 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const downloadToken = 'dl-tok-' + Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);

  // If price is 0 (Free checkout)
  if (roundedTotal === 0) {
    const freeOrder = db.createOrder({
      id: internalOrderId,
      customerEmail: customerInfo?.email || 'free-download@cashmerekids.com',
      customerName: customerInfo?.name || 'Free Customer',
      items: verifiedItems,
      subtotal: 0,
      taxAmount: 0,
      totalAmount: 0,
      currency: settings.currency || 'USD',
      status: 'PAID',
      downloadToken,
      createdAt: new Date().toISOString(),
      paidAt: new Date().toISOString()
    });

    return {
      orderId: freeOrder.id,
      downloadToken: freeOrder.downloadToken,
      isFree: true,
      order: freeOrder
    };
  }

  // Real PayPal Integration if keys are set
  if (token) {
    const baseUrl = settings.paypalMode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const paypalResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: internalOrderId,
            amount: {
              currency_code: settings.currency || 'USD',
              value: roundedTotal.toFixed(2)
            },
            description: `CASHMERE KID$ Purchase - ${verifiedItems.map(i => i.title).join(', ')}`
          }
        ]
      })
    });

    if (!paypalResponse.ok) {
      const errData = await paypalResponse.text();
      console.error('PayPal Order API error:', errData);
      throw new Error(`PayPal API returned ${paypalResponse.status}: ${errData}`);
    }

    const paypalData = await paypalResponse.json();

    const order = db.createOrder({
      id: internalOrderId,
      paypalOrderId: paypalData.id,
      customerEmail: customerInfo?.email || 'customer@pending.com',
      customerName: customerInfo?.name || 'Customer',
      items: verifiedItems,
      subtotal: roundedTotal,
      taxAmount: 0,
      totalAmount: roundedTotal,
      currency: settings.currency || 'USD',
      status: 'PENDING',
      downloadToken,
      createdAt: new Date().toISOString()
    });

    return {
      orderId: order.id,
      paypalOrderId: paypalData.id,
      isFree: false,
      configured: true,
      paypalData
    };
  }

  // If PayPal keys are not configured yet, save pending order record with diagnostic message
  const order = db.createOrder({
    id: internalOrderId,
    customerEmail: customerInfo?.email || 'customer@cashmerekids.com',
    customerName: customerInfo?.name || 'Valued Customer',
    items: verifiedItems,
    subtotal: roundedTotal,
    taxAmount: 0,
    totalAmount: roundedTotal,
    currency: settings.currency || 'USD',
    status: 'PENDING',
    downloadToken,
    createdAt: new Date().toISOString()
  });

  return {
    orderId: order.id,
    isFree: false,
    configured: false,
    message: "PayPal Client ID & Secret are not configured in Store Settings. Please configure PayPal API credentials in Command Center > Payment Settings."
  };
}

export async function capturePayPalOrderServer(internalOrderId: string, paypalOrderId?: string, customerEmail?: string) {
  const order = db.getOrderById(internalOrderId);
  if (!order) {
    throw new Error(`Order ${internalOrderId} not found.`);
  }

  if (order.status === 'PAID') {
    return { success: true, order, downloadToken: order.downloadToken };
  }

  const settings = db.getSettings();
  const token = await getPayPalAccessToken();

  if (token && paypalOrderId) {
    const baseUrl = settings.paypalMode === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v2/checkout/orders/${paypalOrderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      db.updateOrder(internalOrderId, { status: 'FAILED' });
      throw new Error(`PayPal Capture Failed: ${errText}`);
    }

    const captureData = await response.json();
    if (captureData.status === 'COMPLETED') {
      const updated = db.updateOrder(internalOrderId, {
        status: 'PAID',
        customerEmail: customerEmail || captureData.payer?.email_address || order.customerEmail,
        customerName: captureData.payer?.name?.given_name ? `${captureData.payer.name.given_name} ${captureData.payer.name.surname || ''}` : order.customerName,
        paidAt: new Date().toISOString()
      });

      // Increment purchase counts
      for (const item of order.items) {
        if (item.type === 'beat') {
          db.incrementPurchaseCount(item.id);
        }
      }

      return { success: true, order: updated, downloadToken: updated?.downloadToken };
    } else {
      db.updateOrder(internalOrderId, { status: 'FAILED' });
      throw new Error(`Payment capture was not completed. Status: ${captureData.status}`);
    }
  }

  throw new Error("PayPal credentials not configured on server. Please configure PayPal Client ID & Secret in Payment Settings to process live transactions.");
}
