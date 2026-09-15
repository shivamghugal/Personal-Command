import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  Receipt, 
  CreditCard as CreditCardIcon, 
  Target, 
  FileText, 
  Sparkles, 
  Settings, 
  Activity,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { BankAccount, Bill, Task } from '../types';

export type TabType = 
  | 'dashboard' 
  | 'tasks' 
  | 'calendar' 
  | 'finance' 
  | 'expenses' 
  | 'bills' 
  | 'goals' 
  | 'notes' 
  | 'ai' 
  | 'timeline' 
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tasks: Task[];
  bills: Bill[];
  bankAccounts: BankAccount[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  tasks = [],
  bills = [],
  bankAccounts = [],
  isOpenMobile,
  onCloseMobile,
}) => {
  const safeTasks = tasks || [];
  const safeBills = bills || [];
  const safeAccounts = bankAccounts || [];

  const pendingTasksCount = safeTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const upcomingBillsCount = safeBills.filter((b) => b.status === 'upcoming' || b.status === 'due_today').length;
  const totalBalance = safeAccounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks' as TabType, label: 'Tasks & Activities', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'calendar' as TabType, label: 'Calendar & Schedule', icon: Calendar },
    { id: 'finance' as TabType, label: 'Finance Overview', icon: Wallet },
    { id: 'expenses' as TabType, label: 'Expense Tracking', icon: Receipt },
    { id: 'bills' as TabType, label: 'Bills & Dues', icon: CreditCardIcon, badge: upcomingBillsCount, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'goals' as TabType, label: 'Savings Goals', icon: Target },
    { id: 'timeline' as TabType, label: 'Connected Life Feed', icon: Activity },
    { id: 'notes' as TabType, label: 'Notes & AI Ideas', icon: FileText },
    { id: 'ai' as TabType, label: 'AI Life Assistant', icon: Sparkles, highlight: true },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handleSelect = (tab: TabType) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo Branding */}
        <div>
          <div className="p-4 border-b border-neutral-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  LifeOS
                </span>
                <span className="text-[11px] text-neutral-400 block -mt-0.5">
                  Command Center
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v1.0 Live
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-xs border border-neutral-700/60 font-semibold'
                      : item.highlight
                      ? 'text-violet-300 hover:text-white hover:bg-violet-950/30'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? 'text-indigo-400'
                          : item.highlight
                          ? 'text-violet-400'
                          : 'text-neutral-400 group-hover:text-neutral-200'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                        item.badgeColor || 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card: Financial Quick Glance */}
        <div className="p-3 border-t border-neutral-800/80">
          <div className="p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/40">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
              <span>Liquid Balance</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white font-mono">
              ₹{totalBalance.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-700/40 flex items-center justify-between text-[10px] text-neutral-400">
              <span>Savings Rate: <strong className="text-emerald-400 font-semibold">41.6%</strong></span>
              <button
                onClick={() => handleSelect('finance')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
              >
                <span>Details</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
