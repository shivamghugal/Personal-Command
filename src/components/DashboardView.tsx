import React, { useMemo } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  CreditCard as CreditCardIcon, 
  Sparkles, 
  MapPin, 
  ChevronRight, 
  Play, 
  Pause, 
  Check, 
  DollarSign, 
  Compass,
  Building2,
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { 
  Task, 
  Bill, 
  BankAccount, 
  CreditCard, 
  Expense, 
  SavingsGoal, 
  UserPreferences, 
  TaskStatus,
  Debt 
} from '../types';

interface DashboardViewProps {
  preferences: UserPreferences;
  tasks: Task[];
  bills: Bill[];
  bankAccounts: BankAccount[];
  creditCards: CreditCard[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  debts?: Debt[];
  onToggleTaskStatus: (taskId: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onOpenPlanDay: () => void;
  onNavigateTab: (tab: any) => void;
  onPayBillModal: (bill: Bill) => void;
  onQuickAdd: (type: 'task' | 'expense' | 'bill') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  preferences,
  tasks = [],
  bills = [],
  bankAccounts = [],
  creditCards = [],
  expenses = [],
  savingsGoals = [],
  debts = [],
  onToggleTaskStatus,
  onUpdateTaskStatus,
  onOpenPlanDay,
  onNavigateTab,
  onPayBillModal,
  onQuickAdd,
}) => {
  const safeTasks = tasks || [];
  const safeBills = bills || [];
  const safeAccounts = bankAccounts || [];
  const safeCards = creditCards || [];
  const safeExpenses = expenses || [];
  const safeDebts = debts || [];

  // Current Date & Dynamic Greeting
  const now = new Date();
  const currentHour = now.getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';
  const todayFormatted = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const todayDateStr = now.toISOString().split('T')[0];

  // Compute key stats
  const completedTasks = safeTasks.filter((t) => t.status === 'completed');
  const pendingTasks = safeTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress');
  const totalTasks = safeTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Upcoming bills due
  const upcomingBills = safeBills.filter((b) => b.status !== 'paid');
  const nextBill = upcomingBills[0];

  // Credit card due soon
  const cardWithHighestDue = [...safeCards]
    .filter((c) => c.currentOutstanding > 0)
    .sort((a, b) => b.currentOutstanding - a.currentOutstanding)[0];

  // Debts aggregates
  const totalUserOwes = safeDebts
    .filter((d) => d.direction === 'owe' && d.status !== 'settled')
    .reduce((sum, d) => sum + (d.outstandingAmount || 0), 0);

  const totalOwedToUser = safeDebts
    .filter((d) => d.direction === 'owed_to_me' && d.status !== 'settled')
    .reduce((sum, d) => sum + (d.outstandingAmount || 0), 0);

  // Financial aggregates
  const totalLiquidBalance = safeAccounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0);
  const availableBalance = safeAccounts.reduce((sum, acc) => sum + (acc.availableBalance ?? acc.currentBalance ?? 0), 0);
  const totalCCOutstanding = safeCards.reduce((sum, c) => sum + (c.currentOutstanding || 0), 0);
  const totalLiabilities = totalCCOutstanding + totalUserOwes;
  const totalAssets = totalLiquidBalance + totalOwedToUser;
  const netWorth = totalAssets - totalLiabilities;

