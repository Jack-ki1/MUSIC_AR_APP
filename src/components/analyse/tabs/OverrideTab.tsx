import { Card } from '../../../shared/ui/Card';
import { DollarSign } from 'lucide-react';
import type { OverrideScope } from './types';

export function OverrideTab({ avm, effComp, effSong, effVocal, effWriting, handleSaveOverride, overrideSaved, recalculatedTAV, reviewerNotes, setOverrideComp, setOverrideSong, setOverrideVocal, setOverrideWriting, setReviewerNotes }: OverrideScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Polish Headroom & Budget Recommendation */}
      <div className="p-5 rounded bg-brand-50 border border-brand-100 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-brand-700 uppercase flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            Polish Headroom & Studio Budget Recommendation (PDF Section 6)
          </span>
          <span className="text-sm font-mono font-semibold text-brand-700">
            Est. Budget: ${avm?.headroomRecommendation?.suggestedStudioAdvanceUsd?.toLocaleString() ?? 'N/A'}
          </span>
        </div>
        <p className="text-xs text-navy-700">
          <strong>Recommendation:</strong> {avm?.headroomRecommendation?.polishBudgetRecommendation ?? 'N/A'}
        </p>
        <p className="text-xs text-navy-700">
          <strong>Mixing priority:</strong> {avm?.headroomRecommendation?.mixingFocusArea ?? 'N/A'}
        </p>
      </div>

      {/* Manual Sliders for Reviewers */}
      <Card variant="subtle" padding="lg" className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-navy-700 uppercase tracking-wider">
            A&R Evaluator Calibration Overrides
          </h4>
          <button
            onClick={() => {
              setOverrideVocal(null);
              setOverrideWriting(null);
              setOverrideSong(null);
              setOverrideComp(null);
            }}
            className="text-2xs font-bold text-brand-600 hover:underline cursor-pointer"
          >
            Reset to Model Scores
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span>Pillar V (Vocal Ability):</span>
              <strong className="font-mono text-series-4">{effVocal.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.01"
              value={effVocal}
              onChange={(e) => setOverrideVocal(parseFloat(e.target.value))}
              className="w-full accent-series-4"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Pillar W (Writing & Concept):</span>
              <strong className="font-mono text-brand-600">{effWriting.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.01"
              value={effWriting}
              onChange={(e) => setOverrideWriting(parseFloat(e.target.value))}
              className="w-full accent-series-1"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Pillar S (Song as Whole):</span>
              <strong className="font-mono text-success-600">{effSong.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.01"
              value={effSong}
              onChange={(e) => setOverrideSong(parseFloat(e.target.value))}
              className="w-full accent-success-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Pillar C (Composition & Arrangement):</span>
              <strong className="font-mono text-warning-600">{effComp.toFixed(2)}</strong>
            </div>
            <input
              type="range"
              min="0.10"
              max="1.00"
              step="0.01"
              value={effComp}
              onChange={(e) => setOverrideComp(parseFloat(e.target.value))}
              className="w-full accent-warning-600"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-2xs font-bold text-purple-700 uppercase">Reviewer Audit Justification</label>
          <textarea
            rows={2}
            value={reviewerNotes}
            onChange={(e) => setReviewerNotes(e.target.value)}
            className="w-full bg-surface border border-line-strong rounded p-2.5 text-xs text-navy-700 focus:outline-none focus:border-series-1"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs">
            <span>Recalculated TAV: </span>
            <strong className="text-base text-brand-600 font-mono font-semibold">{recalculatedTAV}</strong>
          </div>

          <button
            onClick={handleSaveOverride}
            className="px-4 py-2 rounded-sm bg-brand-500 hover:bg-brand-400 text-navy-900 font-semibold text-xs cursor-pointer  flex items-center gap-1.5"
          >
            {overrideSaved ? <span>✓ Saved to A&R Committee</span> : <span>Apply & Save Calibration</span>}
          </button>
        </div>
      </Card>
    </div>
  );
}
