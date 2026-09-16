import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Mic, 
  MapPin, 
  Clock, 
  Calendar as CalendarIcon, 
  Tag, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Trash2, 
  Edit3, 
  AlertCircle, 
  Sparkles,
  Repeat,
  X
} from 'lucide-react';
import { Task, TaskCategory, Priority, TaskStatus } from '../types';

interface TasksViewProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onOpenVoiceAdd: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskStatus,
  onOpenVoiceAdd,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('Work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [dueDate, setDueDate] = useState('2026-09-15');
  const [startTime, setStartTime] = useState('09:00');
  const [dueTime, setDueTime] = useState('10:00');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [location, setLocation] = useState('');
  const [context, setContext] = useState('');
  const [locationBased, setLocationBased] = useState(false);
  const [triggerWhen, setTriggerWhen] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<'daily' | 'weekly' | 'monthly' | 'weekdays'>('daily');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');

  const categories = ['All', 'Work', 'Personal', 'Finance', 'Health', 'Shopping', 'Family', 'Learning', 'Travel'];

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('Work');
    setPriority('medium');
    setStatus('pending');
    setDueDate('2026-09-15');
    setStartTime('09:00');
    setDueTime('10:00');
    setEstimatedDuration(60);
    setLocation('');
    setContext('');
    setLocationBased(false);
    setTriggerWhen('');
    setRecurring(false);
    setRecurrencePattern('daily');
    setTagsInput('');
    setNotes('');
    setEditingTask(null);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category);
    setPriority(task.priority);
    setStatus(task.status);
    setDueDate(task.dueDate);
    setStartTime(task.startTime || '');
    setDueTime(task.dueTime || '');
    setEstimatedDuration(task.estimatedDuration || 60);
    setLocation(task.location || '');
    setContext(task.context || '');
    setLocationBased(!!task.locationBased);
    setTriggerWhen(task.triggerWhen || '');
    setRecurring(!!task.recurring);
    setRecurrencePattern((task.recurrencePattern as any) || 'daily');
    setTagsInput(task.tags ? task.tags.join(', ') : '');
    setNotes(task.notes || '');
    setIsCreateModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const taskData: Task = {
      id: editingTask ? editingTask.id : `task-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      status,
      dueDate,
      startTime: startTime || undefined,
      dueTime: dueTime || undefined,
      estimatedDuration: Number(estimatedDuration) || undefined,
      location: location.trim() || undefined,
      context: context.trim() || undefined,
      locationBased,
      triggerWhen: triggerWhen.trim() || undefined,
      recurring,
      recurrencePattern: recurring ? recurrencePattern : undefined,
      tags: tagsArray.length > 0 ? tagsArray : undefined,
      notes: notes.trim() || undefined,
      createdAt: editingTask ? editingTask.createdAt : new Date().toISOString(),
      completedAt: status === 'completed' ? new Date().toISOString() : undefined,
    };

    if (editingTask) {
      onUpdateTask(taskData);
    } else {
      onAddTask(taskData);
    }

    setIsCreateModalOpen(false);
    resetForm();
  };

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.location && task.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.tags && task.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'All' || task.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'pending') matchesStatus = task.status === 'pending';
    else if (selectedStatus === 'in_progress') matchesStatus = task.status === 'in_progress';
    else if (selectedStatus === 'completed') matchesStatus = task.status === 'completed';
    else if (selectedStatus === 'today') matchesStatus = task.dueDate === '2026-09-15';

    let matchesPriority = true;
    if (selectedPriority !== 'all') matchesPriority = task.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono text-indigo-300 mb-1.5">
            <CheckSquare className="w-3 h-3 text-indigo-400" />
            <span>EXECUTIVE TASK WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Task Orchestration</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Synchronized execution across work projects, personal life, commute routes & errand triggers
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-voice-add-task"
            onClick={onOpenVoiceAdd}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-[#111624] hover:bg-[#181f33] text-indigo-300 border border-white/[0.08] hover:border-indigo-500/30 transition-all shadow-xs"
            title="Voice Task Input"
          >
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>Voice Command</span>
          </button>
          <button
            id="btn-create-task-modal"
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-[0_4px_16px_rgba(99,102,241,0.35)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e17] border border-white/[0.08] shadow-md space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              id="input-task-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, locations, or #tags..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#111624] border border-white/[0.08] focus:border-indigo-500/60 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-hidden transition-all shadow-inner"
            />
          </div>

          {/* Status Tab Filters */}
          <div className="p-1 bg-[#111624] rounded-xl border border-white/[0.06] flex items-center gap-1 overflow-x-auto pb-1 md:pb-1 custom-scrollbar shadow-inner">
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'pending', label: 'Pending' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`task-status-tab-${tab.id}`}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === tab.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar pt-1 border-t border-white/[0.06]">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1 mr-1.5 font-medium">
            <Filter className="w-3 h-3 text-neutral-500" />
            <span>Filter:</span>
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              id={`task-cat-pill-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white/[0.12] text-white border border-white/[0.2] font-semibold'
                  : 'bg-white/[0.03] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06] border border-white/[0.04]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[#0b0e17] border border-white/[0.08] space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto border border-white/[0.06]">
              <CheckSquare className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-neutral-200">No tasks found</p>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No tasks match your current filter or search criteria. Try clearing filters or create a new task.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('all');
                setSelectedPriority('all');
              }}
              className="text-xs text-indigo-400 hover:underline font-semibold"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in_progress';

            return (
              <div
                key={task.id}
                id={`task-item-${task.id}`}
                className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-start justify-between gap-3 relative overflow-hidden group shadow-xs ${
                  isCompleted
                    ? 'bg-[#0d101a]/50 border-white/[0.04] opacity-70'
                    : isInProgress
                    ? 'bg-indigo-950/25 border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.18)] ring-1 ring-indigo-500/30'
                    : 'bg-[#0f1320]/80 border-white/[0.07] hover:border-white/[0.15] hover:bg-[#131828]/90'
                }`}
              >
                {isInProgress && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}

                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  {/* Status Checkbox */}
                  <button
                    onClick={() => onToggleTaskStatus(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                        : 'border border-neutral-600 hover:border-indigo-400 bg-neutral-800/60'
                    }`}
                    title={isCompleted ? 'Mark pending' : 'Mark completed'}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Category Badge */}
                      <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white/[0.05] text-neutral-300 border border-white/[0.08]">
                        {task.category}
                      </span>

                      {/* Priority */}
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                          task.priority === 'urgent'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : task.priority === 'high'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : task.priority === 'medium'
                            ? 'bg-blue-500/15 text-blue-300 border border-blue-500/20'
                            : 'bg-neutral-800/80 text-neutral-400'
                        }`}
                      >
                        {task.priority}
                      </span>

                      {/* Schedule timing */}
                      {(task.startTime || task.dueTime) && (
                        <span className="text-[11px] font-mono text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700/50 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>
                            {task.startTime || ''}
                            {task.startTime && task.dueTime ? ' – ' : ''}
                            {task.dueTime || ''}
                          </span>
                        </span>
                      )}

                      {/* Due date */}
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1 font-mono">
                        <CalendarIcon className="w-3 h-3 text-neutral-500" />
                        <span>{task.dueDate}</span>
                      </span>

                      {/* Recurrence badge */}
                      {task.recurring && (
                        <span className="text-[10px] text-indigo-300 bg-indigo-950/60 border border-indigo-800/50 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Repeat className="w-3 h-3" />
                          <span>{task.recurrencePattern}</span>
                        </span>
                      )}

                      {/* AI Generated tag */}
                      {task.aiGenerated && (
                        <span className="text-[10px] text-violet-300 bg-violet-950/60 border border-violet-800/50 px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          <Sparkles className="w-3 h-3 text-violet-400" />
                          <span>AI Route</span>
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm sm:text-base font-bold tracking-tight ${
                        isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'
                      }`}
                    >
                      {task.title}
                    </h3>

                    {task.description && (
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    {/* Location & Context */}
                    {(task.location || task.context) && (
                      <div className="flex items-center gap-1.5 text-xs text-indigo-300 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                        <span>
                          {task.location} {task.context ? `• ${task.context}` : ''}
                        </span>
                        {task.triggerWhen && (
                          <span className="text-[10px] bg-indigo-900/60 text-indigo-200 px-1.5 py-0.5 rounded">
                            {task.triggerWhen}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        {task.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] text-neutral-400 bg-neutral-800 px-1.5 py-0.5 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-start shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80 w-full sm:w-auto justify-end">
                  {!isCompleted && !isInProgress && (
                    <button
                      onClick={() => onUpdateTask({ ...task, status: 'in_progress' })}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-800/40 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start</span>
                    </button>
                  )}
                  {isInProgress && (
                    <button
                      onClick={() => onUpdateTask({ ...task, status: 'pending' })}
                      className="px-2 py-1 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/40 flex items-center gap-1"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Pause</span>
                    </button>
                  )}

                  <button
                    onClick={() => openEditModal(task)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                    title="Edit Task"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Create/Edit Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-5 sm:p-6 space-y-4 my-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-400" />
                <span>{editingTask ? 'Edit Task' : 'Create New Task'}</span>
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Buy groceries while coming back from office"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs sm:text-sm text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-300 block mb-1">
                  Description & Checklist
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details, shopping items, meeting agenda..."
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="deferred">Deferred</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Location & Commute Context */}
              <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 space-y-3">
                <span className="text-xs font-semibold text-indigo-300 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Location & Route Trigger</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-0.5">
                      Store / Place Name
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. FreshMart Supermarket"
                      className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-neutral-400 block mb-0.5">
                      Commute Context
                    </label>
                    <input
                      type="text"
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      placeholder="e.g. Office → Home Route"
                      className="w-full px-2.5 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="chk-loc-based"
                    checked={locationBased}
                    onChange={(e) => setLocationBased(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="chk-loc-based" className="text-xs text-neutral-300">
                    Remind me when leaving office (Route-dependent)
                  </label>
                </div>
              </div>

              {/* Tags and Recurring */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-300 block mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="Engineering, Sprint, Shopping..."
                    className="w-full px-2.5 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="chk-recurring"
                    checked={recurring}
                    onChange={(e) => setRecurring(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <label htmlFor="chk-recurring" className="text-xs text-neutral-300">
                    Recurring Task
                  </label>

                  {recurring && (
                    <select
                      value={recurrencePattern}
                      onChange={(e) => setRecurrencePattern(e.target.value as any)}
                      className="ml-auto px-2 py-1 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="weekdays">Weekdays</option>
                    </select>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
                >
                  {editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
