import React, { useState, useEffect } from 'react';
import { AudioProvider } from './context/AudioContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/Header';
import { Player } from './components/Player';
import { CheckoutModal } from './components/CheckoutModal';
import { NotificationToast } from './components/NotificationToast';
import { SessionModeModal } from './components/SessionModeModal';
import { CashmereRadioModal } from './components/CashmereRadioModal';
import { LicenseComparisonModal } from './components/LicenseComparisonModal';

import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { BeatDetailPage } from './pages/BeatDetailPage';
import { PacksPage } from './pages/PacksPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { VaultPage } from './pages/VaultPage';
import { MerchPage } from './pages/MerchPage';
import { YouTubePage } from './pages/YouTubePage';
import { ProfilePage } from './pages/ProfilePage';
import { DownloadsPage } from './pages/DownloadsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CreatorStudioPage } from './pages/CreatorStudioPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { BeatBattlePage } from './pages/BeatBattlePage';
import { ReleaseRoomPage } from './pages/ReleaseRoomPage';
import { RecoveryCenterPage } from './pages/RecoveryCenterPage';
import { SecurityCenterPage } from './pages/SecurityCenterPage';
import { AudioPlayerPage } from './pages/AudioPlayerPage';

import { 
  fetchPublicSettings, fetchBeats, fetchBeatPacks, fetchCollections, 
  fetchMerch, fetchYouTubeVideos 
} from './services/api';
import { Beat, BeatPack, Collection, MerchItem, YouTubeVideo, StoreSettings } from './types';

export function AppContent() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedBeatId, setSelectedBeatId] = useState<string | null>(null);
  const [isSessionModeOpen, setIsSessionModeOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isLicenseCompareOpen, setIsLicenseCompareOpen] = useState(false);

  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'CASHMERE KID$',
    producerName: 'CASHMERE KID$',
    bio: 'Independent trap producer creating luxury underground beats.',
    bannerUrl: '/src/assets/images/hero_cashmere_kids_1790977501320.jpg',
    profileImageUrl: '/src/assets/images/producer_cashmere_kids_1790977511588.jpg',
    currency: 'USD',
    socialLinks: {}
  });

  const [beats, setBeats] = useState<Beat[]>([]);
  const [beatPacks, setBeatPacks] = useState<BeatPack[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [merch, setMerch] = useState<MerchItem[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [stgs, bts, pks, cols, mch, yts] = await Promise.all([
        fetchPublicSettings().catch(() => null),
        fetchBeats().catch(() => []),
        fetchBeatPacks().catch(() => []),
        fetchCollections().catch(() => []),
        fetchMerch().catch(() => []),
        fetchYouTubeVideos().catch(() => [])
      ]);

      if (stgs) setSettings(stgs);
      setBeats(bts || []);
      setBeatPacks(pks || []);
      setCollections(cols || []);
      setMerch(mch || []);
      setYoutubeVideos(yts || []);
    } catch (e) {
      console.error('Failed to load store data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#beat-')) {
        const id = hash.replace('#beat-', '');
        setSelectedBeatId(id);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const openBeatDetail = (id: string) => {
    setSelectedBeatId(id);
    window.location.hash = `#beat-${id}`;
  };

  const selectedBeat = beats.find(b => b.id === selectedBeatId);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-purple-600 selection:text-white">
      
      {/* Top Header Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setSelectedBeatId(null);
          setActiveTab(tab);
          if (window.location.hash) window.location.hash = '';
        }}
        openAdminModal={() => {
          setSelectedBeatId(null);
          setActiveTab('admin');
        }}
        openRadio={() => setIsRadioOpen(true)}
      />

      {/* Main Page View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 pt-6">
        {selectedBeat ? (
          <BeatDetailPage
            beat={selectedBeat}
            allBeats={beats}
            onBack={() => {
              setSelectedBeatId(null);
              window.location.hash = '';
            }}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'home' ? (
          <HomePage
            beats={beats}
            beatPacks={beatPacks}
            collections={collections}
            merch={merch}
            youtubeVideos={youtubeVideos}
            setActiveTab={setActiveTab}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'audioPlayer' ? (
          <AudioPlayerPage
            beats={beats}
            onSelectBeat={(beat) => openBeatDetail(beat.id)}
          />
        ) : activeTab === 'browse' ? (
          <BrowsePage
            beats={beats}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'battle' ? (
          <BeatBattlePage
            beats={beats}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'packs' ? (
          <PacksPage packs={beatPacks} />
        ) : activeTab === 'collections' ? (
          <CollectionsPage
            collections={collections}
            beats={beats}
            setActiveTab={setActiveTab}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'vault' ? (
          <VaultPage
            beats={beats}
            beatPacks={beatPacks}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'recovery' ? (
          <RecoveryCenterPage />
        ) : activeTab === 'security' ? (
          <SecurityCenterPage />
        ) : activeTab === 'creatorStudio' ? (
          <CreatorStudioPage
            beats={beats}
            beatPacks={beatPacks}
            collections={collections}
          />
        ) : activeTab === 'promotions' ? (
          <PromotionsPage
            beats={beats}
            beatPacks={beatPacks}
            setActiveTab={setActiveTab}
          />
        ) : activeTab === 'releaseRoom' ? (
          <ReleaseRoomPage
            beats={beats}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'merch' ? (
          <MerchPage merch={merch} />
        ) : activeTab === 'youtube' ? (
          <YouTubePage videos={youtubeVideos} />
        ) : activeTab === 'profile' ? (
          <ProfilePage
            settings={settings}
            beats={beats}
            beatPacks={beatPacks}
            openBeatDetail={openBeatDetail}
          />
        ) : activeTab === 'downloads' ? (
          <DownloadsPage />
        ) : activeTab === 'admin' ? (
          <AdminDashboardPage
            onBeatUploaded={loadData}
            openCreatorStudio={() => setActiveTab('creatorStudio')}
            openPromotions={() => setActiveTab('promotions')}
            openSessionMode={() => setIsSessionModeOpen(true)}
          />
        ) : (
          <HomePage
            beats={beats}
            beatPacks={beatPacks}
            collections={collections}
            merch={merch}
            youtubeVideos={youtubeVideos}
            setActiveTab={setActiveTab}
            openBeatDetail={openBeatDetail}
          />
        )}
      </main>

      {/* Persistent Audio Player */}
      <Player />

      {/* Checkout Modal */}
      <CheckoutModal />

      {/* Notification Toast Alert */}
      <NotificationToast />

      {/* Studio Session Mode Modal */}
      <SessionModeModal
        beats={beats}
        isOpen={isSessionModeOpen}
        onClose={() => setIsSessionModeOpen(false)}
      />

      {/* Cashmere Radio Modal */}
      <CashmereRadioModal
        beats={beats}
        isOpen={isRadioOpen}
        onClose={() => setIsRadioOpen(false)}
      />

      {/* License Comparison Modal */}
      <LicenseComparisonModal
        isOpen={isLicenseCompareOpen}
        onClose={() => setIsLicenseCompareOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AudioProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AudioProvider>
    </NotificationProvider>
  );
}
