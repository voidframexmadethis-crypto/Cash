import { db } from './db.js';

export interface IPNVerificationResult {
  verified: boolean;
  orderId?: string;
  paymentStatus?: string;
  amount?: number;
  currency?: string;
  payerEmail?: string;
  payerName?: string;
  receiverEmail?: string;
  txnId?: string;
  errorMessage?: string;
}

/**
 * Validates a PayPal IPN (Instant Payment Notification) callback.
 * Sends the raw payload back to PayPal for definitive verification.
 */
export async function verifyIPNNotification(rawBody: string): Promise<IPNVerificationResult> {
  const settings = db.getSettings();
  const isLive = settings.paypalMode === 'live';
  const paypalUrl = isLive 
    ? 'https://www.paypal.com/cgi-bin/webscr' 
    : 'https://www.sandbox.paypal.com/cgi-bin/webscr';

  try {
    // 1. Prepend notify-validate command
    const verificationBody = `cmd=_notify-validate&${rawBody}`;

    const response = await fetch(paypalUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'CASHMERE-KIDS-STORE-IPN'
      },
      body: verificationBody
    });

    if (!response.ok) {
      return {
        verified: false,
        errorMessage: `PayPal IPN endpoint returned HTTP ${response.status}`
      };
    }

    const verificationResponse = (await response.text()).trim();

    if (verificationResponse !== 'VERIFIED') {
      return {
        verified: false,
        errorMessage: `PayPal IPN validation failed: ${verificationResponse}`
      };
    }

    // 2. Parse payload keys for order validation
    const params = new URLSearchParams(rawBody);
    const orderId = params.get('custom') || undefined;
    const paymentStatus = params.get('payment_status') || undefined;
    const amount = parseFloat(params.get('mc_gross') || '0');
    const currency = params.get('mc_currency') || undefined;
    const payerEmail = params.get('payer_email') || undefined;
    const receiverEmail = params.get('receiver_email') || params.get('business') || undefined;
    const txnId = params.get('txn_id') || undefined;
    
    const firstName = params.get('first_name') || '';
    const lastName = params.get('last_name') || '';
    const payerName = firstName ? `${firstName} ${lastName}`.trim() : undefined;

    return {
      verified: true,
      orderId,
      paymentStatus,
      amount,
      currency,
      payerEmail,
      payerName,
      receiverEmail,
      txnId
    };
  } catch (err: any) {
    console.error('IPN Verification error:', err);
    return {
      verified: false,
      errorMessage: `Internal server-side IPN process error: ${err.message}`
    };
  }
}
