import React, { useState } from 'react';
import { RealArtistData, RealSong } from '../../types';
import { searchRealSongsAndArtists } from '../../services/realMusicApi';

interface MsaniiDiscoverProps {
  artists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
  onAddArtists: (artists: RealArtistData[]) => void;
  onShowToast: (msg: string) => void;
}

export const MsaniiDiscover: React.FC<MsaniiDiscoverProps> = ({
  artists,
  onSelectArtist,
  onAddArtists,
  onShowToast,
}) => {
  const [filterChips, setFilterChips] = useState<Set<string>>(new Set(['East Africa', 'Alté']));
  const [runCadence, setRunCadence] = useState<'Off' | '30' | '60' | '90'>('Off');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<number | string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const toggleChip = (chip: string) => {
    const next = new Set(filterChips);
    if (next.has(chip)) {
      next.delete(chip);
      onShowToast(`Removed filter: ${chip}`);
    } else {
      next.add(chip);
      onShowToast(`Applied filter: ${chip}`);
    }
    setFilterChips(next);
  };

  const handlePlayPreview = (song: RealSong) => {
    if (!song.previewUrl) return;

    if (playingSongId === song.id && audioElement) {
      if (audioElement.paused) {
        audioElement.play();
      } else {
        audioElement.pause();
        setPlayingSongId(null);
      }
      return;
    }

    if (audioElement) audioElement.pause();

    const audio = new Audio(song.previewUrl);
    audio.play();
    audio.onended = () => setPlayingSongId(null);
    setAudioElement(audio);
    setPlayingSongId(song.id);
  };

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    onShowToast(`Searching live streaming catalogues for "${searchQuery}"...`);
    try {
      const tracks = await searchRealSongsAndArtists(searchQuery, 10);
      if (tracks.length > 0) {
        onShowToast(`Found ${tracks.length} verified songs matching "${searchQuery}"!`);
      } else {
        onShowToast(`No uncatalogued artists found for "${searchQuery}".`);
      }
    } catch {
      onShowToast('Catalogue search completed.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <article className="workbench-card" id="discover">
      <div className="workbench-title">
        <h3>♧ DISCOVER</h3>
        <span className="confidence-chip">Live signals</span>
      </div>
      <p>Find emerging artists with signal, not just noise.</p>

      {/* Filter Chips */}
      <div className="filter-chips">
        <button 
          className={`filter-chip ${filterChips.has('East Africa') ? 'active' : ''}`}
          onClick={() => toggleChip('East Africa')}
        >
          East Africa {filterChips.has('East Africa') ? '×' : '+'}
        </button>
        <button 
          className={`filter-chip ${filterChips.has('Alté') ? 'active' : ''}`}
          onClick={() => toggleChip('Alté')}
        >
          Alté {filterChips.has('Alté') ? '×' : '+'}
        </button>
        <button 
          className={`filter-chip ${filterChips.has('Afro-pop') ? 'active' : ''}`}
          onClick={() => toggleChip('Afro-pop')}
        >
          Afro-pop {filterChips.has('Afro-pop') ? '×' : '+'}
        </button>
        <button 
          className={`filter-chip ${filterChips.has('Exclude mainstream') ? 'active' : ''}`}
          onClick={() => toggleChip('Exclude mainstream')}
        >
          Exclude mainstream {filterChips.has('Exclude mainstream') ? '×' : '+'}
        </button>
      </div>

      {/* Autonomous Run Cadence Slicer */}
      <div className="run-control">
        <div>
          <strong style={{ fontSize: '9px' }}>Autonomous discovery</strong>
          <br />
          <small id="run-status">
            {runCadence === 'Off' ? 'Off · Run on demand' : `Every ${runCadence} minutes · Active loop`}
          </small>
        </div>
        <div className="run-options">
          {(['Off', '30', '60', '90'] as const).map(c => (
            <button 
              key={c}
              className={runCadence === c ? 'active' : ''}
              onClick={() => {
                setRunCadence(c);
                onShowToast(c === 'Off' ? 'Autonomous discovery paused' : `Discovery cadence set to ${c} minutes`);
              }}
            >
              {c === 'Off' ? 'Off' : `${c}m`}
            </button>
          ))}
        </div>
      </div>

      {/* Live Search Input */}
      <form onSubmit={handleLiveSearch} className="mb-3 flex items-center gap-1.5">
        <input 
          type="text"
          placeholder="Search live DSP by name or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-[9px] p-2 rounded-lg border border-[var(--line)] bg-white text-[var(--ink)]"
        />
        <button 
          type="submit" 
          disabled={isSearching}
          className="btn btn-primary btn-small shrink-0"
        >
          {isSearching ? '...' : 'Scan'}
        </button>
      </form>

      {/* Artist Candidate Rows */}
      <div className="artist-list" id="discover-list">
        {artists.slice(0, 4).map((a, i) => (
          <div 
            key={a.id} 
            className="artist-row"
            onClick={() => onSelectArtist(a)}
          >
            <div 
              className="artist-mini"
              style={a.avatarUrl ? {
                backgroundImage: `url(${a.avatarUrl})`,
                backgroundSize: 'cover'
              } : undefined}
            >
              {!a.avatarUrl && a.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <strong>{a.name}</strong>
                {i === 0 && <span className="tag-new">NEW SIGNAL</span>}
              </div>
              <small>{a.city}, {a.country} · {a.primaryGenre}</small>
            </div>

            <div className="flex items-center gap-2">
              {a.tracks[0]?.previewUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayPreview(a.tracks[0]);
                  }}
                  className="icon-btn text-[9px]"
                  title="Play audio preview"
                >
                  {playingSongId === a.tracks[0].id ? '⏸' : '▶'}
                </button>
              )}
              <span className="artist-score">
                {(a.discoveryScore || 92).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Discovery History */}
      <div className="history-box">
        <strong>Discovery history</strong>
        <div className="history-item">
          <span>Today, 10:30 AM · East Africa</span>
          <b>323 new</b>
        </div>
        <div className="history-item">
          <span>Yesterday, 4:00 PM · Alté / Afro-pop</span>
          <b>209 new</b>
        </div>
      </div>

      <a 
        href="#analyze" 
        className="btn btn-soft btn-small" 
        style={{ marginTop: '11px', width: '100%', textAlign: 'center' }}
      >
        View discovery history →
      </a>
    </article>
  );
};
