import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  Sparkles,
  Plus
} from 'lucide-react';
import { TabType } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuickAdd: () => void;
  pendingTasksCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  pendingTasksCount,
}) => {
  const items = [
    { id: 'dashboard' as TabType, label: 'Home', icon: Home },
    { id: 'tasks' as TabType, label: 'Tasks', icon: CheckSquare, badge: pendingTasksCount },
    { id: 'calendar' as TabType, label: 'Calendar', icon: Calendar },
    { id: 'finance' as TabType, label: 'Finance', icon: Wallet },
    { id: 'ai' as TabType, label: 'AI', icon: Sparkles, isAI: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 px-2 py-1.5 flex items-center justify-around">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        if (item.isAI) {
          return (
            <button
              key={item.id}
              id="mobile-nav-ai"
              onClick={() => setActiveTab('ai')}
              className="flex flex-col items-center justify-center p-1 relative -top-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-neutral-900 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-violet-300 animate-pulse" />
                </div>
              </div>
              <span className="text-[10px] font-medium text-violet-300 mt-0.5">
                AI Life
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            id={`mobile-nav-${item.id}`}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              isActive
                ? 'text-indigo-400 font-semibold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <div className="relative">
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400 scale-105' : 'text-neutral-400'}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-indigo-600 text-white rounded-full text-[9px] font-mono flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
