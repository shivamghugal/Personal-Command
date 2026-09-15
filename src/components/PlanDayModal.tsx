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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 space-y-5 my-8 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-300" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                ✨ Plan My Day with Connected Life AI
              </h2>
              <p className="text-xs text-neutral-400">
                Optimizes your work blocks, errands along your commute, and bill deadlines
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Initial prompt or generation trigger */}
        {!aiPlanResult && !loading && (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-white">
                Ready to organize Tuesday, Sep 15
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                LifeOS AI will analyze your pending work tasks, office departure time (18:30), commute path to home, and grocery shopping to build an effortless schedule.
              </p>
            </div>
            <button
              id="btn-run-ai-plan-day"
              onClick={handleGeneratePlan}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              Analyze & Generate Smart Schedule
            </button>
          </div>
        )}

        {loading && (
          <div className="p-8 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
            <p className="text-xs text-neutral-300 font-medium">
              Synthesizing work meetings, transit buffer, and store opening hours...
            </p>
          </div>
        )}

        {aiPlanResult && (
          <div className="space-y-4">
            {/* AI Summary Banner */}
            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 space-y-2">
              <span className="text-xs font-bold text-violet-300 block uppercase tracking-wider">
                Autonomous Life Assessment
              </span>
              <p className="text-xs text-neutral-200 leading-relaxed">
                {aiPlanResult.summary}
              </p>
            </div>

            {/* Recommendations */}
            {aiPlanResult.recommendations && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-neutral-400 block">
                  AI Contextual Recommendations:
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
                <span className="text-xs font-semibold text-neutral-400 block">
                  Optimized Chronological Timeline:
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {aiPlanResult.suggestedSchedule.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/50 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-indigo-400 bg-neutral-800 px-2 py-0.5 rounded">
                          {item.startTime} – {item.endTime}
                        </span>
                        <div>
                          <span className="font-semibold text-white block">{item.taskTitle}</span>
                          {item.commuteRouteContext && (
                            <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-emerald-400" />
                              <span>{item.commuteRouteContext}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {item.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-800">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs text-neutral-400 hover:text-white"
              >
                Dismiss
              </button>
              <button
                onClick={handleApply}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Apply Schedule to Today</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
