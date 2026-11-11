import React from 'react';
import { Search, Command, PanelLeft } from 'lucide-react';

interface TopbarProps {
  onOpenGlobalSearch: () => void;
  apiConnected?: boolean;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

/** Unified command bar: rail toggle · search field with ⌘K · telemetry status. */
export const Topbar: React.FC<TopbarProps> = ({
  onOpenGlobalSearch,
  apiConnected = true,
  sidebarCollapsed = false,
  onToggleSidebar,
}) => {
  return (
    <header className="h-11 shrink-0 flex items-center gap-2 px-3 border-b border-line-strong bg-surface sticky top-0 z-20">
      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!sidebarCollapsed}
          className="hidden lg:flex shrink-0 items-center justify-center w-7 h-7 rounded-sm border border-line text-purple-500 hover:text-navy-700 hover:border-line-strong transition-colors cursor-pointer"
        >
          <PanelLeft className="w-3.5 h-3.5" />
        </button>
      )}

      <button
        onClick={onOpenGlobalSearch}
        className="flex-1 min-w-0 max-w-md flex items-center gap-2 h-7 px-2 rounded-sm bg-surface-sunken border border-line text-purple-500 hover:border-line-strong transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 min-w-0 text-left text-xs truncate">
          Search artists, tracks, regions…
        </span>
        <span className="hidden sm:flex shrink-0 items-center gap-0.5 h-5 px-1.5 rounded-sm border border-line bg-surface text-2xs font-mono text-purple-500">
          <Command className="w-3 h-3" />K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 h-6 px-2 rounded-sm border text-2xs font-mono font-semibold uppercase tracking-[0.08em] ${
            apiConnected
              ? 'border-line-strong text-purple-500'
              : 'border-danger-600 text-danger-600'
          }`}
          title={apiConnected ? 'Backend telemetry link established' : 'Running on local fixtures'}
        >
          <span className={`w-1.5 h-1.5 ${apiConnected ? 'bg-success-600' : 'bg-danger-600'}`} />
          {apiConnected ? 'API LIVE' : 'API LOCAL'}
        </span>
        <span className="w-6 h-6 flex items-center justify-center rounded-sm border border-line-strong bg-surface-subtle text-2xs font-mono font-semibold text-navy-700">
          A
        </span>
      </div>
    </header>
  );
};
