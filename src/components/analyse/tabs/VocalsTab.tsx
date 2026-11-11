import { Card } from '../../../shared/ui/Card';
import { Mic2 } from 'lucide-react';
import type { VocalsScope } from './types';

export function VocalsTab({ avm, pianoKeys }: VocalsScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Piano Keyboard Tessitura Visualizer */}
      <Card variant="subtle" padding="lg" className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-series-4" />
              <span>Vocal Tessitura & Pitch Span (V4 Range Percentile)</span>
            </h4>
            <p className="text-2xs text-purple-500 mt-0.5">
              Lowest note: <strong className="text-series-4">{avm.vocalProfile.lowestNote}</strong> • Highest note: <strong className="text-series-4">{avm.vocalProfile.highestNote}</strong> • Usable span: <strong>{avm.vocalProfile.usableRangeSemitones} semitones</strong>
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xs font-bold text-purple-500 block">Detected Center Key</span>
            <span className="text-xs font-semibold text-success-600 font-mono">{avm.vocalProfile.detectedKey}</span>
          </div>
        </div>

        {/* Interactive Piano Roll Display */}
        <div className="overflow-x-auto py-2">
          <div className="inline-flex h-24 bg-surface border border-line-strong rounded p-1 relative shadow-inner">
            {pianoKeys.map((k) => {
              const isLowest = k.note === avm.vocalProfile.lowestNote;
              const isHighest = k.note === avm.vocalProfile.highestNote;
              const lowestMidi = 40; // rough baseline
              const highestMidi = 76;
              const isInRange = k.midi >= lowestMidi && k.midi <= highestMidi;

              return (
                <div
                  key={k.note}
                  className={`relative select-none text-2xs font-mono transition-colors ${
                    k.isBlack
                      ? '-mx-2.5 z-10 w-5 h-14 rounded-b bg-navy-900 text-white flex items-end justify-center pb-1'
                      : 'w-7 h-22 rounded-b border-r border-line bg-surface flex items-end justify-center pb-1 text-purple-500'
                  } ${
                    isLowest || isHighest
                      ? 'bg-brand-500 text-navy-900 font-semibold ring-2 ring-brand-300'
                      : isInRange && !k.isBlack
                      ? 'bg-brand-50 text-brand-700'
                      : ''
                  }`}
                  title={`${k.note} (MIDI ${k.midi})`}
                >
                  <span>{k.note}</span>
                </div>
            );
          })}
        </div>
      </div>
    </Card>

    {/* Pitch Error Cent Distribution Bar Chart (V1) */}
    <Card variant="subtle" padding="lg" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
            V1 Pitch Error Cent Deviation Distribution (CREPE f0 Tracking)
          </h4>
          <p className="text-2xs text-purple-500 mt-0.5">
            {avm.notesWithin20CentsPercent}% of held sustained notes fall inside the critical ±20 cents intonation window.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-series-4">
          {avm.subScores.v1PitchAccuracy} / 1.00
        </span>
      </div>

      <div className="h-32 flex items-end gap-2 pt-4 px-2 border-b border-line">
        {avm.pitchDistribution.map((bin) => (
          <div key={bin.centBin} className="flex-1 flex flex-col items-center gap-1 group">
            <span className="text-2xs font-mono text-purple-500 group-hover:text-navy-700">
              {bin.countPercent}%
            </span>
            <div
              className={`w-full rounded-t transition-all ${
                bin.isWithin20Cents
                  ? 'bg-info-600 group-hover:bg-brand-600'
                  : 'bg-purple-200 group-hover:bg-purple-300'
              }`}
              style={{ height: `${bin.countPercent * 2.5}px` }}
            ></div>
            <span className="text-2xs font-mono text-purple-500 whitespace-nowrap">
              {bin.centBin}c
            </span>
          </div>
        ))}
      </div>
    </Card>

    {/* Vocal Acoustic Metrics Grid (V2 Stability, V3 Formants, Autotune Audit) */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <Card variant="default" padding="none" className="p-3.5">
        <span className="text-2xs text-purple-500 font-semibold block">V2 Vibrato & Stability</span>
        <span className="text-sm font-semibold text-navy-700">{avm.vocalProfile.vibratoRateHz} Hz</span>
        <span className="text-2xs text-purple-500 block">±{avm.vocalProfile.vibratoDepthCents} cents depth</span>
      </Card>

      <Card variant="default" padding="none" className="p-3.5">
        <span className="text-2xs text-purple-500 font-semibold block">V3 Formants & Timbre</span>
        <span className="text-sm font-semibold text-navy-700">F1 {avm.vocalProfile.formantF1Hz} Hz</span>
        <span className="text-2xs text-purple-500 block">F2 {avm.vocalProfile.formantF2Hz} Hz</span>
      </Card>

      <Card variant="default" padding="none" className="p-3.5">
        <span className="text-2xs text-purple-500 font-semibold block">Harmonic-to-Noise</span>
        <span className="text-sm font-semibold text-navy-700">{avm.vocalProfile.harmonicToNoiseRatioDb} dB</span>
        <span className="text-2xs text-success-600 block">Clean vocal clarity</span>
      </Card>

      <Card variant="default" padding="none" className="p-3.5">
        <span className="text-2xs text-purple-500 font-semibold block">Autotune / Processing</span>
        <span className="text-sm font-semibold text-navy-700">{(avm.vocalProfile.processingLevel * 100).toFixed(0)}%</span>
        <span className="text-2xs text-brand-600 block font-semibold">
          Intrinsic conf: {(avm.vocalProfile.intrinsicPitchConfidence * 100).toFixed(0)}%
        </span>
      </Card>
    </div>
  </div>
  );
}
