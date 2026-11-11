import { Card } from '../../../shared/ui/Card';
import { Layers, Mic2, Music, PenTool } from 'lucide-react';
import type { ScorecardScope } from './types';

export function ScorecardTab({ avm, effComp, effSong, effVocal, effWriting, prodBonus, recalculatedTAV, weights }: ScorecardScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pillar V */}
        <Card variant="subtle" padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-navy-700">
              <Mic2 className="w-3.5 h-3.5 text-series-4" />
              Pillar V: Vocal Ability
            </span>
            <span className="text-series-4 font-mono font-semibold">{effVocal}</span>
          </div>
          <div className="h-1.5 bg-purple-100 rounded-sm overflow-hidden">
            <div className="h-full bg-info-600 rounded" style={{ width: `${effVocal * 100}%` }}></div>
          </div>
          <p className="text-2xs text-purple-500">Weight: {weights.wV.toFixed(2)} (Pitch, Tone, Range, Phrasing)</p>
        </Card>

        {/* Pillar W */}
        <Card variant="subtle" padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-navy-700">
              <PenTool className="w-3.5 h-3.5 text-brand-600" />
              Pillar W: Writing & Concept
            </span>
            <span className="text-brand-600 font-mono font-semibold">{effWriting}</span>
          </div>
          <div className="h-1.5 bg-purple-100 rounded-sm overflow-hidden">
            <div className="h-full bg-brand-500 rounded" style={{ width: `${effWriting * 100}%` }}></div>
          </div>
          <p className="text-2xs text-purple-500">Weight: {weights.wW.toFixed(2)} (Imagery, Arc, Hooks, Sound Craft)</p>
        </Card>

        {/* Pillar S */}
        <Card variant="subtle" padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-navy-700">
              <Layers className="w-3.5 h-3.5 text-success-600" />
              Pillar S: Song as Whole
            </span>
            <span className="text-success-600 font-mono font-semibold">{effSong}</span>
          </div>
          <div className="h-1.5 bg-purple-100 rounded-sm overflow-hidden">
            <div className="h-full bg-success-600 rounded" style={{ width: `${effSong * 100}%` }}></div>
          </div>
          <p className="text-2xs text-purple-500">Weight: {weights.wS.toFixed(2)} (Energy Curve, Cohesion, Gestalt)</p>
        </Card>

        {/* Pillar C */}
        <Card variant="subtle" padding="md" className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-1.5 text-navy-700">
              <Music className="w-3.5 h-3.5 text-warning-600" />
              Pillar C: Composition
            </span>
            <span className="text-warning-600 font-mono font-semibold">{effComp}</span>
          </div>
          <div className="h-1.5 bg-purple-100 rounded-sm overflow-hidden">
            <div className="h-full bg-warning-600 rounded" style={{ width: `${effComp * 100}%` }}></div>
          </div>
          <p className="text-2xs text-purple-500">Weight: {weights.wC.toFixed(2)} (Melody, Harmony, Groove, Stems)</p>
        </Card>
      </div>

      {/* Mathematical Formulation Explainer from PDF */}
      <Card variant="subtle" padding="md" className="text-xs space-y-2">
        <span className="text-2xs font-bold text-purple-500 uppercase tracking-wider block">
          Mathematical Synthesis Formula (AVM Section 1)
        </span>
        <div className="p-2.5 rounded-card bg-surface border border-line font-mono text-2xs text-navy-700 overflow-x-auto">
          TAV = 100 × ({weights.wV.toFixed(2)} × {effVocal} + {weights.wW.toFixed(2)} × {effWriting} + {weights.wS.toFixed(2)} × {effSong} + {weights.wC.toFixed(2)} × {effComp}) + {prodBonus} = <strong className="text-brand-600">{recalculatedTAV}</strong>
        </div>
        <p className="text-2xs text-purple-500">
          Production Index is {avm.productionIndex}/100. Per Section 6: production polish never lowers an artist's score; it can only add up to a capped +3.0 bonus points.
        </p>
      </Card>

      {/* Verifiable Evidence */}
      <div className="space-y-2">
        <span className="text-2xs font-bold text-purple-500 uppercase tracking-wider block">
          AVM Verifiable Evidence & Flags:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {avm.evidence.map((ev, idx) => (
            <Card variant="subtle" padding="none" className="p-2.5 text-xs text-navy-700 flex items-center gap-2">
              <span className="text-success-600 font-bold">✓</span>
              <span>{ev}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
