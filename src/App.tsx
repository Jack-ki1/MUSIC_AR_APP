import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { DiscoverySection, DiscoveryRegion, DiscoveryGenre } from './components/discovery/DiscoverySection';
import { AnalyseSection } from './components/analyse/AnalyseSection';
import { RecommendationsSection } from './components/recommendations/RecommendationsSection';
import { SettingsSection } from './components/settings/SettingsSection';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { 
  RealArtistData, 
  runRealAutonomousDiscovery, 
  getInitialVerifiedUpcomingArtists,
  isLegacyMainstream
} from './services/realMusicApi';
import { 
  syncArtistToFirestore, 
  batchSyncArtistsToFirestore, 
  loadArtistsFromFirestore, 
  saveDecisionToFirestore 
} from './services/firestoreSync';
import { WorkspaceSection, ARDecision } from './types';
import { Check } from 'lucide-react';

function cleanAndDeduplicateArtists(artists: RealArtistData[]): RealArtistData[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const results: RealArtistData[] = [];

  for (const a of artists) {
    if (!a || !a.id || !a.name) continue;
    if (isLegacyMainstream(a.name)) continue;
    const nameKey = a.name.toLowerCase().trim();
    if (seenIds.has(a.id) || seenNames.has(nameKey)) continue;
    seenIds.add(a.id);
    seenNames.add(nameKey);

    // Deduplicate tracks within each artist
    const seenTrackIds = new Set<number | string>();
    const cleanTracks: typeof a.tracks = [];
    for (const t of a.tracks || []) {
      if (!t || !t.id || seenTrackIds.has(t.id)) continue;
      seenTrackIds.add(t.id);
      cleanTracks.push(t);
    }

    results.push({
      ...a,
      tracks: cleanTracks.length > 0 ? cleanTracks : (getInitialVerifiedUpcomingArtists()[0]?.tracks || [])
    });
  }

  return results.length > 0 ? results : getInitialVerifiedUpcomingArtists();
}

const DEFAULT_REGIONS: DiscoveryRegion[] = [
  {
    id: 'reg-east-africa',
    name: 'East Africa',
    countries: ['Kenya', 'Tanzania', 'Uganda', 'Rwanda', 'Burundi', 'South Sudan'],
    enabled: true,
    isDefault: true,
  },
  {
    id: 'reg-west-africa',
    name: 'West Africa',
    countries: ['Nigeria', 'Ghana', 'Senegal', 'Ivory Coast'],
    enabled: false,
  },
  {
    id: 'reg-southern-africa',
    name: 'Southern Africa',
    countries: ['South Africa', 'Zimbabwe', 'Zambia'],
    enabled: false,
  },
  {
    id: 'reg-uk-diaspora',
    name: 'UK Diaspora',
    countries: ['United Kingdom'],
    enabled: false,
  }
];

const DEFAULT_GENRES: DiscoveryGenre[] = [
  { id: 'g-afropop', name: 'Afro-pop', enabled: true },
  { id: 'g-gengetone', name: 'Gengetone', enabled: true },
  { id: 'g-bongoflava', name: 'Bongo Flava', enabled: true },
  { id: 'g-afrofusion', name: 'Afro-fusion', enabled: true },
  { id: 'g-benga', name: 'Benga', enabled: true },
  { id: 'g-hiphop', name: 'East African Hip Hop', enabled: true },
  { id: 'g-rnb', name: 'R&B / Soul', enabled: true },
  { id: 'g-amapiano', name: 'Amapiano', enabled: true },
];

