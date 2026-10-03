import React, { useState } from 'react';
import { X, Layers, Tag, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { Collection } from '../types';

interface BulkManagementModalProps {
  selectedBeatIds: string[];
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
  onApplyBulkUpdate: (update: any) => Promise<void>;
  onApplyBulkDelete: () => Promise<void>;
}

export const BulkManagementModal: React.FC<BulkManagementModalProps> = ({
  selectedBeatIds,
  collections,
  isOpen,
  onClose,
  onApplyBulkUpdate,
  onApplyBulkDelete
}) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<'feature' | 'unfeature' | 'vault' | 'archive' | 'delete'>('feature');

  if (!isOpen || selectedBeatIds.length === 0) return null;

  const handleExecute = async () => {
    setLoading(true);
    try {
      if (action === 'delete') {
        if (confirm(`Are you sure you want to permanently delete ${selectedBeatIds.length} beat(s)?`)) {
          await onApplyBulkDelete();
        }
      } else if (action === 'feature') {
        await onApplyBulkUpdate({ isFeatured: true });
      } else if (action === 'unfeature') {
        await onApplyBulkUpdate({ isFeatured: false });
      } else if (action === 'vault') {
        await onApplyBulkUpdate({ isVault: true });
      } else if (action === 'archive') {
        await onApplyBulkUpdate({ isArchived: true });
      }
      onClose();
    } catch (err) {
      console.error('Bulk operation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h3 className="text-lg font-bold font-display text-white">Bulk Management ({selectedBeatIds.length} selected)</h3>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <label className="block text-zinc-300 font-bold uppercase">Select Action</label>
          <select
            value={action}
            onChange={(e: any) => setAction(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
          >
            <option value="feature">Feature Beats on Storefront</option>
            <option value="unfeature">Remove Feature Status</option>
            <option value="vault">Add to Vault Exclusives</option>
            <option value="archive">Archive Beats</option>
            <option value="delete">Permanently Delete Beats</option>
          </select>
        </div>

        <button
          onClick={handleExecute}
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono uppercase shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>EXECUTE BULK ACTION</span>}
        </button>
      </div>
    </div>
  );
};
