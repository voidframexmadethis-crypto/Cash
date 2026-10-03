import React, { useState } from 'react';
import { X, ShoppingBag, CheckCircle, AlertCircle, Download, Loader2, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { createPayPalOrder, capturePayPalOrder } from '../services/api';
import { PayPalPayment } from './PayPalPayment';

export const CheckoutModal: React.FC = () => {
  const { items, removeFromCart, clearCart, subtotal, isCheckoutOpen, closeCheckout } = useCart();

  const [customerEmail, setCustomerEmail] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  
  // Checkout stages: 'CART', 'PAYING', 'SUCCESS'
  const [checkoutStage, setCheckoutStage] = useState<'CART' | 'PAYING' | 'SUCCESS'>('CART');
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [pendingPaypalId, setPendingPaypalId] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerEmail.trim()) {
      setError('Please provide a valid email address for delivery.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payloadItems = items.map(i => ({ 
        id: i.id, 
        type: i.type,
        selectedLicenseId: i.selectedLicense?.id
      }));

      // Server-side authoritative calculation
      const orderRes = await createPayPalOrder(payloadItems, { email: customerEmail, name: customerName });

      if (orderRes.isFree) {
        setSuccessOrder(orderRes.order);
        setCheckoutStage('SUCCESS');
        clearCart();
        setLoading(false);
        return;
      }

      if (!orderRes.configured) {
        // If credentials are not configured yet, save order as pending with instructions
        setError(orderRes.message || 'PayPal credentials not set in Command Center > Payment Settings.');
        setLoading(false);
        return;
      }

      if (orderRes.paypalOrderId && orderRes.orderId) {
        setPendingOrderId(orderRes.orderId);
        setPendingPaypalId(orderRes.paypalOrderId);
        setCheckoutStage('PAYING');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (details: any) => {
    if (!pendingOrderId || !pendingPaypalId) return;
    setLoading(true);
    try {
      const captureRes = await capturePayPalOrder(pendingOrderId, pendingPaypalId, customerEmail);
      if (captureRes.success) {
        setSuccessOrder(captureRes.order);
        setCheckoutStage('SUCCESS');
        clearCart();
      } else {
        setError('Payment capture could not be verified.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            <h3 className="text-xl font-bold font-display text-white">Your Cart & Checkout</h3>
          </div>
          <button
            onClick={() => {
              setCheckoutStage('CART');
              closeCheckout();
            }}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Screen */}
        {checkoutStage === 'SUCCESS' && successOrder && (
          <div className="py-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-2xl font-bold font-display text-white">Order Confirmed!</h4>
              <p className="text-sm text-zinc-400 mt-1">
                Thank you, <span className="text-white font-medium">{successOrder.customerName || 'Artist'}</span>. Your beats are ready.
              </p>
              <div className="mt-3 p-3 bg-zinc-900 rounded-xl text-xs font-mono text-zinc-300 border border-zinc-800">
                Order ID: <span className="text-purple-400 font-bold">{successOrder.id}</span>
              </div>
            </div>

            {/* Authorized Downloads List */}
            <div className="space-y-3 text-left">
              <h5 className="text-xs font-bold text-zinc-400 uppercase font-mono tracking-wider">Authorized Downloads:</h5>
              {successOrder.items.map((item: any) => (
                <div key={item.id} className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white font-display">{item.title}</p>
                    <p className="text-xs text-zinc-400 font-mono uppercase">Format: {item.format || 'M4A'} · {item.licenseName || 'Lease'}</p>
                  </div>
                  <a
                    href={`/api/download/authorized/${successOrder.downloadToken}/${item.id}`}
                    download
                    className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </a>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSuccessOrder(null);
                setCheckoutStage('CART');
                closeCheckout();
              }}
              className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm transition-colors"
            >
              Close & Return to Store
            </button>
          </div>
        )}

        {/* Paying Stage (PayPal Smart Button Component) */}
        {checkoutStage === 'PAYING' && pendingPaypalId && (
          <div className="py-6 space-y-4">
            <PayPalPayment
              amount={subtotal}
              description={`CASHMERE KID$ Purchase - ${items.map(i => i.item.title).join(', ')}`}
              clientId={import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb'}
              onSuccess={handlePaymentSuccess}
              onError={(err) => setError(err.message || 'PayPal Checkout Cancelled/Failed')}
            />
            
            <button
              onClick={() => setCheckoutStage('CART')}
              className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-mono text-xs uppercase"
            >
              Cancel & Return to Cart
            </button>
          </div>
        )}

        {/* Cart Stage */}
        {checkoutStage === 'CART' && (
          <div className="py-6 space-y-6">
            {items.length === 0 ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-zinc-400">Your cart is currently empty.</p>
                <button
                  onClick={closeCheckout}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                >
                  Browse Beats
                </button>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                  {items.map((cartItem) => (
                    <div
                      key={cartItem.id}
                      className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-white truncate font-display">
                          {cartItem.item.title}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-mono uppercase">
                          Format: {cartItem.type === 'beat' ? (cartItem.item as any).format : 'm4a'} · {cartItem.selectedLicense?.name || 'Standard M4A/MP3 Lease'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-purple-300">
                          {cartItem.price === 0 ? 'FREE' : `$${cartItem.price.toFixed(2)}`}
                        </span>
                        <button
                          onClick={() => removeFromCart(cartItem.id)}
                          className="p-1 rounded text-zinc-500 hover:text-rose-400 transition-colors"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal */}
                <div className="p-4 bg-zinc-900/90 border border-zinc-800 rounded-xl flex items-center justify-between font-mono">
                  <span className="text-sm text-zinc-400">Total Price:</span>
                  <span className="text-xl font-bold text-purple-400">${subtotal.toFixed(2)}</span>
                </div>

                {/* Customer Details Form */}
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1 font-mono uppercase">
                      Delivery Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="artist@example.com"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1 font-mono uppercase">
                      Artist / Customer Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Stage name or Name"
                      className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-500 focus:outline-none text-white text-sm"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl flex items-start gap-2 font-mono">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-sm shadow-lg purple-glow transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Preparing Secured Bill...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>{subtotal === 0 ? 'Complete Free Order' : 'Proceed to Payment Gate'}</span>
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-zinc-500 text-center mt-2 font-mono">
                      🔒 Secured server verified checkout and instant digital delivery.
                    </p>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