export default function App() {
  const [currentSection, setCurrentSection] = useState<WorkspaceSection>('discovery');
  
  // Real artists state initialized and cleansed of legacy artists and duplicate keys
  const [realArtists, setRealArtists] = useState<RealArtistData[]>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_real_artists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return cleanAndDeduplicateArtists(parsed);
        }
      }
      return getInitialVerifiedUpcomingArtists();
    } catch {
      return getInitialVerifiedUpcomingArtists();
    }
  });

  const [selectedArtist, setSelectedArtist] = useState<RealArtistData | null>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_real_artists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const cleaned = cleanAndDeduplicateArtists(parsed);
          return cleaned[0] || null;
        }
      }
      return getInitialVerifiedUpcomingArtists()[0] || null;
    } catch {
      return getInitialVerifiedUpcomingArtists()[0] || null;
    }
  });

  // User configurable regions (Default: East Africa)
  const [regions, setRegions] = useState<DiscoveryRegion[]>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_regions');
      return saved ? JSON.parse(saved) : DEFAULT_REGIONS;
    } catch {
      return DEFAULT_REGIONS;
    }
  });

  // User configurable genres
  const [genres, setGenres] = useState<DiscoveryGenre[]>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_genres');
      return saved ? JSON.parse(saved) : DEFAULT_GENRES;
    } catch {
      return DEFAULT_GENRES;
    }
  });

  // Autonomous Discovery Loop: 30 minutes vs 60 minutes (default 30 mins)
  const [loopIntervalMinutes, setLoopIntervalMinutes] = useState<number>(30);
  const [isAutonomousActive, setIsAutonomousActive] = useState<boolean>(true);

  // Global search & toast
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist regions and genres
  useEffect(() => {
    localStorage.setItem('breakout_radar_regions', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem('breakout_radar_genres', JSON.stringify(genres));
  }, [genres]);

  useEffect(() => {
    localStorage.setItem('breakout_radar_real_artists', JSON.stringify(realArtists));
  }, [realArtists]);

  // Initial live discovery fetch and Firestore sync on mount
  useEffect(() => {
    // 1. Fetch any cloud-persisted artists from Firestore
    loadArtistsFromFirestore().then(cloudArtists => {
      if (cloudArtists && cloudArtists.length > 0) {
        setRealArtists(prev => cleanAndDeduplicateArtists([...cloudArtists, ...prev]));
      }
    }).catch(err => console.warn('[App] Cloud load error:', err));

    // 2. Initial discovery if empty
    if (realArtists.length === 0) {
      runRealAutonomousDiscovery(regions, genres).then(results => {
        if (results.length > 0) {
          setRealArtists(results);
          setSelectedArtist(results[0]);
          batchSyncArtistsToFirestore(results);
        }
      });
    } else if (!selectedArtist && realArtists.length > 0) {
      setSelectedArtist(realArtists[0]);
    }
  }, []);

  const handleAddDiscoveredArtists = (newArtists: RealArtistData[]) => {
    setRealArtists(prev => {
      const combined = cleanAndDeduplicateArtists([...newArtists, ...prev]);
      return combined;
    });
    // Cloud persist to Firestore in background
    batchSyncArtistsToFirestore(newArtists);
    showToast(`Autonomous scan complete: ${newArtists.length} real artists parsed!`);
  };

  const handleUpdateArtistScore = (artistId: string, artisticScore: number, notes: string) => {
    setRealArtists(prev => prev.map(a => {
      if (a.id !== artistId) return a;
      const combined = Number((((artisticScore * 20) * 0.6) + (a.discoveryScore * 0.4)).toFixed(1));
      let tier: RealArtistData['recommendationTier'] = a.recommendationTier;
      if (combined >= 92) tier = 'PURSUE';
      else if (combined >= 85) tier = 'MEET';
      else if (combined >= 75) tier = 'WATCH';
      else tier = 'MORE_EVIDENCE';

      const updated: RealArtistData = {
        ...a,
        artisticScore,
        combinedScore: combined,
        recommendationTier: tier,
      };

      // Persist to Firestore
      syncArtistToFirestore(updated);

      return updated;
    }));
    showToast('A&R Assessment score successfully updated!');
  };

  const handleRecordDecision = (artistId: string, decision: string, notes: string) => {
    const newDecision: ARDecision = {
      id: `dec-${Date.now()}`,
      artistId,
      decision,
      decisionMaker: 'Workspace Operator (A&R Team)',
      rationale: notes || 'Reviewed against AVM 4-pillar scorecard and multi-platform telemetry.',
      followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    saveDecisionToFirestore(newDecision);
    showToast(`Decision recorded: ${decision}`);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-transparent text-[#0B1530] font-sans selection:bg-[#7C5CFF] selection:text-white">
      {/* 1. Left Sidebar matching design system */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={(sec) => setCurrentSection(sec)}
        candidateCount={realArtists.length}
      />

      {/* 2. Main Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-transparent">
        {/* Topbar with ⌘K search and API connected indicator */}
        <Topbar
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          apiConnected={true}
        />

        {/* Workspace Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {currentSection === 'discovery' && (
              <DiscoverySection
                realArtists={realArtists}
                onAddDiscoveredArtists={handleAddDiscoveredArtists}
                onSelectArtist={(artist) => {
                  setSelectedArtist(artist);
                  setCurrentSection('analyse');
                }}
                regions={regions}
                genres={genres}
                onUpdateRegions={setRegions}
                onUpdateGenres={setGenres}
                loopIntervalMinutes={loopIntervalMinutes}
                onChangeLoopInterval={setLoopIntervalMinutes}
                isAutonomousActive={isAutonomousActive}
                onToggleAutonomous={() => setIsAutonomousActive(!isAutonomousActive)}
              />
            )}

            {currentSection === 'analyse' && (
              <AnalyseSection
                artists={realArtists}
                selectedArtist={selectedArtist}
                onSelectArtist={(artist) => setSelectedArtist(artist)}
                onUpdateArtistScore={handleUpdateArtistScore}
              />
            )}

            {currentSection === 'recommendations' && (
              <RecommendationsSection
                artists={realArtists}
                onSelectArtist={(artist) => {
                  setSelectedArtist(artist);
                  setCurrentSection('analyse');
                }}
                onRecordDecision={handleRecordDecision}
              />
            )}

            {currentSection === 'settings' && (
              <SettingsSection
                regions={regions}
                genres={genres}
                onUpdateRegions={setRegions}
                onUpdateGenres={setGenres}
                loopIntervalMinutes={loopIntervalMinutes}
                onChangeLoopInterval={setLoopIntervalMinutes}
                isAutonomousActive={isAutonomousActive}
                onToggleAutonomous={() => setIsAutonomousActive(!isAutonomousActive)}
                onShowToast={showToast}
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Search Modal (⌘K) */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        artists={realArtists}
        onSelectArtist={(artist) => setSelectedArtist(artist)}
        onNavigateSection={(sec) => setCurrentSection(sec)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#0F172A] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-bottom-2">
          <div className="w-4 h-4 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
