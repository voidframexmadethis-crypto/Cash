import React from 'react';
import { X, CheckCircle, AlertCircle, Info, ShieldCheck, ShoppingBag, Download, KeyRound } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

export const NotificationToast: React.FC = () => {
  const { toast, dismissToast } = useNotifications();

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'order':
      case 'payment':
        return <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'download':
        return <Download className="w-5 h-5 text-purple-400 shrink-0" />;
      case 'security':
        return <ShieldCheck className="w-5 h-5 text-purple-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-purple-400 shrink-0" />;
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-zinc-950/95 border border-purple-900/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top duration-300 font-sans">
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-bold font-display text-white">{toast.title}</h4>
          <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">{toast.message}</p>
          <span className="text-[10px] font-mono text-zinc-500 mt-1 block">
            {new Date(toast.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <button onClick={dismissToast} className="p-1 text-zinc-500 hover:text-white rounded-lg">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
