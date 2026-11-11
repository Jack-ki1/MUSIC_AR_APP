import { chart, primary, series } from '../../../shared/theme/chartPalette';
import { Card } from '../../../shared/ui/Card';
import { Activity, Pause, Play } from 'lucide-react';
import type { EnergyScope } from './types';

export function EnergyTab({ avm, currentSong, currentTimeSec, handlePlaySong, handleSeekCurve, playingSongId }: EnergyScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <Card variant="subtle" padding="lg" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-success-600" />
              <span>S1 Energy Curve & Structure (Synchronized 30s Audio Stream)</span>
            </h4>
            <p className="text-2xs text-purple-500">
              Scored against genre hit archetypes: loudness, onset density, spectral flux, bass weight, and section lift.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePlaySong(currentSong)}
              className="px-3 py-1.5 rounded-sm bg-brand-500 hover:bg-brand-400 text-navy-900 text-xs font-semibold flex items-center gap-1.5 cursor-pointer "
            >
              {playingSongId === currentSong.id ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{playingSongId === currentSong.id ? 'Pause Preview' : 'Play 30s Preview'}</span>
            </button>
            <span className="text-xs font-mono font-bold text-navy-700 px-2 py-1 rounded bg-surface border border-line-strong">
              00:{String(currentTimeSec).padStart(2, '0')} / 00:30
            </span>
          </div>
        </div>

        {/* Interactive Synchronized Energy Curve SVG */}
        <div className="relative bg-surface border border-line-strong rounded p-4 shadow-inner">
          {/* Section timeline labels */}
          <div className="flex justify-between text-2xs font-bold text-purple-500 mb-2 px-1">
            <span>Intro (0-5s)</span>
            <span>Verse (5-14s)</span>
            <span>Pre-Chorus (14-19s)</span>
            <span className="text-brand-600">Chorus / Hook (19-26s)</span>
            <span>Drop (26-30s)</span>
          </div>

          {/* Multi-trace energy graph */}
          <svg viewBox="0 0 300 100" className="w-full h-36 overflow-visible cursor-pointer" onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const sec = Math.floor((x / rect.width) * 30);
            handleSeekCurve(sec);
          }}>
            {/* Grid lines */}
            <line x1="0" y1="25" x2="300" y2="25" stroke={chart.grid} strokeDasharray="3 3" />
            <line x1="0" y1="50" x2="300" y2="50" stroke={chart.grid} strokeDasharray="3 3" />
            <line x1="0" y1="75" x2="300" y2="75" stroke={chart.grid} strokeDasharray="3 3" />

            {/* Overall Energy Area Fill */}
            <polygon
              points={`0,100 ${avm.energyCurve.map(p => `${p.second * 10},${100 - p.overallEnergy * 85}`).join(' ')} 300,100`}
              fill="url(#energyGradient)"
              opacity="0.25"
            />
            <defs>
              <linearGradient id="energyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={primary} />
                <stop offset="100%" stopColor={chart.primarySoft} />
              </linearGradient>
            </defs>

            {/* Loudness trace (purple) */}
            <polyline
              fill="none"
              stroke={primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              points={avm.energyCurve.map(p => `${p.second * 10},${100 - p.loudness * 85}`).join(' ')}
            />

            {/* Bass weight trace (orange) */}
            <polyline
              fill="none"
              stroke={series[2]}
              strokeWidth="1.5"
              strokeDasharray="2 2"
              points={avm.energyCurve.map(p => `${p.second * 10},${100 - p.bassWeight * 80}`).join(' ')}
            />

            {/* Onset density trace (blue) */}
            <polyline
              fill="none"
              stroke={series[4]}
              strokeWidth="1.2"
              opacity="0.7"
              points={avm.energyCurve.map(p => `${p.second * 10},${100 - p.onsetDensity * 75}`).join(' ')}
            />

            {/* Scrubber Playhead */}
            <line
              x1={currentTimeSec * 10}
              y1="0"
              x2={currentTimeSec * 10}
              y2="100"
              stroke={chart.playhead}
              strokeWidth="2"
            />
            <circle
              cx={currentTimeSec * 10}
              cy="10"
              r="3.5"
              fill={chart.playhead}
            />
          </svg>

          {/* Legend */}
          <div className="flex items-center justify-between text-2xs text-purple-500 pt-2 border-t border-line">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-brand-500 rounded"></span>
                <span>Loudness (RMS)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-brand-600 rounded"></span>
                <span>Bass Weight</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-1 bg-info-600 rounded"></span>
                <span>Onset Density</span>
              </span>
            </div>
            <span>Click timeline to scrub preview audio</span>
          </div>
        </div>

        {/* Energy & Structure Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Time to First Peak</span>
            <span className="text-sm font-semibold text-navy-700 font-mono">{avm.energyMetrics.timeToFirstPeakSec}s</span>
            <span className="text-2xs text-success-600 block">Fast hook delivery</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Chorus Section Lift</span>
            <span className="text-sm font-semibold text-navy-700 font-mono">+{avm.energyMetrics.sectionLiftDb} dB</span>
            <span className="text-2xs text-purple-500 block">Dynamic dynamic range</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Structure Archetype</span>
            <span className="text-xs font-bold text-navy-700 truncate block">{avm.energyMetrics.shapeArchetype}</span>
            <span className="text-2xs text-brand-600 font-semibold block">{avm.energyMetrics.archetypeFitPercent}% fit to hits</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Cohesion Alignment (S2)</span>
            <span className="text-sm font-semibold text-navy-700 font-mono">{avm.subScores.s2Cohesion}</span>
            <span className="text-2xs text-purple-500 block">Lyric-to-beat fit</span>
          </Card>
        </div>
      </Card>
    </div>
  );
}
