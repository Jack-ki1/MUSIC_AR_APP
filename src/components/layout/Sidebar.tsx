import React from 'react';
import { 
  Compass, 
  Activity, 
  Sparkles, 
  Settings as SettingsIcon, 
  Music
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
      label: 'Recommend',
      icon: Sparkles,
    },
    {
      id: 'settings' as WorkspaceSection,
      label: 'Settings',
      icon: SettingsIcon,
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#E5E9F3] flex flex-col h-screen select-none shrink-0 z-30">
      {/* Brand Header matching screenshot */}
      <div className="p-6 pb-5 flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#0F172A] shadow-md shadow-slate-900/10">
          <Music className="w-5 h-5 text-[#38BDF8]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5 leading-tight">
            <span className="font-extrabold text-sm tracking-tight text-[#0F172A]">BREAKOUT</span>
            <span className="font-extrabold text-sm tracking-tight text-[#2563EB]">RADAR</span>
          </div>
          <p className="text-[10px] font-bold tracking-wider text-[#64748B] uppercase mt-0.5">
            A&R INTELLIGENCE
          </p>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="h-[1px] bg-[#E5E9F3]"></div>
      </div>

      {/* Main Nav */}
      <div className="px-4 py-3 space-y-1.5 flex-1 overflow-y-auto">
        <div className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase px-3 mb-2.5">
          WORKSPACE
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 text-left ${
                isActive
                  ? 'bg-[#F5F3FF] border-2 border-[#7155F5] text-[#5425D5] font-semibold shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] border-2 border-transparent font-medium'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#7155F5]' : 'text-[#64748B]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-[#7155F5] text-white' : 'bg-[#F1F5F9] text-[#64748B]'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Profile Footer matching screenshot */}
      <div className="p-4 border-t border-[#E5E9F3] bg-white">
        <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-[#F8FAFC] transition-colors cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EEF2FF] text-[#4338CA] font-bold text-xs flex items-center justify-center">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-[#0F172A] leading-tight">Workspace operator</p>
              <p className="text-[11px] text-[#64748B]">Local workspace</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
        </div>
      </div>
    </aside>
  );
};
