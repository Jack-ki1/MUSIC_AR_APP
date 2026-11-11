import React from 'react';
import { Compass, Activity, Sparkles, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '../shared/ui/Button';
import { Card } from '../shared/ui/Card';

interface HomePageProps {
  candidateCount: number;
  onNavigate: (section: 'discovery' | 'analyse' | 'recommendations' | 'settings') => void;
}

const strip = [
  { label: 'Tracked candidates', value: '—', sub: 'Live roster' },
  { label: 'Regions monitored', value: '5', sub: 'East + West Africa' },
  { label: 'Genres covered', value: '40+', sub: 'Catalogue breadth' },
  { label: 'AVM score range', value: '0–100', sub: '4-pillar composite' }
];

export const HomePage: React.FC<HomePageProps> = ({ candidateCount, onNavigate }) => {
  return (
    <div className="space-y-5 pb-16 section-enter">
      {/* Hero — flat terminal header + dense border-divided KPI strip */}
      <div className="rounded-card border border-line-strong bg-surface overflow-hidden">
        <div className="px-4 py-4 sm:px-6 sm:py-5 border-b border-line">
          <div className="text-2xs font-mono font-semibold uppercase tracking-[0.16em] text-brand-600">
            Africa · A&amp;R Intelligence Command
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-navy-700 mt-1.5 font-mono">
            BREAKOUT RADAR
          </h1>
          <p className="text-sm text-purple-500 mt-2 max-w-2xl leading-relaxed">
            Discover emerging talent early, analyze artistic value with the AVM 4-pillar
            engine, and make data-driven signing decisions.
          </p>
          <div className="mt-3.5 flex flex-wrap gap-2">
            <Button size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />} onClick={() => onNavigate('discovery')}>
              Start Discovery
            </Button>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Activity className="w-3.5 h-3.5" />}
              onClick={() => onNavigate('analyse')}
            >
              Analyze Artists
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-line">
          {strip.map((k, i) => (
            <div key={k.label} className="bg-surface px-3.5 py-2.5 min-w-0">
              <div className="text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-purple-500 truncate">
                {k.label}
              </div>
              <div className="text-lg font-mono font-semibold tabular-nums tracking-tight text-navy-700 mt-0.5">
                {i === 0 ? candidateCount : k.value}
              </div>
              <div className="text-2xs text-purple-500 truncate mt-0.5">{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-2xs font-mono font-semibold uppercase tracking-[0.16em] text-purple-500 mb-2">
          Workspace
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            {
              title: 'Discovery',
              desc: 'Autonomous scanning across African markets with live telemetry.',
              icon: Compass,
              section: 'discovery' as const
            },
            {
              title: 'Analyze',
              desc: 'Deep AVM dossier with vocal, writing, energy and composition labs.',
              icon: Activity,
              section: 'analyse' as const
            },
            {
              title: 'Recommendations',
              desc: 'Tiered A&R decisions, rationale tracking and follow-ups.',
              icon: Sparkles,
              section: 'recommendations' as const
            }
          ].map((card) => (
            <Card key={card.title} padding="sm" interactive>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-sm border border-line bg-surface-subtle flex items-center justify-center text-brand-600 shrink-0">
                  <card.icon className="w-3 h-3" />
                </span>
                <span className="text-xs font-mono font-semibold uppercase tracking-[0.08em] text-navy-700">
                  {card.title}
                </span>
              </div>
              <p className="text-xs text-purple-500 mt-2 leading-relaxed">{card.desc}</p>
              <button
                onClick={() => onNavigate(card.section)}
                className="mt-2.5 text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-brand-600 flex items-center gap-1 hover:text-brand-700 cursor-pointer"
              >
                Open <ArrowRight className="w-3 h-3" />
              </button>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-card border border-brand-500 bg-surface px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-navy-700">Ready to find the next breakout?</div>
          <div className="text-xs text-purple-500 mt-0.5">
            Run a scan and surface high-potential, low-production gems.
          </div>
        </div>
        <Button
          size="sm"
          className="shrink-0"
          leftIcon={<PlayCircle className="w-3.5 h-3.5" />}
          onClick={() => onNavigate('discovery')}
        >
          Launch Scan
        </Button>
      </div>
    </div>
  );
};
