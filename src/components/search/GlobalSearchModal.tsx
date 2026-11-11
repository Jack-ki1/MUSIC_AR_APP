import React, { useState, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { RealArtistData } from '../../services/realMusicApi';
import { WorkspaceSection } from '../../types';
import { Pill } from '../../shared/ui/Pill';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  artists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
  onNavigateSection: (section: WorkspaceSection) => void;
}

const NAV_SECTIONS: [WorkspaceSection, string][] = [
  ['discovery', 'Discovery'],
  ['analyse', 'Analyze'],
  ['recommendations', 'Recommendations'],
  ['settings', 'Settings']
];

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
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();
  const filtered = q
    ? artists.filter(a =>
        a.name.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q) ||
        a.country?.toLowerCase().includes(q) ||
        a.primaryGenre?.toLowerCase().includes(q)
      ).slice(0, 20)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-surface border border-line rounded-card shadow-overlay overflow-hidden section-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-3 py-2.5 border-b border-line gap-2">
          <Search className="w-4 h-4 text-purple-500 shrink-0" />
          <input
            type="text"
            placeholder="Search artists, city, genre..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-none p-0 text-sm text-navy-700 placeholder:text-navy-300 focus:outline-none focus:ring-0 focus:shadow-none"
            style={{ boxShadow: 'none', border: 'none', padding: 0 }}
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-2xs font-mono text-purple-500 border border-line rounded px-1.5 py-0.5">
            <Command className="w-3 h-3" /> K
          </kbd>
          <button
            onClick={onClose}
            aria-label="Close search"
            className="p-1 rounded-tile text-purple-500 hover:text-navy-700 hover:bg-purple-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!q && (
            <div className="p-1">
              <div className="text-2xs font-semibold text-purple-500 uppercase tracking-wider px-2 py-1">
                Navigate
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                {NAV_SECTIONS.map(([sec, label]) => (
                  <button
                    key={sec}
                    onClick={() => { onNavigateSection(sec); onClose(); }}
                    className="px-2 py-1.5 text-xs text-left text-navy-700 hover:bg-purple-50 rounded-tile border border-transparent hover:border-line cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {q && (
            <div>
              <div className="text-2xs font-semibold text-purple-500 uppercase tracking-wider px-2 py-1">
                Results ({filtered.length})
              </div>
              {filtered.length === 0 ? (
                <div className="px-2 py-3 text-xs text-purple-500">No matches.</div>
              ) : (
                <div className="space-y-0.5">
                  {filtered.map((artist, idx) => (
                    <button
                      key={`search-${artist.id}-${idx}`}
                      onClick={() => { onSelectArtist(artist); onNavigateSection('analyse'); onClose(); }}
                      className="w-full px-2 py-1.5 rounded-tile hover:bg-purple-50 border border-transparent hover:border-line flex items-center justify-between gap-2 cursor-pointer text-left"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <img
                          src={artist.avatarUrl}
                          alt=""
                          className="w-6 h-6 rounded-tile object-cover border border-line shrink-0"
                        />
                        <span className="min-w-0">
                          <span className="block text-xs font-medium text-navy-700 truncate">
                            {artist.name}
                          </span>
                          <span className="block text-2xs text-purple-500 truncate">
                            {artist.city}, {artist.country} · {artist.primaryGenre}
                          </span>
                        </span>
                      </span>
                      <span className="shrink-0 flex items-center gap-1.5">
                        <Pill
                          tone={
                            artist.recommendationTier === 'PURSUE' ? 'sign'
                            : artist.recommendationTier === 'MEET' ? 'meet'
                            : artist.recommendationTier === 'MORE_EVIDENCE' ? 'evidence'
                            : 'watch'
                          }
                        >
                          {artist.recommendationTier}
                        </Pill>
                        <span className="text-2xs font-mono text-purple-700">
                          {Number(artist.discoveryScore || 0).toFixed(1)}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
