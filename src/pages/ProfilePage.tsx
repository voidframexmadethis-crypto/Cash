import React from 'react';
import { Youtube, Instagram, Twitter, Music, Disc, Sparkles, Share2 } from 'lucide-react';
import { Beat, BeatPack, StoreSettings } from '../types';

interface ProfilePageProps {
  settings: StoreSettings;
  beats: Beat[];
  beatPacks: BeatPack[];
  openBeatDetail: (id: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  settings,
  beats,
  beatPacks,
  openBeatDetail
}) => {
  const totalStreams = beats.reduce((acc, b) => acc + (b.playCount || 0), 0);

  return (
    <div className="space-y-12 pb-28">
      
      {/* Banner & Avatar Lockup */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950">
        <div className="h-56 md:h-72 w-full relative overflow-hidden">
          <img
            src={settings.bannerUrl || '/src/assets/images/hero_cashmere_kids_1790977501320.jpg'}
            alt="Producer Banner"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        </div>

        <div className="px-6 md:px-10 pb-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-20 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <img
              src={settings.profileImageUrl || '/src/assets/images/producer_cashmere_kids_1790977511588.jpg'}
              alt={settings.producerName}
              className="w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-zinc-950 shadow-2xl purple-glow-sm"
            />
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/50 text-purple-300 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>VERIFIED PRODUCER</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold font-display text-white tracking-tight">
                {settings.producerName || 'CASHMERE KID$'}
              </h1>
              <p className="text-sm text-zinc-400 max-w-xl font-sans">
                {settings.bio || 'Independent underground trap producer.'}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3">
            {settings.socialLinks?.youtube && (
              <a
                href={settings.socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {settings.socialLinks?.instagram && (
              <a
                href={settings.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {settings.socialLinks?.twitter && (
              <a
                href={settings.socialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Producer Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">Total Catalog Beats</span>
          <span className="text-2xl font-bold text-white">{beats.length}</span>
        </div>
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">Beat Packs</span>
          <span className="text-2xl font-bold text-white">{beatPacks.length}</span>
        </div>
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">Total Streams</span>
          <span className="text-2xl font-bold text-purple-400">{totalStreams}</span>
        </div>
        <div className="p-5 bg-zinc-950 border border-zinc-900 rounded-2xl text-center">
          <span className="text-[10px] text-zinc-500 uppercase block">Primary Genre</span>
          <span className="text-lg font-bold text-zinc-200">Dark Trap</span>
        </div>
      </div>

      {/* Beats Grid */}
      <div className="space-y-4">
        <h3 className="text-2xl font-extrabold font-display text-white">Catalog Spotlight</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beats.slice(0, 6).map((beat) => (
            <div
              key={beat.id}
              onClick={() => openBeatDetail(beat.id)}
              className="bg-zinc-950 border border-zinc-900 hover:border-purple-500/40 p-4 rounded-2xl space-y-3 cursor-pointer transition-all"
            >
              <img
                src={beat.artworkUrl || '/src/assets/images/pack_dark_trap_vol1_1790977520055.jpg'}
                alt={beat.title}
                className="w-full aspect-square rounded-xl object-cover"
              />
              <div>
                <h4 className="font-bold text-base text-white font-display truncate">{beat.title}</h4>
                <p className="text-xs text-zinc-400 font-mono">{beat.bpm} BPM · {beat.key}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
