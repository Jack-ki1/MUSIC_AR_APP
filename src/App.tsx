import React, { useState, useEffect, useMemo } from 'react';
import { MsaniiHeader } from './components/msanii/MsaniiHeader';
import { MsaniiHero } from './components/msanii/MsaniiHero';
import { MsaniiTrustAndValue } from './components/msanii/MsaniiTrustAndValue';
import { MsaniiAbout } from './components/msanii/MsaniiAbout';
import { MsaniiAnalyze } from './components/msanii/MsaniiAnalyze';
import { MsaniiDiscover } from './components/msanii/MsaniiDiscover';
import { MsaniiRecommend } from './components/msanii/MsaniiRecommend';
import { MsaniiSettings } from './components/msanii/MsaniiSettings';
import { MsaniiDesignSystem } from './components/msanii/MsaniiDesignSystem';
import { MsaniiFooter } from './components/msanii/MsaniiFooter';
import { MsaniiModals } from './components/msanii/MsaniiModals';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';

import { 
  RealArtistData, 
  ARDecision, 
  UserRole 
} from './types';
import { 
  INITIAL_VERIFIED_UPCOMING_ARTISTS,
  isLegacyMainstream 
} from './services/realMusicApi';
import { 
  syncArtistToFirestore, 
  loadArtistsFromFirestore, 
  saveDecisionToFirestore,
  loadDecisionsFromFirestore
} from './services/firestoreSync';
import { useAuth } from './services/authService';

