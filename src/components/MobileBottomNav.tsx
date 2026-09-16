import React from 'react';
import { 
  Home, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  Sparkles,
  Mic
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
  onOpenVoiceAdd,
  pendingTasksCount = 0,
  isSimulatedMobile = false,
}) => {
  return (
    <div
      className={`${
        isSimulatedMobile
          ? 'absolute bottom-2 left-2 right-2'
          : 'fixed bottom-2 left-3 right-3 lg:hidden'
      } z-40 pointer-events-none`}
    >
      <nav 
        aria-label="Mobile Navigation"
        className="pointer-events-auto max-w-md mx-auto bg-[#0c0f17]/90 backdrop-blur-2xl border border-white/[0.12] rounded-2xl px-2 py-1.5 flex items-center justify-around shadow-[0_12px_40px_-4px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.1)] relative"
      >
        {/* 1. Home / Dashboard */}
        <button
          id="mobile-nav-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[52px] min-h-[44px] ${
            activeTab === 'dashboard'
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
          }`}
          aria-label="Dashboard"
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'dashboard' ? 'scale-110 text-indigo-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Home</span>
          {activeTab === 'dashboard' && (
            <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* 2. Tasks */}
        <button
          id="mobile-nav-tasks"
          onClick={() => setActiveTab('tasks')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[52px] min-h-[44px] ${
            activeTab === 'tasks'
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
          }`}
          aria-label="Tasks"
        >
          <div className="relative">
            <CheckSquare className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'tasks' ? 'scale-110 text-indigo-400' : ''}`} />
            {pendingTasksCount > 0 && (
              <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow-xs">
                {pendingTasksCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Tasks</span>
          {activeTab === 'tasks' && (
            <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* 3. Center Elevated Voice Action Button */}
        <div className="flex flex-col items-center justify-center -mt-6">
          <button
            id="mobile-nav-voice-action"
            onClick={onOpenVoiceAdd}
            title="Voice Command & Quick Add"
            aria-label="Voice Command"
            className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-500 via-violet-500 to-fuchsia-500 p-[2px] shadow-[0_8px_25px_rgba(99,102,241,0.45)] hover:shadow-[0_10px_30px_rgba(99,102,241,0.6)] active:scale-90 transition-all duration-200 group"
          >
            <div className="w-full h-full bg-[#0B0D14] rounded-full flex items-center justify-center group-hover:bg-[#121624] transition-colors relative overflow-hidden">
              <span className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-violet-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
              <Mic className="w-5 h-5 text-indigo-300 group-hover:text-white transition-colors relative z-10" />
            </div>
          </button>
          <span className="text-[9px] font-semibold text-indigo-300/90 mt-0.5 tracking-tight">Voice</span>
        </div>

        {/* 4. Calendar */}
        <button
          id="mobile-nav-calendar"
          onClick={() => setActiveTab('calendar')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[52px] min-h-[44px] ${
            activeTab === 'calendar'
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
          }`}
          aria-label="Calendar"
        >
          <Calendar className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'calendar' ? 'scale-110 text-indigo-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Calendar</span>
          {activeTab === 'calendar' && (
            <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* 5. Finance Hub */}
        <button
          id="mobile-nav-finance"
          onClick={() => setActiveTab('finance')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[52px] min-h-[44px] ${
            activeTab === 'finance'
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
          }`}
          aria-label="Finance"
        >
          <Wallet className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'finance' ? 'scale-110 text-indigo-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">Finance</span>
          {activeTab === 'finance' && (
            <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
          )}
        </button>

        {/* 6. AI Life Assistant */}
        <button
          id="mobile-nav-ai"
          onClick={() => setActiveTab('ai')}
          className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[52px] min-h-[44px] ${
            activeTab === 'ai'
              ? 'text-white'
              : 'text-neutral-400 hover:text-neutral-200 active:scale-95'
          }`}
          aria-label="AI Life"
        >
          <Sparkles className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'ai' ? 'scale-110 text-violet-400' : ''}`} />
          <span className="text-[10px] mt-0.5 tracking-tight font-medium">AI Life</span>
          {activeTab === 'ai' && (
            <span className="absolute -bottom-0.5 w-4 h-0.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
          )}
        </button>
      </nav>
    </div>
  );
};
