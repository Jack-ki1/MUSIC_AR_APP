import React, { useState } from 'react';
import { APPROVED_WORKSPACE_USERS } from '../../services/authService';

interface MsaniiSettingsProps {
  onShowToast: (msg: string) => void;
}

export type MsaniiSettingTab = 
  | 'Workspace'
  | 'Team and Access'
  | 'Data Providers'
  | 'Discovery'
  | 'Scoring and Models'
  | 'Automation'
  | 'Security and Audit';

export const MsaniiSettings: React.FC<MsaniiSettingsProps> = ({ onShowToast }) => {
  const [activeTab, setActiveTab] = useState<MsaniiSettingTab>('Workspace');

  const settingsData: Record<MsaniiSettingTab, {
    intro: string;
    panels: Array<[string, Array<[string, string]>]>;
  }> = {
    'Workspace': {
      intro: 'Workspace identity, locale and defaults for your A&R team.',
      panels: [
        ['Workspace details', [
          ['Workspace name', 'MSANII A&R Desk'],
          ['Region', 'East Africa (Nairobi HQ)'],
          ['Timezone', 'Africa/Nairobi (EAT, UTC+3)'],
          ['Default currency', 'KES / USD']
        ]],
        ['Workspace preferences', [
          ['Default date range', '30 days'],
          ['Default country', 'All countries'],
          ['Display density', 'High-Density Editorial']
        ]],
        ['Access posture', [
          ['Workspace visibility', 'Invite only (15 enterprise seats)'],
          ['Session timeout', '30 minutes'],
          ['Data retention', 'Authoritative Firestore']
        ]]
      ]
    },
    'Team and Access': {
      intro: 'Manage membership, permissions and team-level access boundaries across 5 RBAC roles.',
      panels: [
        ['Team members', [
          ['A&R Lead', 'Jackson Kimotho (Lead Director)'],
          ['Talent Scout', 'Sarah Adhiambo (Senior Scout)'],
          ['Research Analyst', 'Kofi Mensah (Analyst)']
        ]],
        ['Access roles', [
          ['ADMIN', 'Full system configuration & governance'],
          ['AR_LEAD', 'Scout signing approvals & pipeline triage'],
          ['ANALYST', 'Audio MIR ingestion & empirical tuning'],
          ['REVIEWER', 'Qualitative human reviews & notes'],
          ['VIEWER', 'Strict read-only terminal access']
        ]],
        ['Invitations', [
          ['Active allowlist seats', `${APPROVED_WORKSPACE_USERS.length} of 15 occupied`],
          ['Default invitation expiry', '7 days'],
          ['Require verified email', 'Enabled']
        ]]
      ]
    },
    'Data Providers': {
      intro: 'Provider connections and data availability. Secret values are write-only and managed strictly server-side.',
      panels: [
        ['Provider status', [
          ['Spotify API', 'Fully implemented'],
          ['YouTube Music', 'Implemented with credentials'],
          ['Apple Music / iTunes', 'Fully connected (30s AAC previews)'],
          ['MusicBrainz MBID', 'Reconciled catalogue matching'],
          ['TikTok / UGC Index', 'Active creator tracking']
        ]],
        ['Manual sources', [
          ['CSV import', 'Manual import enabled'],
          ['Acoustic review stems', '24-bit/48kHz WAV ingestion'],
          ['Chain-of-title rights', 'Direct verification']
        ]],
        ['Zero-Secret Policy', [
          ['Spotify Client Secret', '•••••••••••• (Server-side proxy)'],
          ['YouTube API Key', '•••••••••••• (Encrypted Vault)'],
          ['Webhook HMAC Secret', '•••••••••••• (Active)']
        ]]
      ]
    },
    'Discovery': {
      intro: 'Tune artist discovery coverage, exclusions and signal freshness.',
      panels: [
        ['Geography', [
          ['Primary markets', 'Kenya, Tanzania, Uganda, Rwanda'],
          ['Expansion scope', 'Sub-Saharan Africa & Diaspora'],
          ['Local scene weighting', 'Enabled (Gengetone, Bongo, Alté)']
        ]],
        ['Artist filters', [
          ['Exclude mainstream', 'Enabled (<100K monthly listeners)'],
          ['Minimum evidence confidence', '65%'],
          ['New signal window', '14 days']
        ]],
        ['Discovery cadence', [
          ['Autonomous sweep', 'Active background loop'],
          ['Scheduled scan', 'Hourly / On-demand'],
          ['Run notifications', 'In-app + email']
        ]]
      ]
    },
    'Scoring and Models': {
      intro: 'Configure explainable scoring pillars and inspect model provenance.',
      panels: [
        ['Artistic Value Model (AVM)', [
          ['Originality & Identity', '25%'],
          ['Vocal Range & Musicianship', '25%'],
          ['Sound & Production Polish', '20%'],
          ['Lyrical Depth & Cultural Resonance', '15%'],
          ['Stage Presence & Live Charisma', '15%']
        ]],
        ['Model governance', [
          ['Active model', 'MSANII-AVM-4.2'],
          ['Last reviewed', 'Nov 11, 2026'],
          ['Human override', 'Always available with audit logging']
        ]],
        ['Confidence policy', [
          ['High confidence', '≥ 80%'],
          ['Medium confidence', '60–79%'],
          ['Low confidence', '< 60%']
        ]]
      ]
    },
    'Automation': {
      intro: 'Manage scheduled discovery and alert delivery without automating A&R decisions.',
      panels: [
        ['Discovery schedule', [
          ['Run interval', 'Every 60 minutes'],
          ['Quiet hours', '21:00–07:00 EAT'],
          ['Time zone', 'Africa/Nairobi']
        ]],
        ['Notifications', [
          ['New high-confidence artist', 'In-app real-time banner'],
          ['Integrity velocity flag', 'Immediate triage alert'],
          ['Review reminder', 'Weekly A&R desk agenda']
        ]],
        ['Control guardrails', [
          ['Auto-sign contracts', 'Permanently disabled'],
          ['Human committee signoff', 'Always mandatory'],
          ['Pause automation', 'Available anytime']
        ]]
      ]
    },
    'Security and Audit': {
      intro: 'Security controls, cryptographic access history and accountable changes.',
      panels: [
        ['Security controls', [
          ['Sign-in posture', 'Allowlist invite-only'],
          ['Multi-factor authentication', 'Enforced for Admin & Lead'],
          ['Session policy', '30 minutes token expiration']
        ]],
        ['Audit coverage', [
          ['Signing decisions', 'SHA-256 signed & recorded'],
          ['Provider configuration', 'Immutable append-only ledger'],
          ['Data export actions', 'Logged with UID & timestamp']
        ]],
        ['Data governance', [
          ['Sensitive credentials', 'Zero client localStorage exposure'],
          ['Database tenant', 'Google Cloud Firestore ai-studio-3334bd27'],
          ['Access review', 'Quarterly seat verification']
        ]]
      ]
    }
  };

  const currentConfig = settingsData[activeTab];

  return (
    <>
      {/* 1. Workbench Quick Summary Card */}
      <article className="workbench-card" id="settings">
        <div className="workbench-title">
          <h3>⚙ SETTINGS</h3>
        </div>
        <p>Configure your workspace and platform preferences.</p>

        <div className="setting-list">
          {(['Workspace', 'Team and Access', 'Data Providers', 'Discovery', 'Scoring and Models', 'Automation', 'Security and Audit'] as MsaniiSettingTab[]).map(tab => (
            <button 
              key={tab}
              className={`setting-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab);
                onShowToast(`Settings tab: ${tab}`);
              }}
            >
              <span><i>▣</i>{tab}</span>
              <span>›</span>
            </button>
          ))}
        </div>
      </article>

      {/* 2. Expanded Settings Shell Section */}
      <section className="settings-section container mt-8" aria-label="Settings workspace detail">
        <div className="settings-shell">
          <div className="settings-head">
            <h3>⚙ Settings</h3>
            <span className="stage-chip">Workspace configuration</span>
          </div>

          <div className="settings-tabs" role="tablist" aria-label="Settings subsections">
            {(['Workspace', 'Team and Access', 'Data Providers', 'Discovery', 'Scoring and Models', 'Automation', 'Security and Audit'] as MsaniiSettingTab[]).map(tab => (
              <button 
                key={tab}
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="settings-content" id="settings-content">
            {currentConfig.panels.map(([title, rows], pIdx) => (
              <div key={title} className="settings-panel">
                <h4>{title}</h4>
                {rows.map(([label, val]) => (
                  <div key={label} className="form-row">
                    <label>{label}</label>
                    <input value={val} readOnly className="bg-slate-50 cursor-default" />
                  </div>
                ))}
                {pIdx === 1 && (
                  <p className="mt-3 text-[8px] text-[var(--muted)] leading-relaxed">
                    {currentConfig.intro}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};
