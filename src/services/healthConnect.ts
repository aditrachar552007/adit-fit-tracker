import { HealthConnectStatus, HealthDataSource, HealthMetricResult, HealthPermissionKey } from '../types';

const STORAGE_KEY_HEALTH_CONNECT = 'adit_fit_health_connect_state_v1';

declare global {
  interface Window {
    HealthConnectBridge?: {
      isAvailable?: () => boolean;
      checkPermissions?: (permissionsJson: string) => string; // returns JSON
      requestPermissions?: (permissionsJson: string) => Promise<string>; // returns JSON
      getAggregatedSteps?: (startTimeEpochMs: number, endTimeEpochMs: number) => Promise<number>;
      getAggregatedExerciseMinutes?: (startTimeEpochMs: number, endTimeEpochMs: number) => Promise<number>;
      getAggregatedTotalCaloriesBurned?: (startTimeEpochMs: number, endTimeEpochMs: number) => Promise<number>;
      getLatestSleepDurationHours?: (startTimeEpochMs: number, endTimeEpochMs: number) => Promise<number>;
      getLatestWeightKg?: () => Promise<number>;
    };
    AndroidBridge?: any;
  }
}

export const REQUIRED_PERMISSIONS: HealthPermissionKey[] = [
  'steps',
  'exercise',
  'calories',
  'sleep',
  'weight',
];

export const PERMISSION_ANDROID_MAPPINGS: Record<HealthPermissionKey, string> = {
  steps: 'android.permission.health.READ_STEPS',
  exercise: 'android.permission.health.READ_EXERCISE',
  calories: 'android.permission.health.READ_TOTAL_CALORIES_BURNED',
  sleep: 'android.permission.health.READ_SLEEP',
  weight: 'android.permission.health.READ_WEIGHT',
};

class HealthDataService {
  private status: HealthConnectStatus;

  constructor() {
    this.status = this.loadStoredStatus();
  }

