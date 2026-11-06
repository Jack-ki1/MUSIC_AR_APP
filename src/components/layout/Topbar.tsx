import React from 'react';
import { Search, Command } from 'lucide-react';

interface TopbarProps {
  onOpenGlobalSearch: () => void;
  apiConnected?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenGlobalSearch,
  apiConnected = true,
}) => {
  return (
    <header className="h-16 border-b border-[#E5E9F3] bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar (⌘K) matching screenshot */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#64748B] transition-all group shadow-2xs"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2563EB] transition-colors" />
            <span className="text-xs text-[#64748B]">Search artist, city, genre...</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] border border-[#E2E8F0] px-2 py-0.5 rounded text-[10px] font-mono text-[#64748B]">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right controls matching screenshot */}
      <div className="flex items-center gap-4 ml-6">
        {/* API Connected status indicator */}
        <div className="flex items-center gap-2 text-xs font-medium text-[#334155]">
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
          <span>API connected</span>
        </div>

        {/* User avatar "A" */}
        <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4338CA] font-bold text-xs flex items-center justify-center border border-[#E0E7FF] shadow-2xs">
          A
        </div>
      </div>
    </header>
  );
};
