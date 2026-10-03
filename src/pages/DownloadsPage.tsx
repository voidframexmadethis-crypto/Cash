import React, { useState } from 'react';
import { Search, Download, ShieldAlert, Disc, Heart, Play, Pause, ShoppingCart, ShieldCheck, FileCheck } from 'lucide-react';
import { Order, Beat, BeatPassport } from '../types';
import { lookupCustomerOrders, fetchBeats } from '../services/api';
import { useAudio } from '../context/AudioContext';
import { useCart } from '../context/CartContext';

export const DownloadsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'passports' | 'favorites'>('orders');
  const [query, setQuery] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [allBeats, setAllBeats] = useState<Beat[]>([]);
  const { favorites, isFavorite, toggleFavorite, playTrack, currentTrack, isPlaying } = useAudio();
  const { addToCart, isInCart } = useCart();

  React.useEffect(() => {
    fetchBeats().then(setAllBeats).catch(console.error);
  }, []);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const isEmail = query.includes('@');
      const results = await lookupCustomerOrders(isEmail ? query : undefined, !isEmail ? query : undefined);
      setOrders(results);
      if (results.length === 0) {
        setError('No verified paid orders found matching that email or Order ID.');
      }
    } catch (err: any) {
      console.error('Order lookup error:', err);
      setError('Unable to perform order lookup.');
    } finally {
      setLoading(false);
    }
  };

  const favoriteBeats = allBeats.filter(b => favorites.includes(b.id));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-28 font-sans">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">Customer Library & Beat Passports</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Access your verified purchases, official Beat Passports, and favorited beats.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2 text-xs font-mono">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl transition-colors font-bold ${
            activeTab === 'orders' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          My Verified Orders & Downloads
        </button>
        <button
          onClick={() => setActiveTab('passports')}
          className={`px-4 py-2 rounded-xl transition-colors font-bold ${
            activeTab === 'passports' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          Official Beat Passports
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`px-4 py-2 rounded-xl transition-colors font-bold ${
            activeTab === 'favorites' ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-zinc-400'
          }`}
        >
          My Favorites ({favorites.length})
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <form onSubmit={handleLookup} className="p-6 bg-zinc-950 border border-zinc-900 rounded-3xl space-y-4 shadow-xl">
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase">
              Delivery Email or PayPal Order ID
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="artist@example.com or ord-12345"
                  className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 focus:border-purple-500 rounded-xl text-white text-sm focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs font-mono flex items-center gap-2"
              >
                <span>LOOKUP</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-2 font-mono">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {orders && orders.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold font-display text-white">Your Verified Orders ({orders.length})</h3>

              {orders.map((ord) => (
                <div key={ord.id} className="p-6 bg-zinc-950 border border-zinc-900 rounded-2xl space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-900 text-xs font-mono">
                    <div>
                      <span className="text-zinc-500">ORDER: </span>
                      <span className="text-purple-400 font-bold">{ord.id}</span>
                    </div>
                    <div className="text-zinc-400">
                      <span>DATE: </span>
                      <span>{new Date(ord.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 font-bold">
                      VERIFIED PAID
                    </div>
                  </div>

                  <div className="space-y-3">
                    {ord.items.map((item) => (
                      <div key={item.id} className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Disc className="w-8 h-8 text-purple-400 shrink-0" />
                          <div>
                            <h4 className="font-bold text-sm text-white font-display">{item.title}</h4>
                            <p className="text-xs text-zinc-400 font-mono uppercase">FORMAT: {item.format || 'M4A'}</p>
                          </div>
                        </div>

                        <a
                          href={`/api/download/authorized/${ord.downloadToken}/${item.id}`}
                          download
                          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download File</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Beat Passports Tab */}
      {activeTab === 'passports' && (
        <div className="space-y-4 font-mono text-xs">
          <h3 className="text-lg font-bold font-display text-white">Official Beat Passports</h3>

          {!orders || orders.length === 0 ? (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-2xl space-y-2">
              <FileCheck className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400 font-mono">Perform an order lookup above to view your official Beat Passports.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(ord => (
                ord.items.map(item => (
                  <div key={item.id} className="p-6 bg-zinc-950 border-2 border-purple-900/60 rounded-3xl space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
                      <span className="font-bold text-purple-400 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4" /> BEAT PASSPORT
                      </span>
                      <span className="text-emerald-400 font-bold">AUTHENTICATED</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-zinc-300">
                      <div><span className="text-zinc-500 block">TITLE</span><span className="font-bold text-white text-sm">{item.title}</span></div>
                      <div><span className="text-zinc-500 block">PRODUCER</span><span className="font-bold text-purple-300">CASHMERE KID$</span></div>
                      <div><span className="text-zinc-500 block">ORDER ID</span><span>{ord.id}</span></div>
                      <div><span className="text-zinc-500 block">LICENSE</span><span>{item.licenseName || 'Standard M4A/MP3 Lease'}</span></div>
                    </div>
                  </div>
                ))
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites Tab */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display text-white">Favorited Beats ({favoriteBeats.length})</h3>

          {favoriteBeats.length === 0 ? (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-2xl space-y-2">
              <Heart className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400 font-mono">You haven't favorited any beats yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {favoriteBeats.map((beat) => (
                <div key={beat.id} className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={beat.artworkUrl || ''} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-white font-display text-sm">{beat.title}</h4>
                      <p className="text-xs font-mono text-purple-400">{beat.bpm} BPM · {beat.key}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleFavorite(beat.id)}
                      className="p-2 text-rose-500 hover:text-rose-400"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>

                    <button
                      onClick={() => addToCart(beat, 'beat')}
                      disabled={isInCart(beat.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold font-mono"
                    >
                      {isInCart(beat.id) ? 'IN CART' : 'ADD'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
