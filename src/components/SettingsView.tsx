import React, { useState } from 'react';
import {
  Scale,
  Droplets,
  Footprints,
  BedDouble,
  Flame,
  Utensils,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle,
  Activity,
  Bell,
  Moon,
  ShieldCheck,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
  Trash2,
  X,
} from 'lucide-react';
import { DayLog, UserProfile, HealthConnectStatus, HealthPermissionKey } from '../types';
import { generateSeedHistory, saveAllLogs, saveProfile, clearAllUserData } from '../utils/storage';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onResetToday: () => void;
  allLogs: Record<string, DayLog>;
  onReloadHistory: (logs: Record<string, DayLog>) => void;
  healthStatus: HealthConnectStatus;
  onConnectHealth: () => Promise<void>;
  onDisconnectHealth: () => Promise<void>;
  onSyncHealth: () => Promise<void>;
  onToggleHealthPermission: (key: HealthPermissionKey, val: boolean) => Promise<void>;
  isSyncing?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetToday,
  allLogs,
  onReloadHistory,
  healthStatus,
  onConnectHealth,
  onDisconnectHealth,
  onSyncHealth,
  onToggleHealthPermission,
  isSyncing = false,
}) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [savedStatus, setSavedStatus] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notifications state
  const [waterReminders, setWaterReminders] = useState(true);
  const [routineReminders, setRoutineReminders] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    saveProfile(formData);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const handleSeedData = () => {
    if (confirm('Load fresh 10-day sample history? This will populate progress graphs and habit streaks.')) {
      const seeded = generateSeedHistory();
      saveAllLogs(seeded);
      onReloadHistory(seeded);
      alert('Sample history loaded successfully!');
    }
  };

  const handleExportData = () => {
    const backup = {
      profile: formData,
      logs: allLogs,
      healthConnect: healthStatus,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `adit_fit_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.profile) {
            setFormData(parsed.profile);
            onUpdateProfile(parsed.profile);
            saveProfile(parsed.profile);
          }
          if (parsed.logs) {
            saveAllLogs(parsed.logs);
            onReloadHistory(parsed.logs);
          }
          alert('Backup imported successfully!');
        } catch (err) {
          alert('Invalid backup JSON file.');
        }
      };
    }
  };

  const handleConfirmDeleteData = () => {
    clearAllUserData();
    alert('All your stored health data and preferences have been securely deleted.');
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 max-w-4xl mx-auto">
      {/* Title Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-2xl">⚙️</span>
          <h2 className="text-2xl font-bold text-[#F5F7FA]">App Settings & Preferences</h2>
        </div>
        <p className="text-[#9AA8BC] text-xs sm:text-sm">
          Manage your personal goals, Android Health Connect sync, notifications, and data privacy.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Profile Section */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
          <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <span className="w-2 h-2 rounded-full bg-[#00D9B5]" />
            Profile & Dietary Preference
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5">User Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5">
                Dietary Preference (Used by AI Coach)
              </label>
              <select
                value={formData.dietaryPreference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dietaryPreference: e.target.value as UserProfile['dietaryPreference'],
                  })
                }
                className="w-full bg-[#0A1222] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              >
                <option value="Vegetarian">Vegetarian (Default)</option>
                <option value="Vegan">Vegan (Pure Plant-Based)</option>
                <option value="Eggetarian">Eggetarian (Vegetarian + Eggs)</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Goals Section */}
        <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
          <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
            <Scale className="w-5 h-5 text-[#00D9B5]" />
            Daily Targets & Biometrics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Current Weight */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5">
                Current Weight ({formData.weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.currentWeight}
                onChange={(e) => setFormData({ ...formData, currentWeight: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
            </div>

            {/* Weight Goal */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5">
                Weight Goal ({formData.weightUnit})
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.weightGoal}
                onChange={(e) => setFormData({ ...formData, weightGoal: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
            </div>

            {/* Daily Water Goal */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#4D9FFF]" />
                Daily Water Goal (ml)
              </label>
              <input
                type="number"
                step="100"
                value={formData.waterGoalMl}
                onChange={(e) => setFormData({ ...formData, waterGoalMl: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
              <span className="text-[11px] text-[#66758A] mt-1 block">
                {(formData.waterGoalMl / 1000).toFixed(1)} L (approx {Math.round(formData.waterGoalMl / 250)} glasses)
              </span>
            </div>

            {/* Walking / Steps Goal */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5 flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-[#00C8FF]" />
                Daily Walking / Steps Goal
              </label>
              <input
                type="number"
                step="500"
                value={formData.stepsGoal}
                onChange={(e) => setFormData({ ...formData, stepsGoal: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
              <span className="text-[11px] text-[#66758A] mt-1 block">
                Approx {(formData.stepsGoal * 0.00075).toFixed(1)} km walking per day
              </span>
            </div>

            {/* Sleep Goal */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5 flex items-center gap-1.5">
                <BedDouble className="w-3.5 h-3.5 text-indigo-400" />
                Sleep Goal (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.sleepGoalHours}
                onChange={(e) => setFormData({ ...formData, sleepGoalHours: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
            </div>

            {/* Active Minutes Goal */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#FFB020]" />
                Active Minutes Goal (Mins)
              </label>
              <input
                type="number"
                step="5"
                value={formData.activeMinutesGoal}
                onChange={(e) => setFormData({ ...formData, activeMinutesGoal: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
            </div>

            {/* Daily Calories Goal */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5 flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#FFB020]" />
                Daily Calorie Target (kcal)
              </label>
              <input
                type="number"
                step="50"
                value={formData.caloriesGoal}
                onChange={(e) => setFormData({ ...formData, caloriesGoal: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
            </div>

            {/* Daily Protein Target */}
            <div>
              <label className="text-xs font-semibold text-[#9AA8BC] block mb-1.5">
                Daily Protein Target (grams)
              </label>
              <input
                type="number"
                step="5"
                value={formData.proteinGoalGrams}
                onChange={(e) => setFormData({ ...formData, proteinGoalGrams: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-white/[0.04] border border-white/[0.10] rounded-xl px-3.5 py-2.5 text-sm text-[#F5F7FA] focus:outline-none focus:border-[#00D9B5]"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            {savedStatus && (
              <span className="text-xs text-[#00D9B5] font-semibold flex items-center gap-1">
                <CheckCircle className="w-4 h-4" /> Targets Saved!
              </span>
            )}
            <button
              type="submit"
              className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] hover:opacity-90 text-[#050B18] font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#00D9B5]/25 active:scale-95 transition"
            >
              <Save className="w-4 h-4" />
              <span>Save Goals</span>
            </button>
          </div>
        </div>
      </form>

      {/* 3. HEALTH DATA CONNECTION SCREEN (Android Health Connect Architecture) */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00D9B5]/15 text-[#00D9B5] flex items-center justify-center border border-[#00D9B5]/30 shadow-sm shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg">Health Data</h3>
              <p className="text-xs text-[#9AA8BC]">Android Health Connect (Samsung Health, Google Fit, Pixel & more)</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {healthStatus.isConnected ? (
              <>
                <button
                  type="button"
                  onClick={onSyncHealth}
                  disabled={isSyncing}
                  className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#00D9B5] text-xs font-bold border border-white/[0.10] active:scale-95 transition flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Sync Now</span>
                </button>
                <button
                  type="button"
                  onClick={onDisconnectHealth}
                  className="min-h-[44px] px-3 py-1.5 rounded-xl bg-white/[0.04] text-[#9AA8BC] hover:text-[#FF5C6C] text-xs font-semibold border border-white/[0.08] active:scale-95 transition"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onConnectHealth}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] text-[#050B18] font-bold text-xs shadow-md shadow-[#00D9B5]/25 active:scale-95 transition"
              >
                Connect Health Data
              </button>
            )}
          </div>
        </div>

        {/* Status indicator display */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[#9AA8BC]">Connection status:</span>
              {healthStatus.isConnected ? (
                <span className="font-bold text-[#20D68A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#20D68A] shadow-sm shadow-[#20D68A]" />
                  ● Health Data Connected
                </span>
              ) : (
                <span className="font-semibold text-[#66758A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full border border-[#66758A]" />
                  ○ Not connected
                </span>
              )}
            </div>

            {healthStatus.isConnected && healthStatus.lastSynced && (
              <span className="text-[#9AA8BC]">
                Last synced: <strong className="text-[#F5F7FA] font-medium">{healthStatus.lastSynced}</strong>
              </span>
            )}
          </div>

          {/* Missing permissions warning if applicable */}
          {healthStatus.isConnected && healthStatus.hasMissingPermissions && (
            <div className="p-3.5 rounded-2xl bg-[#FFB020]/10 border border-[#FFB020]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#FFB020] font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Some health permissions are missing.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowPermissionsModal(true)}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-[#FFB020]/20 text-[#FFB020] font-bold self-start sm:self-auto hover:bg-[#FFB020]/30 transition"
              >
                Manage Permissions
              </button>
            </div>
          )}

          {/* Available synchronized streams list */}
          <div className="p-4 rounded-2xl glass-panel-subtle border border-white/[0.08]">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-[#66758A] uppercase tracking-wider">
                Available Health Data Streams
              </span>
              {healthStatus.isConnected && (
                <button
                  type="button"
                  onClick={() => setShowPermissionsModal(true)}
                  className="text-xs text-[#00D9B5] hover:underline font-semibold"
                >
                  Manage Permissions
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
              {[
                { key: 'steps' as HealthPermissionKey, label: 'Steps' },
                { key: 'exercise' as HealthPermissionKey, label: 'Exercise' },
                { key: 'calories' as HealthPermissionKey, label: 'Active calories' },
                { key: 'sleep' as HealthPermissionKey, label: 'Sleep' },
                { key: 'weight' as HealthPermissionKey, label: 'Weight' },
              ].map((item) => {
                const isGranted = healthStatus.isConnected && healthStatus.permissions[item.key];
                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-1.5 font-medium p-2 rounded-xl transition-all ${
                      isGranted ? 'text-[#F5F7FA] bg-[#00D9B5]/[0.08]' : 'text-[#66758A] bg-white/[0.02]'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isGranted ? 'text-[#00D9B5]' : 'text-[#66758A]'}`} />
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRIVACY SECTION & GOVERNANCE */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
          <Lock className="w-5 h-5 text-[#00D9B5]" />
          Health Privacy & Data Governance
        </h3>

        <p className="text-xs text-[#9AA8BC] leading-relaxed">
          Health data is strictly private. Adit Fit Tracker stores your information locally on your device. Data is only shared with the AI Coach when you explicitly ask for nutritional or workout guidance.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Privacy Policy */}
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="min-h-[44px] p-3.5 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-white/[0.08] text-left transition-all active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[#F5F7FA] mb-1">Privacy Policy</p>
              <p className="text-xs text-[#9AA8BC]">Review how your biometrics are secured.</p>
            </div>
            <span className="text-xs text-[#00D9B5] mt-3 font-semibold">View Policy</span>
          </button>

          {/* Manage Health Permissions */}
          <button
            type="button"
            onClick={() => setShowPermissionsModal(true)}
            className="min-h-[44px] p-3.5 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-white/[0.08] text-left transition-all active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[#F5F7FA] mb-1">Health Data Permissions</p>
              <p className="text-xs text-[#9AA8BC]">Configure individual read permissions.</p>
            </div>
            <span className="text-xs text-[#00C8FF] mt-3 font-semibold">Configure</span>
          </button>

          {/* Delete My Data */}
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="min-h-[44px] p-3.5 rounded-2xl glass-panel-subtle hover:bg-[#FF5C6C]/10 border border-[#FF5C6C]/20 text-left transition-all active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[#FF5C6C] mb-1">Delete My Data</p>
              <p className="text-xs text-[#9AA8BC]">Permanently erase local records & cache.</p>
            </div>
            <span className="text-xs text-[#FF5C6C] mt-3 font-semibold flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Erase Data
            </span>
          </button>
        </div>
      </div>

      {/* 5. Notifications & Reminders */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
          <Bell className="w-5 h-5 text-[#FFB020]" />
          Notifications & Nudges
        </h3>

        <div className="space-y-3 text-xs sm:text-sm">
          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel-subtle border border-white/[0.06]">
            <div>
              <p className="font-semibold text-[#F5F7FA]">Water Hydration Reminders</p>
              <p className="text-xs text-[#9AA8BC]">Periodic reminders throughout the day to hit 2.5–3L</p>
            </div>
            <button
              type="button"
              onClick={() => setWaterReminders(!waterReminders)}
              className={`w-11 h-6 rounded-full transition-colors relative min-h-[44px] min-w-[44px] flex items-center ${
                waterReminders ? 'bg-[#00D9B5]' : 'bg-white/[0.12]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#050B18] transition-transform mx-1 ${
                  waterReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-panel-subtle border border-white/[0.06]">
            <div>
              <p className="font-semibold text-[#F5F7FA]">Daily Routine Checklist Nudge</p>
              <p className="text-xs text-[#9AA8BC]">Evening check-in to close remaining micro-habits</p>
            </div>
            <button
              type="button"
              onClick={() => setRoutineReminders(!routineReminders)}
              className={`w-11 h-6 rounded-full transition-colors relative min-h-[44px] min-w-[44px] flex items-center ${
                routineReminders ? 'bg-[#00D9B5]' : 'bg-white/[0.12]'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#050B18] transition-transform mx-1 ${
                  routineReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Data Management & Backup */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="font-bold text-[#F5F7FA] text-base sm:text-lg flex items-center gap-2.5 pb-3 border-b border-white/[0.06]">
          <RotateCcw className="w-5 h-5 text-[#00D9B5]" />
          Data Management & Archival
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={onResetToday}
            className="min-h-[44px] p-4 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-white/[0.08] text-left transition-all active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[#F5F7FA] mb-1">Reset Today's Log</p>
              <p className="text-xs text-[#9AA8BC]">Clear today's checklist and water to start clean.</p>
            </div>
            <span className="text-xs text-[#FFB020] mt-3 font-semibold">Reset Today</span>
          </button>

          <button
            type="button"
            onClick={handleSeedData}
            className="min-h-[44px] p-4 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-white/[0.08] text-left transition-all active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[#F5F7FA] mb-1">Load Sample History</p>
              <p className="text-xs text-[#9AA8BC]">Pre-populate 10 days of rich workout & diet data.</p>
            </div>
            <span className="text-xs text-[#00D9B5] mt-3 font-semibold">Load 10-Day Data</span>
          </button>

          <button
            type="button"
            onClick={handleExportData}
            className="min-h-[44px] p-4 rounded-2xl glass-panel-subtle hover:bg-white/[0.08] border border-white/[0.08] text-left transition-all active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-[#F5F7FA] mb-1">Export Data Backup</p>
              <p className="text-xs text-[#9AA8BC]">Download your complete health logs as JSON.</p>
            </div>
            <span className="text-xs text-[#00C8FF] mt-3 font-semibold flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> Export JSON
            </span>
          </button>
        </div>

        {/* Import JSON */}
        <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#9AA8BC]">
          <span>Import existing backup JSON file:</span>
          <label className="cursor-pointer px-3.5 py-2 rounded-xl glass-capsule hover:bg-white/[0.10] text-[#F5F7FA] border border-white/[0.10] flex items-center justify-center gap-1.5 transition active:scale-95 self-start sm:self-auto min-h-[44px]">
            <Upload className="w-3.5 h-3.5 text-[#00D9B5]" />
            <span>Select File</span>
            <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
          </label>
        </div>
      </div>

      {/* Permissions Modal */}
      {showPermissionsModal && (
        <div className="fixed inset-0 bg-[#050B18]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#00D9B5]" />
                <h3 className="font-bold text-[#F5F7FA] text-base">Health Connect Permissions</h3>
              </div>
              <button onClick={() => setShowPermissionsModal(false)} className="text-[#9AA8BC] hover:text-[#F5F7FA] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#9AA8BC] leading-relaxed">
              Enable or disable specific Android Health Connect data read permissions. If access is revoked, Adit Fit Tracker gracefully falls back to manual entry.
            </p>

            <div className="space-y-2.5">
              {[
                { key: 'steps' as HealthPermissionKey, label: 'Steps', desc: 'Aggregated step count from Google Fit / Samsung Health' },
                { key: 'exercise' as HealthPermissionKey, label: 'Exercise', desc: 'Active workout sessions and duration' },
                { key: 'calories' as HealthPermissionKey, label: 'Active Calories', desc: 'Total energy burned throughout the day' },
                { key: 'sleep' as HealthPermissionKey, label: 'Sleep', desc: 'Sleep duration and recovery intervals' },
                { key: 'weight' as HealthPermissionKey, label: 'Weight', desc: 'Latest recorded scale biometrics' },
              ].map((item) => {
                const granted = healthStatus.permissions[item.key];
                return (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-2xl glass-panel-subtle border border-white/[0.06]">
                    <div>
                      <p className="text-sm font-semibold text-[#F5F7FA]">{item.label}</p>
                      <p className="text-[11px] text-[#9AA8BC]">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleHealthPermission(item.key, !granted)}
                      className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        granted
                          ? 'bg-[#20D68A]/20 text-[#20D68A] border border-[#20D68A]/30'
                          : 'bg-white/[0.06] text-[#66758A] border border-white/[0.08]'
                      }`}
                    >
                      {granted ? 'Granted' : 'Revoked'}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowPermissionsModal(false)}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-gradient-to-r from-[#00D9B5] to-[#00C8FF] text-[#050B18] font-bold text-xs shadow-md active:scale-95 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-[#050B18]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-white/[0.12] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00D9B5]" />
                <h3 className="font-bold text-[#F5F7FA] text-base">Privacy Policy</h3>
              </div>
              <button onClick={() => setShowPrivacyModal(false)} className="text-[#9AA8BC] hover:text-[#F5F7FA] p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 text-xs text-[#9AA8BC] leading-relaxed pr-1">
              <p>
                <strong>1. Local-First Storage:</strong> All weight logs, meal entries, daily routine ticks, and personal goals are stored locally in your device's private browser storage.
              </p>
              <p>
                <strong>2. Health Connect Architecture:</strong> When integrated on Android devices, Adit Fit Tracker reads only requested data types (Steps, Exercise, Calories, Sleep, Weight) via the secure Android Health Connect API. We do not transmit or sell this telemetry to external ad networks.
              </p>
              <p>
                <strong>3. AI Coach Consultation:</strong> When you consult the AI Coach, relevant daily totals (e.g. calories consumed, protein logged) are provided only for the duration of answering your query.
              </p>
              <p>
                <strong>4. Right to Deletion:</strong> You retain complete control over your data. Use the "Delete My Data" tool at any time to purge all local records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrivacyModal(false)}
              className="w-full min-h-[44px] py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-[#F5F7FA] font-bold text-xs active:scale-95 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-[#050B18]/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-[#FF5C6C]/30 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF5C6C]/15 text-[#FF5C6C] flex items-center justify-center mx-auto border border-[#FF5C6C]/30">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-bold text-[#F5F7FA] text-lg">Erase All Health Data?</h3>
              <p className="text-xs text-[#9AA8BC]">
                This will permanently delete all daily routines, meal logs, weight trends, and reset preferences. This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 min-h-[44px] rounded-xl glass-panel-subtle hover:bg-white/[0.08] text-[#9AA8BC] font-semibold text-xs active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteData}
                className="flex-1 min-h-[44px] rounded-xl bg-[#FF5C6C] hover:bg-red-600 text-white font-bold text-xs shadow-lg shadow-[#FF5C6C]/25 active:scale-95 transition"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
