import { Card } from '../../../shared/ui/Card';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import type { AnomalyScope } from './types';

export function AnomalyTab({ activeArtist }: AnomalyScope) {
  return (
    <div className="space-y-4 animate-in fade-in">
      <div className="bg-success-50 border border-success-100 p-4 rounded flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-success-600 text-navy-900 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-semibold text-success-700 block">
              A&R Integrity Verdict: Organic Growth Verified
            </span>
            <p className="text-xs text-success-700">
              Confidence rating: <strong>{(activeArtist.organicConfidence * 100).toFixed(0)}%</strong> • Zero suspicious bot farm clusters detected.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded bg-surface text-success-600 border border-success-600">
          CLEAN SIGNAL
        </span>
      </div>

      {/* 4 Anomaly Vectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <Card variant="default" padding="md" className="space-y-1.5">
          <span className="font-bold text-navy-700 block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            Stream-to-Listener Ratio
          </span>
          <p className="text-xs text-purple-700">
            Observed replay ratio is <strong>3.4 streams per listener</strong>. Typical range for emerging indie pop/R&B is 2.5–4.2. Reflects true repeat fan engagement, not looped automated farm playback.
          </p>
        </Card>

        <Card variant="default" padding="md" className="space-y-1.5">
          <span className="font-bold text-navy-700 block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            Grassroots Velocity Sanity
          </span>
          <p className="text-xs text-purple-700">
            Spikes align with documented TikTok sound creations (+210% 14d) and local radio shoutouts in Nairobi. No unnatural overnight 10,000% jump without source attribution.
          </p>
        </Card>

        <Card variant="default" padding="md" className="space-y-1.5">
          <span className="font-bold text-navy-700 block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            Comment Diversity & Language Entropy
          </span>
          <p className="text-xs text-purple-700">
            88% of community comments feature authentic vernacular expressions in Sheng, Swahili, and local regional slang. No generic copypasta or bot emoji spam.
          </p>
        </Card>

        <Card variant="default" padding="md" className="space-y-1.5">
          <span className="font-bold text-navy-700 block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-success-600" />
            Geographic Concentration Sanity
          </span>
          <p className="text-xs text-purple-700">
            92% of listeners originate in {activeArtist.country} ({activeArtist.city}, Mombasa, Kisumu, Dar es Salaam) and 8% in the UK diaspora. Zero inexplicable server farm datacenters.
          </p>
        </Card>
      </div>
    </div>
  );
}
