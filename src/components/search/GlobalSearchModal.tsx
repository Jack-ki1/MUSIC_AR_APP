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
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#0B1530]/40 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl glass p-0 overflow-hidden flex flex-col shadow-2xl border border-white/90"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-5 py-4 border-b border-[rgba(120,140,190,0.2)] gap-3 bg-white/60">
          <Search className="w-5 h-5 text-[#3B6CFF] shrink-0" />
          <input
            type="text"
            placeholder="Search artist, city, genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-[#0B1530] placeholder-[#5F6B8A] text-sm font-semibold focus:outline-none"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-[#5F6B8A] hover:text-[#0B1530] hover:bg-white/80 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto p-5 space-y-4">
          {!query && (
            <div className="space-y-2">
              <span className="text-[10px] font-black text-[#5F6B8A] uppercase tracking-wider block">
                Quick Navigation
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => { onNavigateSection('discovery'); onClose(); }}
                  className="p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-[rgba(120,140,190,0.2)] text-xs font-bold text-[#0B1530] flex items-center gap-2 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                >
                  <Compass className="w-4 h-4 text-[#3B6CFF]" />
                  <span>Discovery</span>
                </button>
                <button
                  onClick={() => { onNavigateSection('analyse'); onClose(); }}
                  className="p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-[rgba(120,140,190,0.2)] text-xs font-bold text-[#0B1530] flex items-center gap-2 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                >
                  <Activity className="w-4 h-4 text-[#3B6CFF]" />
                  <span>Analyze</span>
                </button>
                <button
                  onClick={() => { onNavigateSection('recommendations'); onClose(); }}
                  className="p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-[rgba(120,140,190,0.2)] text-xs font-bold text-[#0B1530] flex items-center gap-2 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-[#7C5CFF]" />
                  <span>Recommend</span>
                </button>
                <button
                  onClick={() => { onNavigateSection('settings'); onClose(); }}
                  className="p-2.5 rounded-2xl bg-white/70 hover:bg-white border border-[rgba(120,140,190,0.2)] text-xs font-bold text-[#0B1530] flex items-center gap-2 cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                >
                  <SettingsIcon className="w-4 h-4 text-[#FF8A3D]" />
                  <span>Settings</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <span className="text-[10px] font-black text-[#5F6B8A] uppercase tracking-wider block mb-2">
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
                  className="p-3 rounded-2xl bg-white/70 hover:bg-white border border-[rgba(120,140,190,0.2)] flex items-center justify-between cursor-pointer group transition-all shadow-2xs hover:shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="w-9 h-9 rounded-xl object-cover border border-[rgba(120,140,190,0.25)] shadow-xs"
                    />
                    <div>
                      <p className="text-xs font-extrabold text-[#0B1530] group-hover:text-[#3B6CFF]">{artist.name}</p>
                      <p className="text-[10px] text-[#5F6B8A]">{artist.city}, {artist.country} • {artist.primaryGenre}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-[#7C5CFF]">
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
