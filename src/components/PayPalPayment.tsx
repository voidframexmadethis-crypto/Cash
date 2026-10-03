import React, { useEffect, useState, useRef } from 'react';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  description?: string;
  clientId?: string; // Set this to your live Client ID, or let it default to 'sb'
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
}

export const PayPalPayment: React.FC<PayPalButtonProps> = ({
  amount,
  currency = 'USD',
  description = 'Digital Purchase',
  clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'sb', // Set your VITE_PAYPAL_CLIENT_ID in your .env file
  onSuccess,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const buttonContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scriptId = 'paypal-js-sdk-unique';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initializeButtons = () => {
      setIsLoaded(true);
      const paypal = (window as any).paypal;
      if (paypal && buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                description: description,
                amount: {
                  currency_code: currency,
                  value: amount.toFixed(2).toString(),
                }
              }]
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              const details = await actions.order.capture();
              onSuccess(details);
            } catch (err) {
              console.error('Capture failed', err);
              onError(err);
            }
          },
          onError: (err: any) => {
            console.error('PayPal Buttons experienced an error', err);
            onError(err);
          }
        }).render(buttonContainerRef.current);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
      script.async = true;
      script.onload = initializeButtons;
      script.onerror = () => {
        setLoadError('Failed to load PayPal secure payment network.');
        onError(new Error('PayPal SDK failed to load.'));
      };
      document.body.appendChild(script);
    } else {
      const paypal = (window as any).paypal;
      if (paypal) {
        initializeButtons();
      } else {
        script.addEventListener('load', initializeButtons);
      }
    }

    return () => {
      if (buttonContainerRef.current) {
        buttonContainerRef.current.innerHTML = '';
      }
    };
  }, [amount, currency, description, clientId, onSuccess, onError]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-xl text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold tracking-wider text-amber-400">SECURE BILLING PORTAL</h3>
        <span className="text-xs text-zinc-500 font-mono">SSL Secure Connection</span>
      </div>
      <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/50 mb-6 flex justify-between items-center">
        <span className="text-sm text-zinc-400 font-medium">{description}</span>
        <span className="text-xl font-bold text-teal-400">${amount.toFixed(2)} {currency}</span>
      </div>
      {loadError && (
        <div className="bg-red-950/50 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center mb-4">
          {loadError}
        </div>
      )}
      <div className="relative min-h-[150px] flex flex-col justify-center">
        {!isLoaded && !loadError && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-amber-400 font-mono tracking-widest uppercase">Initializing payment gateway...</p>
          </div>
        )}
        <div ref={buttonContainerRef} id="paypal-button-container" className="w-full z-10"></div>
      </div>
      <div className="mt-6 text-center text-[10px] text-zinc-500 font-medium uppercase tracking-widest">
        Processed via PayPal Merchant Integration API • Safe & Encrypted
      </div>
    </div>
  );
};

export default PayPalPayment;
