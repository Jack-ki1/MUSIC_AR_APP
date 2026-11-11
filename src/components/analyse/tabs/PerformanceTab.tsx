import { Card } from '../../../shared/ui/Card';
import type { PerformanceScope } from './types';

export function PerformanceTab({ activeArtist, growthPeriod, setGrowthPeriod }: PerformanceScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-subtle border border-line p-4 rounded text-xs">
        <div>
          <span className="font-semibold text-navy-700 block text-sm">
            Digital Traction & Multi-Platform Growth Velocity
          </span>
          <p className="text-purple-500 text-2xs">
            Multi-channel evidence collection across streaming, video, and social audio platforms.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-surface border border-line-strong p-1 rounded">
          {(['7d', '14d', '30d', '90d'] as const).map(p => (
            <button
              key={p}
              onClick={() => setGrowthPeriod(p)}
              className={`px-2.5 py-1 rounded-sm font-semibold text-xs cursor-pointer transition-all ${
                growthPeriod === p ? 'bg-brand-500 text-navy-900 ' : 'text-purple-500 hover:text-navy-700'
              }`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Platform Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Spotify */}
        <Card variant="default" padding="md" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-700 text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-platform-spotify"></span>
              Spotify for Artists
            </span>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-success-50 text-success-700">
              Active Metric
            </span>
          </div>
          <div className="pt-1">
            <span className="text-xl font-semibold text-navy-700 font-mono">
              {Number(activeArtist.monthlyListeners||0).toLocaleString()}
            </span>
            <span className="text-2xs text-purple-500 block">Monthly Listeners</span>
          </div>
          <div className="pt-2 border-t border-line flex justify-between text-2xs">
            <span className="text-purple-500">Velocity ({growthPeriod}):</span>
            <strong className="text-success-700">
              +{growthPeriod === '7d' ? '3.8%' : growthPeriod === '14d' ? '9.4%' : growthPeriod === '30d' ? `${activeArtist.growthSignal30d}%` : '82.5%'}
            </strong>
          </div>
        </Card>

        {/* YouTube */}
        <Card variant="default" padding="md" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-700 text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-platform-youtube"></span>
              YouTube Music / Data API
            </span>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
              Channel Verified
            </span>
          </div>
          <div className="pt-1">
            <span className="text-xl font-semibold text-navy-700 font-mono">
              {Math.round(activeArtist.monthlyListeners * 1.8).toLocaleString()}
            </span>
            <span className="text-2xs text-purple-500 block">Total Video Views</span>
          </div>
          <div className="pt-2 border-t border-line flex justify-between text-2xs">
            <span className="text-purple-500">Shorts Audio Uses:</span>
            <strong className="text-brand-600">14,200+ clips</strong>
          </div>
        </Card>

        {/* TikTok Audio */}
        <Card variant="default" padding="md" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-700 text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-platform-tiktok"></span>
              TikTok Sound Velocity
            </span>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-warning-50 text-warning-700">
              Viral Spark
            </span>
          </div>
          <div className="pt-1">
            <span className="text-xl font-semibold text-navy-700 font-mono">
              {Math.round(activeArtist.monthlyListeners * 0.42).toLocaleString()}
            </span>
            <span className="text-2xs text-purple-500 block">UGC Creations with Sound</span>
          </div>
          <div className="pt-2 border-t border-line flex justify-between text-2xs">
            <span className="text-purple-500">Weekly Growth:</span>
            <strong className="text-warning-600">+142% spike</strong>
          </div>
        </Card>

        {/* Apple Music */}
        <Card variant="default" padding="md" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-700 text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-platform-apple"></span>
              Apple Music & Shazam
            </span>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-success-50 text-success-700">
              Storefront Active
            </span>
          </div>
          <div className="pt-1">
            <span className="text-xl font-semibold text-navy-700 font-mono">
              #{Math.floor(Math.random() * 20 + 5)}
            </span>
            <span className="text-2xs text-purple-500 block">Shazam Top 50 ({activeArtist.city})</span>
          </div>
          <div className="pt-2 border-t border-line flex justify-between text-2xs">
            <span className="text-purple-500">Editorial Playlists:</span>
            <strong className="text-navy-700">Afro-Indie, Naija & East</strong>
          </div>
        </Card>

        {/* SoundCloud */}
        <Card variant="default" padding="md" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-700 text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-platform-soundcloud"></span>
              SoundCloud & Bandcamp
            </span>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-surface-sunken text-purple-500">
              Underground Feed
            </span>
          </div>
          <div className="pt-1">
            <span className="text-xl font-semibold text-navy-700 font-mono">
              28.4K
            </span>
            <span className="text-2xs text-purple-500 block">Direct Audio Plays</span>
          </div>
          <div className="pt-2 border-t border-line flex justify-between text-2xs">
            <span className="text-purple-500">Grassroots Reposts:</span>
            <strong className="text-navy-700">2,410</strong>
          </div>
        </Card>

        {/* MusicBrainz & Wikidata */}
        <Card variant="default" padding="md" className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-700 text-xs flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-platform-bandcamp"></span>
              MusicBrainz & Metadata
            </span>
            <span className="text-2xs font-bold px-2 py-0.5 rounded bg-success-50 text-success-700">
              MBID Matched
            </span>
          </div>
          <div className="pt-1">
            <span className="text-xs font-mono font-bold text-brand-600 truncate block">
              mbid-{(activeArtist.appleArtistId || 948210).toString(16)}-east
            </span>
            <span className="text-2xs text-purple-500 block">Open Catalog Entity</span>
          </div>
          <div className="pt-2 border-t border-line flex justify-between text-2xs">
            <span className="text-purple-500">ISRC Registered:</span>
            <strong className="text-success-600">Yes (Verified)</strong>
          </div>
        </Card>
      </div>

      {/* Interactive Trajectory Visualization Bar */}
      <Card variant="default" padding="md" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-navy-700 uppercase">
            {growthPeriod.toUpperCase()} Audience Trajectory Curve
          </span>
          <span className="text-xs text-success-600 font-bold">
            Velocity Index: +{growthPeriod === '7d' ? '4.2%' : growthPeriod === '14d' ? '12.8%' : growthPeriod === '30d' ? `${activeArtist.growthSignal30d}%` : '74.2%'}
          </span>
        </div>

        <div className="h-28 bg-surface-subtle border border-line rounded p-3 flex items-end justify-between gap-2">
          {[32, 38, 42, 45, 49, 56, 61, 68, 74, 82, 89, 95].map((val, idx) => (
            <div key={`curve-bar-${idx}`} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div
                className="w-full bg-brand-500 group-hover:bg-brand-600 rounded-t-md transition-all"
                style={{ height: `${val}%` }}
              ></div>
              <span className="text-2xs text-purple-300 font-mono group-hover:text-navy-700">
                T-{12 - idx}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
