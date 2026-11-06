import React from 'react';
import { Search, Command, Radio, Sparkles } from 'lucide-react';

interface TopbarProps {
  onOpenGlobalSearch: () => void;
  apiConnected?: boolean;
}

export const Topbar: React.FC<TopbarProps> = ({
  onOpenGlobalSearch,
  apiConnected = true,
}) => {
  return (
    <header className="h-18 px-8 flex items-center justify-between sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-[rgba(120,140,190,0.2)]">
      {/* Global Search Bar (⌘K) matching pill design from index.html */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onOpenGlobalSearch}
          className="w-full flex items-center justify-between bg-white hover:bg-[#F8FAFC] border border-[rgba(120,140,190,0.25)] rounded-full px-5 py-2.5 text-xs text-[#5F6B8A] transition-all shadow-[0_14px_34px_-16px_rgba(59,92,170,0.25),inset_0_1px_0_#fff] group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-[#5F6B8A] group-hover:text-[#3B6CFF] transition-colors" />
            <span className="text-xs text-[#5F6B8A] font-medium">Search artist, city, genre...</span>
          </div>
          <div className="flex items-center gap-1 bg-[#F1F5F9] border border-[rgba(120,140,190,0.2)] px-2 py-0.5 rounded-full text-[10px] font-mono text-[#5F6B8A] font-bold">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </button>
      </div>

      {/* Right controls matching index.html */}
      <div className="flex items-center gap-4 ml-6">
        {/* API Connected status indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[rgba(120,140,190,0.2)] shadow-2xs text-xs font-bold text-[#0B1530]">
          <span className="w-2 h-2 rounded-full bg-[#12B76A] animate-pulse"></span>
          <span>API Connected</span>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B6CFF] to-[#7C5CFF] text-white font-black text-xs flex items-center justify-center border-2 border-white shadow-xs">
          A
        </div>
      </div>
    </header>
  );
};