export default function App() {
  const { user: currentUser } = useAuth();

  // Modals state
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [focusVisual, setFocusVisual] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Production candidates: starts with verified authentic upcoming roster or remote Firestore
  const [productionArtists, setProductionArtists] = useState<RealArtistData[]>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_production_artists');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.filter(a => !isLegacyMainstream(a.name));
        }
      }
      return INITIAL_VERIFIED_UPCOMING_ARTISTS;
    } catch {
      return INITIAL_VERIFIED_UPCOMING_ARTISTS;
    }
  });

  // Decisions ledger: loads from Firestore or local storage
  const [decisions, setDecisions] = useState<ARDecision[]>(() => {
    try {
      const saved = localStorage.getItem('breakout_radar_decisions_ledger');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected artist ID for deep dive
  const [selectedArtistId, setSelectedArtistId] = useState<string | null>(null);

  // Active dataset: strictly verified authentic production artists
  const activeArtists = productionArtists;

  // Derived canonical selected artist
  const canonicalSelectedArtist = useMemo(() => {
    if (selectedArtistId) {
      const match = activeArtists.find(a => a.id === selectedArtistId);
      if (match) return match;
    }
    return activeArtists[0] || null;
  }, [activeArtists, selectedArtistId]);

  // Load from Firestore on mount
  useEffect(() => {
    let mounted = true;
    loadArtistsFromFirestore().then(remoteArtists => {
      if (mounted && remoteArtists.length > 0) {
        setProductionArtists(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const additions = remoteArtists.filter(a => !existingIds.has(a.id));
          return [...prev, ...additions];
        });
      }
    });

    loadDecisionsFromFirestore().then(remoteDecisions => {
      if (mounted && remoteDecisions.length > 0) {
        setDecisions(remoteDecisions);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('breakout_radar_production_artists', JSON.stringify(productionArtists));
    } catch {
      //
    }
  }, [productionArtists]);

  useEffect(() => {
    try {
      localStorage.setItem('breakout_radar_decisions_ledger', JSON.stringify(decisions));
    } catch {
      //
    }
  }, [decisions]);

  // Global Keyboard Shortcut: ⌘K or Ctrl+K opens/closes Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsAccessModalOpen(false);
        setIsLoginModalOpen(false);
        setFocusVisual(null);
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleAddDiscoveredArtists = (newArtists: RealArtistData[]) => {
    setProductionArtists(prev => {
      const existingIds = new Set(prev.map(a => a.id));
      const additions = newArtists.filter(a => !existingIds.has(a.id));
      additions.forEach(a => syncArtistToFirestore(a));
      return [...additions, ...prev];
    });

    if (newArtists.length > 0) {
      setSelectedArtistId(newArtists[0].id);
      showToast(`Added ${newArtists.length} candidate(s) to MSANII workspace.`);
    }
  };

  const handleRecordDecision = async (
    artistId: string, 
    decisionText: string, 
    notes: string
  ) => {
    const artist = activeArtists.find(a => a.id === artistId);
    const newDecision: ARDecision = {
      id: `dec-${Date.now()}`,
      artistId,
      artistName: artist?.name || 'Emerging Talent',
      decision: decisionText,
      decisionMaker: currentUser?.displayName || 'Jackson Kimotho (Lead A&R Director)',
      rationale: notes,
      dealType: 'EP Development & Master Distribution',
      recommendedAdvanceUsd: 15000,
      followUpDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'submitted',
      createdAt: new Date().toISOString()
    };

    setDecisions(prev => [newDecision, ...prev]);
    await saveDecisionToFirestore(newDecision);
    showToast(`Decision logged in authoritative ledger: "${decisionText}"`);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-[#111820] flex flex-col font-sans">
      {/* 1. Sticky Navigation Header */}
      <MsaniiHeader
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAccess={() => setIsAccessModalOpen(true)}
      />

      <main className="flex-1">
        {/* 2. Hero Section */}
        <MsaniiHero
          featuredArtist={canonicalSelectedArtist || undefined}
          onOpenAccess={() => setIsAccessModalOpen(true)}
          onGoToAnalyze={() => scrollToSection('analyze')}
        />

        {/* 3. Trust Strip & 5-item Value Strip */}
        <MsaniiTrustAndValue />

        {/* 4. About MSANII & Metric Cards */}
        <MsaniiAbout
          onOpenAccess={() => setIsAccessModalOpen(true)}
          onGoToDiscover={() => scrollToSection('discover')}
        />

        {/* 5. ANALYZE Flagship Workspace (Power BI-grade Artist Intelligence) */}
        <MsaniiAnalyze
          artists={activeArtists}
          selectedArtist={canonicalSelectedArtist}
          onSelectArtist={(artist) => {
            setSelectedArtistId(artist.id);
            showToast(`Selected artist: ${artist.name}`);
          }}
          onOpenFocus={(title, content) => setFocusVisual({ title, content })}
          onShowToast={showToast}
        />

        {/* 6. Workbench Grid: DISCOVER, RECOMMEND, SETTINGS */}
        <section className="workbench-section container" id="discover">
          <div className="workbench-grid">
            <MsaniiDiscover
              artists={activeArtists}
              onSelectArtist={(artist) => {
                setSelectedArtistId(artist.id);
                scrollToSection('analyze');
                showToast(`Switched dossier to ${artist.name}`);
              }}
              onAddArtists={handleAddDiscoveredArtists}
              onShowToast={showToast}
            />

            <MsaniiRecommend
              artists={activeArtists}
              onSelectArtist={(artist) => {
                setSelectedArtistId(artist.id);
                scrollToSection('analyze');
                showToast(`Viewing recommendation for ${artist.name}`);
              }}
              onRecordDecision={handleRecordDecision}
              onShowToast={showToast}
            />

            <MsaniiSettings
              onShowToast={showToast}
            />
          </div>
        </section>

        {/* 7. Design System Foundations Showcase */}
        <MsaniiDesignSystem />
      </main>

      {/* 8. Footer */}
      <MsaniiFooter onOpenAccess={() => setIsAccessModalOpen(true)} />

      {/* 9. Interactive Modals (Access Request, Member Login, Visual Focus Mode) */}
      <MsaniiModals
        isAccessOpen={isAccessModalOpen}
        isLoginOpen={isLoginModalOpen}
        focusVisual={focusVisual}
        onCloseModals={() => {
          setIsAccessModalOpen(false);
          setIsLoginModalOpen(false);
          setFocusVisual(null);
        }}
        onShowToast={showToast}
      />

      {/* 10. Global Search Modal (⌘K / Ctrl+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        artists={activeArtists}
        decisions={decisions}
        onSelectArtist={(artist) => {
          setSelectedArtistId(artist.id);
          scrollToSection('analyze');
          showToast(`Opened ${artist.name}`);
        }}
        onNavigateSection={(sec) => {
          scrollToSection(sec === 'analyse' ? 'analyze' : sec);
        }}
      />

      {/* 11. Toast Notification Bar matching index.html */}
      <div className={`toast ${toastMessage ? 'show' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </div>
  );
}
