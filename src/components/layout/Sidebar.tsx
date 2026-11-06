import React from 'react';
import { 
  Compass, 
  Activity, 
  Sparkles, 
  Settings as SettingsIcon, 
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { WorkspaceSection } from '../../types';

interface SidebarProps {
  currentSection: WorkspaceSection;
  onSelectSection: (section: WorkspaceSection) => void;
  candidateCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  candidateCount,
}) => {
  const navItems = [
    {
      id: 'discovery' as WorkspaceSection,
      label: 'Discovery',
      icon: Compass,
      badge: candidateCount > 0 ? String(candidateCount) : undefined,
    },
    {
      id: 'analyse' as WorkspaceSection,
      label: 'Analyze',
      icon: Activity,
    },
    {
      id: 'recommendations' as WorkspaceSection,
      label: 'Recommendations',
      icon: Sparkles,
    },
    {
      id: 'settings' as WorkspaceSection,
      label: 'Settings',
      icon: SettingsIcon,
    }
  ];

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-md border-r border-[rgba(120,140,190,0.2)] flex flex-col h-screen select-none shrink-0 z-30 p-4">
      {/* Brand Header matching attached index.html */}
      <div className="p-2 pb-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0B1530] flex items-center justify-center shadow-md shrink-0">
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none" stroke="#C8F51F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 8h3l2-6 3 12 3-10 2 4h7"/>
          </svg>
        </div>
        <div>
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-extrabold text-base tracking-tight text-[#0B1530]">Breakout</span>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-[#3B6CFF] to-[#7C5CFF] bg-clip-text text-transparent">Radar</span>
          </div>
          <p className="text-[10px] font-bold tracking-wider text-[#5F6B8A] uppercase mt-0.5">
            A&R INTELLIGENCE
          </p>
        </div>
      </div>

      <div className="my-1 h-[1px] bg-[rgba(120,140,190,0.2)]"></div>

      {/* Main Nav matching .nv / .nv.on in index.html */}
      <div className="py-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="text-[11px] font-bold tracking-wider text-[#5F6B8A] uppercase px-3 mb-2.5">
          WORKSPACE
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm transition-all duration-150 text-left cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-br from-[#DFE9FF] to-[#EDE7FF] text-[#3B6CFF] font-bold shadow-[0_14px_34px_-16px_rgba(59,92,170,0.35),inset_0_1px_0_#fff]'
                  : 'text-[#5F6B8A] hover:text-[#0B1530] hover:bg-white/70 font-semibold'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#3B6CFF]' : 'text-[#5F6B8A]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full transition-colors ${
                  isActive ? 'bg-[#3B6CFF] text-white' : 'bg-[#C8F51F] text-[#0B1530] shadow-xs'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sweep Schedule Card from index.html */}
      <div className="mt-auto pt-3 space-y-2.5">
        <div className="p-3.5 rounded-2xl bg-white/80 border border-[rgba(120,140,190,0.25)] shadow-[0_14px_34px_-16px_rgba(59,92,170,0.25),inset_0_1px_0_#fff] text-xs">
          <div className="flex items-center gap-2 text-[#0B1530] font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#3B6CFF]" />
            <span>Autonomous Sweep</span>
          </div>
          <p className="text-[11px] text-[#5F6B8A] mt-0.5">
            Mondays & Daily Loops: <strong className="text-[#12B76A]">Active</strong>
          </p>
        </div>

        {/* Bottom Profile Footer matching index.html */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/70 hover:bg-white transition-all cursor-pointer border border-[rgba(120,140,190,0.2)] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B6CFF] to-[#7C5CFF] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-[#0B1530] leading-tight">A&R Scout Operator</p>
              <p className="text-[10px] text-[#5F6B8A]">Workspace synced</p>
            </div>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#12B76A] ring-2 ring-emerald-200"></span>
        </div>
      </div>
    </aside>
  );
};
