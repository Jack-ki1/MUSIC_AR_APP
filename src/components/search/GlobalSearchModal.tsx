import React, { useState, useEffect } from 'react';
import { Search, X, Compass, Activity, Sparkles, Settings as SettingsIcon, ArrowRight } from 'lucide-react';
import { RealArtistData } from '../../services/realMusicApi';
import { WorkspaceSection } from '../../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
  onNavigateSection: (section: WorkspaceSection) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  artists,
  onSelectArtist,
  onNavigateSection
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = artists.filter(a => 
    a.name.toLowerCase().includes(query.toLowerCase()) ||
    a.city.toLowerCase().includes(query.toLowerCase()) ||
    a.country.toLowerCase().includes(query.toLowerCase()) ||
    a.primaryGenre.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/30 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white border border-[#E2E8F0] rounded-2xl shadow-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#F1F5F9] gap-3 bg-white">
          <Search className="w-5 h-5 text-[#2563EB] shrink-0" />
          <input
            type="text"
            placeholder="Search artist, city, genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-[#0F172A] placeholder-[#94A3B8] text-sm focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F8FAFC]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-4 space-y-3">
          {!query && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block">
                Quick Navigation
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => { onNavigateSection('discovery'); onClose(); }}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] flex items-center gap-2"
                >
                  <Compass className="w-4 h-4 text-[#2563EB]" />
                  <span>Discovery</span>
                </button>
                <button
                  onClick={() => { onNavigateSection('analyse'); onClose(); }}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] flex items-center gap-2"
                >
                  <Activity className="w-4 h-4 text-[#2563EB]" />
                  <span>Analyze</span>
                </button>
                <button
                  onClick={() => { onNavigateSection('recommendations'); onClose(); }}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F5F3FF] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#7155F5]" />
                  <span>Recommend</span>
                </button>
                <button
                  onClick={() => { onNavigateSection('settings'); onClose(); }}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-xs font-semibold text-[#0F172A] flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4 text-[#EA580C]" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider block mb-2">
              Discovered Artists ({filtered.length})
            </span>
            <div className="space-y-1.5">
              {filtered.map((artist, idx) => (
                <div
                  key={`search-art-${artist.id}-${idx}`}
                  onClick={() => {
                    onSelectArtist(artist);
                    onNavigateSection('analyse');
                    onClose();
                  }}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] flex items-center justify-between cursor-pointer group transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-8 h-8 rounded-lg object-cover border border-[#E2E8F0]"
                    />
                    <div>
                      <p className="text-xs font-bold text-[#0F172A] group-hover:text-[#2563EB]">{artist.name}</p>
                      <p className="text-[10px] text-[#64748B]">{artist.city}, {artist.country} • {artist.primaryGenre}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0F172A]">
                    {artist.discoveryScore.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
