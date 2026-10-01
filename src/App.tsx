/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { DietView } from './components/DietView';
import { RoutineView } from './components/RoutineView';
import { ProgressView } from './components/ProgressView';
import { AICoachView } from './components/AICoachView';
import { SettingsView } from './components/SettingsView';
import { WeightModal } from './components/WeightModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { DayLog, TabType, UserProfile, HealthConnectStatus, HealthPermissionKey } from './types';
import { healthDataService } from './services/healthConnect';
import {
  calculateOverallCompletion,
  createFreshDayLog,
  formatDateOffset,
  getDayLog,
  getTodayDateString,
  loadAllLogs,
  loadProfile,
  saveAllLogs,
  saveProfile,
} from './utils/storage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [allLogs, setAllLogs] = useState<Record<string, DayLog>>(() => loadAllLogs());
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayDateString());
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string | undefined>();

  // Health Connect status state
  const [healthStatus, setHealthStatus] = useState<HealthConnectStatus>(() => healthDataService.getStatus());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Ensure current selected date has an initialized DayLog (local timezone calendar day)
  const currentDayLog = useMemo(() => {
    return getDayLog(selectedDate, allLogs, profile.currentWeight);
  }, [selectedDate, allLogs, profile.currentWeight]);

  // Persist day log if not yet saved
  useEffect(() => {
    if (!allLogs[selectedDate]) {
      const fresh = createFreshDayLog(selectedDate, profile.currentWeight);
      setAllLogs((prev) => {
        const next = { ...prev, [selectedDate]: fresh };
        saveAllLogs(next);
        return next;
      });
    }
  }, [selectedDate, allLogs, profile.currentWeight]);

  // Health Connect synchronization function
  const handleSyncHealth = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await healthDataService.syncAllMetrics();
      setHealthStatus(result.status);

      // If today is selected or in current view, apply synced metrics
      const todayStr = getTodayDateString();
      if (allLogs[todayStr]) {
        const updates: Partial<DayLog> = {};
        if (result.steps) {
          updates.steps = result.steps.value;
          updates.stepsSource = result.steps.source;
        }
        if (result.activeMinutes) {
          updates.activeMinutes = result.activeMinutes.value;
          updates.activeMinutesSource = result.activeMinutes.source;
        }
        if (result.caloriesBurned) {
          updates.caloriesBurned = result.caloriesBurned.value;
          updates.caloriesBurnedSource = result.caloriesBurned.source;
        }
        if (result.sleepHours) {
          updates.sleepHours = result.sleepHours.value;
          updates.sleepSource = result.sleepHours.source;
        }
        if (result.weight) {
          updates.weight = result.weight.value;
          updates.weightSource = result.weight.source;
        }

        if (Object.keys(updates).length > 0) {
          updates.lastSyncedAt = new Date().toISOString();
          setAllLogs((prev) => {
            const next = {
              ...prev,
              [todayStr]: { ...prev[todayStr], ...updates },
            };
            saveAllLogs(next);
            return next;
          });
        }
      }
    } catch (err) {
      console.warn('Health Connect sync failed gracefully:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [allLogs]);

  // Check Health Connect status and auto-sync on app open
  useEffect(() => {
    const initHealth = async () => {
      const current = healthDataService.getStatus();
      setHealthStatus(current);
      if (current.isConnected) {
        await handleSyncHealth();
      }
    };
    initHealth();
  }, []);

  const handleConnectHealth = async () => {
    setIsSyncing(true);
    try {
      const newStatus = await healthDataService.connectHealthData();
      setHealthStatus(newStatus);
      if (newStatus.isConnected) {
        await handleSyncHealth();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnectHealth = async () => {
    const newStatus = await healthDataService.disconnectHealthData();
    setHealthStatus(newStatus);
  };

  const handleToggleHealthPermission = async (key: HealthPermissionKey, val: boolean) => {
    const updated = await healthDataService.updatePermission(key, val);
    setHealthStatus(updated);
  };

  // Streak count
  const streakCount = useMemo(() => {
    const today = getTodayDateString();
    let count = 0;
    for (let i = 0; i < 60; i++) {
      const dateStr = formatDateOffset(today, -i);
      const log = allLogs[dateStr];
      if (!log) {
        if (i === 0) continue;
        break;
      }
      const habitsDone = Object.values(log.habits || {}).filter(Boolean).length;
      if (habitsDone >= 3 || log.steps >= 5000 || log.waterMl >= 2000) {
        count++;
      } else {
        if (i === 0) continue;
        break;
      }
    }
    return Math.max(1, count);
  }, [allLogs]);

  // Overall daily completion %
  const dailyCompletion = useMemo(() => {
    return calculateOverallCompletion(currentDayLog, profile);
  }, [currentDayLog, profile]);

  // Pending habits count for mobile badge
  const pendingHabitsCount = useMemo(() => {
    const total = 8;
    const done = Object.values(currentDayLog.habits || {}).filter(Boolean).length;
    return Math.max(0, total - done);
  }, [currentDayLog]);

  // Handlers
  const handleUpdateDayLog = (updatedFields: Partial<DayLog>) => {
    const updated: DayLog = {
      ...currentDayLog,
      ...updatedFields,
    };

    setAllLogs((prev) => {
      const next = { ...prev, [selectedDate]: updated };
      saveAllLogs(next);
      return next;
    });
  };

  const handleToggleHabit = (habitKey: string) => {
    const currentStatus = !!currentDayLog.habits[habitKey];
    const newStatus = !currentStatus;

    const updatedHabits = {
      ...currentDayLog.habits,
      [habitKey]: newStatus,
    };

    let updatedWater = currentDayLog.waterMl;
    if (habitKey === 'waterTarget' && newStatus && updatedWater < 2500) {
      updatedWater = 2500;
    }

    let updatedSteps = currentDayLog.steps;
    let updatedActive = currentDayLog.activeMinutes;
    if (habitKey === 'walking' && newStatus && updatedSteps < 5000) {
      updatedSteps = 6000;
      updatedActive = Math.max(updatedActive, 35);
    }

    handleUpdateDayLog({
      habits: updatedHabits,
      waterMl: updatedWater,
      steps: updatedSteps,
      activeMinutes: updatedActive,
    });
  };

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleResetToday = () => {
    if (confirm('Reset today to a blank routine and log?')) {
      const fresh = createFreshDayLog(selectedDate, profile.currentWeight);
      setAllLogs((prev) => {
        const next = { ...prev, [selectedDate]: fresh };
        saveAllLogs(next);
        return next;
      });
    }
  };

  const handleSaveWeight = (weight: number) => {
    handleUpdateDayLog({ weight, weightSource: 'manual' });
    const updatedProf = { ...profile, currentWeight: weight };
    setProfile(updatedProf);
    saveProfile(updatedProf);
  };

  const handleAskCoachQuestion = (question: string) => {
    setCoachInitialPrompt(question);
    setCurrentTab('coach');
  };

  return (
    <div className="min-h-screen bg-[#050B18] text-[#F5F7FA] relative flex flex-col md:flex-row antialiased selection:bg-[#00D9B5] selection:text-[#050B18] overflow-x-hidden">
      {/* Subtle Background Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full bg-[#00D9B5]/[0.035] blur-[140px]" />
        <div className="absolute -bottom-32 -left-32 w-[550px] h-[550px] rounded-full bg-[#00C8FF]/[0.03] blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-[#0A1A3A]/[0.2] blur-[160px]" />
      </div>

      {/* Desktop / Laptop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        profile={profile}
        dailyCompletion={dailyCompletion}
        streakCount={streakCount}
      />

      {/* Main Content Area: Responsive flex container */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Header
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          streakCount={streakCount}
          currentWeight={currentDayLog.weight || profile.currentWeight}
          weightUnit={profile.weightUnit}
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          onOpenSettings={() => setCurrentTab('settings')}
          currentTab={currentTab}
          healthStatus={healthStatus}
          onSyncHealth={handleSyncHealth}
          isSyncing={isSyncing}
        />

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'home' && (
            <HomeView
              dayLog={currentDayLog}
              allLogs={allLogs}
              profile={profile}
              healthStatus={healthStatus}
              onUpdateDayLog={handleUpdateDayLog}
              onToggleHabit={handleToggleHabit}
              onNavigateTab={setCurrentTab}
              onOpenWeightModal={() => setIsWeightModalOpen(true)}
              onAskCoachQuestion={handleAskCoachQuestion}
              onSyncHealth={handleSyncHealth}
              isSyncing={isSyncing}
            />
          )}

          {currentTab === 'diet' && (
            <DietView
              dayLog={currentDayLog}
              profile={profile}
              onUpdateDayLog={handleUpdateDayLog}
              onAskCoachQuestion={handleAskCoachQuestion}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'routine' && (
            <RoutineView
              dayLog={currentDayLog}
              allLogs={allLogs}
              profile={profile}
              streakCount={streakCount}
              onToggleHabit={handleToggleHabit}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressView
              allLogs={allLogs}
              profile={profile}
            />
          )}

          {currentTab === 'coach' && (
            <AICoachView
              dayLog={currentDayLog}
              profile={profile}
              healthStatus={healthStatus}
              initialQuestion={coachInitialPrompt}
              onClearInitialQuestion={() => setCoachInitialPrompt(undefined)}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onResetToday={handleResetToday}
              allLogs={allLogs}
              onReloadHistory={(logs) => setAllLogs(logs)}
              healthStatus={healthStatus}
              onConnectHealth={handleConnectHealth}
              onDisconnectHealth={handleDisconnectHealth}
              onSyncHealth={handleSyncHealth}
              onToggleHealthPermission={handleToggleHealthPermission}
              isSyncing={isSyncing}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingHabitsCount={pendingHabitsCount}
      />

      {/* Weight Modal */}
      {isWeightModalOpen && (
        <WeightModal
          currentWeight={currentDayLog.weight || profile.currentWeight}
          weightUnit={profile.weightUnit}
          onSaveWeight={handleSaveWeight}
          onClose={() => setIsWeightModalOpen(false)}
        />
      )}

      {/* Offline Status Toast */}
      <OfflineIndicator />
    </div>
  );
}
