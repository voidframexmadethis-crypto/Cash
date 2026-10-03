import { db } from './db.js';

export interface PDTVerificationResult {
  success: boolean;
  orderId?: string;
  paypalTxId?: string;
  amount?: number;
  currency?: string;
  payerEmail?: string;
  payerName?: string;
  errorMessage?: string;
}

/**
 * Verifies a PayPal PDT (Payment Data Transfer) transaction token server-side.
 * This is 100% compatible with PayPal Personal Accounts and does NOT require 
 * a PayPal Business account or a REST Client Secret.
 */
export async function verifyPDTTransaction(txToken: string): Promise<PDTVerificationResult> {
  const settings = db.getSettings();
  
  // PDT Identity Token from Personal PayPal Dashboard (Settings > Website Payments > Payment Data Transfer)
  const pdtIdentityToken = settings.paypalSecret || process.env.PAYPAL_PDT_TOKEN;

  if (!pdtIdentityToken) {
    return {
      success: false,
      errorMessage: 'PDT Identity Token is not configured on the server. Please add your PDT Token in Store Settings.'
    };
  }

  const isLive = settings.paypalMode === 'live';
  const paypalUrl = isLive 
    ? 'https://www.paypal.com/cgi-bin/webscr' 
    : 'https://www.sandbox.paypal.com/cgi-bin/webscr';

  try {
    const params = new URLSearchParams();
    params.append('cmd', '_notify-synch');
    params.append('tx', txToken);
    params.append('at', pdtIdentityToken);

    const response = await fetch(paypalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CASHMERE-KIDS-STORE-PDT'
      },
      body: params.toString()
    });

    if (!response.ok) {
      return {
        success: false,
        errorMessage: `PayPal PDT endpoint returned HTTP ${response.status}`
      };
    }

    const text = await response.text();
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    if (lines[0] !== 'SUCCESS') {
      return {
        success: false,
        errorMessage: `PayPal PDT verification failed: ${lines[0] || 'Unknown response'}`
      };
    }

    // Parse key-value pairs returned by PDT
    const data: Record<string, string> = {};
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split('=');
      if (parts.length >= 2) {
        const key = decodeURIComponent(parts[0]);
        const val = decodeURIComponent(parts.slice(1).join('='));
        data[key] = val;
      }
    }

    const orderId = data['custom'];
    const amount = parseFloat(data['mc_gross'] || '0');
    const currency = data['mc_currency'];
    const paypalTxId = data['txn_id'];
    const payerEmail = data['payer_email'];
    const payerName = data['first_name'] ? `${data['first_name']} ${data['last_name'] || ''}`.trim() : undefined;

    return {
      success: true,
      orderId,
      paypalTxId,
      amount,
      currency,
      payerEmail,
      payerName
    };
  } catch (err: any) {
    console.error('PDT Verification error:', err);
    return {
      success: false,
      errorMessage: `Internal server-side PDT Verification error: ${err.message}`
    };
  }
}
