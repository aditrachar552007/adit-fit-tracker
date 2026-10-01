export type MealType =
  | 'breakfast'
  | 'midMorning'
  | 'lunch'
  | 'eveningSnack'
  | 'dinner'
  | 'nightMeal';

export interface MealItem {
  id: string;
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  isVeg?: boolean;
}

export interface HabitItem {
  id: string;
  key: string;
  label: string;
  sublabel: string;
  icon: string;
}

export type HealthDataSource = 'health_connect' | 'manual';

export interface DayLog {
  date: string; // YYYY-MM-DD
  weight?: number;
  steps: number;
  waterMl: number;
  activeMinutes: number;
  sleepHours: number;
  caloriesBurned: number;
  habits: Record<string, boolean>;
  meals: {
    breakfast: MealItem[];
    midMorning: MealItem[];
    lunch: MealItem[];
    eveningSnack: MealItem[];
    dinner: MealItem[];
    nightMeal: MealItem[];
  };
  notes?: string;
  // Metadata for data source tracking
  stepsSource?: HealthDataSource;
  weightSource?: HealthDataSource;
  activeMinutesSource?: HealthDataSource;
  sleepSource?: HealthDataSource;
  caloriesBurnedSource?: HealthDataSource;
  lastSyncedAt?: string;
}

export interface UserProfile {
  name: string;
  weightGoal: number;
  currentWeight: number;
  weightUnit: 'kg' | 'lbs';
  waterGoalMl: number;
  stepsGoal: number;
  activeMinutesGoal: number;
  sleepGoalHours: number;
  caloriesGoal: number;
  proteinGoalGrams: number;
  dietaryPreference: 'Vegetarian' | 'Vegan' | 'Eggetarian' | 'Non-Vegetarian';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export type TabType = 'home' | 'diet' | 'routine' | 'progress' | 'coach' | 'settings';

export type HealthPermissionKey = 'steps' | 'exercise' | 'calories' | 'sleep' | 'weight';

export interface HealthConnectStatus {
  isAvailable: boolean; // Android Health Connect support available on platform/bridge
  isConnected: boolean; // User has toggled connection and granted permissions
  isAndroidBridge: boolean; // True if running inside an actual native Android WebView/TWA
  lastSynced: string | null;
  permissions: Record<HealthPermissionKey, boolean>;
  hasMissingPermissions: boolean;
  statusMessage?: string;
}

export interface HealthMetricResult<T> {
  value: T;
  source: HealthDataSource;
  timestamp?: string;
}
