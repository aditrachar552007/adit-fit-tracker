import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Flame,
  Scale,
  Settings as SettingsIcon,
  RefreshCw,
} from 'lucide-react';
import { formatDisplayDate, formatDateOffset, getTodayDateString } from '../utils/storage';
import { TabType, HealthConnectStatus } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  streakCount: number;
  currentWeight: number;
  weightUnit: string;
  onOpenWeightModal: () => void;
  onOpenSettings: () => void;
  currentTab: TabType;
  healthStatus?: HealthConnectStatus;
  onSyncHealth?: () => void;
  isSyncing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  selectedDate,
  onSelectDate,
  streakCount,
  currentWeight,
  weightUnit,
  onOpenWeightModal,
  onOpenSettings,
  healthStatus,
  onSyncHealth,
  isSyncing = false,
}) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  const handlePrevDay = () => {
    onSelectDate(formatDateOffset(selectedDate, -1));
  };

  const handleNextDay = () => {
    onSelectDate(formatDateOffset(selectedDate, 1));
  };

  const handleGoToday = () => {
    onSelectDate(today);
  };

  return (
    <header className="bg-[#050B18]/70 backdrop-blur-2xl border-b border-white/[0.08] sticky top-0 z-40 px-3 py-2.5 sm:px-6 transition-all">
      <div className="flex items-center justify-between gap-1.5 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Mobile App Logo and Date Controls Capsule */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Mobile brand indicator */}
          <div className="flex md:hidden items-center shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00D9B5] to-[#00C8FF] flex items-center justify-center text-[#050B18] font-black text-xs shadow-md shadow-[#00D9B5]/20">
              AF
            </div>
          </div>

          {/* Date Picker Glass Capsule: [ < ] [ 📅 Date ] [ > ] */}
          <div className="flex items-center glass-capsule rounded-2xl p-0.5 sm:p-1 shrink min-w-0 transition-all hover:border-white/[0.18]">
            <button
              onClick={handlePrevDay}
              aria-label="Previous day"
              className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-xl text-[#9AA8BC] hover:text-[#F5F7FA] hover:bg-white/[0.08] active:scale-95 transition-all shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 text-xs sm:text-sm font-medium text-[#F5F7FA] truncate">
              <Calendar className="w-3.5 h-3.5 text-[#00D9B5] hidden sm:inline shrink-0" />
              <span className="truncate">{formatDisplayDate(selectedDate)}</span>
            </div>

            <button
              onClick={handleNextDay}
              aria-label="Next day"
              className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center rounded-xl text-[#9AA8BC] hover:text-[#F5F7FA] hover:bg-white/[0.08] active:scale-95 transition-all shrink-0"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {!isToday && (
            <button
              onClick={handleGoToday}
              className="hidden lg:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-[#00D9B5]/15 text-[#00D9B5] hover:bg-[#00D9B5]/25 border border-[#00D9B5]/30 active:scale-95 transition-all shrink-0"
            >
              Today
            </button>
          )}
        </div>

        {/* Right Actions: Floating Glass Capsules */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Sync Now button when Health Connect is connected */}
          {healthStatus?.isConnected && onSyncHealth && (
            <button
              onClick={onSyncHealth}
              disabled={isSyncing}
              title={healthStatus.lastSynced ? `Synced: ${healthStatus.lastSynced}` : 'Sync Health Connect'}
              className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center glass-capsule hover:bg-white/[0.08] text-[#00D9B5] rounded-2xl active:scale-95 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>
          )}

          {/* Streak Capsule */}
          <div className="flex items-center gap-1 sm:gap-1.5 glass-capsule px-2 sm:px-2.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-semibold text-[#FFB020]">
            <Flame className="w-3.5 h-3.5 fill-[#FFB020] shrink-0" />
            <span className="hidden sm:inline">Streak:</span>
            <span>{streakCount}d</span>
          </div>

          {/* Weight Capsule */}
          <button
            onClick={onOpenWeightModal}
            className="flex items-center gap-1 sm:gap-1.5 glass-capsule hover:bg-white/[0.08] px-2 sm:px-2.5 py-1.5 rounded-2xl text-[11px] sm:text-xs font-semibold text-[#F5F7FA] active:scale-95 transition-all"
            title="Log weight"
          >
            <Scale className="w-3.5 h-3.5 text-[#00D9B5] shrink-0" />
            <span className="truncate">{currentWeight || '--'} {weightUnit}</span>
          </button>

          {/* Settings Button (Touch target min 44px on mobile) */}
          <button
            onClick={onOpenSettings}
            aria-label="Settings"
            className="min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] flex items-center justify-center glass-capsule hover:bg-white/[0.08] text-[#9AA8BC] hover:text-[#F5F7FA] rounded-2xl active:scale-95 transition-all"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
