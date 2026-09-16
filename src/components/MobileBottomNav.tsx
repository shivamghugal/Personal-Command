import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  Sparkles,
  Mic,
  Plus
} from 'lucide-react';
import { TabType } from './Sidebar';

interface MobileBottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenQuickAdd?: () => void;
  onOpenVoiceAdd?: () => void;
  pendingTasksCount?: number;
  isSimulatedMobile?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickAdd,
  onOpenVoiceAdd,
  pendingTasksCount = 0,
  isSimulatedMobile = false,
}) => {
  return (
    <nav 
      aria-label="Mobile Navigation"
      className={`${
        isSimulatedMobile ? 'absolute bottom-0 left-0 right-0' : 'fixed bottom-0 left-0 right-0 lg:hidden'
      } z-40 bg-neutral-900/95 backdrop-blur-xl border-t border-neutral-800/90 px-3 py-1.5 flex items-center justify-between shadow-2xl`}
    >
      {/* 1. Home / Dashboard */}
      <button
        id="mobile-nav-dashboard"
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'dashboard' ? 'text-indigo-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Home className={`w-5 h-5 ${activeTab === 'dashboard' ? 'scale-105' : ''}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
      </button>

      {/* 2. Tasks */}
      <button
        id="mobile-nav-tasks"
        onClick={() => setActiveTab('tasks')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
          activeTab === 'tasks' ? 'text-indigo-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <div className="relative">
          <CheckSquare className={`w-5 h-5 ${activeTab === 'tasks' ? 'scale-105' : ''}`} />
          {pendingTasksCount > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 bg-indigo-600 text-white rounded-full text-[9px] font-mono flex items-center justify-center">
              {pendingTasksCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight">Tasks</span>
      </button>

      {/* 3. Center Voice Command Action Button */}
      <button
        id="mobile-nav-voice-action"
        onClick={onOpenVoiceAdd}
        title="Voice Command & Quick Add"
        className="flex flex-col items-center justify-center -top-3 relative group"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 p-0.5 shadow-xl shadow-indigo-600/40 group-active:scale-95 transition-all">
          <div className="w-full h-full bg-neutral-950 rounded-full flex items-center justify-center hover:bg-neutral-900 transition-colors">
            <Mic className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
          </div>
        </div>
        <span className="text-[9px] font-semibold text-indigo-300 mt-0.5">Voice</span>
      </button>

      {/* 4. Calendar */}
      <button
        id="mobile-nav-calendar"
        onClick={() => setActiveTab('calendar')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'calendar' ? 'text-indigo-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Calendar className={`w-5 h-5 ${activeTab === 'calendar' ? 'scale-105' : ''}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Calendar</span>
      </button>

      {/* 5. Finance Hub */}
      <button
        id="mobile-nav-finance"
        onClick={() => setActiveTab('finance')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'finance' ? 'text-indigo-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Wallet className={`w-5 h-5 ${activeTab === 'finance' ? 'scale-105' : ''}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">Finance</span>
      </button>

      {/* 6. AI Life Assistant */}
      <button
        id="mobile-nav-ai"
        onClick={() => setActiveTab('ai')}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
          activeTab === 'ai' ? 'text-violet-400 font-semibold' : 'text-neutral-400 hover:text-neutral-200'
        }`}
      >
        <Sparkles className={`w-5 h-5 ${activeTab === 'ai' ? 'scale-105 text-violet-400' : ''}`} />
        <span className="text-[10px] mt-0.5 tracking-tight">AI Life</span>
      </button>
    </nav>
  );
};
