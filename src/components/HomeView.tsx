import React, { useMemo } from 'react';
import {
  Scale,
  Footprints,
  Droplets,
  Timer,
  Flame,
  Check,
  Plus,
  Minus,
  Utensils,
  ArrowRight,
  Sparkles,
  TrendingDown,
  Activity,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { DayLog, TabType, UserProfile, HealthConnectStatus } from '../types';
import { calculateDailyTotals, calculateOverallCompletion, formatDateOffset, formatDisplayDate, getTodayDateString } from '../utils/storage';
import { DEFAULT_HABITS } from '../utils/constants';

interface HomeViewProps {
  dayLog: DayLog;
  allLogs: Record<string, DayLog>;
  profile: UserProfile;
  healthStatus?: HealthConnectStatus;
  onUpdateDayLog: (updated: Partial<DayLog>) => void;
  onToggleHabit: (habitKey: string) => void;
  onNavigateTab: (tab: TabType) => void;
  onOpenWeightModal: () => void;
  onAskCoachQuestion: (question: string) => void;
  onSyncHealth?: () => void;
  isSyncing?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  dayLog,
  allLogs,
  profile,
  healthStatus,
  onUpdateDayLog,
  onToggleHabit,
  onNavigateTab,
  onOpenWeightModal,
  onAskCoachQuestion,
  onSyncHealth,
  isSyncing = false,
}) => {
  const { totalCalories, totalProtein, completedHabits, totalHabits } = calculateDailyTotals(dayLog);
  const overallPercentage = calculateOverallCompletion(dayLog, profile);

  // Water calculations
  const waterGlasses = Math.round(dayLog.waterMl / 250);
  const targetGlasses = Math.round(profile.waterGoalMl / 250);
  const waterProgress = Math.min(100, Math.round((dayLog.waterMl / profile.waterGoalMl) * 100));

  // Steps calculations
  const stepsProgress = Math.min(100, Math.round((dayLog.steps / profile.stepsGoal) * 100));
  const kmWalked = (dayLog.steps * 0.00075).toFixed(1);

  // Weekly & Monthly steps calculated from history
  const today = getTodayDateString();
  const { weeklySteps, monthlySteps } = useMemo(() => {
    let weekTotal = 0;
    let monthTotal = 0;

    for (let i = 0; i < 30; i++) {
      const dateStr = formatDateOffset(today, -i);
      const log = allLogs[dateStr];
      const steps = log?.steps || 0;
      if (i < 7) {
        weekTotal += steps;
      }
      monthTotal += steps;
    }
    return { weeklySteps: weekTotal, monthlySteps: monthTotal };
  }, [allLogs, today]);

  // Active minutes
  const activeProgress = Math.min(100, Math.round((dayLog.activeMinutes / profile.activeMinutesGoal) * 100));

  // Calories remaining
  const caloriesRemaining = Math.max(0, profile.caloriesGoal - totalCalories);
  const proteinRemaining = Math.max(0, profile.proteinGoalGrams - totalProtein);

  // Weight diff
  const currentW = dayLog.weight || profile.currentWeight;
  const weightToGoal = Math.abs(currentW - profile.weightGoal).toFixed(1);
  const isGoalReached = currentW <= profile.weightGoal;

  // Health data source indicators
  const isStepsFromHealthConnect = healthStatus?.isConnected && healthStatus.permissions.steps && dayLog.stepsSource === 'health_connect';
  const isWeightFromHealthConnect = healthStatus?.isConnected && healthStatus.permissions.weight && dayLog.weightSource === 'health_connect';

  // Quick water adjustments
  const addWater = (ml: number) => {
    const updated = Math.max(0, (dayLog.waterMl || 0) + ml);
    onUpdateDayLog({ waterMl: updated });
  };

  // Quick steps adjustments
  const addSteps = (stepsToAdd: number) => {
    const updated = Math.max(0, (dayLog.steps || 0) + stepsToAdd);
    const newBurn = Math.round(updated * 0.045 + (dayLog.activeMinutes || 0) * 6);
    onUpdateDayLog({ steps: updated, caloriesBurned: newBurn, stepsSource: 'manual' });
  };

  // Quick active minutes adjustments
  const addActiveMinutes = (mins: number) => {
    const updated = Math.max(0, (dayLog.activeMinutes || 0) + mins);
    const newBurn = Math.round((dayLog.steps || 0) * 0.045 + updated * 6);
    onUpdateDayLog({ activeMinutes: updated, caloriesBurned: newBurn, activeMinutesSource: 'manual' });
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Hero Section: Responsive Glass Hero Card */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-5 sm:p-7 transition-all hover:border-white/[0.16]">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#00D9B5]/[0.08] to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#00D9B5] tracking-wide uppercase">
                {formatDisplayDate(dayLog.date)}
              </span>
              {healthStatus?.isConnected ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00D9B5]/15 text-[#00D9B5] font-semibold border border-[#00D9B5]/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00D9B5] animate-pulse" />
                  Health Connect Active
                </span>
              ) : (
                <button
                  onClick={() => onNavigateTab('settings')}
                  className="text-[10px] px-2 py-0.5 rounded-full glass-capsule text-[#9AA8BC] hover:text-[#00D9B5] font-medium flex items-center gap-1 transition"
                >
                  <Activity className="w-3 h-3 text-[#00D9B5]" />
                  <span>Connect Health Data</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F7FA] tracking-tight">
              Keep pushing, {profile.name}! 🚀
            </h2>
            <p className="text-[#9AA8BC] text-xs sm:text-sm leading-relaxed">
              You are at <span className="font-bold text-[#00D9B5]">{overallPercentage}%</span> of your daily health targets.
              {overallPercentage >= 80
                ? ' Outstanding consistency today, you are crushing your health rings!'
                : ' Track your water, steps, and routine habits to complete your day.'}
            </p>
          </div>

          {/* Circular Progress Indicator with subtle teal/cyan gradient */}
          <div className="flex items-center gap-4 sm:gap-5 glass-panel-subtle p-3.5 sm:p-4 rounded-2xl border border-white/[0.08] shrink-0 self-start md:self-auto shadow-inner">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="rgba(255, 255, 255, 0.08)"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#heroProgressGradient)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * overallPercentage) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
                <defs>
                  <linearGradient id="heroProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00D9B5" />
                    <stop offset="100%" stopColor="#00C8FF" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-[#F5F7FA] tracking-tight">{overallPercentage}%</span>
                <span className="text-[10px] text-[#9AA8BC] font-medium">Daily</span>
              </div>
            </div>

            <div className="text-xs space-y-1.5 min-w-0">
              <div className="text-[#66758A] font-semibold uppercase tracking-wider text-[10px]">Breakdown:</div>
              <div className="flex items-center gap-2 text-[#F5F7FA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00D9B5] shrink-0" />
                <span className="text-[#9AA8BC]">Habits:</span>
                <span className="font-semibold">{completedHabits}/{totalHabits}</span>
              </div>
              <div className="flex items-center gap-2 text-[#F5F7FA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C8FF] shrink-0" />
                <span className="text-[#9AA8BC]">Water:</span>
                <span className="font-semibold">{waterGlasses}/{targetGlasses}</span>
              </div>
              <div className="flex items-center gap-2 text-[#F5F7FA]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4D9FFF] shrink-0" />
                <span className="text-[#9AA8BC]">Steps:</span>
                <span className="font-semibold truncate">{dayLog.steps.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards: 1-col on mobile, 2-col on tablet, 4-col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Weight Card */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between animate-card-1">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#00D9B5]/10 text-[#00D9B5] flex items-center justify-center border border-[#00D9B5]/20 shadow-sm shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Weight</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/[0.04] text-[#9AA8BC] border border-white/[0.06]">
                      {isWeightFromHealthConnect ? 'Health Connect' : 'Manual'}
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-[#F5F7FA] tracking-tight mt-0.5">
                    {currentW} <span className="text-sm font-medium text-[#9AA8BC]">{profile.weightUnit}</span>
                  </h3>
                </div>
              </div>
              <button
                onClick={onOpenWeightModal}
                className="min-h-[44px] px-3 flex items-center justify-center text-xs font-semibold rounded-xl glass-capsule text-[#00D9B5] hover:bg-white/[0.08] active:scale-95 transition-all"
              >
                Update
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs mt-3">
            <span className="text-[#9AA8BC]">Target: {profile.weightGoal} {profile.weightUnit}</span>
            <span className="flex items-center gap-1 text-[#00D9B5] font-semibold">
              <TrendingDown className="w-3.5 h-3.5" />
              {isGoalReached ? 'Goal Reached! 🎉' : `${weightToGoal} ${profile.weightUnit} to goal`}
            </span>
          </div>
        </div>

        {/* 2. Steps Card: Health Connect Sync support + Weekly & Monthly breakdown */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between animate-card-2">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#00C8FF]/10 text-[#00C8FF] flex items-center justify-center border border-[#00C8FF]/20 shadow-sm shrink-0">
                  <Footprints className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Steps</span>
                    {isStepsFromHealthConnect ? (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-[#00D9B5]/15 text-[#00D9B5] font-semibold border border-[#00D9B5]/30">
                        Health Connect
                      </span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-white/[0.04] text-[#9AA8BC] border border-white/[0.06]">
                        Manual
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-black text-[#F5F7FA] tracking-tight mt-0.5">
                    {dayLog.steps.toLocaleString()}
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold text-[#00C8FF]">{stepsProgress}%</span>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-1.5 my-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${stepsProgress}%` }}
              />
            </div>

            {/* Weekly & Monthly Steps summary */}
            <div className="flex items-center justify-between text-[11px] text-[#9AA8BC] py-1">
              <span>Goal: {profile.stepsGoal.toLocaleString()}</span>
              <span>Week: {weeklySteps.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#9AA8BC] pt-2 border-t border-white/[0.06]">
            <span>{kmWalked} km walked</span>
            {healthStatus?.isConnected ? (
              <button
                onClick={onSyncHealth}
                disabled={isSyncing}
                className="min-h-[36px] px-2.5 py-1 rounded-lg glass-capsule text-[#00D9B5] hover:bg-white/[0.10] active:scale-95 transition-all text-[11px] font-medium flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => addSteps(500)}
                  className="min-h-[36px] px-2 py-1 rounded-lg glass-capsule text-[#F5F7FA] hover:bg-white/[0.10] active:scale-95 transition-all text-[11px] font-medium"
                >
                  +500
                </button>
                <button
                  onClick={() => addSteps(1000)}
                  className="min-h-[36px] px-2 py-1 rounded-lg glass-capsule text-[#F5F7FA] hover:bg-white/[0.10] active:scale-95 transition-all text-[11px] font-medium"
                >
                  +1k
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. Water Card 💧 */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between animate-card-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4D9FFF]/10 text-[#4D9FFF] flex items-center justify-center border border-[#4D9FFF]/20 shadow-sm shrink-0">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Water 💧</span>
                  <h3 className="text-2xl font-black text-[#F5F7FA] tracking-tight mt-0.5">
                    {(dayLog.waterMl / 1000).toFixed(1)} <span className="text-sm font-medium text-[#9AA8BC]">/ {(profile.waterGoalMl / 1000).toFixed(1)} L</span>
                  </h3>
                </div>
              </div>
              <span className="text-xs font-bold text-[#4D9FFF]">{waterProgress}%</span>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-1.5 my-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#00C8FF] to-[#4D9FFF] h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${waterProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
            <span className="text-[#9AA8BC]">{waterGlasses} of {targetGlasses} glasses</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => addWater(-250)}
                disabled={dayLog.waterMl <= 0}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg glass-capsule text-[#9AA8BC] hover:text-[#F5F7FA] disabled:opacity-30 active:scale-95 transition-all"
                title="Minus 1 glass"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => addWater(250)}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-[#4D9FFF]/15 hover:bg-[#4D9FFF]/25 text-[#4D9FFF] font-semibold text-[11px] border border-[#4D9FFF]/30 active:scale-95 transition-all flex items-center justify-center"
              >
                +250ml
              </button>
            </div>
          </div>
        </div>

        {/* 4. Active Minutes Card */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-5 flex flex-col justify-between animate-card-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#FFB020]/10 text-[#FFB020] flex items-center justify-center border border-[#FFB020]/20 shadow-sm shrink-0">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">Active Time</span>
                  <h3 className="text-2xl font-black text-[#F5F7FA] tracking-tight mt-0.5">
                    {dayLog.activeMinutes} <span className="text-sm font-medium text-[#9AA8BC]">/ {profile.activeMinutesGoal} min</span>
                  </h3>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#FFB020] font-bold">
                <Flame className="w-3.5 h-3.5 fill-[#FFB020]" />
                <span>{dayLog.caloriesBurned} kcal</span>
              </div>
            </div>

            <div className="w-full bg-white/[0.06] rounded-full h-1.5 my-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FFB020] to-[#FF5C6C] h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${activeProgress}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/[0.06]">
            <span className="text-[#9AA8BC]">{activeProgress}% of goal</span>
            <button
              onClick={() => addActiveMinutes(15)}
              className="min-h-[36px] px-2.5 py-1 rounded-lg glass-capsule text-[#F5F7FA] hover:bg-white/[0.10] active:scale-95 transition-all text-[11px] font-medium"
            >
              +15m
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Daily Routine Snapshot & Diet Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Daily Routine Habits Checklist (Glass Card) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#00D9B5]/15 text-[#00D9B5] flex items-center justify-center font-bold border border-[#00D9B5]/30 shrink-0">
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg">Daily Routine Checklist</h3>
                  <p className="text-xs text-[#9AA8BC]">
                    {completedHabits} of {totalHabits} completed today
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('routine')}
                className="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-[#00D9B5] hover:text-[#00C8FF] font-semibold transition"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {DEFAULT_HABITS.slice(0, 5).map((habit) => {
                const isChecked = !!dayLog.habits[habit.key];
                return (
                  <div
                    key={habit.key}
                    onClick={() => onToggleHabit(habit.key)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isChecked
                        ? 'bg-[#00D9B5]/[0.08] border-[#00D9B5]/30 shadow-sm'
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        aria-label={`Toggle ${habit.label}`}
                        className={`min-w-[28px] min-h-[28px] rounded-full flex items-center justify-center transition-all duration-200 shrink-0 ${
                          isChecked
                            ? 'bg-[#20D68A] text-[#050B18] shadow-md shadow-[#20D68A]/30 scale-105'
                            : 'border-2 border-[#66758A] hover:border-[#00D9B5] bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="min-w-0 truncate">
                        <p
                          className={`text-sm font-medium transition-colors truncate ${
                            isChecked ? 'line-through text-[#66758A]' : 'text-[#F5F7FA]'
                          }`}
                        >
                          {habit.label}
                        </p>
                        <p className="text-[11px] text-[#9AA8BC] truncate">{habit.sublabel}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold transition-all shrink-0 ml-2 ${
                        isChecked
                          ? 'bg-[#20D68A]/15 text-[#20D68A] border border-[#20D68A]/30 shadow-sm shadow-[#20D68A]/10'
                          : 'bg-white/[0.04] text-[#66758A] border border-white/[0.06]'
                      }`}
                    >
                      {isChecked ? 'Done' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-[#9AA8BC]">
            <span>Fresh daily routine with archive</span>
            <button
              onClick={() => onNavigateTab('routine')}
              className="text-[#00D9B5] hover:text-[#00C8FF] font-semibold transition"
            >
              See all 8 habits →
            </button>
          </div>
        </div>

        {/* Right: Diet & Nutrition (Glass Card with Transparent Meal Rows) */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#FFB020]/15 text-[#FFB020] flex items-center justify-center font-bold border border-[#FFB020]/30 shrink-0">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg">Diet & Nutrition</h3>
                  <p className="text-xs text-[#9AA8BC]">
                    Preference: <span className="text-[#00D9B5] font-semibold">{profile.dietaryPreference}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('diet')}
                className="min-h-[44px] inline-flex items-center gap-1.5 text-xs text-[#FFB020] hover:text-[#FFA000] font-semibold transition"
              >
                <span>Log Meals</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Calories & Protein Progress Bars */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass-panel-subtle rounded-2xl p-3.5 border border-white/[0.08]">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#9AA8BC] font-medium">Calories</span>
                  <span className="font-bold text-[#F5F7FA]">{totalCalories} / {profile.caloriesGoal}</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className="bg-gradient-to-r from-[#FFB020] to-[#FF5C6C] h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (totalCalories / profile.caloriesGoal) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#66758A]">
                  {caloriesRemaining > 0 ? `${caloriesRemaining} kcal left` : 'Budget reached'}
                </span>
              </div>

              <div className="glass-panel-subtle rounded-2xl p-3.5 border border-white/[0.08]">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="text-[#9AA8BC] font-medium">Protein</span>
                  <span className="font-bold text-[#00D9B5]">{totalProtein}g / {profile.proteinGoalGrams}g</span>
                </div>
                <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className="bg-gradient-to-r from-[#00D9B5] to-[#20D68A] h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, (totalProtein / profile.proteinGoalGrams) * 100)}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#66758A]">
                  {proteinRemaining > 0 ? `${proteinRemaining}g remaining` : 'Target hit! 💪'}
                </span>
              </div>
            </div>

            {/* Transparent Meal Rows */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors">
                <span className="font-medium text-[#F5F7FA]">Breakfast</span>
                <span className="text-[#9AA8BC]">
                  {dayLog.meals.breakfast.length > 0
                    ? `${dayLog.meals.breakfast.length} item${dayLog.meals.breakfast.length > 1 ? 's' : ''}  ·  ${dayLog.meals.breakfast.reduce((acc, i) => acc + i.calories, 0)} kcal`
                    : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors">
                <span className="font-medium text-[#F5F7FA]">Lunch</span>
                <span className="text-[#9AA8BC]">
                  {dayLog.meals.lunch.length > 0
                    ? `${dayLog.meals.lunch.length} item${dayLog.meals.lunch.length > 1 ? 's' : ''}  ·  ${dayLog.meals.lunch.reduce((acc, i) => acc + i.calories, 0)} kcal`
                    : 'Pending'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors">
                <span className="font-medium text-[#F5F7FA]">Dinner</span>
                <span className={dayLog.meals.dinner.length > 0 ? 'text-[#9AA8BC]' : 'text-[#FFB020] font-semibold'}>
                  {dayLog.meals.dinner.length > 0
                    ? `${dayLog.meals.dinner.length} item${dayLog.meals.dinner.length > 1 ? 's' : ''}  ·  ${dayLog.meals.dinner.reduce((acc, i) => acc + i.calories, 0)} kcal`
                    : 'Pending (Ask AI Coach!)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] transition-colors">
                <span className="font-medium text-[#F5F7FA]">Snacks</span>
                <span className="text-[#9AA8BC]">
                  {dayLog.meals.eveningSnack.length > 0
                    ? `${dayLog.meals.eveningSnack.length} item${dayLog.meals.eveningSnack.length > 1 ? 's' : ''}  ·  ${dayLog.meals.eveningSnack.reduce((acc, i) => acc + i.calories, 0)} kcal`
                    : 'Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Coach Suggestion Capsule */}
          <div className="mt-auto bg-gradient-to-r from-purple-950/30 to-indigo-950/30 border border-purple-500/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-300 flex items-center justify-center shrink-0 border border-purple-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs truncate">
                <p className="font-semibold text-purple-200">Need dinner ideas?</p>
                <p className="text-[#9AA8BC] text-[11px] truncate">Ask AI for vegetarian options based on remaining macros.</p>
              </div>
            </div>
            <button
              onClick={() => {
                onNavigateTab('coach');
                onAskCoachQuestion('What should I eat for dinner?');
              }}
              className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold text-xs shadow-md shadow-purple-500/20 transition active:scale-95 shrink-0 flex items-center justify-center"
            >
              Ask Coach
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
