import React from 'react';
import { X, FileText, Check, Minus } from 'lucide-react';
import { DEFAULT_LICENSE_TEMPLATES } from '../constants/licenses';

interface LicenseComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LicenseComparisonModal: React.FC<LicenseComparisonModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in font-sans">
      <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl w-full max-w-4xl p-6 md:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold font-display text-white">CASHMERE KID$ License Comparison</h2>
              <p className="text-xs text-zinc-400 font-mono">Transparent legal terms and audio usage allowances</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto no-scrollbar font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-purple-400">
                <th className="p-3 text-zinc-500 font-bold uppercase">TERMS / RIGHTS</th>
                {DEFAULT_LICENSE_TEMPLATES.map(l => (
                  <th key={l.id} className="p-3 font-bold uppercase text-white">{l.name}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              <tr>
                <td className="p-3 font-bold text-zinc-400">PRICE</td>
                {DEFAULT_LICENSE_TEMPLATES.map(l => (
                  <td key={l.id} className="p-3 font-bold text-purple-300 text-sm">${l.price.toFixed(2)}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-400">AUDIO FORMATS</td>
                {DEFAULT_LICENSE_TEMPLATES.map(l => (
                  <td key={l.id} className="p-3 font-semibold uppercase">{l.fileTypes.join(' / ')}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-400">STREAMING LIMIT</td>
                {DEFAULT_LICENSE_TEMPLATES.map(l => (
                  <td key={l.id} className="p-3">{l.streamingLimit || 'Unlimited'}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-400">COMMERCIAL RIGHTS</td>
                {DEFAULT_LICENSE_TEMPLATES.map(l => (
                  <td key={l.id} className="p-3">{l.commercialRights ? <Check className="w-4 h-4 text-emerald-400" /> : <Minus className="w-4 h-4 text-zinc-600" />}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-400">PERFORMANCE RIGHTS</td>
                {DEFAULT_LICENSE_TEMPLATES.map(l => (
                  <td key={l.id} className="p-3">{l.performanceRights ? <Check className="w-4 h-4 text-emerald-400" /> : <Minus className="w-4 h-4 text-zinc-600" />}</td>
                ))}
              </tr>
              <tr>
                <td className="p-3 font-bold text-zinc-400">EXCLUSIVITY</td>
                {DEFAULT_LICENSE_TEMPLATES.map(l => (
                  <td key={l.id} className="p-3">{l.isExclusive ? <span className="text-purple-400 font-bold">EXCLUSIVE</span> : 'NON-EXCLUSIVE'}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};
