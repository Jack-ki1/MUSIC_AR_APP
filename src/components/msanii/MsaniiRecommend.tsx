import React, { useState } from 'react';
import { RealArtistData, ARDecision } from '../../types';

interface MsaniiRecommendProps {
  artists: RealArtistData[];
  onSelectArtist: (artist: RealArtistData) => void;
  onRecordDecision?: (artistId: string, decision: string, notes: string) => void;
  onShowToast: (msg: string) => void;
}

export const MsaniiRecommend: React.FC<MsaniiRecommendProps> = ({
  artists,
  onSelectArtist,
  onRecordDecision,
  onShowToast,
}) => {
  const [selectedTier, setSelectedTier] = useState<'PURSUE' | 'MEET' | 'WATCH' | 'MORE EVIDENCE'>('PURSUE');
  const [compareA, setCompareA] = useState(artists[0]?.id || '');
  const [compareB, setCompareB] = useState(artists[1]?.id || '');

  // Form State
  const [decisionAction, setDecisionAction] = useState('Schedule A&R meeting');
  const [decisionOwner, setDecisionOwner] = useState('A&R Lead');
  const [decisionDate, setDecisionDate] = useState('');
  const [decisionRationale, setDecisionRationale] = useState('');

  // Audit trail state
  const [auditList, setAuditList] = useState<Array<{ id: string; time: string; text: string; dotColor?: string }>>([
    {
      id: 'aud-1',
      time: 'Today, 10:42 AM',
      text: 'Zakìra moved to Pursue · A&R Lead',
      dotColor: 'var(--blue)'
    },
    {
      id: 'aud-2',
      time: 'Yesterday, 4:18 PM',
      text: 'Evidence pack updated · Research Team',
      dotColor: 'var(--lime)'
    },
    {
      id: 'aud-3',
      time: 'Nov 08, 2026',
      text: 'Artist added from discovery · System',
      dotColor: '#9da9b6'
    }
  ]);

  const activeArtist = artists.find(a => a.id === compareA) || artists[0];

  const handleDecisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newEntry = {
      id: 'aud-' + Date.now(),
      time: 'Just now',
      text: `${activeArtist?.name || 'Candidate'}: ${decisionAction} · ${decisionOwner} · ${decisionDate || 'Immediate'}`,
      dotColor: 'var(--lime)'
    };
    setAuditList([newEntry, ...auditList]);
    if (onRecordDecision && activeArtist) {
      onRecordDecision(activeArtist.id, decisionAction, decisionRationale || 'Submitted via MSANII A&R Workbench');
    }
    onShowToast(`Decision recorded: ${decisionAction} for ${activeArtist?.name || 'Artist'}`);
    setDecisionRationale('');
  };

  const getTierCount = (tier: string) => {
    switch (tier) {
      case 'PURSUE': return 2;
      case 'MEET': return 4;
      case 'WATCH': return 3;
      case 'MORE EVIDENCE': return 2;
      default: return 0;
    }
  };

  return (
    <>
      <article className="workbench-card" id="recommend">
        <div className="workbench-title">
          <h3>♧ RECOMMEND</h3>
          <span className="stage-chip">Decision workspace</span>
        </div>
        <p>Turn insights into confident A&amp;R decisions.</p>

        {/* Tier Tabs */}
        <div className="tier-tabs">
          {(['PURSUE', 'MEET', 'WATCH', 'MORE EVIDENCE'] as const).map(tier => (
            <button 
              key={tier}
              className={selectedTier === tier ? 'active' : ''}
              onClick={() => {
                setSelectedTier(tier);
                onShowToast(`Viewing ${tier} shortlist`);
              }}
            >
              {tier} ({getTierCount(tier)})
            </button>
          ))}
        </div>

        {/* Ranked Leaderboard */}
        <div className="rank-list" id="rank-list">
          {artists.slice(0, 3).map((a, i) => (
            <div 
              key={a.id} 
              className="rank-row"
              onClick={() => onSelectArtist(a)}
            >
              <span className="rank-num">{i + 1}</span>
              <div 
                className="rank-avatar"
                style={a.avatarUrl ? {
                  backgroundImage: `url(${a.avatarUrl})`,
                  backgroundSize: 'cover'
                } : undefined}
              >
                {!a.avatarUrl && a.name.charAt(0)}
              </div>
              <div>
                <strong>{a.name}</strong>
                <small>{a.city}, {a.country} · {a.primaryGenre}</small>
              </div>
              <span className="rank-score">
                {(a.combinedScore || 88).toFixed(0)}
              </span>
            </div>
          ))}
        </div>

        {/* Slicer Comparison Selectors */}
        <div className="rank-detail">
          <div>
            <label htmlFor="compare-a">Compare artist A</label>
            <select 
              id="compare-a"
              value={compareA}
              onChange={(e) => setCompareA(e.target.value)}
            >
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="compare-b">Compare artist B</label>
            <select 
              id="compare-b"
              value={compareB}
              onChange={(e) => setCompareB(e.target.value)}
            >
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <a 
          href="#recommend-detail" 
          className="btn btn-soft btn-small" 
          style={{ marginTop: '12px', width: '100%', textAlign: 'center' }}
        >
          View full recommendation →
        </a>
      </article>

      {/* Expanded Recommendation Dossier Detail */}
      <div className="recommend-detail container my-6" id="recommend-detail">
        <article className="detail-panel">
          <h4>{activeArtist?.name || 'Zakìra'} · Recommendation detail <span className="tier-chip">PURSUE</span></h4>
          <p>
            <b>Why:</b> Strong early audience momentum, distinctive sound and a growing creator ecosystem across Nairobi and neighbouring markets.
          </p>
          <ul>
            <li>Distinctive vocal identity and consistent release signals.</li>
            <li>Healthy creator spread across multiple communities.</li>
            <li>Opportunity to deepen regional live and editorial reach.</li>
          </ul>
          <p className="mt-2">
            <b>Risks / missing:</b> Audio review is ongoing; validate chain-of-title rights, live readiness and audience retention before financial commitment.
          </p>
        </article>

        <article className="detail-panel">
          <h4>Decision &amp; ownership</h4>
          <form className="decision-form" id="decision-form" onSubmit={handleDecisionSubmit}>
            <div>
              <label htmlFor="decision-action">Action</label>
              <select 
                id="decision-action"
                value={decisionAction}
                onChange={(e) => setDecisionAction(e.target.value)}
              >
                <option>Schedule A&amp;R meeting</option>
                <option>Request more evidence</option>
                <option>Move to watchlist</option>
                <option>Pass for now</option>
              </select>
            </div>

            <div>
              <label htmlFor="decision-owner">Owner</label>
              <select 
                id="decision-owner"
                value={decisionOwner}
                onChange={(e) => setDecisionOwner(e.target.value)}
              >
                <option>A&amp;R Lead</option>
                <option>Talent Scout</option>
                <option>Research Team</option>
              </select>
            </div>

            <div>
              <label htmlFor="decision-date">Follow-up date</label>
              <input 
                type="date" 
                id="decision-date" 
                value={decisionDate}
                onChange={(e) => setDecisionDate(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="decision-rationale">Rationale</label>
              <input 
                id="decision-rationale" 
                placeholder="Add decision rationale"
                value={decisionRationale}
                onChange={(e) => setDecisionRationale(e.target.value)}
              />
            </div>

            <div className="full">
              <button className="btn btn-primary btn-small" type="submit">
                Submit decision →
              </button>
            </div>
          </form>
        </article>

        <article className="detail-panel">
          <h4>Audit trail</h4>
          <div className="audit-list" id="audit-list">
            {auditList.map(item => (
              <div key={item.id} className="audit-item">
                <span className="audit-dot" style={{ background: item.dotColor || 'var(--blue)' }}></span>
                <span>
                  <b>{item.time}</b><br />
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="detail-panel">
          <h4>Compare shortlist</h4>
          <p>Compare up to three artists on artistic value, audience momentum, evidence confidence and integrity signals.</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
            {artists.slice(0, 3).map(a => (
              <span key={a.id} className="sample-chip">
                {a.name} · {(a.combinedScore || 88).toFixed(0)}
              </span>
            ))}
          </div>
          <p style={{ marginTop: '11px', fontSize: '8px', color: 'var(--muted)' }}>
            Decision support only. Final signing judgement remains with the human A&amp;R committee.
          </p>
        </article>
      </div>
    </>
  );
};
