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
      {/* 1. Top Section / Greeting & Core Question Banner */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-900 to-indigo-950/40 p-5 sm:p-7 rounded-2xl border border-neutral-800 shadow-xl relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-800/80 border border-neutral-700/60 text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>{todayFormatted} • Live Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {greeting}, {preferences.name} 👋
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl">
              Connected life, commute schedule, and real-time personal balance sheet.
            </p>
          </div>

          {/* Quick Action Plan Day Button */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-plan-my-day-hero"
              onClick={onOpenPlanDay}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>✨ Plan My Day</span>
            </button>
            <button
              id="btn-quick-add-task-hero"
              onClick={() => onQuickAdd('task')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-neutral-800 hover:bg-neutral-700/80 text-neutral-200 border border-neutral-700/70 transition-all"
            >
              <span>+ Add Task</span>
            </button>
          </div>
        </div>

        {/* Status Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-neutral-800/80">
          <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/40">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Task Progress</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-white font-mono">{progressPercent}%</span>
              <span className="text-[11px] text-neutral-400">({completedTasks.length}/{totalTasks})</span>
            </div>
            <div className="w-full bg-neutral-700/50 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/40">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Remaining Tasks</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-white font-mono">{pendingTasks.length}</span>
              <span className="text-[11px] text-neutral-400">pending</span>
            </div>
            <p className="text-[10px] text-indigo-400 mt-1 truncate">
              Up next: {upNextTask ? upNextTask.title : 'All caught up!'}
            </p>
          </div>

          <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/40">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Bills Pending</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-amber-400 font-mono">
                {upcomingBills.length}
              </span>
              <span className="text-[11px] text-neutral-400">bills</span>
            </div>
            <p className="text-[10px] text-amber-300 mt-1 truncate">
              {nextBill ? `${nextBill.name} (${preferences.currencySymbol}${nextBill.amount.toLocaleString('en-IN')})` : 'No pending bills'}
            </p>
          </div>

          <div className="bg-neutral-800/50 p-3 rounded-xl border border-neutral-700/40">
            <div className="text-[11px] text-neutral-400 flex items-center gap-1.5">
              <CreditCardIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Card Outstanding</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-lg font-bold text-rose-400 font-mono">
                {preferences.currencySymbol}{totalCCOutstanding.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[10px] text-neutral-400 mt-1 truncate">
              {cardWithHighestDue ? `${cardWithHighestDue.name} • Due ${cardWithHighestDue.paymentDueDate}` : 'No balance due'}
            </p>
          </div>
        </div>

        {/* Proactive AI Recommendation Card */}
        <div className="mt-4 p-3.5 rounded-xl bg-violet-950/30 border border-violet-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <span className="font-semibold text-violet-200 block">
                Command Intelligence:
              </span>
              <p className="text-neutral-300 mt-0.5 leading-relaxed">
                {upNextTask ? (
                  <>
                    Priority task is <strong>"{upNextTask.title}"</strong>
                    {upNextTask.startTime ? ` at ${upNextTask.startTime}` : ''}.
                    {commuteTask && commuteTask.id !== upNextTask.id ? (
                      <> You also have <strong>"{commuteTask.title}"</strong> planned on your commute route.</>
                    ) : (
                      <> Your estimated monthly savings rate is <strong>{savingsRate}%</strong>.</>
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
            className="text-xs font-semibold text-violet-300 hover:text-white px-3 py-1.5 rounded-lg bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 transition-all shrink-0 flex items-center gap-1 self-end sm:self-auto"
          >
            <span>Optimize Schedule</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Connected Life Pipeline Visualizer */}
      <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Connected Life Flow
            </h2>
          </div>
          <span className="text-[11px] text-neutral-400">
            Work, commute route & financial synchronization
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/50">
            <span className="text-[10px] text-neutral-400 font-mono block">STEP 1 • WORK</span>
            <span className="font-semibold text-neutral-200 block mt-0.5">Office & Projects</span>
            <span className="text-[11px] text-neutral-400 block mt-1">
              {sortedTasks.find((t) => t.category === 'Work')?.title || 'Work Schedule'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/50">
            <span className="text-[10px] text-neutral-400 font-mono block">STEP 2 • ROUTE</span>
            <span className="font-semibold text-neutral-200 block mt-0.5">Commute Trigger</span>
            <span className="text-[11px] text-indigo-400 block mt-1">
              {commuteTask?.context || 'Office → Home route'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/50">
            <span className="text-[10px] text-neutral-400 font-mono block">STEP 3 • ERRAND</span>
            <span className="font-semibold text-neutral-200 block mt-0.5 truncate">
              {commuteTask?.title || 'Personal Errand'}
            </span>
            <span className="text-[11px] text-amber-400 block mt-1">
              {commuteTask?.startTime ? `${commuteTask.startTime} PM` : 'En route'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/50">
            <span className="text-[10px] text-neutral-400 font-mono block">STEP 4 • WALLET</span>
            <span className="font-semibold text-neutral-200 block mt-0.5">Auto-Ledger Entry</span>
            <span className="text-[11px] text-emerald-400 block mt-1">
              {preferences.currencySymbol}{monthlySpending.toLocaleString('en-IN')} spend
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-neutral-800/70 border border-neutral-700/50 col-span-2 md:col-span-1">
            <span className="text-[10px] text-neutral-400 font-mono block">STEP 5 • GOALS</span>
            <span className="font-semibold text-neutral-200 block mt-0.5">Net Worth Impact</span>
            <span className="text-[11px] text-violet-400 block mt-1">
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-normal">
                  {sortedTasks.length} items
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Sorted chronologically by schedule and commute
              </p>
            </div>

            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
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
                  className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isCompleted
                      ? 'bg-neutral-900/40 border-neutral-800/60 opacity-75'
                      : isInProgress
                      ? 'bg-indigo-950/20 border-indigo-500/40 ring-1 ring-indigo-500/20'
                      : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleTaskStatus(task.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'border border-neutral-600 hover:border-indigo-400'
                      }`}
                      title={isCompleted ? 'Mark pending' : 'Mark completed'}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5" />}
                    </button>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded">
                          {task.startTime || task.dueTime || 'Anytime'}
                        </span>

                        <span className="text-[10px] px-2 py-0.5 rounded-md font-medium bg-neutral-800 text-neutral-300 border border-neutral-700">
                          {task.category}
                        </span>

                        {task.priority === 'urgent' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">
                            URGENT
                          </span>
                        )}
                        {task.priority === 'high' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                            HIGH
                          </span>
                        )}

                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            isCompleted
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : isInProgress
                              ? 'bg-indigo-500/10 text-indigo-400 animate-pulse'
                              : 'bg-neutral-800 text-neutral-400'
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
                            <span className="text-indigo-300 text-[10px] bg-indigo-950/60 px-1.5 py-0.5 rounded ml-1">
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
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-indigo-300 hover:bg-neutral-800 text-xs"
                        title="Start Task"
                      >
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        onClick={() => onUpdateTaskStatus(task.id, 'pending')}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-300 hover:bg-neutral-800 text-xs"
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
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Financial Balance Sheet</span>
              </h2>
              <button
                onClick={() => onNavigateTab('finance')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
              >
                <span>Full View</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-neutral-800/60 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Net Worth</span>
                <span className={`text-base font-bold font-mono ${netWorth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {preferences.currencySymbol}{netWorth.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 flex items-center justify-between">
                <span className="text-xs text-neutral-400">Total Liquid Cash</span>
                <span className="text-sm font-bold text-white font-mono">
                  {preferences.currencySymbol}{availableBalance.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-neutral-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block">Total Liabilities</span>
                  <span className="text-[10px] text-rose-400 font-semibold">Cards & Debts</span>
                </div>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  {preferences.currencySymbol}{totalLiabilities.toLocaleString('en-IN')}
                </span>
              </div>

              {totalOwedToUser > 0 && (
                <div className="p-3 rounded-xl bg-neutral-800/60 flex items-center justify-between">
                  <span className="text-xs text-neutral-400">Receivables (Owed to you)</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">
                    {preferences.currencySymbol}{totalOwedToUser.toLocaleString('en-IN')}
                  </span>
                </div>
              )}

              <div className="p-3 rounded-xl bg-neutral-800/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block">Savings Rate</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">{savingsRate}% of income</span>
                </div>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {preferences.currencySymbol}{Math.max(0, monthlySavings).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Next Bill Action Banner */}
            {nextBill && (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40">
                <div className="flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-semibold text-amber-200 block">
                      {nextBill.name}
                    </span>
                    <span className="text-neutral-400 text-[11px]">
                      {preferences.currencySymbol}{nextBill.amount.toLocaleString('en-IN')} • Due {nextBill.dueDate}
                    </span>
                  </div>
                  <button
                    id={`btn-pay-bill-${nextBill.id}`}
                    onClick={() => onPayBillModal(nextBill)}
                    className="px-2.5 py-1 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg transition-colors"
                  >
                    Pay
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Savings Goals Widget */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                <span>Savings Goals</span>
              </h2>
              <button
                onClick={() => onNavigateTab('goals')}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-medium"
              >
                <span>Manage</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {savingsGoals.slice(0, 2).map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                return (
                  <div key={goal.id} className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/40 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-200">{goal.title}</span>
                      <span className="font-mono text-neutral-400">
                        {preferences.currencySymbol}{goal.currentAmount.toLocaleString('en-IN')} / {preferences.currencySymbol}{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-700/50 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: goal.color || '#10b981',
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Progress: <strong className="text-neutral-200">{percent}%</strong></span>
                      <span>Target: {goal.targetDate}</span>
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
