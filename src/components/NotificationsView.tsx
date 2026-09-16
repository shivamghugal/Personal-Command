import React, { useState } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Filter, 
  Volume2, 
  VolumeX,
  Plus,
  Send
} from 'lucide-react';
import { NotificationItem } from '../types';
import { notificationService } from '../lib/notifications';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDeleteNotification: (id: string) => void;
  onClearAllNotifications: () => void;
  onNavigateToItem?: (type: string, id?: string) => void;
  soundEnabled?: boolean;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onClearAllNotifications,
  onNavigateToItem,
  soundEnabled = true,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'task' | 'bill' | 'ai'>('all');
  const [testTitle, setTestTitle] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [testType, setTestType] = useState<'task' | 'bill' | 'ai' | 'milestone'>('task');
  const [showCreateCustom, setShowCreateCustom] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'task') return n.type === 'task';
    if (filter === 'bill') return n.type === 'bill' || n.type === 'credit_card';
    if (filter === 'ai') return n.type === 'ai';
    return true;
  });

  const handleTestChime = (type: 'task' | 'bill' | 'urgent' | 'success') => {
    notificationService.playChime(type);
  };

  const handleRequestBrowserPermission = async () => {
    const res = await notificationService.requestPermission();
    if (res === 'granted') {
      notificationService.sendSystemNotification('LifeOS Notifications Active', {
        body: 'You will now receive desktop and mobile notifications for due tasks & bills.',
      });
      notificationService.playChime('success');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-amber-400" />
            <span>Notification & Alert Center</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time reminders for due tasks, approaching bills, commute route triggers, and AI suggestions.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={onClearAllNotifications}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-rose-950/40 text-neutral-400 hover:text-rose-300 border border-neutral-700 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Browser Notification Banner & Audio Status */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Browser & Audio Alerts</span>
              {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted' ? (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                  Browser Push Enabled
                </span>
              ) : (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400 font-medium">
                  Web Mode
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Plays acoustic chimes and triggers desktop notifications whenever tasks or bills become due.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => handleTestChime('task')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all flex items-center gap-1.5"
            title="Test notification audio sound"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test Sound</span>
          </button>

          {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
            <button
              onClick={handleRequestBrowserPermission}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-sm"
            >
              Enable Browser Push
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-3 gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {(
            [
              { id: 'all', label: 'All Alerts', count: notifications.length },
              { id: 'unread', label: 'Unread', count: unreadCount },
              { id: 'task', label: 'Tasks', count: notifications.filter((n) => n.type === 'task').length },
              { id: 'bill', label: 'Bills & Cards', count: notifications.filter((n) => n.type === 'bill' || n.type === 'credit_card').length },
              { id: 'ai', label: 'AI Recommendations', count: notifications.filter((n) => n.type === 'ai').length },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filter === t.id
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <span>{t.label}</span>
              {t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  filter === t.id ? 'bg-neutral-700 text-neutral-200' : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 text-center space-y-2">
            <Bell className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-sm font-semibold text-neutral-300">No notifications in this view</p>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              You're all caught up! New alerts will appear when tasks reach their due time or bills become upcoming.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isUnread = !notif.read;
            const isBill = notif.type === 'bill' || notif.type === 'credit_card';
            const isTask = notif.type === 'task';
            const isAi = notif.type === 'ai';

            return (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isUnread
                    ? 'bg-neutral-900 border-neutral-700/80 shadow-md ring-1 ring-neutral-700/40'
                    : 'bg-neutral-900/60 border-neutral-800/80 text-neutral-400'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                      isBill
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : isTask
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                        : isAi
                        ? 'bg-violet-500/10 border-violet-500/30 text-violet-400'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    }`}
                  >
                    {isBill ? (
                      <CreditCard className="w-4 h-4" />
                    ) : isTask ? (
                      <Clock className="w-4 h-4" />
                    ) : isAi ? (
                      <Sparkles className="w-4 h-4" />
                    ) : (
                      <Bell className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className={`text-xs font-bold tracking-tight ${isUnread ? 'text-white' : 'text-neutral-300'}`}>
                        {notif.title}
                      </h2>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      )}
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {notif.timestamp ? new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      {notif.severity === 'urgent' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold uppercase">
                          Urgent
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {notif.message}
                    </p>

                    {notif.actionLabel && (
                      <div className="pt-1.5">
                        <button
                          onClick={() => {
                            onMarkAsRead(notif.id);
                            if (onNavigateToItem) {
                              onNavigateToItem(notif.type, notif.relatedId);
                            }
                          }}
                          className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                          <span>{notif.actionLabel}</span>
                          <span>→</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {isUnread && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-emerald-400 hover:bg-neutral-800 transition-colors"
                      title="Mark as read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteNotification(notif.id)}
                    className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-neutral-800 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
