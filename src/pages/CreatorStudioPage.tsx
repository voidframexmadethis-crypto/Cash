import React, { useState } from 'react';
import { 
  Sparkles, Download, Copy, Check, Disc, Music, Layers, Palette, Image as ImageIcon,
  Share2, Eye, ShieldCheck, Flame, KeyRound
} from 'lucide-react';
import { Beat, BeatPack, Collection } from '../types';

interface CreatorStudioPageProps {
  beats: Beat[];
  beatPacks: BeatPack[];
  collections: Collection[];
}

export const CreatorStudioPage: React.FC<CreatorStudioPageProps> = ({
  beats,
  beatPacks,
  collections
}) => {
  const [selectedBeatId, setSelectedBeatId] = useState<string>(beats[0]?.id || '');
  const [selectedTemplate, setSelectedTemplate] = useState<'darkTrap' | 'neonPurple' | 'cinematic' | 'underground' | 'luxury' | 'vault'>('darkTrap');
  
  const [headline, setHeadline] = useState('NEW BEAT DROP');
  const [subtitle, setSubtitle] = useState('Out Now on CASHMERE KID$');
  const [ctaText, setCtaText] = useState('LISTEN NOW / COP BEAT');
  const [copied, setCopied] = useState(false);

  const selectedBeat = beats.find(b => b.id === selectedBeatId) || beats[0];

  const handleCopyCaption = () => {
    if (!selectedBeat) return;
    const text = `🔥 NEW DROP: "${selectedBeat.title}" [${selectedBeat.bpm} BPM / ${selectedBeat.key}]\nProduced by ${selectedBeat.producer}\n💰 Price: ${selectedBeat.isFree ? 'FREE DOWNLOAD' : `$${selectedBeat.price.toFixed(2)}`}\nStream & Download now: ${window.location.origin}/#beat-${selectedBeat.id}\n\n#CASHMEREKIDS #BeatStore #TrapBeats #Producers`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getTemplateStyle = () => {
    switch (selectedTemplate) {
      case 'neonPurple':
        return 'bg-gradient-to-br from-purple-950 via-zinc-950 to-black border-2 border-purple-500 shadow-2xl purple-glow';
      case 'cinematic':
        return 'bg-gradient-to-t from-black via-zinc-950 to-purple-950/40 border border-zinc-800 shadow-2xl';
      case 'underground':
        return 'bg-zinc-950 border-2 border-zinc-800 shadow-2xl';
      case 'luxury':
        return 'bg-gradient-to-br from-zinc-900 via-zinc-950 to-black border-2 border-amber-500/40 shadow-2xl';
      case 'vault':
        return 'bg-gradient-to-br from-purple-950 via-black to-zinc-950 border-2 border-purple-600 shadow-2xl';
      case 'darkTrap':
      default:
        return 'bg-zinc-950 border-2 border-purple-900/60 shadow-2xl';
    }
  };

  return (
    <div className="space-y-8 pb-28">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>PRODUCER CREATIVE STUDIO</span>
        </div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">CASHMERE KID$ UGC & Ad Creator</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Generate promotional cards, social media ad graphics, and promo copy pulled directly from catalog data.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Creative Controls */}
        <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-6 shadow-xl">
          <h3 className="text-lg font-bold font-display text-white">Creative Controls</h3>

          {/* Select Beat */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-2">
              Select Beat to Promote
            </label>
            <select
              value={selectedBeatId}
              onChange={(e) => setSelectedBeatId(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-sm font-sans focus:outline-none focus:border-purple-500"
            >
              {beats.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} ({b.bpm} BPM · {b.key})
                </option>
              ))}
            </select>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-2">
              Promo Template Style
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { id: 'darkTrap', label: 'Dark Trap' },
                { id: 'neonPurple', label: 'Neon Purple' },
                { id: 'cinematic', label: 'Cinematic' },
                { id: 'underground', label: 'Underground' },
                { id: 'luxury', label: 'Gold Luxury' },
                { id: 'vault', label: 'Vault Exclusive' }
              ].map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id as any)}
                  className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-purple-600 text-white border-purple-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Text Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">Promo Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">Subheadline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-zinc-300 uppercase mb-1">Call To Action (CTA)</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white text-xs font-mono focus:outline-none"
              />
            </div>
          </div>

          {/* Copy Caption Action */}
          <button
            onClick={handleCopyCaption}
            className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono uppercase shadow-lg flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Caption Copied to Clipboard!' : 'Copy Social Media Caption'}</span>
          </button>
        </div>

        {/* Right Column: Live Ad Asset Canvas Preview */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-white">Live Ad Card Preview</h3>
            <span className="text-xs font-mono text-zinc-500">1080x1080 Aspect Ratio</span>
          </div>

          {!selectedBeat ? (
            <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-3xl">
              <p className="text-zinc-500 font-mono text-xs">No beat selected for promo creation.</p>
            </div>
          ) : (
            <div className={`aspect-square w-full max-w-lg mx-auto rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden transition-all ${getTemplateStyle()}`}>
              
              {/* Header Lockup */}
              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-mono font-bold tracking-widest text-purple-400 bg-black/60 px-3 py-1 rounded-full border border-purple-900/50 uppercase">
                  {headline}
                </span>
                <span className="text-xs font-mono font-bold text-white tracking-tight">
                  CASHMERE KID$
                </span>
              </div>

              {/* Artwork & Specs */}
              <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-4">
                <img
                  src={selectedBeat.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                  alt={selectedBeat.title}
                  className="w-44 h-44 rounded-2xl object-cover border-2 border-purple-500/40 shadow-2xl purple-glow-sm"
                />

                <div className="space-y-1">
                  <h2 className="text-2xl font-extrabold font-display text-white tracking-tight">
                    {selectedBeat.title}
                  </h2>
                  <p className="text-xs font-mono text-purple-300">
                    {selectedBeat.bpm} BPM · {selectedBeat.key} · {selectedBeat.genre}
                  </p>
                  <p className="text-xs text-zinc-400 font-sans">{subtitle}</p>
                </div>
              </div>

              {/* Footer CTA & Price */}
              <div className="relative z-10 flex items-center justify-between pt-4 border-t border-white/10 font-mono">
                <span className="text-xl font-extrabold text-white">
                  {selectedBeat.isFree ? 'FREE DOWNLOAD' : `$${selectedBeat.price.toFixed(2)}`}
                </span>

                <div className="px-4 py-2 bg-purple-600 text-white font-bold text-xs rounded-xl shadow">
                  {ctaText}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
