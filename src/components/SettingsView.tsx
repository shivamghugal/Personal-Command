import React, { useState } from 'react';
import { 
  Settings, 
  User, 
  MapPin, 
  Bell, 
  Smartphone, 
  Monitor, 
  Shield, 
  Save, 
  Check, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { UserPreferences } from '../types';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (pref: UserPreferences) => void;
  syncStatus: {
    lastSyncTime: string;
    isSyncing: boolean;
    activeDevices: string[];
  };
  onTriggerSync: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  preferences,
  onUpdatePreferences,
  syncStatus,
  onTriggerSync,
}) => {
  const [name, setName] = useState(preferences.name);
  const [email, setEmail] = useState(preferences.email);
  const [monthlyIncome, setMonthlyIncome] = useState(preferences.monthlyIncome.toString());
  const [currency, setCurrency] = useState(preferences.currency);
  const [homeAddress, setHomeAddress] = useState(preferences.homeAddress);
  const [officeAddress, setOfficeAddress] = useState(preferences.officeAddress);
  const [commuteStart, setCommuteStart] = useState(preferences.commuteRoute.usualLeavingTime);
  const [commuteEnd, setCommuteEnd] = useState(preferences.commuteRoute.usualArrivalTime);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePreferences({
      ...preferences,
      name,
      email,
      monthlyIncome: parseFloat(monthlyIncome) || 95000,
      currency,
      homeAddress,
      officeAddress,
      commuteRoute: {
        ...preferences.commuteRoute,
        usualLeavingTime: commuteStart,
        usualArrivalTime: commuteEnd,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          <span>System Settings & Device Sync</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Configure personal profile, commute routes, sync across web and mobile, and notifications
        </p>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <RefreshCw className={`w-4 h-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Cross-Device Sync: Active</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <span className="text-[11px] text-neutral-400 block">
              Last synced: {syncStatus.lastSyncTime} • Web Dashboard & Mobile App connected
            </span>
          </div>
        </div>

        <button
          onClick={onTriggerSync}
          disabled={syncStatus.isSyncing}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all self-start sm:self-auto flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          <span>{syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>
      </div>

      {/* Connected Devices */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span>Registered Access Points</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-400" />
              <div>
                <span className="font-semibold text-white block">Desktop Web</span>
                <span className="text-[10px] text-neutral-400">Current Session (Chrome)</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Online
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-semibold text-white block">Pixel 8 Pro (Mobile App)</span>
                <span className="text-[10px] text-neutral-400">Location Reminders Active</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
              Synced
            </span>
          </div>

          <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-neutral-400" />
              <div>
                <span className="font-semibold text-white block">iPad Pro 11"</span>
                <span className="text-[10px] text-neutral-400">Calendar Widget</span>
              </div>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-700 text-neutral-400 font-mono">
              Standby
            </span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSave} className="p-5 sm:p-6 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Personal Profile & Monthly Budget Parameters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">User Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">
              Monthly Net Salary / Income (₹)
            </label>
            <input
              type="number"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-neutral-300 block mb-1">Currency Code</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
            >
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>
        </div>

        {/* Commute Coordinates & Connected Life Routes */}
        <div className="pt-4 border-t border-neutral-800 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>Commute Route & Location-Based Trigger Settings</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Office / Workplace Location
              </label>
              <input
                type="text"
                value={officeAddress}
                onChange={(e) => setOfficeAddress(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Home Residence Location
              </label>
              <input
                type="text"
                value={homeAddress}
                onChange={(e) => setHomeAddress(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Usual Office Departure Time
              </label>
              <input
                type="time"
                value={commuteStart}
                onChange={(e) => setCommuteStart(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-300 block mb-1">
                Expected Home Arrival Time
              </label>
              <input
                type="time"
                value={commuteEnd}
                onChange={(e) => setCommuteEnd(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
          {savedSuccess ? (
            <span className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
              <Check className="w-4 h-4" />
              <span>Preferences and commute routes saved successfully!</span>
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