  private loadStoredStatus(): HealthConnectStatus {
    const isBridgeAvailable = this.detectBridge();
    const defaultStatus: HealthConnectStatus = {
      isAvailable: isBridgeAvailable || true, // Available for connection on Android or testing
      isConnected: false,
      isAndroidBridge: isBridgeAvailable,
      lastSynced: null,
      permissions: {
        steps: false,
        exercise: false,
        calories: false,
        sleep: false,
        weight: false,
      },
      hasMissingPermissions: false,
    };

    try {
      const stored = localStorage.getItem(STORAGE_KEY_HEALTH_CONNECT);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...defaultStatus,
          ...parsed,
          isAndroidBridge: isBridgeAvailable,
        };
      }
    } catch (e) {
      console.error('Failed to load Health Connect status:', e);
    }
    return defaultStatus;
  }

  private saveStatus(): void {
    try {
      localStorage.setItem(STORAGE_KEY_HEALTH_CONNECT, JSON.stringify(this.status));
    } catch (e) {
      console.error('Failed to save Health Connect status:', e);
    }
  }

  public detectBridge(): boolean {
    return typeof window !== 'undefined' && (!!window.HealthConnectBridge || !!window.AndroidBridge);
  }

  public getStatus(): HealthConnectStatus {
    return { ...this.status };
  }

  public async connectHealthData(): Promise<HealthConnectStatus> {
    if (window.HealthConnectBridge?.requestPermissions) {
      try {
        const requested = Object.values(PERMISSION_ANDROID_MAPPINGS);
        const resultJson = await window.HealthConnectBridge.requestPermissions(JSON.stringify(requested));
        const grantedMap: Record<string, boolean> = JSON.parse(resultJson || '{}');

        const newPermissions: Record<HealthPermissionKey, boolean> = {
          steps: !!grantedMap[PERMISSION_ANDROID_MAPPINGS.steps],
          exercise: !!grantedMap[PERMISSION_ANDROID_MAPPINGS.exercise],
          calories: !!grantedMap[PERMISSION_ANDROID_MAPPINGS.calories],
          sleep: !!grantedMap[PERMISSION_ANDROID_MAPPINGS.sleep],
          weight: !!grantedMap[PERMISSION_ANDROID_MAPPINGS.weight],
        };

        const hasMissing = Object.values(newPermissions).some((val) => !val);

        this.status = {
          ...this.status,
          isConnected: true,
          isAndroidBridge: true,
          lastSynced: this.formatSyncTimestamp(),
          permissions: newPermissions,
          hasMissingPermissions: hasMissing,
          statusMessage: hasMissing ? 'Some health permissions are missing.' : undefined,
        };
        this.saveStatus();
        return this.getStatus();
      } catch (err: any) {
        console.error('Android Health Connect permission request failed:', err);
        this.status.statusMessage = 'Health data access not granted';
        this.saveStatus();
        return this.getStatus();
      }
    }

    // Web / portable simulator mode:
    // Enables the user to connect on Web while preparing the exact contract for Android deployment
    const grantedPermissions: Record<HealthPermissionKey, boolean> = {
      steps: true,
      exercise: true,
      calories: true,
      sleep: true,
      weight: true,
    };

    this.status = {
      ...this.status,
      isConnected: true,
      isAndroidBridge: false,
      lastSynced: this.formatSyncTimestamp(),
      permissions: grantedPermissions,
      hasMissingPermissions: false,
      statusMessage: undefined,
    };
    this.saveStatus();
    return this.getStatus();
  }

  public async disconnectHealthData(): Promise<HealthConnectStatus> {
    this.status = {
      ...this.status,
      isConnected: false,
      lastSynced: null,
      permissions: {
        steps: false,
        exercise: false,
        calories: false,
        sleep: false,
        weight: false,
      },
      hasMissingPermissions: false,
      statusMessage: undefined,
    };
    this.saveStatus();
    return this.getStatus();
  }

  public async updatePermission(key: HealthPermissionKey, value: boolean): Promise<HealthConnectStatus> {
    this.status.permissions[key] = value;
    this.status.hasMissingPermissions = Object.values(this.status.permissions).some((v) => !v);
    this.saveStatus();
    return this.getStatus();
  }

  public async syncTodaySteps(): Promise<HealthMetricResult<number> | null> {
    if (!this.status.isConnected || !this.status.permissions.steps) {
      return null;
    }

    const { startMs, endMs } = this.getTodayTimeRangeEpochMs();

    // If native Android Health Connect bridge is present, use aggregated step count
    // to strictly avoid double counting across multiple apps (e.g. Samsung Health + Google Fit)
    if (window.HealthConnectBridge?.getAggregatedSteps) {
      try {
        const aggregatedSteps = await window.HealthConnectBridge.getAggregatedSteps(startMs, endMs);
        return {
          value: aggregatedSteps,
          source: 'health_connect',
          timestamp: new Date().toISOString(),
        };
      } catch (err) {
        console.error('Failed to get aggregated steps from Health Connect bridge:', err);
      }
    }

    return null;
  }

  public async syncAllMetrics(): Promise<{
    status: HealthConnectStatus;
    steps?: HealthMetricResult<number>;
    activeMinutes?: HealthMetricResult<number>;
    caloriesBurned?: HealthMetricResult<number>;
    sleepHours?: HealthMetricResult<number>;
    weight?: HealthMetricResult<number>;
  }> {
    if (!this.status.isConnected) {
      return { status: this.getStatus() };
    }

    const { startMs, endMs } = this.getTodayTimeRangeEpochMs();
    const result: any = {};

    // Steps (Aggregated)
    if (this.status.permissions.steps) {
      if (window.HealthConnectBridge?.getAggregatedSteps) {
        try {
          const steps = await window.HealthConnectBridge.getAggregatedSteps(startMs, endMs);
          result.steps = { value: steps, source: 'health_connect' };
        } catch (e) {
          console.warn('Bridge getAggregatedSteps failed:', e);
        }
      }
    }

    // Exercise Minutes
    if (this.status.permissions.exercise) {
      if (window.HealthConnectBridge?.getAggregatedExerciseMinutes) {
        try {
          const mins = await window.HealthConnectBridge.getAggregatedExerciseMinutes(startMs, endMs);
          result.activeMinutes = { value: mins, source: 'health_connect' };
        } catch (e) {
          console.warn('Bridge getAggregatedExerciseMinutes failed:', e);
        }
      }
    }

    // Calories Burned
    if (this.status.permissions.calories) {
      if (window.HealthConnectBridge?.getAggregatedTotalCaloriesBurned) {
        try {
          const cals = await window.HealthConnectBridge.getAggregatedTotalCaloriesBurned(startMs, endMs);
          result.caloriesBurned = { value: cals, source: 'health_connect' };
        } catch (e) {
          console.warn('Bridge getAggregatedTotalCaloriesBurned failed:', e);
        }
      }
    }

    // Sleep
    if (this.status.permissions.sleep) {
      if (window.HealthConnectBridge?.getLatestSleepDurationHours) {
        try {
          const sleep = await window.HealthConnectBridge.getLatestSleepDurationHours(startMs, endMs);
          result.sleepHours = { value: sleep, source: 'health_connect' };
        } catch (e) {
          console.warn('Bridge getLatestSleepDurationHours failed:', e);
        }
      }
    }

    // Weight
    if (this.status.permissions.weight) {
      if (window.HealthConnectBridge?.getLatestWeightKg) {
        try {
          const weight = await window.HealthConnectBridge.getLatestWeightKg();
          result.weight = { value: weight, source: 'health_connect' };
        } catch (e) {
          console.warn('Bridge getLatestWeightKg failed:', e);
        }
      }
    }

    this.status.lastSynced = this.formatSyncTimestamp();
    this.saveStatus();

    return {
      status: this.getStatus(),
      ...result,
    };
  }

  // Local device day boundary (respects user's actual phone timezone)
  private getTodayTimeRangeEpochMs(): { startMs: number; endMs: number } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return {
      startMs: start.getTime(),
      endMs: end.getTime(),
    };
  }

  private formatSyncTimestamp(): string {
    const now = new Date();
    const hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `Today, ${formattedHours}:${minutes} ${ampm}`;
  }
}

export const healthDataService = new HealthDataService();
