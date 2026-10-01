import React from 'react';
import {
  LayoutDashboard,
  Utensils,
  CheckSquare,
  TrendingUp,
  Sparkles,
  Settings,
  Flame,
  ChevronRight,
} from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface SidebarProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  profile: UserProfile;
  dailyCompletion: number;
  streakCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  dailyCompletion,
  streakCount,
}) => {
  const navItems: { id: TabType; label: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'diet', label: 'Diet & Meals', icon: Utensils },
    { id: 'routine', label: 'Daily Routine', icon: CheckSquare, badge: '8 habits' },
    { id: 'progress', label: 'Progress & Stats', icon: TrendingUp },
    { id: 'coach', label: 'AI Coach', icon: Sparkles, badge: 'AI' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0A1222]/70 backdrop-blur-2xl border-r border-white/[0.08] text-[#F5F7FA] h-screen sticky top-0 p-5 select-none shrink-0 z-30 shadow-2xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-6 px-1.5">
        {/* Rounded square logo with teal gradient, subtle glow, white AF */}
        <div className="relative group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00D9B5] to-[#00C8FF] flex items-center justify-center shadow-lg shadow-[#00D9B5]/25 text-[#050B18] font-black text-base tracking-tight transition-transform duration-300 group-hover:scale-105">
            AF
          </div>
          <div className="absolute inset-0 rounded-2xl bg-[#00D9B5] opacity-20 blur-md -z-10 group-hover:opacity-40 transition-opacity" />
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-bold text-base tracking-tight text-[#F5F7FA]">
              Adit Fit
            </h1>
            {/* Small glass badge for Tracker */}
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] backdrop-blur-md text-[#00D9B5] font-semibold border border-white/[0.10] shadow-sm">
              Tracker
            </span>
          </div>
          <p className="text-[11px] text-[#9AA8BC] tracking-wide mt-0.5">Health & Routine</p>
        </div>
      </div>

      {/* User Progress Glass Card */}
      <div className="glass-panel-subtle rounded-2xl p-4 mb-6 border border-white/[0.08] shadow-lg shadow-black/20">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#00D9B5]/15 text-[#00D9B5] font-bold text-xs flex items-center justify-center border border-[#00D9B5]/30 shadow-sm">
              {profile.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F5F7FA] leading-tight">{profile.name}</p>
              <p className="text-[11px] text-[#9AA8BC]">Goal: {profile.weightGoal} {profile.weightUnit}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#FFB020]/10 border border-[#FFB020]/30 px-2 py-0.5 rounded-full text-[#FFB020] text-xs font-semibold">
            <Flame className="w-3.5 h-3.5 fill-[#FFB020]" />
            <span>{streakCount}d</span>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#9AA8BC]">Today's Progress</span>
            <span className="font-bold text-[#00D9B5]">{dailyCompletion}%</span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] h-full rounded-full transition-all duration-700 ease-out shadow-sm shadow-[#00D9B5]/30"
              style={{ width: `${dailyCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-[#00D9B5]/[0.14] text-[#F5F7FA] shadow-sm shadow-[#00D9B5]/10 border border-[#00D9B5]/25'
                  : 'text-[#9AA8BC] hover:bg-[#00D9B5]/[0.08] hover:text-[#F5F7FA]'
              }`}
            >
              {/* Left accent indicator for active state */}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-[#00D9B5] rounded-r-full shadow-sm shadow-[#00D9B5]" />
              )}

              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#00D9B5]' : 'text-[#66758A]'
                  }`}
                />
                <span className={isActive ? 'font-semibold text-white' : ''}>{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      item.id === 'coach'
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-white/[0.06] text-[#9AA8BC] border border-white/[0.08]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#00D9B5]" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer Preference Badge */}
      <div className="pt-4 border-t border-white/[0.08] mt-auto">
        <div className="flex items-center justify-between text-xs text-[#9AA8BC] px-1">
          <span className="flex items-center gap-2 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#00D9B5] inline-block shadow-sm shadow-[#00D9B5]" />
            {profile.dietaryPreference}
          </span>
          <span className="text-[11px] font-mono text-[#66758A]">{profile.caloriesGoal} kcal</span>
        </div>
      </div>
    </aside>
  );
};
