import React, { useState } from 'react';
import { X, FileText, CheckCircle, Plus } from 'lucide-react';
import { LicenseTemplate } from '../types';
import { DEFAULT_LICENSE_TEMPLATES } from '../constants/licenses';

interface LicenseBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveLicense: (license: LicenseTemplate) => void;
}

export const LicenseBuilderModal: React.FC<LicenseBuilderModalProps> = ({
  isOpen,
  onClose,
  onSaveLicense
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('49.99');
  const [desc, setDesc] = useState('');
  const [streamingLimit, setStreamingLimit] = useState('100,000 Streams');
  const [isExclusive, setIsExclusive] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLic: LicenseTemplate = {
      id: 'lic-' + Date.now(),
      name,
      price: parseFloat(price) || 49.99,
      description: desc || 'Custom license terms.',
      fileTypes: ['M4A', 'MP3'],
      streamingLimit,
      distributionLimit: '5,000 Units',
      commercialRights: true,
      performanceRights: true,
      isExclusive
    };

    onSaveLicense(newLic);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-sans">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold font-display text-white">License Product Builder</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-300 font-bold uppercase mb-1">License Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Broadcast Commercial License"
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-1">Price ($) *</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-zinc-300 font-bold uppercase mb-1">Streaming Limit</label>
              <input
                type="text"
                value={streamingLimit}
                onChange={(e) => setStreamingLimit(e.target.value)}
                placeholder="e.g. 100,000 Streams"
                className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-zinc-300 font-bold uppercase mb-1">Description & Usage Terms</label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Specify commercial rights, radio play, and distribution limits..."
              rows={3}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 font-bold">
            <input
              type="checkbox"
              checked={isExclusive}
              onChange={(e) => setIsExclusive(e.target.checked)}
              className="rounded bg-zinc-900 border-zinc-800 text-purple-600"
            />
            <span>EXCLUSIVE OWNERSHIP LICENSE</span>
          </label>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase shadow-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>SAVE LICENSE PRODUCT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
