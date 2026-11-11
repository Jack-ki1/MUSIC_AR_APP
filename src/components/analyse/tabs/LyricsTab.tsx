import { Card } from '../../../shared/ui/Card';
import { PenTool } from 'lucide-react';
import type { LyricsScope } from './types';

export function LyricsTab({ avm }: LyricsScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <Card variant="subtle" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-2">
              <PenTool className="w-4 h-4 text-brand-600" />
              <span>Pillar W: Transcribed Multilingual Lyrics & Rhyme Craft</span>
            </h4>
            <p className="text-2xs text-purple-500">
              Code-switching detection (Swahili, Sheng, English) with sensory imagery and rhyme detection.
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            {avm.lyricsBreakdown.detectedLanguages.map((lang, idx) => (
              <span key={idx} className="text-2xs font-bold px-2 py-0.5 rounded bg-surface border border-line-strong text-navy-700">
                {lang}
              </span>
            ))}
          </div>
        </div>

        {/* Line by line lyric breakdown */}
        <div className="space-y-2">
          {avm.lyricsBreakdown.lines.map((l) => (
            <Card variant="default" padding="sm" className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-navy-700 text-sm">{l.text}</span>
                <span className="text-2xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                  {l.language} · Rhyme [{l.rhymeSchemeLabel}]
                </span>
              </div>
              {l.translation && (
                <p className="text-xs text-purple-500 italic">"{l.translation}"</p>
              )}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-2xs text-purple-300 font-bold uppercase">Imagery tokens:</span>
                {l.imageryTokens.map((t, idx) => (
                  <span key={idx} className="text-2xs px-1.5 py-0.2 rounded bg-warning-50 text-warning-700">
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Writing sub-score metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Repetition Sweet-Spot</span>
            <span className="text-sm font-semibold text-navy-700 font-mono">{avm.lyricsBreakdown.repetitionSweetSpotScore}</span>
            <span className="text-2xs text-purple-500 block">Ratio {avm.lyricsBreakdown.repetitionRatio} vs 0.38 opt</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Hook Memorability</span>
            <span className="text-sm font-semibold text-brand-600 font-mono">{avm.lyricsBreakdown.hookMemorabilityScore}</span>
            <span className="text-2xs text-purple-500 block">Short singable refrains</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Concept Originality</span>
            <span className="text-sm font-semibold text-navy-700 font-mono">{avm.subScores.w5ConceptOriginality}</span>
            <span className="text-2xs text-purple-500 block">Embedding novelty</span>
          </Card>

          <Card variant="default" padding="sm">
            <span className="text-2xs text-purple-500 block font-semibold">Cliché Avoidance Rate</span>
            <span className="text-sm font-semibold text-success-600 font-mono">{avm.subScores.w6ClicheAvoidance}</span>
            <span className="text-2xs text-purple-500 block">Fresh vernacular</span>
          </Card>
        </div>
      </Card>
    </div>
  );
}