  const monthlySpending = safeExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const monthlyIncome = preferences?.monthlyIncome || 95000;
  const monthlySavings = monthlyIncome - monthlySpending;
  const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 100) : 0;

  // Tasks ordered by time
  const sortedTasks = useMemo(() => {
    return [...safeTasks].sort((a, b) => {
      const timeA = a.startTime || a.dueTime || '99:99';
      const timeB = b.startTime || b.dueTime || '99:99';
      return timeA.localeCompare(timeB);
    });
  }, [safeTasks]);

  // Next upcoming pending task
  const upNextTask = sortedTasks.find((t) => t.status === 'pending' || t.status === 'in_progress');

  // Commute / route task if any
  const commuteTask = sortedTasks.find((t) => t.location || t.context?.toLowerCase().includes('commute') || t.category === 'Shopping');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Top Section / Greeting & Core Executive Hero Banner */}
      <div className="bg-gradient-to-br from-[#121626] via-[#0e121d] to-[#090c14] p-5 sm:p-7 rounded-3xl border border-white/[0.09] shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden">
        {/* Subtle atmospheric ambient glow */}
        <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-indigo-500/[0.07] rounded-full blur-3xl pointer-events-none -mr-28 -mt-28"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-violet-500/[0.04] rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.1] backdrop-blur-md text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
              <span className="font-medium">{todayFormatted}</span>
              <span className="text-neutral-500">•</span>
              <span className="text-indigo-300 font-mono text-[11px]">Real-Time Sync</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {preferences.name} 👋
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              Connected workspace: today's schedule, commute-aware errands, and executive balance sheet.
            </p>
          </div>

          {/* Quick Action Plan Day Button */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <button
              id="btn-plan-my-day-hero"
              onClick={onOpenPlanDay}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>✨ Plan My Day</span>
            </button>
            <button
              id="btn-quick-add-task-hero"
              onClick={() => onQuickAdd('task')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#121622] hover:bg-[#181e2e] text-neutral-200 border border-white/[0.09] transition-all hover:border-white/[0.18]"
            >
              <span>+ Add Task</span>
            </button>
          </div>
        </div>

        {/* Status Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-white/[0.07]">
          {/* Card 1: Task Progress */}
          <div className="bg-[#101420]/80 p-3.5 rounded-2xl border border-white/[0.06] shadow-inner">
            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Task Progress</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">({completedTasks.length}/{totalTasks})</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white font-mono">{progressPercent}%</span>
            </div>
            <div className="w-full bg-neutral-800/80 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Card 2: Remaining Tasks */}
          <div className="bg-[#101420]/80 p-3.5 rounded-2xl border border-white/[0.06] shadow-inner">
            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Remaining</span>
              </span>
              <span className="text-[10px] font-mono text-indigo-400 font-semibold">Active</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-white font-mono">{pendingTasks.length}</span>
              <span className="text-[11px] text-neutral-400">tasks pending</span>
            </div>
            <p className="text-[10px] text-indigo-300 mt-1 truncate font-medium">
              Next: {upNextTask ? upNextTask.title : 'All tasks completed!'}
            </p>
          </div>

          {/* Card 3: Upcoming Bills */}
          <div className="bg-[#101420]/80 p-3.5 rounded-2xl border border-white/[0.06] shadow-inner">
            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Bills Pending</span>
              </span>
              {upcomingBills.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              )}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-amber-400 font-mono">
                {upcomingBills.length}
              </span>
              <span className="text-[11px] text-neutral-400">unpaid bills</span>
            </div>
            <p className="text-[10px] text-amber-300 mt-1 truncate font-medium">
              {nextBill ? `${nextBill.name} (${preferences.currencySymbol}${nextBill.amount.toLocaleString('en-IN')})` : 'Zero pending dues'}
            </p>
          </div>

          {/* Card 4: Credit Card Liabilities */}
          <div className="bg-[#101420]/80 p-3.5 rounded-2xl border border-white/[0.06] shadow-inner">
            <div className="text-[11px] text-neutral-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <CreditCardIcon className="w-3.5 h-3.5 text-rose-400" />
                <span>Card Dues</span>
              </span>
              <span className="text-[10px] font-mono text-rose-400 font-semibold">Liabilities</span>
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-xl font-extrabold text-rose-400 font-mono">
                {preferences.currencySymbol}{totalCCOutstanding.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1 truncate">
              {cardWithHighestDue ? `${cardWithHighestDue.name} • Due ${cardWithHighestDue.paymentDueDate}` : 'No balance due'}
            </p>
          </div>
        </div>

        {/* Proactive AI Intelligence Advisory Card */}
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-neutral-900/40 border border-violet-700/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 text-violet-300 shrink-0 border border-violet-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-bold text-violet-200 block tracking-tight">
                Executive Command Intelligence:
              </span>
              <p className="text-neutral-300 mt-0.5 leading-relaxed">
                {upNextTask ? (
                  <>
                    Next priority task is <strong className="text-white">"{upNextTask.title}"</strong>
                    {upNextTask.startTime ? ` at ${upNextTask.startTime}` : ''}.
                    {commuteTask && commuteTask.id !== upNextTask.id ? (
                      <> You have <strong className="text-white">"{commuteTask.title}"</strong> mapped onto your commute route.</>
                    ) : (
                      <> Current monthly savings trajectory is <strong className="text-emerald-300">{savingsRate}%</strong>.</>
                    )}
                  </>
                ) : (
                  <>All scheduled tasks completed. You are on track with your finances and schedule.</>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPlanDay}
            className="text-xs font-semibold text-violet-200 hover:text-white px-3.5 py-1.5 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/40 transition-all shrink-0 flex items-center gap-1.5 self-end sm:self-auto shadow-xs"
          >
            <span>Optimize Schedule</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Connected Life Pipeline Visualizer */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0b0e17] border border-white/[0.08] shadow-md">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Connected Life Circuit
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
            Work • Commute Route • Wallet Synchronization
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-[#121624]/80 border border-white/[0.06] relative overflow-hidden group">
            <div className="w-1 h-full bg-indigo-500 absolute left-0 top-0 opacity-80" />
            <span className="text-[9px] text-indigo-400 font-mono font-bold block">STEP 1 • WORK</span>
            <span className="font-semibold text-neutral-100 block mt-0.5">Office & Projects</span>
            <span className="text-[11px] text-neutral-400 block mt-1 truncate">
              {sortedTasks.find((t) => t.category === 'Work')?.title || 'Work Schedule'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#121624]/80 border border-white/[0.06] relative overflow-hidden group">
            <div className="w-1 h-full bg-cyan-500 absolute left-0 top-0 opacity-80" />
            <span className="text-[9px] text-cyan-400 font-mono font-bold block">STEP 2 • ROUTE</span>
            <span className="font-semibold text-neutral-100 block mt-0.5">Commute Trigger</span>
            <span className="text-[11px] text-cyan-300 block mt-1 truncate">
              {commuteTask?.context || 'Office → Home route'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#121624]/80 border border-white/[0.06] relative overflow-hidden group">
            <div className="w-1 h-full bg-amber-500 absolute left-0 top-0 opacity-80" />
            <span className="text-[9px] text-amber-400 font-mono font-bold block">STEP 3 • ERRAND</span>
            <span className="font-semibold text-neutral-100 block mt-0.5 truncate">
              {commuteTask?.title || 'Personal Errand'}
            </span>
            <span className="text-[11px] text-amber-300 block mt-1">
              {commuteTask?.startTime ? `${commuteTask.startTime} PM` : 'En route'}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#121624]/80 border border-white/[0.06] relative overflow-hidden group">
            <div className="w-1 h-full bg-emerald-500 absolute left-0 top-0 opacity-80" />
            <span className="text-[9px] text-emerald-400 font-mono font-bold block">STEP 4 • WALLET</span>
            <span className="font-semibold text-neutral-100 block mt-0.5">Auto-Ledger Entry</span>
            <span className="text-[11px] text-emerald-300 font-mono block mt-1">
              {preferences.currencySymbol}{monthlySpending.toLocaleString('en-IN')} spend
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#121624]/80 border border-white/[0.06] col-span-2 md:col-span-1 relative overflow-hidden group">
            <div className="w-1 h-full bg-violet-500 absolute left-0 top-0 opacity-80" />
            <span className="text-[9px] text-violet-400 font-mono font-bold block">STEP 5 • GOALS</span>
            <span className="font-semibold text-neutral-100 block mt-0.5">Net Worth Impact</span>
            <span className="text-[11px] text-violet-300 font-mono block mt-1 font-semibold">
              {savingsRate}% Savings Rate
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Today's Schedule & Tasks</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-mono font-medium">
                  {sortedTasks.length} items
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Sorted chronologically by timeline, commute route & priority
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold transition-colors"
            >
              <span>View All Tasks</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline list */}
          <div className="space-y-2.5">
            {sortedTasks.slice(0, 6).map((task) => {
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in_progress';

              return (
                <div
                  key={task.id}
                  id={`dashboard-task-${task.id}`}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-start justify-between gap-3 relative overflow-hidden group ${
                    isCompleted
                      ? 'bg-[#0d101a]/50 border-white/[0.04] opacity-70'
                      : isInProgress
                      ? 'bg-indigo-950/25 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30'
                      : 'bg-[#0f1320]/80 border-white/[0.07] hover:border-white/[0.15] hover:bg-[#131828]/90 shadow-xs'
                  }`}
                >
                  {isInProgress && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                  )}

                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTaskStatus(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 text-neutral-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'border border-neutral-600 hover:border-indigo-400 hover:bg-neutral-800/60'
                      }`}
                      title={isCompleted ? 'Mark pending' : 'Mark completed'}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-medium text-neutral-300 bg-neutral-800/80 px-2 py-0.5 rounded-md border border-neutral-700/50">
                          {task.startTime || task.dueTime || 'Anytime'}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-white/[0.05] text-neutral-300 border border-white/[0.08]">
                          {task.category}
                        </span>

                        {task.priority === 'urgent' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                            URGENT
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold">
                            HIGH
                          </span>
                        )}

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isInProgress
                              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 animate-pulse'
                              : 'bg-neutral-800/60 text-neutral-400'
                          }`}
                        >
                          {isCompleted ? 'Completed' : isInProgress ? 'In Progress' : 'Pending'}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-semibold tracking-tight ${
                          isCompleted ? 'line-through text-neutral-500' : 'text-neutral-100'
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-neutral-400 line-clamp-1">
                          {task.description}
                        </p>
                      )}

                      {(task.location || task.context) && (
                        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 pt-0.5">
                          <MapPin className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>
                            {task.location} {task.context ? `(${task.context})` : ''}
                          </span>
                          {task.triggerWhen && (
                            <span className="text-indigo-300 text-[10px] bg-indigo-950/70 border border-indigo-800/40 px-1.5 py-0.5 rounded ml-1 font-mono">
                              {task.triggerWhen}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {!isCompleted && !isInProgress && (
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'in_progress')}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-indigo-300 hover:bg-neutral-800/80 border border-transparent hover:border-white/[0.08] transition-all"
                        title="Start Task"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'pending')}
                        className="p-1.5 rounded-xl text-neutral-400 hover:text-amber-300 hover:bg-neutral-800/80 border border-transparent hover:border-white/[0.08] transition-all"
                        title="Pause Task"
                      >
                        <Pause className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Financial Balance Sheet & Goals */}
        <div className="space-y-4">
          <div className="p-5 rounded-3xl bg-[#0b0e17] border border-white/[0.08] shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span>Executive Balance Sheet</span>
              </h2>
              <button
                onClick={() => onNavigateTab('finance')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-semibold"
              >
                <span>Full Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-2xl bg-[#121624]/90 border border-white/[0.06] flex items-center justify-between shadow-inner">
                <span className="text-xs text-neutral-400 font-medium">Net Worth Position</span>
                <span className={`text-base font-extrabold font-mono ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {preferences.currencySymbol}{netWorth.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121624]/90 border border-white/[0.06] flex items-center justify-between shadow-inner">
                <span className="text-xs text-neutral-400 font-medium">Total Liquid Cash</span>
                <span className="text-sm font-bold text-white font-mono">
                  {preferences.currencySymbol}{availableBalance.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#121624]/90 border border-white/[0.06] flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-xs text-neutral-400 font-medium block">Total Liabilities</span>
                  <span className="text-[10px] text-rose-400 font-semibold font-mono">Cards & Debts</span>
                </div>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  {preferences.currencySymbol}{totalLiabilities.toLocaleString('en-IN')}
                </span>
              </div>

              {totalOwedToUser > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#121624]/90 border border-white/[0.06] flex items-center justify-between shadow-inner">
                  <span className="text-xs text-neutral-400 font-medium">Receivables (Owed to you)</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {preferences.currencySymbol}{totalOwedToUser.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="p-3.5 rounded-2xl bg-[#121624]/90 border border-white/[0.06] flex items-center justify-between shadow-inner">
                <div>
                  <span className="text-xs text-neutral-400 font-medium block">Savings Trajectory</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{savingsRate}% of income</span>
                </div>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {preferences.currencySymbol}{Math.max(0, monthlySavings).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Next Bill Action Banner */}
            {nextBill && (
              <div className="p-3.5 rounded-2xl bg-amber-950/25 border border-amber-500/30 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-amber-200 block">
                      {nextBill.name}
                    </span>
                    <span className="text-neutral-400 text-[11px] font-mono mt-0.5 block">
                      {preferences.currencySymbol}{nextBill.amount.toLocaleString('en-IN')} • Due {nextBill.dueDate}
                    </span>
                  </div>
                  <button
                    id={`btn-pay-bill-${nextBill.id}`}
                    onClick={() => onPayBillModal(nextBill)}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl transition-all shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  >
                    Pay Bill
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Savings Goals Widget */}
          <div className="p-5 rounded-3xl bg-[#0b0e17] border border-white/[0.08] shadow-lg space-y-3.5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <span>Savings Targets</span>
              </h2>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-semibold"
              >
                <span>Manage</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {savingsGoals.slice(0, 2).map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="p-3.5 rounded-2xl bg-[#121624]/90 border border-white/[0.06] space-y-2 shadow-inner">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-100">{goal.title}</span>
                      <span className="font-mono text-neutral-400 text-[11px]">
                        {preferences.currencySymbol}{goal.currentAmount.toLocaleString('en-IN')} / {preferences.currencySymbol}{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-800/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 shadow-xs"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color || '#6366f1',
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Funded: <strong className="text-white font-mono">{percent}%</strong></span>
                      <span className="font-mono text-[10px]">Target: {goal.targetDate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
