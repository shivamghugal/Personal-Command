import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  MapPin, 
  Smartphone, 
  Monitor, 
  Save, 
  Check, 
  RefreshCw,
  Trash2,
  Database,
  Sparkles,
  AlertTriangle,
  Bell,
  Volume2
} from 'lucide-react';
import { UserPreferences } from '../types';
import { notificationService } from '../lib/notifications';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (pref: UserPreferences) => void;
  syncStatus: {
    lastSyncTime: string;
    isSyncing: boolean;
    activeDevices: string[];
  };
  onTriggerSync: () => void;
  onResetDatabase?: () => Promise<void>;
  onSeedDemoData?: () => Promise<void>;
  isFirebaseActive?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  syncStatus,
  onTriggerSync,
  onResetDatabase,
  onSeedDemoData,
  isFirebaseActive = true,
}) => {
  const [name, setName] = useState(preferences.name || 'Shivam');
  const [currencySymbol, setCurrencySymbol] = useState(preferences.currencySymbol || '₹');
  const [currencyCode, setCurrencyCode] = useState(preferences.currencyCode || 'INR');
  const [monthlyIncome, setMonthlyIncome] = useState((preferences.monthlyIncome || 95000).toString());
  const [monthlyBudget, setMonthlyBudget] = useState((preferences.monthlyBudget || 50000).toString());
  const [workStartTime, setWorkStartTime] = useState(preferences.workStartTime || '09:00');
  const [workEndTime, setWorkEndTime] = useState(preferences.workEndTime || '18:30');
  const [officeLocation, setOfficeLocation] = useState(preferences.officeLocation || '');
  const [homeLocation, setHomeLocation] = useState(preferences.homeLocation || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(preferences.notificationsEnabled ?? true);
  const [soundEnabled, setSoundEnabled] = useState(preferences.soundEnabled ?? true);
  const [locationRemindersEnabled, setLocationRemindersEnabled] = useState(preferences.locationRemindersEnabled ?? true);
  
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      ...preferences,
      name,
      currencySymbol,
      currencyCode,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      monthlyBudget: parseFloat(monthlyBudget) || 0,
      workStartTime,
      workEndTime,
      officeLocation,
      homeLocation,
      notificationsEnabled,
      soundEnabled,
      locationRemindersEnabled,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleConfirmReset = async () => {
    if (!onResetDatabase) return;
    setIsResetting(true);
    try {
      await onResetDatabase();
      setShowConfirmReset(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsResetting(false);
    }
  };

  const handleRunSeed = async () => {
    if (!onSeedDemoData) return;
    setIsSeeding(true);
    try {
      await onSeedDemoData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>Database & System Settings</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Manage cloud database persistence, fresh start options, personal profile, and commute settings.
        </p>
      </div>

      {/* Cloud Database Persistence Status */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Database: {isFirebaseActive ? 'Firebase Firestore Cloud DB' : 'Local State'}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[11px] text-neutral-400 block">
              Synced across devices in real-time. Last sync: {syncStatus.lastSyncTime}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onTriggerSync}
            disabled={syncStatus.isSyncing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
            <span>{syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Database Management / Fresh Start Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <Trash2 className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white">Fresh Start & Database Reset</h2>
          </div>
          <span className="text-[11px] text-neutral-400">
            Clear all sample data and start with an empty, clean slate.
          </span>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          If you want to clear the pre-loaded sample tasks, mock bank accounts, and past test transactions to enter your own real activities and finances from scratch, use the button below.
        </p>

        {showConfirmReset ? (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 text-xs font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Are you sure? This will erase all tasks, accounts, and bills in Firestore for a clean fresh start.</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={isResetting}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all flex items-center gap-1.5"
              >
                {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Yes, Reset to Clean Slate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              id="btn-fresh-start"
              onClick={() => setShowConfirmReset(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Start Fresh (Clear All Data)</span>
            </button>

            {onSeedDemoData && (
              <button
                type="button"
                onClick={handleRunSeed}
                disabled={isSeeding}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{isSeeding ? 'Loading Sample Data...' : 'Load Sample Data'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Connected Devices */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span>Registered Access Points</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-semibold text-white block">Desktop Browser</span>
                <span className="text-[10px] text-neutral-400">Current Session</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Connected
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-white block">Mobile Device / PWA</span>
                <span className="text-[10px] text-neutral-400">Real-time Cloud Sync</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Live
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Form */}
      <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Personal Profile & Financial Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Your Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Currency Symbol & Code</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="₹"
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white text-center font-bold"
              />
              <select
                value={currencyCode}
                onChange={(e) => {
                  setCurrencyCode(e.target.value);
                  if (e.target.value === 'INR') setCurrencySymbol('₹');
                  else if (e.target.value === 'USD') setCurrencySymbol('$');
                  else if (e.target.value === 'EUR') setCurrencySymbol('€');
                  else if (e.target.value === 'GBP') setCurrencySymbol('£');
                }}
                className="w-full px-2 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Monthly Net Salary / Income ({currencySymbol})
            </label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Monthly Budget Target ({currencySymbol})
            </label>
            <input
              type="number"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Commute Coordinates & Connected Life Routes */}
        <div className="pt-4 border-t border-neutral-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Commute Route & Daily Timings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Office / Workplace Location
              </label>
              <input
                type="text"
                value={officeLocation}
                placeholder="e.g., Cyber City, Tower B"
                onChange={(e) => setOfficeLocation(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Home Residence Location
              </label>
              <input
                type="text"
                value={homeLocation}
                placeholder="e.g., Sector 45, Apartment 402"
                onChange={(e) => setHomeLocation(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Usual Work / Shift Start Time
              </label>
              <input
                type="time"
                value={workStartTime}
                onChange={(e) => setWorkStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Usual Work / Departure Time
              </label>
              <input
                type="time"
                value={workEndTime}
                onChange={(e) => setWorkEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Real-time Notifications & Audio Alerts */}
        <div className="pt-4 border-t border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <span>Real-Time Notifications & Sound</span>
            </h2>
            <button
              type="button"
              onClick={() => notificationService.playChime('task')}
              className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all flex items-center gap-1.5"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Test Audio</span>
            </button>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 cursor-pointer hover:bg-neutral-800">
              <div>
                <span className="text-xs font-semibold text-white block">Task & Due Date Alerts</span>
                <span className="text-[11px] text-neutral-400">Receive alerts when scheduled tasks and bills are due.</span>
              </div>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-neutral-900 border-neutral-700 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 cursor-pointer hover:bg-neutral-800">
              <div>
                <span className="text-xs font-semibold text-white block">Audible Chimes</span>
                <span className="text-[11px] text-neutral-400">Play pleasant sound chimes when notifications or reminders fire.</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-neutral-900 border-neutral-700 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 cursor-pointer hover:bg-neutral-800">
              <div>
                <span className="text-xs font-semibold text-white block">Commute & Location Triggers</span>
                <span className="text-[11px] text-neutral-400">Surface errand alerts as you pass by stores on your commute route.</span>
              </div>
              <input
                type="checkbox"
                checked={locationRemindersEnabled}
                onChange={(e) => setLocationRemindersEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded bg-neutral-900 border-neutral-700 focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4" />
              <span>Preferences and settings saved to Cloud DB!</span>
            </span>
          ) : (
            <span className="text-xs text-neutral-500">
              Changes sync seamlessly across web and mobile.
            </span>
          )}

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};
