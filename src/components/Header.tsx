import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Mic, 
  Smartphone, 
  Monitor, 
  Sparkles,
  Calendar as CalendarIcon,
  Menu,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { UserPreferences, NotificationItem, Task, Bill } from '../types';
import { TabType } from './Sidebar';

interface HeaderProps {
  preferences?: UserPreferences;
  notifications?: NotificationItem[];
  activeTab?: TabType;
  setActiveTab?: (tab: TabType) => void;
  deviceMode?: 'desktop' | 'mobile' | 'responsive' | 'mobile-frame';
  setDeviceMode?: (mode: 'desktop' | 'mobile') => void;
  onOpenSearch?: () => void;
  onOpenNotifications?: () => void;
  onOpenQuickAdd?: (initialType?: 'task' | 'expense' | 'bill') => void;
  onOpenVoiceAdd?: () => void;
  onOpenPlanDay?: () => void;
  onOpenAI?: () => void;
  onToggleMobileMenu?: () => void;
  currentTime?: Date;
  tasks?: Task[];
  bills?: Bill[];
}

export const Header: React.FC<HeaderProps> = ({
  preferences,
  notifications = [],
  activeTab,
  setActiveTab,
  deviceMode = 'desktop',
  setDeviceMode,
  onOpenSearch,
  onOpenNotifications,
  onOpenQuickAdd,
  onOpenVoiceAdd,
  onOpenPlanDay,
  onOpenAI,
  onToggleMobileMenu,
  currentTime,
  tasks = [],
  bills = [],
}) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(notifications || []);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {
      setLocalNotifications(notifications);
    }
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotificationsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeNotifications = Array.isArray(localNotifications) ? localNotifications : [];
  const unreadCount = safeNotifications.filter((n) => !n?.read).length;

  const now = currentTime || new Date();
  const formattedDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleMarkAllAsRead = () => {
    setLocalNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const isMobile = deviceMode === 'mobile' || deviceMode === 'mobile-frame';

  return (
    <header className="sticky top-0 z-30 bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile Menu Toggle & Brand / Date */}
        <div className="flex items-center gap-3">
          {onToggleMobileMenu && (
            <button
              id="btn-toggle-mobile-menu"
              onClick={onToggleMobileMenu}
              className="lg:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
                {preferences?.name || 'Shivam'}'s Command Center
              </h1>
            </div>
            <p className="text-xs text-neutral-400 hidden sm:block">
              {formattedDate} • <span className="text-neutral-300 font-mono">{formattedTime}</span>
            </p>
          </div>
        </div>

        {/* Center: Quick Search Trigger */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <button
            id="btn-global-search-header"
            onClick={onOpenSearch || (() => setActiveTab?.('tasks'))}
            className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-neutral-400 bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700/60 rounded-xl transition-all group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-200" />
              <span>Search tasks, bills, expenses, notes...</span>
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] bg-neutral-900 border border-neutral-700 rounded text-neutral-400 font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions (Voice, Quick Add, Notifications, Device Mode Switcher) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Device Frame Switcher */}
          {setDeviceMode && (
            <div className="hidden sm:flex items-center bg-neutral-800 p-0.5 rounded-xl border border-neutral-700/60">
              <button
                id="btn-view-responsive"
                onClick={() => setDeviceMode('desktop')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  !isMobile
                    ? 'bg-neutral-700 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Full Web Desktop View"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Web View</span>
              </button>
              <button
                id="btn-view-mobile-frame"
                onClick={() => setDeviceMode('mobile')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  isMobile
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title="Simulate Mobile App Frame"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xl:inline">Mobile Frame</span>
              </button>
            </div>
          )}

          {/* Search Icon for Mobile */}
          <button
            id="btn-search-mobile"
            onClick={onOpenSearch || (() => setActiveTab?.('tasks'))}
            className="md:hidden p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Voice Input Button */}
          {onOpenVoiceAdd && (
            <button
              id="btn-header-voice-add"
              onClick={onOpenVoiceAdd}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all hover:scale-102"
              title="Voice Command & Quick Add"
            >
              <Mic className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span className="hidden sm:inline">Voice Task</span>
            </button>
          )}

          {/* Plan Day Shortcut */}
          {onOpenPlanDay && (
            <button
              id="btn-header-plan-day"
              onClick={onOpenPlanDay}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700/60 transition-all"
              title="AI Plan My Day"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Plan Day</span>
            </button>
          )}

          {/* AI Assistant Quick Pill */}
          <button
            id="btn-header-ai-assistant"
            onClick={onOpenAI || (() => setActiveTab?.('ai'))}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-gradient-to-r from-violet-600/20 to-indigo-600/20 hover:from-violet-600/30 hover:to-indigo-600/30 text-violet-300 border border-violet-500/30 transition-all"
            title="Open AI Life Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden md:inline">AI Assistant</span>
          </button>

          {/* Notifications Bell with Popover */}
          <div className="relative" ref={notifRef}>
            <button
              id="btn-header-notifications"
              onClick={() => {
                if (onOpenNotifications) {
                  onOpenNotifications();
                } else {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                }
              }}
              className="relative p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-neutral-900"></span>
              )}
            </button>

            {showNotificationsDropdown && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded text-[10px]">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] text-indigo-400 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {safeNotifications.length === 0 ? (
                    <p className="text-neutral-500 text-center py-4">No notifications</p>
                  ) : (
                    safeNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          notif.read
                            ? 'bg-neutral-800/40 border-neutral-800 text-neutral-400'
                            : 'bg-neutral-800/90 border-neutral-700 text-neutral-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-white block text-[11px]">
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                            {notif.timestamp ? notif.timestamp.slice(11, 16) : ''}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.actionLabel && (
                          <div className="mt-2 flex justify-end">
                            <button
                              onClick={() => {
                                setShowNotificationsDropdown(false);
                                if (notif.type === 'bill' || notif.type === 'credit_card') {
                                  setActiveTab?.('bills');
                                } else {
                                  setActiveTab?.('tasks');
                                }
                              }}
                              className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              <span>{notif.actionLabel}</span>
                              <span>→</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Button */}
          {onOpenQuickAdd && (
            <button
              id="btn-header-quick-add"
              onClick={() => onOpenQuickAdd('task')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all hover:shadow-emerald-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Item</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
