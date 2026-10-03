import React from 'react';
import { Shirt, ShoppingBag } from 'lucide-react';
import { MerchItem } from '../types';

interface MerchPageProps {
  merch: MerchItem[];
}

export const MerchPage: React.FC<MerchPageProps> = ({ merch }) => {
  return (
    <div className="space-y-8 pb-28">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">CASHMERE KID$ Apparel & Merch</h1>
        <p className="text-xs text-zinc-400 mt-1">Official streetwear, hoodies, tees, and caps</p>
      </div>

      {merch.length === 0 ? (
        <div className="p-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
          <Shirt className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-300 font-display">New Merch Drop Coming Soon</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
            Apparel and physical accessories can be added by the owner in Creator Studio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {merch.map((item) => (
            <div key={item.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full aspect-square rounded-xl object-cover bg-zinc-900"
                />
              )}
              <h3 className="text-lg font-bold font-display text-white">{item.title}</h3>
              <p className="text-xs text-zinc-400">{item.description}</p>
              <div className="flex items-center justify-between font-mono">
                <span className="text-lg font-bold text-purple-300">${item.price.toFixed(2)}</span>
                <span className="text-xs text-zinc-500">In Stock: {item.stock}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
