import React from 'react';
import { Youtube } from 'lucide-react';
import { YouTubeVideo } from '../types';

interface YouTubePageProps {
  videos: YouTubeVideo[];
}

export const YouTubePage: React.FC<YouTubePageProps> = ({ videos }) => {
  return (
    <div className="space-y-8 pb-28">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight">Studio YouTube Channel</h1>
        <p className="text-xs text-zinc-400 mt-1">Official beat cookups, tutorials, and music video releases</p>
      </div>

      {videos.length === 0 ? (
        <div className="p-16 text-center bg-zinc-950 border border-zinc-900 rounded-2xl space-y-3">
          <Youtube className="w-12 h-12 text-rose-500/80 mx-auto" />
          <h3 className="text-lg font-bold text-zinc-300 font-display">No YouTube Videos Linked Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto font-sans">
            Add YouTube Video IDs in Creator Studio to showcase beat cookups and music videos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {videos.map((vid) => (
            <div key={vid.id} className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${vid.videoId}`}
                  title={vid.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
              <h3 className="font-bold text-base text-white font-display">{vid.title}</h3>
              {vid.description && <p className="text-xs text-zinc-400 font-sans">{vid.description}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
