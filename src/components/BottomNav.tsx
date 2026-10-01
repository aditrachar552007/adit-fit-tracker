import React from 'react';
import {
  LayoutDashboard,
  Utensils,
  CheckSquare,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { TabType } from '../types';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingHabitsCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  pendingHabitsCount = 0,
}) => {
  const tabs: { id: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'diet', label: 'Diet', icon: Utensils },
    { id: 'routine', label: 'Routine', icon: CheckSquare, badge: pendingHabitsCount > 0 ? pendingHabitsCount : undefined },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'coach', label: 'AI', icon: Sparkles },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#050B18]/90 backdrop-blur-2xl border-t border-white/[0.08] z-50 px-2 py-1.5 safe-area-pb shadow-2xl">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`min-h-[48px] min-w-[48px] relative flex flex-col items-center justify-center px-2 rounded-2xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-[#00D9B5]'
                  : 'text-[#66758A] hover:text-[#9AA8BC]'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-[#00D9B5]' : ''
                  }`}
                />
                {tab.badge !== undefined && (
                  <span className="absolute -top-1 -right-2.5 bg-[#00D9B5] text-[#050B18] font-bold text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-md shadow-[#00D9B5]/40">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] mt-0.5 tracking-tight font-medium transition-colors ${
                  isActive ? 'text-[#F5F7FA] font-bold' : 'text-[#66758A]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#00D9B5] mt-0.5 shadow-sm shadow-[#00D9B5]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
