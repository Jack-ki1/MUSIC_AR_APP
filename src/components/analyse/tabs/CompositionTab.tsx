import { Card } from '../../../shared/ui/Card';
import { Music } from 'lucide-react';
import type { CompositionScope } from './types';

export function CompositionTab({ avm }: CompositionScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <Card variant="subtle" padding="lg" className="space-y-4">
        <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-2">
          <Music className="w-4 h-4 text-warning-600" />
          <span>Pillar C: Arrangement & Demucs Separated Stem Occupancy</span>
        </h4>

        {/* Stem Activity Occupancy */}
        <div className="space-y-2.5">
          <span className="text-2xs font-bold text-purple-500 uppercase tracking-wider block">
            Stem Activity Map (Time-Frequency Occupancy)
          </span>

          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span>Vocal Stem Occupancy</span>
                <span className="font-mono font-bold text-series-4">{avm.stemsActivity.vocalOccupancy}%</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-sm overflow-hidden">
                <div className="h-full bg-info-600 rounded" style={{ width: `${avm.stemsActivity.vocalOccupancy}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Drums & Percussion (Kick / Snare / Shaker)</span>
                <span className="font-mono font-bold text-brand-600">{avm.stemsActivity.drumsOccupancy}%</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-sm overflow-hidden">
                <div className="h-full bg-brand-600 rounded" style={{ width: `${avm.stemsActivity.drumsOccupancy}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Bass & Sub-Bass (808 / Electric Bass)</span>
                <span className="font-mono font-bold text-success-600">{avm.stemsActivity.bassOccupancy}%</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-sm overflow-hidden">
                <div className="h-full bg-success-600 rounded" style={{ width: `${avm.stemsActivity.bassOccupancy}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span>Melodic Synths & Guitars</span>
                <span className="font-mono font-bold text-brand-600">{avm.stemsActivity.melodicOccupancy}%</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-sm overflow-hidden">
                <div className="h-full bg-brand-500 rounded" style={{ width: `${avm.stemsActivity.melodicOccupancy}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Composition Facts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Chord Progression</span>
            <span className="text-xs font-semibold text-navy-700 font-mono">{avm.compositionFacts.detectedProgression}</span>
            <span className="text-2xs text-purple-500 block">Modal cadence</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Syncopation Index</span>
            <span className="text-sm font-semibold text-navy-700 font-mono">{avm.compositionFacts.syncopationIndex}</span>
            <span className="text-2xs text-success-600 block">High rhythmic bounce</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Swing / Micro-Timing</span>
            <span className="text-sm font-semibold text-navy-700 font-mono">{avm.compositionFacts.swingPercent}%</span>
            <span className="text-2xs text-purple-500 block">Human groove feel</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Genre Centroid Distance</span>
            <span className="text-sm font-semibold text-brand-600 font-mono">{avm.compositionFacts.genreCentroidDistance}</span>
            <span className="text-2xs text-purple-500 block">Sweet-spot novelty</span>
          </Card>
        </div>
      </Card>
    </div>
  );
}
