import { Card } from '../../../shared/ui/Card';
import type { HumanScorecardScope } from './types';

export function HumanScorecardTab({ activeArtist, humanArtisticDirection, humanMarketFit, humanMelody, humanOriginality, humanPerformance, humanProduction, humanReviewSaved, humanSongwriting, humanVocalIdentity, onUpdateArtistScore, reviewerNotes, setHumanArtisticDirection, setHumanMarketFit, setHumanMelody, setHumanOriginality, setHumanPerformance, setHumanProduction, setHumanReviewSaved, setHumanSongwriting, setHumanVocalIdentity }: HumanScorecardScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="bg-surface-subtle border border-line p-4 rounded flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-navy-700 block text-sm">
            8-Dimension Human A&R Evaluation Scorecard
          </span>
          <p className="text-purple-500 text-2xs">
            Professional subjective assessment rubric (0.0 to 5.0 scale) per Master Prompt specifications.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xs text-purple-500 block">Composite Score:</span>
          <span className="text-lg font-semibold text-brand-600 font-mono">
            {((humanSongwriting + humanVocalIdentity + humanMelody + humanProduction + humanOriginality + humanPerformance + humanArtisticDirection + humanMarketFit) / 8).toFixed(2)} / 5.0
          </span>
        </div>
      </div>

      {/* 8 Dimension Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* 1. Songwriting */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">1. Songwriting Craft:</span>
            <strong className="text-brand-600 font-mono">{humanSongwriting.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanSongwriting}
            onChange={(e) => setHumanSongwriting(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Structure, lyrical craft, clarity and storytelling</p>
        </Card>

        {/* 2. Vocal Identity */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">2. Vocal Identity:</span>
            <strong className="text-brand-600 font-mono">{humanVocalIdentity.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanVocalIdentity}
            onChange={(e) => setHumanVocalIdentity(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Tone, control, delivery and vocal character</p>
        </Card>

        {/* 3. Melody */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">3. Melodic Hooks:</span>
            <strong className="text-brand-600 font-mono">{humanMelody.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanMelody}
            onChange={(e) => setHumanMelody(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Hooks, phrasing, memorability and harmony</p>
        </Card>

        {/* 4. Production */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">4. Production Polish:</span>
            <strong className="text-brand-600 font-mono">{humanProduction.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanProduction}
            onChange={(e) => setHumanProduction(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Sound quality, arrangement and sonic space</p>
        </Card>

        {/* 5. Originality */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">5. Creative Originality:</span>
            <strong className="text-brand-600 font-mono">{humanOriginality.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanOriginality}
            onChange={(e) => setHumanOriginality(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Distinctiveness and unique artistic identity</p>
        </Card>

        {/* 6. Performance */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">6. Live Performance:</span>
            <strong className="text-brand-600 font-mono">{humanPerformance.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanPerformance}
            onChange={(e) => setHumanPerformance(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Stage presence, authenticity and live delivery</p>
        </Card>

        {/* 7. Artistic Direction */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">7. Artistic Direction:</span>
            <strong className="text-brand-600 font-mono">{humanArtisticDirection.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanArtisticDirection}
            onChange={(e) => setHumanArtisticDirection(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Vision, consistency and future catalog potential</p>
        </Card>

        {/* 8. Market Fit */}
        <Card variant="default" padding="none" className="p-3.5 space-y-1.5">
          <div className="flex justify-between">
            <span className="font-bold text-navy-700">8. Market Fit & Positioning:</span>
            <strong className="text-brand-600 font-mono">{humanMarketFit.toFixed(1)}</strong>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.1"
            value={humanMarketFit}
            onChange={(e) => setHumanMarketFit(parseFloat(e.target.value))}
            className="w-full accent-series-1"
          />
          <p className="text-2xs text-purple-500">Audience fit, crossover ability and differentiator</p>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={() => {
            const avg = (humanSongwriting + humanVocalIdentity + humanMelody + humanProduction + humanOriginality + humanPerformance + humanArtisticDirection + humanMarketFit) / 8;
            onUpdateArtistScore(activeArtist.id, Number(avg.toFixed(1)), reviewerNotes);
            setHumanReviewSaved(true);
            setTimeout(() => setHumanReviewSaved(false), 2000);
          }}
          className="px-4 py-2 rounded-sm bg-brand-500 hover:bg-brand-400 text-navy-900 font-semibold text-xs  cursor-pointer flex items-center gap-1.5"
        >
          {humanReviewSaved ? <span>✓ Saved to A&R Ledger</span> : <span>Save Human A&R Scorecard</span>}
        </button>
      </div>
    </div>
  );
}
