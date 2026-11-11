import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ErrorBoundary } from './shared/lib/ErrorBoundary';
import { HomePage } from './pages/HomePage';
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
import {
  checkBackendHealth,
  fetchArtistsFromBackend,
  fetchSeedArtistsFromBackend,
  upsertArtistsToBackend,
  saveDecisionToBackend,
  fetchSettingsFromBackend,
  saveSettingsToBackend
} from './services/backendApi';
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
  const [currentSection, setCurrentSection] = useState<WorkspaceSection>('home');
  
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
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return window.localStorage.getItem('br.sidebar.collapsed') === '1';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((v) => {
      const next = !v;
      try {
        window.localStorage.setItem('br.sidebar.collapsed', next ? '1' : '0');
      } catch {
        /* storage unavailable — keep in-memory state only */
      }
      return next;
    });
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Persist regions and genres + sync settings to backend when available
  useEffect(() => {
    localStorage.setItem('breakout_radar_regions', JSON.stringify(regions));
  }, [regions]);

  useEffect(() => {
    localStorage.setItem('breakout_radar_genres', JSON.stringify(genres));
  }, [genres]);

  useEffect(() => {
    localStorage.setItem('breakout_radar_real_artists', JSON.stringify(realArtists));
  }, [realArtists]);

  useEffect(() => {
    if (!backendConnected) return;
    const payload = {
      regions,
      genres,
      loopIntervalMinutes,
      isAutonomousActive,
      updatedAt: new Date().toISOString()
    };
    saveSettingsToBackend(payload).catch(() => {});
  }, [regions, genres, loopIntervalMinutes, isAutonomousActive, backendConnected]);

  // Initial bootstrap: backend (if available) + Firestore + local fallback
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const hasBackend = await checkBackendHealth();
      if (!mounted) return;
      setBackendConnected(hasBackend);

      // 1) Backend artists or seed data + settings
      if (hasBackend) {
        try {
          let backendArtists = await fetchArtistsFromBackend();
          if (!backendArtists || backendArtists.length === 0) {
            backendArtists = await fetchSeedArtistsFromBackend();
          }
          if (mounted && backendArtists && backendArtists.length > 0) {
            const cleaned = cleanAndDeduplicateArtists(backendArtists);
            setRealArtists(cleaned);
            setSelectedArtist(prev => prev || cleaned[0] || null);
          }
        } catch (err) {
          console.warn('[App] Backend bootstrap error:', err);
        }

        try {
          const backendSettings = await fetchSettingsFromBackend();
          if (mounted && backendSettings) {
            if (Array.isArray(backendSettings.regions) && backendSettings.regions.length) setRegions(backendSettings.regions);
            if (Array.isArray(backendSettings.genres) && backendSettings.genres.length) setGenres(backendSettings.genres);
            if (typeof backendSettings.loopIntervalMinutes === 'number') setLoopIntervalMinutes(backendSettings.loopIntervalMinutes);
            if (typeof backendSettings.isAutonomousActive === 'boolean') setIsAutonomousActive(backendSettings.isAutonomousActive);
          }
        } catch (err) {
          console.warn('[App] Backend settings load error:', err);
        }
      }

      // 2) Firestore cloud merge (optional, best-effort)
      try {
        const cloudArtists = await loadArtistsFromFirestore();
        if (mounted && cloudArtists && cloudArtists.length > 0) {
          setRealArtists(prev => cleanAndDeduplicateArtists([...cloudArtists, ...prev]));
        }
      } catch (err) {
        console.warn('[App] Cloud load error:', err);
      }

      // 3) Final fallback to local seed if still empty
      setRealArtists(prev => {
        if (prev && prev.length > 0) return prev;
        const seed = getInitialVerifiedUpcomingArtists();
        setSelectedArtist(seed[0] || null);
        return seed;
      });
    }

    bootstrap();
    return () => { mounted = false; };
  }, []);

  const handleAddDiscoveredArtists = (newArtists: RealArtistData[]) => {
    setRealArtists(prev => {
      const combined = cleanAndDeduplicateArtists([...newArtists, ...prev]);
      return combined;
    });
    // Persist to backend + Firestore in background (best-effort)
    upsertArtistsToBackend(newArtists).catch(() => {});
    batchSyncArtistsToFirestore(newArtists);
    showToast(`Discovery update: ${newArtists.length} artist${newArtists.length === 1 ? '' : 's'} ingested.`);
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
    saveDecisionToBackend(newDecision).catch(() => {});
    saveDecisionToFirestore(newDecision);
    showToast(`Decision recorded: ${decision}`);
  };

  return (
    <ErrorBoundary>
    <div className="app-shell flex h-dvh w-full overflow-hidden bg-surface text-navy-700 font-sans selection:bg-brand-500 selection:text-navy-900">
      <div className="app-sidebar shrink-0 h-full">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={(sec) => { if (sec === 'analyse' && !selectedArtist && realArtists[0]) setSelectedArtist(realArtists[0]); setCurrentSection(sec); }}
          candidateCount={realArtists.length}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-surface">
        <Topbar
          onOpenGlobalSearch={() => setIsGlobalSearchOpen(true)}
          apiConnected={backendConnected}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-4 md:px-6 py-4">
          <div className="max-w-7xl mx-auto w-full">
            {currentSection === 'home' && (
              <HomePage candidateCount={realArtists.length} onNavigate={(section) => setCurrentSection(section)} />
            )}

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
                realArtists={realArtists}
                onAddDiscoveredArtists={handleAddDiscoveredArtists}
              />
            )}
          </div>
        </main>
      </div>

      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        artists={realArtists}
        onSelectArtist={(artist) => setSelectedArtist(artist)}
        onNavigateSection={(sec) => setCurrentSection(sec)}
      />

      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-surface-subtle text-navy-700 text-xs px-3 py-2 rounded-sm border border-line-strong shadow-raised">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
    </ErrorBoundary>
  );
}
