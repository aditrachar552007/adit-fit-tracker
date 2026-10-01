import React, { useState } from 'react';
import {
  TrendingUp,
  Scale,
  Footprints,
  Droplets,
  Timer,
  CheckCircle2,
  Calendar,
  Flame,
} from 'lucide-react';
import { DayLog, UserProfile } from '../types';
import { formatDateOffset, getTodayDateString } from '../utils/storage';

interface ProgressViewProps {
  allLogs: Record<string, DayLog>;
  profile: UserProfile;
}

export const ProgressView: React.FC<ProgressViewProps> = ({ allLogs, profile }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const today = getTodayDateString();

  const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;

  // Build ordered data list for the selected timeframe
  const dataPoints = Array.from({ length: daysCount }, (_, i) => {
    const offset = -daysCount + 1 + i;
    const dateStr = formatDateOffset(today, offset);
    const log = allLogs[dateStr];

    const habitsCount = log ? Object.values(log.habits || {}).filter(Boolean).length : 0;
    const habitPercent = Math.round((habitsCount / 8) * 100);

    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const label = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const shortLabel = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' });

    return {
      date: dateStr,
      label,
      shortLabel,
      weight: log?.weight || profile.currentWeight,
      steps: log?.steps || 0,
      waterMl: log?.waterMl || 0,
      activeMinutes: log?.activeMinutes || 0,
      caloriesBurned: log?.caloriesBurned || 0,
      habitsCount,
      habitPercent,
    };
  });

  // Calculate Aggregates
  const weightsRecorded = dataPoints.map((d) => d.weight).filter(Boolean);
  const startWeight = weightsRecorded[0] || profile.currentWeight;
  const latestWeight = weightsRecorded[weightsRecorded.length - 1] || profile.currentWeight;
  const weightChange = (latestWeight - startWeight).toFixed(1);

  const totalSteps = dataPoints.reduce((acc, d) => acc + d.steps, 0);
  const avgSteps = Math.round(totalSteps / daysCount);

  const totalWaterMl = dataPoints.reduce((acc, d) => acc + d.waterMl, 0);
  const avgWaterLiters = ((totalWaterMl / daysCount) / 1000).toFixed(1);

  const avgHabitPercent = Math.round(
    dataPoints.reduce((acc, d) => acc + d.habitPercent, 0) / daysCount
  );

  const totalCaloriesBurned = dataPoints.reduce((acc, d) => acc + d.caloriesBurned, 0);
  const avgCaloriesBurned = Math.round(totalCaloriesBurned / daysCount);

  // SVG Weight Graph Calculations
  const minWeight = Math.min(...weightsRecorded, profile.weightGoal) - 0.5;
  const maxWeight = Math.max(...weightsRecorded, profile.weightGoal) + 0.5;
  const weightRange = maxWeight - minWeight || 1;

  const svgWidth = 600;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 30;

  const weightPoints = dataPoints.map((d, index) => {
    const x = paddingX + (index / (dataPoints.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - ((d.weight - minWeight) / weightRange) * (svgHeight - paddingY * 2);
    return { x, y, weight: d.weight, label: d.label, date: d.date };
  });

  const weightLinePath = weightPoints
    .map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`))
    .join(' ');

  const weightAreaPath = `${weightLinePath} L ${weightPoints[weightPoints.length - 1].x} ${svgHeight - paddingY} L ${weightPoints[0].x} ${svgHeight - paddingY} Z`;

  // Goal weight horizontal Y
  const goalY = svgHeight - paddingY - ((profile.weightGoal - minWeight) / weightRange) * (svgHeight - paddingY * 2);

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      {/* Header and Time Range Switcher */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-2xl">📊</span>
            <h2 className="text-2xl font-bold text-[#F5F7FA]">Progress & Trends</h2>
          </div>
          <p className="text-[#9AA8BC] text-xs sm:text-sm">
            Monitor weight transformation, steps consistency, hydration, and habit adherence.
          </p>
        </div>

        {/* Timeframe switch glass capsules */}
        <div className="flex items-center glass-panel-subtle p-1 rounded-2xl border border-white/[0.08] self-start sm:self-auto">
          {(['7d', '14d', '30d'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                timeRange === range
                  ? 'bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] text-[#050B18] shadow-md shadow-[#00D9B5]/20'
                  : 'text-[#9AA8BC] hover:text-[#F5F7FA]'
              }`}
            >
              {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weight Change */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#66758A] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Weight Trend</span>
            <Scale className="w-4 h-4 text-[#00D9B5]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#F5F7FA] flex items-baseline gap-1.5">
            <span>{latestWeight} {profile.weightUnit}</span>
            <span
              className={`text-xs font-semibold ${
                Number(weightChange) <= 0 ? 'text-[#00D9B5]' : 'text-[#FFB020]'
              }`}
            >
              {Number(weightChange) <= 0 ? `${weightChange} ${profile.weightUnit}` : `+${weightChange} ${profile.weightUnit}`}
            </span>
          </div>
          <p className="text-[11px] text-[#9AA8BC] mt-1">Goal: {profile.weightGoal} {profile.weightUnit}</p>
        </div>

        {/* Average Steps */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#66758A] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Avg Daily Steps</span>
            <Footprints className="w-4 h-4 text-[#00C8FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#F5F7FA]">
            {avgSteps.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#00C8FF] mt-1">
            {Math.round((avgSteps / profile.stepsGoal) * 100)}% of daily goal
          </p>
        </div>

        {/* Average Water */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#66758A] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Avg Water</span>
            <Droplets className="w-4 h-4 text-[#4D9FFF]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#F5F7FA]">
            {avgWaterLiters} L <span className="text-xs text-[#9AA8BC] font-normal">/ day</span>
          </div>
          <p className="text-[11px] text-[#4D9FFF] mt-1">Target: {(profile.waterGoalMl / 1000).toFixed(1)} L</p>
        </div>

        {/* Habit Completion Average */}
        <div className="glass-panel glass-panel-hover rounded-3xl p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#66758A] text-[11px] font-bold uppercase tracking-wider mb-1">
            <span>Habit Consistency</span>
            <CheckCircle2 className="w-4 h-4 text-[#20D68A]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#20D68A]">
            {avgHabitPercent}%
          </div>
          <p className="text-[11px] text-[#9AA8BC] mt-1">8 micro-habits tracked</p>
        </div>
      </div>

      {/* 1. Weight Graph: Modern SVG Smooth Curve with Gradient Area */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-lg font-bold text-[#F5F7FA] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#00D9B5]" />
              Weight Progression Curve
            </h3>
            <p className="text-xs text-[#9AA8BC]">
              Steadily progressing towards your {profile.weightGoal} {profile.weightUnit} goal
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-[#00D9B5] font-medium">
              <span className="w-3 h-0.5 bg-[#00D9B5] rounded-full" />
              Logged Weight
            </span>
            <span className="flex items-center gap-1.5 text-[#FFB020] font-medium">
              <span className="w-3 h-0.5 border-t border-dashed border-[#FFB020]" />
              Goal ({profile.weightGoal} {profile.weightUnit})
            </span>
          </div>
        </div>

        {/* SVG Interactive Line Chart */}
        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-64 select-none"
            preserveAspectRatio="xMidYMid meet"
          >
              <defs>
                <linearGradient id="weightAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D9B5" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00D9B5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={svgWidth - paddingX}
                y2={paddingY}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={svgHeight - paddingY}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY}
                stroke="rgba(255, 255, 255, 0.08)"
              />

              {/* Goal line */}
              {goalY >= paddingY && goalY <= svgHeight - paddingY && (
                <g>
                  <line
                    x1={paddingX}
                    y1={goalY}
                    x2={svgWidth - paddingX}
                    y2={goalY}
                    stroke="#FFB020"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                  <text
                    x={svgWidth - paddingX - 10}
                    y={goalY - 6}
                    fill="#FFB020"
                    fontSize="10"
                    textAnchor="end"
                    fontWeight="bold"
                  >
                    Goal: {profile.weightGoal}
                  </text>
                </g>
              )}

              {/* Fill area */}
              <path d={weightAreaPath} fill="url(#weightAreaGrad)" />

              {/* Main curve line */}
              <path
                d={weightLinePath}
                fill="none"
                stroke="#00D9B5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {weightPoints.map((p, idx) => (
                <g key={idx} className="group">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="#050B18"
                    stroke="#00D9B5"
                    strokeWidth="2"
                    className="cursor-pointer transition-transform hover:scale-125"
                  />
                  {(idx === 0 || idx === weightPoints.length - 1 || idx % Math.ceil(daysCount / 5) === 0) && (
                    <text
                      x={p.x}
                      y={p.y - 10}
                      fill="#F5F7FA"
                      fontSize="10"
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {p.weight}
                    </text>
                  )}
                  {(idx === 0 || idx === weightPoints.length - 1 || idx % Math.ceil(daysCount / 5) === 0) && (
                    <text
                      x={p.x}
                      y={svgHeight - 10}
                      fill="#9AA8BC"
                      fontSize="9"
                      textAnchor="middle"
                    >
                      {p.label}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        </div>

      {/* 2. Steps & Water Intake History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps Bar Chart */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-base flex items-center gap-2">
                <Footprints className="w-4 h-4 text-[#00C8FF]" />
                Steps History
              </h3>
              <p className="text-xs text-[#9AA8BC]">Target: {profile.stepsGoal.toLocaleString()} steps/day</p>
            </div>
            <span className="text-xs font-semibold text-[#00C8FF]">{avgSteps.toLocaleString()} avg</span>
          </div>

          <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6">
            {dataPoints.map((d, i) => {
              const maxSteps = Math.max(...dataPoints.map((p) => p.steps), profile.stepsGoal);
              const heightPercent = Math.min(100, Math.round((d.steps / maxSteps) * 100));
              const isGoalMet = d.steps >= profile.stepsGoal;

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isGoalMet ? 'bg-gradient-to-t from-[#00D9B5] to-[#00C8FF]' : 'bg-white/[0.08] group-hover:bg-white/[0.14]'
                    }`}
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                    title={`${d.label}: ${d.steps.toLocaleString()} steps`}
                  />
                  <span className="text-[9px] text-[#66758A] mt-2 truncate w-full text-center">
                    {d.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Water Intake History */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-base flex items-center gap-2">
                <Droplets className="w-4 h-4 text-[#4D9FFF]" />
                Water Intake History 💧
              </h3>
              <p className="text-xs text-[#9AA8BC]">Target: {(profile.waterGoalMl / 1000).toFixed(1)} L/day</p>
            </div>
            <span className="text-xs font-semibold text-[#4D9FFF]">{avgWaterLiters} L avg</span>
          </div>

          <div className="h-44 flex items-end gap-1.5 sm:gap-2 pt-6">
            {dataPoints.map((d, i) => {
              const maxWater = Math.max(...dataPoints.map((p) => p.waterMl), profile.waterGoalMl);
              const heightPercent = Math.min(100, Math.round((d.waterMl / maxWater) * 100));
              const isGoalMet = d.waterMl >= profile.waterGoalMl;

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isGoalMet ? 'bg-gradient-to-t from-[#00C8FF] to-[#4D9FFF]' : 'bg-white/[0.08] group-hover:bg-white/[0.14]'
                    }`}
                    style={{ height: `${Math.max(8, heightPercent)}%` }}
                    title={`${d.label}: ${(d.waterMl / 1000).toFixed(1)} L`}
                  />
                  <span className="text-[9px] text-[#66758A] mt-2 truncate w-full text-center">
                    {d.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Habit Routine Consistency & Active Minutes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Consistency */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#20D68A]" />
                Habit Completion Rate
              </h3>
              <p className="text-xs text-[#9AA8BC]">% of 8 habits completed per day</p>
            </div>
            <span className="text-xs font-bold text-[#20D68A]">{avgHabitPercent}% avg</span>
          </div>

          <div className="h-40 flex items-end gap-1.5 sm:gap-2 pt-6">
            {dataPoints.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    d.habitPercent === 100
                      ? 'bg-[#20D68A]'
                      : d.habitPercent >= 70
                      ? 'bg-[#00D9B5]/80'
                      : 'bg-white/[0.08] group-hover:bg-white/[0.14]'
                  }`}
                  style={{ height: `${Math.max(10, d.habitPercent)}%` }}
                  title={`${d.label}: ${d.habitsCount}/8 habits (${d.habitPercent}%)`}
                />
                <span className="text-[9px] text-[#66758A] mt-2 truncate w-full text-center">
                  {d.shortLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Minutes & Calories Burned */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-base flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#FFB020]" />
                Active Time & Burn
              </h3>
              <p className="text-xs text-[#9AA8BC]">Avg: {avgCaloriesBurned} kcal / day burned</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-[#FFB020]">
              <Flame className="w-3.5 h-3.5 fill-[#FFB020]" />
              <span>{totalCaloriesBurned.toLocaleString()} kcal total</span>
            </div>
          </div>

          <div className="h-40 flex items-end gap-1.5 sm:gap-2 pt-6">
            {dataPoints.map((d, i) => {
              const maxActive = Math.max(...dataPoints.map((p) => p.activeMinutes), profile.activeMinutesGoal);
              const heightPercent = Math.min(100, Math.round((d.activeMinutes / maxActive) * 100));

              return (
                <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#FFB020] to-[#FF5C6C] group-hover:opacity-85 transition-all duration-300"
                    style={{ height: `${Math.max(10, heightPercent)}%` }}
                    title={`${d.label}: ${d.activeMinutes} min (${d.caloriesBurned} kcal)`}
                  />
                  <span className="text-[9px] text-[#66758A] mt-2 truncate w-full text-center">
                    {d.shortLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
