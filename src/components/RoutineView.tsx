import React from 'react';
import {
  Check,
  Flame,
  Award,
  Droplet,
  Coffee,
  GlassWater,
  Footprints,
  Salad,
  Apple,
  Moon,
  BedDouble,
  History,
} from 'lucide-react';
import { DayLog, UserProfile } from '../types';
import { DEFAULT_HABITS } from '../utils/constants';
import { formatDateOffset, formatDisplayDate, getTodayDateString } from '../utils/storage';

interface RoutineViewProps {
  dayLog: DayLog;
  allLogs: Record<string, DayLog>;
  profile: UserProfile;
  streakCount: number;
  onToggleHabit: (habitKey: string) => void;
  onSelectDate: (date: string) => void;
  selectedDate: string;
}

export const RoutineView: React.FC<RoutineViewProps> = ({
  dayLog,
  allLogs,
  profile,
  streakCount,
  onToggleHabit,
  onSelectDate,
  selectedDate,
}) => {
  const today = getTodayDateString();
  const isToday = selectedDate === today;

  const habitIcons: Record<string, React.ElementType> = {
    morningWater: Droplet,
    breakfast: Coffee,
    waterTarget: GlassWater,
    walking: Footprints,
    healthyLunch: Salad,
    healthySnack: Apple,
    lightDinner: Moon,
    goodSleep: BedDouble,
  };

  const completedCount = Object.values(dayLog.habits || {}).filter(Boolean).length;
  const totalCount = DEFAULT_HABITS.length;
  const completionPercentage = Math.round((completedCount / totalCount) * 100);

  // Generate last 7 days for the consistency matrix
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = formatDateOffset(today, -6 + i);
    const log = allLogs[d];
    const completed = log ? Object.values(log.habits || {}).filter(Boolean).length : 0;
    return {
      date: d,
      completed,
      total: totalCount,
      percentage: Math.round((completed / totalCount) * 100),
      isCurrentSelected: d === selectedDate,
      isToday: d === today,
    };
  });

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Top Hero Glass Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all hover:border-white/[0.16]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#00D9B5] tracking-wide uppercase">
              {isToday ? 'Fresh Day Started' : 'Historical Archive'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Daily Routine Checklist
            </h2>
            <p className="text-[#9AA8BC] text-sm max-w-xl leading-relaxed">
              {completedCount} of {totalCount} completed today. Consistent daily habits compound into lasting vitality.
            </p>
          </div>

          {/* Quick Streak & Progress Pill */}
          <div className="flex items-center gap-4 glass-panel-subtle p-4 rounded-2xl border border-white/[0.08] shrink-0">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1.5 text-[#FFB020] text-lg sm:text-xl font-black">
                <Flame className="w-5 h-5 fill-[#FFB020]" />
                <span>{streakCount} {streakCount === 1 ? 'Day' : 'Days'}</span>
              </div>
              <span className="text-[11px] text-[#9AA8BC]">Current Streak</span>
            </div>

            <div className="w-[1px] h-9 bg-white/[0.08]" />

            <div className="flex flex-col items-center">
              <div className="text-[#00D9B5] text-lg sm:text-xl font-black">
                {completedCount} / {totalCount}
              </div>
              <span className="text-[11px] text-[#9AA8BC]">{completionPercentage}% Completed</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/[0.06] rounded-full h-1.5 mt-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] h-full rounded-full transition-all duration-700 ease-out shadow-sm shadow-[#00D9B5]/30"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* 7-Day Consistency Matrix */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#00D9B5]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F5F7FA] uppercase tracking-wider">
              7-Day Habit Consistency
            </h3>
          </div>
          <span className="text-xs text-[#9AA8BC]">Tap a day to inspect</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {last7Days.map((day) => {
            const [y, m, d] = day.date.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });
            const dayNum = dateObj.getDate();

            return (
              <button
                key={day.date}
                onClick={() => onSelectDate(day.date)}
                className={`flex flex-col items-center p-2 rounded-xl border transition-all duration-200 active:scale-95 ${
                  day.isCurrentSelected
                    ? 'bg-[#00D9B5]/[0.16] border-[#00D9B5]/40 text-[#F5F7FA] shadow-md shadow-[#00D9B5]/10'
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] text-[#9AA8BC]'
                }`}
              >
                <span className="text-[10px] font-semibold text-[#66758A]">{dayName}</span>
                <span className="text-xs font-bold text-[#F5F7FA] my-1">{dayNum}</span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    day.percentage === 100
                      ? 'bg-[#20D68A] text-[#050B18] shadow-sm shadow-[#20D68A]/30'
                      : day.percentage >= 50
                      ? 'bg-[#00D9B5]/25 text-[#00D9B5]'
                      : day.percentage > 0
                      ? 'bg-white/[0.08] text-[#F5F7FA]'
                      : 'bg-white/[0.03] text-[#66758A]'
                  }`}
                >
                  {day.completed}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routine Checkboxes List */}
      <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
          <div>
            <h3 className="font-bold text-[#F5F7FA] text-lg">
              Routine for {formatDisplayDate(selectedDate)}
            </h3>
            <p className="text-xs text-[#9AA8BC]">
              {completedCount} of {totalCount} completed today
            </p>
          </div>
          {completedCount === totalCount && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#20D68A]/15 text-[#20D68A] text-xs font-bold border border-[#20D68A]/30 shadow-sm shadow-[#20D68A]/10">
              <Award className="w-4 h-4" />
              <span>All 8 Completed! 🎉</span>
            </div>
          )}
        </div>

        <div className="space-y-2.5 pt-2">
          {DEFAULT_HABITS.map((habit, index) => {
            const isChecked = !!dayLog.habits[habit.key];
            const Icon = habitIcons[habit.key] || Check;

            return (
              <div
                key={habit.key}
                onClick={() => onToggleHabit(habit.key)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none ${
                  isChecked
                    ? 'bg-[#00D9B5]/[0.07] border-[#00D9B5]/30 shadow-sm'
                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.07] hover:border-white/[0.14]'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Tactile circular checkbox with smooth check animation and subtle green glow */}
                  <button
                    type="button"
                    aria-label={`Toggle ${habit.label}`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 shrink-0 ${
                      isChecked
                        ? 'bg-[#20D68A] text-[#050B18] shadow-md shadow-[#20D68A]/30 scale-105'
                        : 'border-2 border-[#66758A] hover:border-[#00D9B5] bg-transparent'
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Habit Icon Container */}
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      isChecked
                        ? 'bg-[#20D68A]/15 text-[#20D68A] border border-[#20D68A]/25'
                        : 'bg-white/[0.04] text-[#9AA8BC] border border-white/[0.06]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Habit Content */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm sm:text-base font-semibold transition-colors ${
                          isChecked ? 'line-through text-[#66758A]' : 'text-[#F5F7FA]'
                        }`}
                      >
                        {habit.label}
                      </p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] text-[#66758A]">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-[#9AA8BC] mt-0.5">{habit.sublabel}</p>
                  </div>
                </div>

                {/* Status tag */}
                <div className="shrink-0 ml-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
                      isChecked
                        ? 'bg-[#20D68A]/15 text-[#20D68A] border border-[#20D68A]/30 shadow-sm shadow-[#20D68A]/10'
                        : 'bg-white/[0.04] text-[#66758A] border border-white/[0.06]'
                    }`}
                  >
                    {isChecked ? 'Completed' : 'To Do'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-white/[0.06] text-center text-xs text-[#9AA8BC]">
          Tip: Complete all 8 habits daily to build resilient momentum and close your health loop.
        </div>
      </div>
    </div>
  );
};
