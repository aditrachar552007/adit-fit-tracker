import { DayLog, UserProfile } from '../types';
import { DEFAULT_HABITS } from './constants';

const STORAGE_KEY_PROFILE = 'adit_fit_user_profile_v1';
const STORAGE_KEY_LOGS = 'adit_fit_daily_logs_v1';

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Adit',
  weightGoal: 68.0,
  currentWeight: 71.8,
  weightUnit: 'kg',
  waterGoalMl: 3000,
  stepsGoal: 10000,
  activeMinutesGoal: 45,
  sleepGoalHours: 8.0,
  caloriesGoal: 2000,
  proteinGoalGrams: 75,
  dietaryPreference: 'Vegetarian',
};

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateOffset(dateStr: string, offsetDays: number): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offsetDays);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateStr: string): string {
  const today = getTodayDateString();
  const yesterday = formatDateOffset(today, -1);
  const tomorrow = formatDateOffset(today, 1);

  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  };
  const formatted = date.toLocaleDateString('en-US', options);

  if (dateStr === today) return `Today, ${formatted}`;
  if (dateStr === yesterday) return `Yesterday, ${formatted}`;
  if (dateStr === tomorrow) return `Tomorrow, ${formatted}`;
  return `${date.toLocaleDateString('en-US', { weekday: 'long' })}, ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
}

export function createFreshDayLog(date: string, weight?: number): DayLog {
  const initialHabits: Record<string, boolean> = {};
  DEFAULT_HABITS.forEach((h) => {
    initialHabits[h.key] = false;
  });

  return {
    date,
    weight,
    steps: 0,
    waterMl: 0,
    activeMinutes: 0,
    sleepHours: 7.5,
    caloriesBurned: 0,
    habits: initialHabits,
    meals: {
      breakfast: [],
      midMorning: [],
      lunch: [],
      eveningSnack: [],
      dinner: [],
      nightMeal: [],
    },
    notes: '',
    stepsSource: 'manual',
    weightSource: 'manual',
    activeMinutesSource: 'manual',
    sleepSource: 'manual',
    caloriesBurnedSource: 'manual',
  };
}

export function clearAllUserData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_LOGS);
    localStorage.removeItem('adit_fit_health_connect_state_v1');
  } catch (e) {
    console.error('Error clearing data:', e);
  }
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (raw) {
      return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error loading profile from storage:', e);
  }
  return DEFAULT_PROFILE;
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Error saving profile:', e);
  }
}

export function loadAllLogs(): Record<string, DayLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading logs from storage:', e);
  }

  // If no logs exist, seed with 10 days of rich realistic history for Adit
  const seeded = generateSeedHistory();
  saveAllLogs(seeded);
  return seeded;
}

export function saveAllLogs(logs: Record<string, DayLog>): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Error saving logs:', e);
  }
}

export function getDayLog(dateStr: string, allLogs: Record<string, DayLog>, userWeight?: number): DayLog {
  if (allLogs[dateStr]) {
    // Ensure all default habits keys exist
    const log = allLogs[dateStr];
    const habits = { ...log.habits };
    DEFAULT_HABITS.forEach((h) => {
      if (habits[h.key] === undefined) {
        habits[h.key] = false;
      }
    });
    return { ...log, habits };
  }
  return createFreshDayLog(dateStr, userWeight);
}

// Generate realistic pre-seeded history so progress charts and AI coach have rich context immediately
export function generateSeedHistory(): Record<string, DayLog> {
  const result: Record<string, DayLog> = {};
  const today = getTodayDateString();

  const historyWeights = [73.2, 73.0, 72.8, 72.7, 72.5, 72.3, 72.2, 72.0, 71.9, 71.8];
  const historySteps = [8400, 10250, 9100, 11400, 7800, 10800, 9950, 12100, 10400, 8900];
  const historyWater = [2500, 3000, 2750, 3250, 2500, 3000, 3000, 3250, 2750, 2250];
  const historyActive = [35, 45, 40, 50, 30, 45, 45, 55, 45, 35];

  for (let i = 9; i >= 1; i--) {
    const dateStr = formatDateOffset(today, -i);
    const idx = 9 - i;
    const habits: Record<string, boolean> = {
      morningWater: true,
      breakfast: true,
      waterTarget: historyWater[idx] >= 2500,
      walking: historySteps[idx] >= 8500,
      healthyLunch: true,
      healthySnack: true,
      lightDinner: idx % 2 === 0,
      goodSleep: true,
    };

    result[dateStr] = {
      date: dateStr,
      weight: historyWeights[idx],
      steps: historySteps[idx],
      waterMl: historyWater[idx],
      activeMinutes: historyActive[idx],
      sleepHours: 7.5 + (idx % 2 === 0 ? 0.5 : 0),
      caloriesBurned: Math.round(historySteps[idx] * 0.045 + historyActive[idx] * 6),
      habits,
      meals: {
        breakfast: [
          { id: `seed-b-${i}`, name: 'Moong Dal Chilla (2 pcs) with Mint Chutney', portion: '2 chillas (160g)', calories: 240, protein: 14, isVeg: true },
        ],
        midMorning: [
          { id: `seed-mm-${i}`, name: 'Green Tea + Soaked Almonds', portion: '1 cup + 6 almonds', calories: 120, protein: 4, isVeg: true },
        ],
        lunch: [
          { id: `seed-l-${i}`, name: '2 Phulkas + 1 Bowl Yellow Dal + Mix Sabzi + Salad', portion: 'Standard thali plate', calories: 420, protein: 16, isVeg: true },
        ],
        eveningSnack: [
          { id: `seed-es-${i}`, name: 'Roasted Makhana with Spices', portion: '1 bowl (35g)', calories: 130, protein: 4, isVeg: true },
        ],
        dinner: [
          { id: `seed-d-${i}`, name: 'Moong Dal Khichdi with Curd', portion: '1 bowl + 1/2 cup curd', calories: 340, protein: 14, isVeg: true },
        ],
        nightMeal: [],
      },
      notes: 'Felt energetic and well-hydrated today!',
    };
  }

  // Today's fresh initial day
  const todayHabits: Record<string, boolean> = {
    morningWater: true,
    breakfast: true,
    waterTarget: false,
    walking: false,
    healthyLunch: true,
    healthySnack: false,
    lightDinner: false,
    goodSleep: false,
  };

  result[today] = {
    date: today,
    weight: 71.8,
    steps: 6420,
    waterMl: 1750,
    activeMinutes: 30,
    sleepHours: 7.5,
    caloriesBurned: 410,
    habits: todayHabits,
    meals: {
      breakfast: [
        { id: 'today-b-1', name: 'Oatmeal with Almonds & Chia', portion: '1 medium bowl (250g)', calories: 280, protein: 11, isVeg: true },
      ],
      midMorning: [
        { id: 'today-mm-1', name: 'Spiced Buttermilk (Chaas) with Jeera', portion: '1 tall glass (250ml)', calories: 60, protein: 4, isVeg: true },
      ],
      lunch: [
        { id: 'today-l-1', name: 'Quinoa Paneer Veggie Bowl', portion: '1 large bowl (300g)', calories: 440, protein: 22, isVeg: true },
      ],
      eveningSnack: [
        { id: 'today-es-1', name: 'Roasted Chana (Black Chickpeas)', portion: '1/2 cup (50g)', calories: 170, protein: 9, isVeg: true },
      ],
      dinner: [], // Leave dinner empty so user/AI can suggest what to eat!
      nightMeal: [],
    },
    notes: 'Morning routine on track. Planning a healthy high-protein vegetarian dinner.',
  };

  return result;
}

export function calculateDailyTotals(dayLog: DayLog) {
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  const mealCategories: (keyof DayLog['meals'])[] = [
    'breakfast',
    'midMorning',
    'lunch',
    'eveningSnack',
    'dinner',
    'nightMeal',
  ];

  mealCategories.forEach((cat) => {
    (dayLog.meals[cat] || []).forEach((item) => {
      totalCalories += item.calories || 0;
      totalProtein += item.protein || 0;
      totalCarbs += item.carbs || 0;
      totalFat += item.fat || 0;
    });
  });

  const habitsList = Object.values(dayLog.habits || {});
  const totalHabits = DEFAULT_HABITS.length;
  const completedHabits = habitsList.filter(Boolean).length;
  const habitCompletionRate = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

  return {
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
    completedHabits,
    totalHabits,
    habitCompletionRate,
  };
}

export function calculateOverallCompletion(dayLog: DayLog, profile: UserProfile): number {
  const { habitCompletionRate, totalCalories } = calculateDailyTotals(dayLog);

  // Score components out of 100%:
  // 1. Habit checklist (35%)
  const habitScore = habitCompletionRate;

  // 2. Steps (25%)
  const stepScore = Math.min(100, Math.round((dayLog.steps / (profile.stepsGoal || 10000)) * 100));

  // 3. Water (20%)
  const waterScore = Math.min(100, Math.round((dayLog.waterMl / (profile.waterGoalMl || 3000)) * 100));

  // 4. Active Minutes (10%)
  const activeScore = Math.min(100, Math.round((dayLog.activeMinutes / (profile.activeMinutesGoal || 45)) * 100));

  // 5. Diet logged (10%) - has at least breakfast & lunch
  const mealsLoggedCount = Object.values(dayLog.meals).filter((m) => m.length > 0).length;
  const dietScore = Math.min(100, (mealsLoggedCount / 3) * 100);

  const weighted =
    habitScore * 0.35 +
    stepScore * 0.25 +
    waterScore * 0.20 +
    activeScore * 0.10 +
    dietScore * 0.10;

  return Math.min(100, Math.max(0, Math.round(weighted)));
}
