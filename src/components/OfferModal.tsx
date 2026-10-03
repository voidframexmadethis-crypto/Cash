import React, { useState } from 'react';
import { X, DollarSign, Send, CheckCircle } from 'lucide-react';
import { Beat } from '../types';

interface OfferModalProps {
  beat: Beat;
  isOpen: boolean;
  onClose: () => void;
  onSubmitOffer: (offerData: { offerAmount: number; customerEmail: string; message: string }) => void;
}

export const OfferModal: React.FC<OfferModalProps> = ({ beat, isOpen, onClose, onSubmitOffer }) => {
  const [offerAmount, setOfferAmount] = useState<string>(String(beat.price * 0.8));
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(offerAmount);
    if (!amount || !email.trim()) return;

    onSubmitOffer({
      offerAmount: amount,
      customerEmail: email,
      message: msg
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold font-display text-white">Make an Offer</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3 font-mono">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Offer Submitted!</h4>
            <p className="text-xs text-zinc-400">The producer will review your offer in the Command Center.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
            <div>
              <span className="text-zinc-500 block">BEAT TITLE</span>
              <span className="font-bold text-white text-base font-display">{beat.title}</span>
              <span className="text-purple-400 text-xs block">Listed Price: ${beat.price.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-1">Your Offer Amount ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-1">Your Email *</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="artist@example.com"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-1">Note / Project Details (Optional)</label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Details about your release or project..."
                rows={2}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase shadow-lg flex items-center justify-center gap-2 purple-glow"
            >
              <Send className="w-4 h-4" />
              <span>SUBMIT OFFER TO PRODUCER</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
