import React, { useState } from 'react';
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
  ListFilter
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
  const [currentDateString, setCurrentDateString] = useState('2026-09-15');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<TaskCategory>('Work');
  const [newEventType, setNewEventType] = useState<'meeting' | 'appointment' | 'task' | 'grocery' | 'travel'>('meeting');
  const [newEventDate, setNewEventDate] = useState('2026-09-15');
  const [newEventStart, setNewEventStart] = useState('14:00');
  const [newEventEnd, setNewEventEnd] = useState('15:00');
  const [newEventLocation, setNewEventLocation] = useState('');

  const safeEvents = events || [];
  const safeTasks = tasks || [];
  const safeBills = bills || [];

  // Combine calendar items: events + scheduled tasks + upcoming bills
  const combinedItems = [
    ...safeEvents.map((e) => ({
      id: e.id,
      title: e.title,
      category: e.category,
      type: e.type,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      status: e.status,
    })),
    ...safeTasks
      .filter((t) => t.startTime && t.dueDate === currentDateString)
      .map((t) => ({
        id: `t-${t.id}`,
        title: t.title,
        category: t.category,
        type: t.category === 'Shopping' ? 'grocery' : 'task',
        date: t.dueDate,
        startTime: t.startTime!,
        endTime: t.dueTime || t.startTime!,
        location: t.location,
        status: t.status,
      })),
    ...safeBills
      .filter((b) => b.dueDate === currentDateString)
      .map((b) => ({
        id: `b-${b.id}`,
        title: `💳 Pay ${b.name} (₹${b.amount})`,
        category: 'Finance' as TaskCategory,
        type: 'bill',
        date: b.dueDate,
        startTime: '21:00',
        endTime: '21:15',
        location: 'Online Netbanking',
        status: b.status === 'paid' ? 'completed' : 'pending',
      })),
  ];

  // Sort chronologically
  combinedItems.sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Category Color Mapper
  const getCategoryColor = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'work':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'personal':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'finance':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'shopping':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'travel':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'health':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const handleResolveConflict = () => {
    // Find the grocery task and shift it to 19:15
    const groceryTask = tasks.find((t) => t.category === 'Shopping' || t.title.toLowerCase().includes('grocer'));
    if (groceryTask) {
      onUpdateTask({
        ...groceryTask,
        startTime: '19:15',
        dueTime: '20:00',
        notes: (groceryTask.notes || '') + ' [Rescheduled to 19:15 to allow 30 min office commute buffer]',
      });
    }
    setConflictResolved(true);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEventTitle.trim(),
      category: newEventCategory,
      type: newEventType,
      date: newEventDate,
      startTime: newEventStart,
      endTime: newEventEnd,
      location: newEventLocation.trim() || undefined,
      status: 'pending',
    };

    onAddEvent(event);
    setIsAddModalOpen(false);
    setNewEventTitle('');
    setNewEventLocation('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            <span>Calendar & Smart Schedule</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Unified view of meetings, personal errands, commute buffers, and bill due dates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-calendar-plan-day"
            onClick={onOpenPlanDay}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-violet-600/30 hover:bg-violet-600/50 text-violet-200 border border-violet-500/40 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Schedule Optimizer</span>
          </button>

          <button
            id="btn-calendar-add-event"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* AI Conflict Detection Alert Box */}
      {!conflictResolved ? (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-amber-200 tracking-wide uppercase">
                Schedule Conflict Detected (18:30 – 19:30)
              </h3>
              <p className="text-xs text-neutral-300 mt-0.5 leading-relaxed">
                You have 3 items clustered between 6:00 PM and 7:00 PM. AI suggests moving <strong>"Buy Groceries"</strong> to <strong>7:15 PM</strong> because you leave the office at 6:30 PM with travel time along the route.
              </p>
            </div>
          </div>
          <button
            id="btn-resolve-calendar-conflict"
            onClick={handleResolveConflict}
            className="px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl transition-all shrink-0 self-end md:self-auto"
          >
            Resolve & Shift to 7:15 PM
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Schedule conflict resolved: Groceries rescheduled to 7:15 PM with 45 mins commute buffer.</span>
          </span>
          <span className="text-[11px] text-neutral-400 font-mono">Optimized</span>
        </div>
      )}

      {/* View Switcher & Navigation */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDateString('2026-09-14')}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="px-3 py-1 bg-neutral-800/80 rounded-xl border border-neutral-700 text-xs font-bold text-white font-mono">
            Tuesday, Sep 15, 2026
          </div>
          <button
            onClick={() => setCurrentDateString('2026-09-16')}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDateString('2026-09-15')}
            className="text-[11px] text-indigo-400 hover:underline px-2"
          >
            Today
          </button>
        </div>

        {/* Day / Week / Month / Agenda Tabs */}
        <div className="flex items-center bg-neutral-800 p-1 rounded-xl border border-neutral-700/60 self-start sm:self-auto">
          {(['day', 'week', 'month', 'agenda'] as CalendarMode[]).map((tab) => (
            <button
              key={tab}
              id={`calendar-view-mode-${tab}`}
              onClick={() => setMode(tab)}
              className={`px-3 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                mode === tab
                  ? 'bg-neutral-700 text-white shadow-xs font-semibold'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Day / Agenda Time Grid */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            {mode === 'month' ? 'September 2026 Overview' : 'Timeline for Tuesday, Sep 15'}
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {combinedItems.length} Scheduled Blocks
          </span>
        </div>

        {mode === 'month' ? (
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="p-2 font-bold text-neutral-500 font-mono">
                {d}
              </div>
            ))}
            {/* Simple month visualization highlighting Sep 15 */}
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const isToday = day === 15;
              return (
                <div
                  key={day}
                  className={`p-3 rounded-xl border text-left min-h-[75px] transition-colors ${
                    isToday
                      ? 'bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30'
                      : 'bg-neutral-800/30 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday ? 'text-indigo-400' : 'text-neutral-400'
                    }`}
                  >
                    {day}
                  </span>
                  {day === 15 && (
                    <div className="mt-1 space-y-1">
                      <span className="block text-[9px] truncate bg-blue-500/20 text-blue-300 px-1 rounded">
                        API Dev
                      </span>
                      <span className="block text-[9px] truncate bg-purple-500/20 text-purple-300 px-1 rounded">
                        Groceries
                      </span>
                    </div>
                  )}
                  {day === 18 && (
                    <span className="block mt-1 text-[9px] truncate bg-amber-500/20 text-amber-300 px-1 rounded">
                      Electricity Bill
                    </span>
                  )}
                  {day === 20 && (
                    <span className="block mt-1 text-[9px] truncate bg-rose-500/20 text-rose-300 px-1 rounded">
                      Regalia CC Due
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {combinedItems.map((item) => {
              const isCompleted = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isCompleted
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-70'
                      : 'bg-neutral-800/40 border-neutral-700/60 hover:border-neutral-600'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {/* Time block */}
                    <div className="w-24 shrink-0 text-left">
                      <span className="text-xs font-mono font-bold text-white block">
                        {item.startTime}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-400 block">
                        to {item.endTime}
                      </span>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-semibold border ${getCategoryColor(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>

                        <span className="text-[10px] text-neutral-400 capitalize bg-neutral-800 px-1.5 py-0.5 rounded">
                          {item.type}
                        </span>

                        {isCompleted && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-sm font-bold ${
                          isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'
                        }`}
                      >
                        {item.title}
                      </h4>

                      {item.location && (
                        <p className="text-[11px] text-neutral-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-400" />
                          <span>{item.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-mono text-neutral-400">
                      {item.type === 'bill' ? 'Financial' : 'Scheduled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" />
                <span>Add Calendar Event</span>
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="e.g. Architecture Sync with Engineering Lead"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  >
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Finance">Finance</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel">Travel</option>
                    <option value="Health">Health</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Type
                  </label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  >
                    <option value="meeting">Meeting</option>
                    <option value="appointment">Appointment</option>
                    <option value="task">Task Block</option>
                    <option value="grocery">Grocery Run</option>
                    <option value="travel">Commute / Travel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-2 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Start
                  </label>
                  <input
                    type="time"
                    value={newEventStart}
                    onChange={(e) => setNewEventStart(e.target.value)}
                    className="w-full px-2 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    End
                  </label>
                  <input
                    type="time"
                    value={newEventEnd}
                    onChange={(e) => setNewEventEnd(e.target.value)}
                    className="w-full px-2 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Location / Meeting Link
                </label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="e.g. Main Boardroom / Google Meet"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white"
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
