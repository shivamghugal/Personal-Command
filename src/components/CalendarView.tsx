import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Plus, 
  MapPin, 
  Check, 
  X,
  ListFilter,
  Receipt,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { CalendarEvent, Task, Bill, TaskCategory } from '../types';

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  bills: Bill[];
  onAddEvent: (event: CalendarEvent) => void;
  onOpenPlanDay: () => void;
  onUpdateTask: (task: Task) => void;
}

type CalendarMode = 'day' | 'week' | 'month' | 'agenda';

export const CalendarView: React.FC<CalendarViewProps> = ({
  events = [],
  tasks = [],
  bills = [],
  onAddEvent,
  onOpenPlanDay,
  onUpdateTask,
}) => {
  const [mode, setMode] = useState<CalendarMode>('day');
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<TaskCategory>('Work');
  const [newEventType, setNewEventType] = useState<'meeting' | 'appointment' | 'task' | 'grocery' | 'travel'>('meeting');
  const [newEventDate, setNewEventDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newEventStart, setNewEventStart] = useState('10:00');
  const [newEventEnd, setNewEventEnd] = useState('11:00');
  const [newEventLocation, setNewEventLocation] = useState('');

  const activeDateString = useMemo(() => {
    return activeDate.toISOString().split('T')[0];
  }, [activeDate]);

  // Navigate Date Helpers
  const handlePrev = () => {
    const next = new Date(activeDate);
    if (mode === 'day') next.setDate(next.getDate() - 1);
    else if (mode === 'week') next.setDate(next.getDate() - 7);
    else if (mode === 'month') next.setMonth(next.getMonth() - 1);
    else next.setDate(next.getDate() - 1);
    setActiveDate(next);
  };

  const handleNext = () => {
    const next = new Date(activeDate);
    if (mode === 'day') next.setDate(next.getDate() + 1);
    else if (mode === 'week') next.setDate(next.getDate() + 7);
    else if (mode === 'month') next.setMonth(next.getMonth() + 1);
    else next.setDate(next.getDate() + 1);
    setActiveDate(next);
  };

  const handleToday = () => {
    setActiveDate(new Date());
  };

  // Build Unified Calendar Items across database
  const allCalendarItems = useMemo(() => {
    const list: Array<{
      id: string;
      originalId: string;
      entityType: 'event' | 'task' | 'bill';
      title: string;
      category: string;
      date: string;
      startTime?: string;
      endTime?: string;
      location?: string;
      isCompleted: boolean;
      amount?: number;
    }> = [];

    // 1. Events
    (events || []).forEach((e) => {
      list.push({
        id: `event-${e.id}`,
        originalId: e.id,
        entityType: 'event',
        title: e.title,
        category: e.category,
        date: e.date,
        startTime: e.startTime,
        endTime: e.endTime,
        location: e.location,
        isCompleted: e.status === 'completed',
      });
    });

    // 2. Tasks
    (tasks || []).forEach((t) => {
      if (t.dueDate) {
        list.push({
          id: `task-${t.id}`,
          originalId: t.id,
          entityType: 'task',
          title: t.title,
          category: t.category,
          date: t.dueDate,
          startTime: t.startTime,
          endTime: t.dueTime,
          location: t.location,
          isCompleted: t.status === 'completed',
        });
      }
    });

    // 3. Bills
    (bills || []).forEach((b) => {
      if (b.dueDate) {
        list.push({
          id: `bill-${b.id}`,
          originalId: b.id,
          entityType: 'bill',
          title: `Pay ${b.name}`,
          category: 'Finance',
          date: b.dueDate,
          startTime: '20:00',
          endTime: '20:15',
          location: 'Online Netbanking',
          isCompleted: b.status === 'paid',
          amount: b.amount,
        });
      }
    });

    return list;
  }, [events, tasks, bills]);

  // Filter items for the selected day
  const dayItems = useMemo(() => {
    return allCalendarItems
      .filter((item) => item.date === activeDateString)
      .sort((a, b) => {
        const timeA = a.startTime || '99:99';
        const timeB = b.startTime || '99:99';
        return timeA.localeCompare(timeB);
      });
  }, [allCalendarItems, activeDateString]);

  // Real Dynamic Overlap / Conflict Detection
  const dynamicConflicts = useMemo(() => {
    const timedItems = dayItems.filter((item) => item.startTime);
    const conflicts: string[] = [];
    for (let i = 0; i < timedItems.length; i++) {
      for (let j = i + 1; j < timedItems.length; j++) {
        const a = timedItems[i];
        const b = timedItems[j];
        if (a.startTime === b.startTime) {
          conflicts.push(`Overlap detected at ${a.startTime}: "${a.title}" and "${b.title}"`);
        }
      }
    }
    return conflicts;
  }, [dayItems]);

  // Calculate days for Month View
  const monthData = useMemo(() => {
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    // Monday = 0, Sunday = 6
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: Array<{ dayNumber: number; dateStr: string; isCurrentMonth: boolean }> = [];

    // Fill preceding days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      days.push({
        dayNumber: d,
        dateStr: prevDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    // Fill current month
    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(year, month, i);
      days.push({
        dayNumber: i,
        dateStr: curDate.toISOString().split('T')[0],
        isCurrentMonth: true,
      });
    }

    // Fill trailing days to complete full grid
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        dayNumber: i,
        dateStr: nextDate.toISOString().split('T')[0],
        isCurrentMonth: false,
      });
    }

    return days;
  }, [activeDate]);

  // Week view 7-day range
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(activeDate);
    const day = (startOfWeek.getDay() + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - day);

    const days: Array<{ date: Date; dateStr: string; label: string }> = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(d.getDate() + i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      });
    }
    return days;
  }, [activeDate]);

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const nextStatus = task.status === 'completed' ? 'pending' : 'completed';
      onUpdateTask({ ...task, status: nextStatus });
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const event: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: newEventTitle.trim(),
      category: newEventCategory,
      type: newEventType,
      date: newEventDate,
      startTime: newEventStart,
      endTime: newEventEnd,
      location: newEventLocation.trim() || undefined,
      status: 'scheduled',
    };

    onAddEvent(event);
    setIsAddModalOpen(false);
    setNewEventTitle('');
    setNewEventLocation('');
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category.toLowerCase()) {
      case 'work':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'personal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'finance':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'shopping':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'travel':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'health':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900 border border-neutral-800 p-5 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Personal & Work Schedule</h1>
            <p className="text-xs text-neutral-400">Database-driven calendar syncing tasks, bills, and appointments</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-open-plan-day-from-cal"
            onClick={onOpenPlanDay}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>AI Plan Day</span>
          </button>
          <button
            id="btn-add-calendar-event"
            onClick={() => setIsAddModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Dynamic Overlap Warning Banner */}
      {dynamicConflicts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-300">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Schedule Conflict Detected</span>
              <span className="text-neutral-300 text-[11px]">{dynamicConflicts[0]}</span>
            </div>
          </div>
          <button
            onClick={onOpenPlanDay}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 font-semibold text-xs shrink-0 self-start sm:self-auto"
          >
            Optimize with AI
          </button>
        </div>
      )}

      {/* View Switcher & Navigation Controls */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            id="btn-calendar-prev"
            onClick={handlePrev}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3.5 py-1.5 bg-neutral-800/80 rounded-xl border border-neutral-700 text-xs font-bold text-white font-mono">
            {mode === 'month'
              ? activeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
              : activeDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </div>

          <button
            id="btn-calendar-next"
            onClick={handleNext}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            id="btn-calendar-today"
            onClick={handleToday}
            className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline px-2.5 py-1 font-semibold"
          >
            Today
          </button>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-neutral-800 p-1 rounded-xl border border-neutral-700/60 self-start sm:self-auto">
          {(['day', 'week', 'month', 'agenda'] as CalendarMode[]).map((tab) => (
            <button
              key={tab}
              id={`calendar-mode-tab-${tab}`}
              onClick={() => setMode(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                mode === tab
                  ? 'bg-neutral-700 text-white shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main View Area */}
      {/* 1. DAY VIEW */}
      {mode === 'day' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Timeline for {activeDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              {dayItems.length} Scheduled Items
            </span>
          </div>

          {dayItems.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No tasks, bills, or events scheduled for this date.
            </div>
          ) : (
            <div className="space-y-3">
              {dayItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    item.isCompleted
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-60'
                      : 'bg-neutral-800/50 border-neutral-700/60 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-3.5 flex-1">
                    {item.entityType === 'task' && (
                      <button
                        onClick={() => handleToggleTask(item.originalId)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          item.isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-neutral-600 hover:border-neutral-400 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    )}

                    {item.entityType === 'bill' && (
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                        <Receipt className="w-3 h-3" />
                      </div>
                    )}

                    {item.entityType === 'event' && (
                      <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <CalendarIcon className="w-3 h-3" />
                      </div>
                    )}

                    <div className="w-24 shrink-0 font-mono text-left">
                      <span className="text-xs font-bold text-white block">
                        {item.startTime || 'All Day'}
                      </span>
                      {item.endTime && (
                        <span className="text-[10px] text-neutral-400 block">
                          to {item.endTime}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${item.isCompleted ? 'line-through text-neutral-400' : 'text-white'}`}>
                          {item.title}
                        </span>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                          {item.category}
                        </span>
                        {item.amount && (
                          <span className="text-xs font-mono font-bold text-amber-400">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      {item.location && (
                        <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-neutral-500" />
                          <span>{item.location}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. WEEK VIEW */}
      {mode === 'week' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              7-Day Week Overview
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              Click any day to view schedule
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {weekDays.map((w) => {
              const dayRecords = allCalendarItems.filter((item) => item.date === w.dateStr);
              const isSelected = w.dateStr === activeDateString;
              const isToday = w.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={w.dateStr}
                  onClick={() => {
                    setActiveDate(w.date);
                    setMode('day');
                  }}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition-all min-h-[140px] flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/30 border-indigo-500/60 ring-1 ring-indigo-500/40'
                      : isToday
                      ? 'bg-neutral-800/70 border-neutral-700'
                      : 'bg-neutral-800/30 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-bold font-mono ${isToday ? 'text-indigo-400' : 'text-neutral-300'}`}>
                        {w.label}
                      </span>
                      {dayRecords.length > 0 && (
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-neutral-700 text-neutral-300">
                          {dayRecords.length}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {dayRecords.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className={`text-[10px] truncate px-1.5 py-0.5 rounded border ${getCategoryBadgeClass(item.category)}`}
                        >
                          {item.startTime ? `${item.startTime} ` : ''}{item.title}
                        </div>
                      ))}
                      {dayRecords.length > 3 && (
                        <span className="text-[9px] text-neutral-500 block font-mono pl-1">
                          +{dayRecords.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-[9px] text-neutral-500 block mt-2 hover:text-indigo-400">
                    View day →
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. MONTH VIEW */}
      {mode === 'month' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              {activeDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Grid
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              Click date to view details
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="p-2 font-bold text-neutral-500 font-mono text-xs">
                {d}
              </div>
            ))}

            {monthData.map((cell, idx) => {
              const cellItems = allCalendarItems.filter((i) => i.date === cell.dateStr);
              const isToday = cell.dateStr === new Date().toISOString().split('T')[0];
              const isSelected = cell.dateStr === activeDateString;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    const [y, m, d] = cell.dateStr.split('-').map(Number);
                    setActiveDate(new Date(y, m - 1, d));
                    setMode('day');
                  }}
                  className={`p-2 sm:p-2.5 rounded-xl border text-left min-h-[75px] sm:min-h-[85px] cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/40'
                      : isToday
                      ? 'bg-neutral-800/80 border-neutral-700'
                      : cell.isCurrentMonth
                      ? 'bg-neutral-800/30 border-neutral-800/80 hover:border-neutral-700'
                      : 'bg-neutral-950/40 border-neutral-900 opacity-40 hover:opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isToday ? 'text-indigo-400' : 'text-neutral-400'}`}>
                      {cell.dayNumber}
                    </span>
                    {cellItems.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                    )}
                  </div>

                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {cellItems.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        className={`text-[9px] truncate px-1 py-0.2 rounded font-medium border ${getCategoryBadgeClass(item.category)}`}
                      >
                        {item.title}
                      </div>
                    ))}
                    {cellItems.length > 2 && (
                      <span className="text-[8px] text-neutral-500 block font-mono">
                        +{cellItems.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. AGENDA VIEW */}
      {mode === 'agenda' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Chronological Agenda
            </span>
            <span className="text-xs text-neutral-500 font-mono">
              {allCalendarItems.length} Total Database Records
            </span>
          </div>

          <div className="space-y-3">
            {allCalendarItems
              .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
              .map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-neutral-800/40 border border-neutral-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-neutral-400 text-xs w-24 shrink-0">
                      {item.date}
                    </span>
                    <span className="font-mono font-bold text-white text-xs w-16 shrink-0">
                      {item.startTime || 'All Day'}
                    </span>
                    <span className="font-semibold text-white">{item.title}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryBadgeClass(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  {item.amount && (
                    <span className="font-mono font-bold text-amber-400">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white">Add Scheduled Event</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Event Title</label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Architecture Sync with Sarah"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Category</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">Start Time</label>
                  <input
                    type="time"
                    value={newEventStart}
                    onChange={(e) => setNewEventStart(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-300 block mb-1 font-medium">End Time</label>
                  <input
                    type="time"
                    value={newEventEnd}
                    onChange={(e) => setNewEventEnd(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-300 block mb-1 font-medium">Location (Optional)</label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g. Office Boardroom / FreshMart"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-neutral-800 text-neutral-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
