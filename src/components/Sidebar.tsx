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
  ShieldCheck,
  Bell,
  Landmark,
  ArrowLeftRight,
  Scale
} from 'lucide-react';
import { BankAccount, Bill, Debt, NotificationItem, Task } from '../types';

export type TabType = 
  | 'dashboard' 
  | 'tasks' 
  | 'calendar' 
  | 'finance' 
  | 'accounts'
  | 'cards'
  | 'transactions'
  | 'debts'
  | 'expenses' 
  | 'bills' 
  | 'goals' 
  | 'notes' 
  | 'ai' 
  | 'timeline' 
  | 'notifications'
  | 'settings';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  tasks: Task[];
  bills: Bill[];
  bankAccounts: BankAccount[];
  debts?: Debt[];
  notifications?: NotificationItem[];
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  tasks = [],
  bills = [],
  bankAccounts = [],
  debts = [],
  notifications = [],
  isOpenMobile,
  onCloseMobile,
}) => {
  const safeTasks = tasks || [];
  const safeBills = bills || [];
  const safeAccounts = bankAccounts || [];
  const safeDebts = debts || [];
  const safeNotifications = notifications || [];

  const pendingTasksCount = safeTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length;
  const upcomingBillsCount = safeBills.filter((b) => b.status === 'upcoming' || b.status === 'due_today').length;
  const activeDebtsCount = safeDebts.filter((d) => d.status === 'active' && d.direction === 'owe').length;
  const unreadNotifCount = safeNotifications.filter((n) => !n.read).length;
  const totalBalance = safeAccounts.reduce((sum, acc) => sum + (acc.availableBalance || 0), 0);

  const navSections = [
    {
      title: 'CORE WORKSPACE',
      items: [
        { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'tasks' as TabType, label: 'Tasks & Activities', icon: CheckSquare, badge: pendingTasksCount },
        { id: 'calendar' as TabType, label: 'Calendar & Schedule', icon: Calendar },
      ],
    },
    {
      title: 'FINANCIAL COMMAND',
      items: [
        { id: 'finance' as TabType, label: 'Finance Command', icon: Wallet },
        { id: 'accounts' as TabType, label: 'Accounts & Cash', icon: Landmark },
        { id: 'cards' as TabType, label: 'Credit Cards', icon: CreditCardIcon },
        { id: 'transactions' as TabType, label: 'Transactions Ledger', icon: ArrowLeftRight },
        { id: 'bills' as TabType, label: 'Bills & Dues', icon: Receipt, badge: upcomingBillsCount, badgeColor: 'bg-amber-500/20 text-amber-300' },
        { id: 'debts' as TabType, label: 'Debts & Liabilities', icon: Scale, badge: activeDebtsCount > 0 ? activeDebtsCount : undefined, badgeColor: 'bg-rose-500/20 text-rose-300' },
        { id: 'goals' as TabType, label: 'Savings Goals', icon: Target },
      ],
    },
    {
      title: 'INTELLIGENCE & NOTES',
      items: [
        { id: 'timeline' as TabType, label: 'Connected Life Feed', icon: Activity },
        { id: 'notifications' as TabType, label: 'Alerts & Notifications', icon: Bell, badge: unreadNotifCount, badgeColor: 'bg-amber-500/20 text-amber-300' },
        { id: 'notes' as TabType, label: 'Notes & AI Ideas', icon: FileText },
        { id: 'ai' as TabType, label: 'AI Life Assistant', icon: Sparkles, highlight: true },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'settings' as TabType, label: 'Settings & Sync', icon: Settings },
      ],
    },
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
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0A0D15] border-r border-white/[0.08] flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo Branding */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/25 p-[1px]">
                <div className="w-full h-full bg-[#0d101a] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white block">
                  LifeOS Pro
                </span>
                <span className="text-[11px] text-neutral-400 block -mt-0.5 font-mono">
                  Command Center
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Sync</span>
            </span>
          </div>

          {/* Navigation Links with Section Groups */}
          <nav className="p-3 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] font-bold text-neutral-500 tracking-wider uppercase">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-nav-${item.id}`}
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group relative overflow-hidden ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-500/15 via-indigo-500/5 to-transparent text-white font-semibold shadow-xs border border-indigo-500/30'
                          : item.highlight
                          ? 'text-violet-300 hover:text-white hover:bg-violet-950/30'
                          : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                      )}

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
                        <span className="truncate">{item.label}</span>
                      </div>

                      {item.badge !== undefined && item.badge > 0 && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md font-bold ${
                            item.badgeColor || 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Card: Financial Quick Glance */}
        <div className="p-3 border-t border-white/[0.08] bg-[#080A10]">
          <div className="p-3 rounded-xl bg-[#101420] border border-white/[0.07] shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
              <span className="font-medium">Total Liquid Cash</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-base font-bold text-white font-mono tracking-tight">
              ₹{totalBalance.toLocaleString('en-IN')}
            </div>
            <div className="mt-2 pt-2 border-t border-neutral-700/40 flex items-center justify-between text-[10px] text-neutral-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Firestore Live</span>
              </span>
              <button
                onClick={() => handleSelect('finance')}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 font-semibold"
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
