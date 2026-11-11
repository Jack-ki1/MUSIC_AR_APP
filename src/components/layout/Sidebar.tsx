import React, { useEffect, useState } from 'react';
import { Home as HomeIcon, Compass, Activity, Sparkles, Settings as SettingsIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkspaceSection } from '../../types';
import { Pill } from '../../shared/ui/Pill';

interface SidebarProps {
  currentSection: WorkspaceSection;
  onSelectSection: (section: WorkspaceSection) => void;
  candidateCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/** Must stay in sync with the `max-width: 63.999rem` breakpoint in index.css
 *  (Tailwind's `lg` starts at 64rem, so the rail appears exactly when the
 *  topbar collapse button does). */
const MOBILE_QUERY = '(max-width: 63.999rem)';

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  candidateCount,
  collapsed = false,
  onToggleCollapse,
}) => {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Collapse only applies to the desktop rail — below the breakpoint the nav
  // always renders as a full-width horizontal bar so content stays reachable.
  const isCollapsed = collapsed && !isMobile;
  const canToggle = Boolean(onToggleCollapse) && !isMobile;

  const navItems = [
    { id: 'home' as WorkspaceSection, label: 'Home', icon: HomeIcon },
    { id: 'discovery' as WorkspaceSection, label: 'Discovery', icon: Compass, badge: candidateCount > 0 ? String(candidateCount) : undefined },
    { id: 'analyse' as WorkspaceSection, label: 'Analyze', icon: Activity },
    { id: 'recommendations' as WorkspaceSection, label: 'Recommendations', icon: Sparkles },
    { id: 'settings' as WorkspaceSection, label: 'Settings', icon: SettingsIcon },
  ];

  const asideCls = isMobile
    ? 'w-full flex flex-col bg-surface border-b border-line-strong select-none shrink-0 z-30'
    : `${isCollapsed ? 'w-14' : 'w-60'} h-full bg-surface border-r border-line-strong flex flex-col select-none shrink-0 z-30 transition-all duration-200`;

  return (
    <aside className={asideCls} aria-label="Workspace navigation">
      <div
        className={[
          'flex items-center border-b border-line-strong',
          isMobile ? 'px-3 py-2 shrink-0' : `px-2 py-2.5 ${isCollapsed ? 'justify-center' : 'justify-between'}`
        ].join(' ')}
      >
        <div className={`flex items-center gap-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-6 h-6 rounded-sm bg-brand-500 text-navy-900 flex items-center justify-center shrink-0">
            <svg width="13" height="9" viewBox="0 0 22 16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 8h3l2-6 3 12 3-10 2 4h7"/>
            </svg>
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <div className="text-xs font-mono font-semibold tracking-[0.06em] uppercase text-navy-700">Breakout Radar</div>
              <div className="text-2xs font-mono tracking-[0.1em] uppercase text-purple-500">A&amp;R Intelligence</div>
            </div>
          )}
        </div>
        {canToggle && (
          <button
            onClick={onToggleCollapse}
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
            aria-expanded={!isCollapsed}
            className="p-1 rounded-sm border border-line text-purple-500 hover:bg-purple-100 hover:text-navy-700 hover:border-line-strong transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {canToggle && isCollapsed && (
        <div className="px-2 py-1 border-b border-line-strong flex justify-center">
          <button
            onClick={onToggleCollapse}
            title="Expand sidebar"
            aria-label="Expand sidebar"
            aria-expanded={false}
            className="p-1 rounded-sm border border-line text-purple-500 hover:bg-purple-100 hover:text-navy-700 hover:border-line-strong transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className={isMobile ? 'min-w-0 overflow-x-auto' : 'px-2 py-2 flex-1'}>
        {!isMobile && !isCollapsed && (
          <div className="px-2 py-1.5 text-2xs font-mono font-semibold tracking-[0.14em] uppercase text-purple-500">Workspace</div>
        )}
        <nav
          aria-label="Sections"
          className={isMobile ? 'flex flex-row items-center gap-1 px-1 py-1.5 w-max' : 'space-y-0.5 mt-1'}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            const layout = isMobile
              ? 'flex-none'
              : isCollapsed ? 'w-full justify-center' : 'w-full justify-between';
            const spacing = isMobile ? 'px-2.5 py-1.5' : 'px-2.5 py-2';
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                title={isMobile ? undefined : (isCollapsed ? item.label : undefined)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-sm text-left cursor-pointer border transition-colors duration-150 whitespace-nowrap ${layout} ${spacing} ${
                  isActive
                    ? 'bg-brand-500 text-navy-900 border-brand-500'
                    : 'text-purple-500 bg-transparent border-transparent hover:bg-purple-100 hover:text-navy-700'
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-mono text-2xs font-semibold uppercase tracking-[0.08em] truncate">
                      {item.label}
                    </span>
                  )}
                </span>
                {!isCollapsed && item.badge && (
                  <Pill tone={isActive ? 'watch' : 'neutral'} solid={isActive}>
                    {item.badge}
                  </Pill>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {!isMobile && (
        <div className="mt-auto border-t border-line-strong px-2.5 py-2">
          {!isCollapsed ? (
            <>
              <div className="text-2xs font-mono font-semibold uppercase tracking-[0.1em] text-navy-700">A&amp;R Workspace</div>
              <div className="text-2xs text-purple-500 mt-0.5 font-mono">East Africa desk</div>
            </>
          ) : (
            <div className="text-2xs text-purple-500 text-center font-mono">EA</div>
          )}
        </div>
      )}
    </aside>
  );
};
