import React from 'react';
import { 
  Activity, 
  MapPin, 
  Clock, 
  ShoppingCart, 
  Briefcase, 
  CreditCard, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Compass,
  Sparkles
} from 'lucide-react';
import { LifeEvent, Task, Expense } from '../types';

interface TimelineFeedViewProps {
  lifeEvents: LifeEvent[];
  tasks: Task[];
  expenses: Expense[];
  onTriggerSimulateFeed?: () => void;
}

export const TimelineFeedView: React.FC<TimelineFeedViewProps> = ({
  lifeEvents,
  tasks,
  expenses,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-400" />
          <span>Connected Life Live Feed</span>
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Real-time chronological events linking your work schedule, location transit, errands, and wallet
        </p>
      </div>

      {/* Concept Explainer Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-indigo-950/30 border border-neutral-800 space-y-2">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
            The Autonomous Life Loop
          </h2>
        </div>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Unlike ordinary to-do apps, LifeOS connects your calendar with your commute and bank accounts. When you complete work and travel toward home, your errands trigger along your route, expenses auto-record into your budget, and savings projections update live.
        </p>
      </div>

      {/* Feed Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-800">
        {lifeEvents.map((item) => {
          return (
            <div key={item.id} className="relative group">
              {/* Timeline marker icon */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center text-white text-[10px] ${
                  item.type === 'location'
                    ? 'bg-indigo-600 border-indigo-400 ring-2 ring-indigo-950'
                    : item.type === 'expense'
                    ? 'bg-emerald-600 border-emerald-400 ring-2 ring-emerald-950'
                    : item.type === 'bill'
                    ? 'bg-amber-600 border-amber-400 ring-2 ring-amber-950'
                    : 'bg-neutral-700 border-neutral-500 ring-2 ring-neutral-900'
                }`}
              >
                {item.type === 'location' ? '📍' : item.type === 'expense' ? '₹' : item.type === 'bill' ? '💳' : '✓'}
              </div>

              {/* Event Card */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-neutral-300 bg-neutral-800 px-2 py-0.5 rounded">
                      {item.timestamp}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500">
                      {item.type}
                    </span>
                  </div>

                  {item.amount && (
                    <span className="text-sm font-mono font-bold text-emerald-400">
                      ₹{item.amount.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight">
                  {item.title}
                </h3>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {item.description}
                </p>

                {/* Commute route or contextual metadata */}
                {item.metadata && (
                  <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap items-center gap-2 text-[11px] text-neutral-400">
                    {item.metadata.location && (
                      <span className="flex items-center gap-1 text-indigo-300">
                        <MapPin className="w-3 h-3" />
                        <span>{item.metadata.location}</span>
                      </span>
                    )}
                    {item.metadata.category && (
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        {item.metadata.category}
                      </span>
                    )}
                    {item.metadata.savingsImpact && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{item.metadata.savingsImpact}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
