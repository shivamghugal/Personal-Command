import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Check, 
  AlertTriangle, 
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { Task, Bill, UserPreferences } from '../types';
import { aiService } from '../services/aiService';

interface PlanDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  bills: Bill[];
  preferences: UserPreferences;
  onApplyPlan: (newTasks: Task[]) => void;
}

export const PlanDayModal: React.FC<PlanDayModalProps> = ({
  isOpen,
  onClose,
  tasks,
  bills,
  preferences,
  onApplyPlan,
}) => {
  const [loading, setLoading] = useState(false);
  const [aiPlanResult, setAiPlanResult] = useState<any | null>(null);

  if (!isOpen) return null;

  const handleGeneratePlan = async () => {
    setLoading(true);
    try {
      const result = await aiService.planDay(tasks, bills, preferences);
      setAiPlanResult(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!aiPlanResult?.suggestedSchedule) {
      onClose();
      return;
    }

    // Update existing tasks with the AI-suggested times
    const updatedTasks = tasks.map((task) => {
      const match = aiPlanResult.suggestedSchedule.find(
        (s: any) => s.taskTitle?.toLowerCase() === task.title.toLowerCase() || task.title.toLowerCase().includes(s.taskTitle?.toLowerCase())
      );
      if (match) {
        return {
          ...task,
          startTime: match.startTime,
          dueTime: match.endTime,
          context: match.commuteRouteContext || task.context,
          notes: (task.notes || '') + ' [Optimized by AI Life Assistant]',
        };
      }
      return task;
    });

    onApplyPlan(updatedTasks);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="bg-[#0b0e17] border border-white/[0.1] rounded-3xl w-full max-w-2xl p-6 sm:p-7 space-y-5 my-8 shadow-[0_25px_70px_rgba(0,0,0,0.8)] relative">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-violet-500/10 blur-2xl pointer-events-none rounded-full" />

        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3.5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.25)]">
              <Sparkles className="w-5 h-5 text-violet-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Autonomous Day Optimizer
              </h2>
              <p className="text-xs text-neutral-400">
                Synchronizes deep work blocks, commute routes, errands, and bill alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Initial prompt or generation trigger */}
        {!aiPlanResult && !loading && (
          <div className="space-y-4 text-center py-6 relative z-10">
            <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400 shadow-[0_0_25px_rgba(99,102,241,0.2)]">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="text-base font-bold text-white tracking-tight">
                Synthesize Today's Trajectory
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                The Connected Life Engine cross-references your tasks, commute path (office to home), opening hours, and financial payments into an effortless chronological flow.
              </p>
            </div>
            <button
              id="btn-run-ai-plan-day"
              onClick={handleGeneratePlan}
              className="px-7 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_4px_20px_rgba(99,102,241,0.4)] transition-all hover:scale-[1.02] active:scale-98"
            >
              Analyze & Generate Smart Schedule
            </button>
          </div>
        )}

        {loading && (
          <div className="p-8 text-center space-y-3.5 relative z-10">
            <RefreshCw className="w-9 h-9 text-violet-400 animate-spin mx-auto" />
            <p className="text-xs text-neutral-300 font-medium tracking-wide">
              Optimizing schedule buffers, commute routes, and financial action triggers...
            </p>
          </div>
        )}

        {aiPlanResult && (
          <div className="space-y-4 relative z-10">
            {/* AI Summary Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-violet-950/25 border border-violet-500/30 space-y-2 shadow-xs">
              <span className="text-xs font-bold text-violet-300 block uppercase tracking-wider font-mono">
                Executive Assessment
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {aiPlanResult.summary}
              </p>
            </div>

            {/* Recommendations */}
            {aiPlanResult.recommendations && (
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-neutral-400 block tracking-tight">
                  Contextual Recommendations:
                </span>
                <ul className="space-y-1">
                  {aiPlanResult.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-xs text-neutral-300 flex items-start gap-2">
                      <span className="text-amber-400 mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggested schedule blocks */}
            {aiPlanResult.suggestedSchedule && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-neutral-400 block tracking-tight">
                  Chronological Timeline:
                </span>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                  {aiPlanResult.suggestedSchedule.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#121624] border border-white/[0.07] flex items-center justify-between text-xs transition-all hover:border-white/[0.15]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-indigo-300 bg-neutral-800/80 border border-neutral-700/50 px-2.5 py-1 rounded-lg">
                          {item.startTime} – {item.endTime}
                        </span>
                        <div>
                          <span className="font-semibold text-white block">{item.taskTitle}</span>
                          {item.commuteRouteContext && (
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{item.commuteRouteContext}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {item.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08]">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800/60 transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-neutral-950 shadow-[0_0_15px_rgba(16,185,129,0.4)] flex items-center gap-1.5 transition-all active:scale-95"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Apply Schedule to Today</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
