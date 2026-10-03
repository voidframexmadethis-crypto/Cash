import { createPayPalOrderServer, capturePayPalOrderServer } from './paypal.js';

export interface PaymentOrderResult {
  orderId: string;
  paypalOrderId?: string;
  downloadToken?: string;
  isFree: boolean;
  configured?: boolean;
  message?: string;
}

export interface PaymentCaptureResult {
  success: boolean;
  order: any;
  downloadToken?: string;
}

export interface IPaymentProvider {
  name: string;
  createOrder(items: { id: string; type: 'beat' | 'pack' }[], customerInfo?: { email?: string; name?: string }): Promise<PaymentOrderResult>;
  captureOrder(internalOrderId: string, providerOrderId?: string, customerEmail?: string): Promise<PaymentCaptureResult>;
}

export class PayPalPaymentProvider implements IPaymentProvider {
  public name = 'paypal_rest';

  async createOrder(items: { id: string; type: 'beat' | 'pack' }[], customerInfo?: { email?: string; name?: string }): Promise<PaymentOrderResult> {
    return await createPayPalOrderServer(items, customerInfo);
  }

  async captureOrder(internalOrderId: string, providerOrderId?: string, customerEmail?: string): Promise<PaymentCaptureResult> {
    return await capturePayPalOrderServer(internalOrderId, providerOrderId, customerEmail);
  }
}

export const paymentProvider = new PayPalPaymentProvider();
