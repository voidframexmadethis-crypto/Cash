import React, { useState } from 'react';
import { ShoppingBag, ShieldCheck, Download, Music, Disc, Layers, Shirt, Youtube, User, KeyRound, Bell, Swords, Radio, HardDrive, Shield, Play } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNotifications } from '../context/NotificationContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAdminModal: () => void;
  openRadio: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, openAdminModal, openRadio }) => {
  const { totalItems, openCheckout } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const navLinks = [
    { id: 'browse', label: 'Beats', icon: Music },
    { id: 'audioPlayer', label: 'Audio Player', icon: Play },
    { id: 'battle', label: 'Beat Battle', icon: Swords },
    { id: 'packs', label: 'Beat Packs', icon: Disc },
    { id: 'collections', label: 'Collections', icon: Layers },
    { id: 'vault', label: 'The Vault', icon: KeyRound },
    { id: 'recovery', label: 'Recovery Center', icon: HardDrive },
    { id: 'security', label: 'Security OS', icon: Shield },
    { id: 'merch', label: 'Merch', icon: Shirt },
    { id: 'downloads', label: 'My Library', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-zinc-800/80 px-4 md:px-8 py-3.5 transition-all font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Wordmark */}
        <button 
          onClick={() => setActiveTab('home')}
          className="text-xl md:text-2xl font-extrabold tracking-tight font-display text-white hover:text-purple-400 transition-colors flex items-center gap-2 text-left shrink-0"
        >
          <span className="purple-gradient-text">CASHMERE KID$</span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-5 text-xs xl:text-sm font-medium text-zinc-300">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => setActiveTab(link.id)}
              className={`transition-colors flex items-center gap-1.5 py-1 ${
                activeTab === link.id
                  ? 'text-purple-400 font-semibold border-b-2 border-purple-500'
                  : 'hover:text-white'
              }`}
            >
              <link.icon className="w-4 h-4" />
              <span>{link.label}</span>
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* CASHMERE RADIO BUTTON */}
          <button
            onClick={openRadio}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-300 hover:text-white font-mono text-xs font-bold transition-all"
            title="Launch Cashmere Radio"
          >
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="hidden sm:inline">RADIO</span>
          </button>

          {/* Notification Center Bell */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 text-zinc-100 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-purple-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 md:w-96 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-900 text-xs font-mono">
                  <span className="font-bold text-white uppercase">System Notifications ({notifications.length})</span>
                  <button onClick={markAllAsRead} className="text-purple-400 hover:text-purple-300 text-[11px]">
                    Mark all read
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 font-sans text-xs">
                  {notifications.length === 0 ? (
                    <p className="text-zinc-500 py-4 text-center font-mono">No notifications.</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                          n.isRead ? 'bg-zinc-900/40 border-zinc-900 text-zinc-400' : 'bg-zinc-900 border-purple-900/50 text-white'
                        }`}
                      >
                        <p className="font-bold font-display">{n.title}</p>
                        <p className="text-zinc-400 text-[11px] mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Button */}
          <button
            onClick={openCheckout}
            className="relative flex items-center justify-center p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/50 text-zinc-100 hover:text-white transition-all min-w-[44px] min-h-[44px]"
            title="View Cart"
            aria-label="View Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5 text-purple-400" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-white text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-md">
                {totalItems}
              </span>
            )}
          </button>

          {/* Owner Command Center Lock Button */}
          <button
            onClick={openAdminModal}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-purple-300 transition-all min-h-[44px]"
            title="Command Center Login"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="hidden sm:inline font-mono">COMMAND CENTER</span>
          </button>

        </div>
      </div>

      {/* Mobile Nav Row */}
      <div className="flex xl:hidden overflow-x-auto no-scrollbar gap-2 mt-3 pt-2 border-t border-zinc-900 text-xs">
        {navLinks.map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveTab(link.id)}
            className={`whitespace-nowrap px-3 py-2 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1.5 min-h-[40px] ${
              activeTab === link.id
                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <link.icon className="w-3.5 h-3.5" />
            <span>{link.label}</span>
          </button>
        ))}
      </div>
    </header>
  );
};
