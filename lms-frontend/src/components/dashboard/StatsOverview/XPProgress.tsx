import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';

export default function XPProgress() {
  const {
    nextRank,
    currentRankIndex,
    activeStage,
    nextRankName,
    activeStageProgress,
    rankProgressPercent
  } = useDashboardStats();

  if (!nextRank) return null;

  const glowColorClass = currentRankIndex === 0 ? 'bg-cyan-500' :
                         currentRankIndex === 1 ? 'bg-purple-500' :
                         currentRankIndex === 2 ? 'bg-amber-500' :
                         'bg-rose-500';

  const progressGradientClass = currentRankIndex === 0 ? 'from-purple-500 to-indigo-500 shadow-[0_0_6px_rgba(168,85,247,0.5)]' :
                                currentRankIndex === 1 ? 'from-amber-500 to-orange-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]' :
                                'from-rose-500 to-red-600 shadow-[0_0_6px_rgba(239,68,68,0.5)]';

  const rankTextColorClass = currentRankIndex === 0 ? 'text-purple-400' :
                             currentRankIndex === 1 ? 'text-amber-400' :
                             'text-rose-400';

  return (
    <div className="mt-1 mb-3 p-3 rounded-xl border border-white/5 bg-slate-950/40 flex flex-col gap-1.5 relative overflow-hidden text-left">
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] opacity-[0.08] pointer-events-none ${glowColorClass}`} />
      
      <div className="flex justify-between items-center z-10">
        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Stage Target</span>
        <span className={`text-[10px] font-black uppercase tracking-wider leading-none ${rankTextColorClass}`}>
          {activeStage?.title || nextRankName}
        </span>
      </div>
      
      <div className="flex justify-between items-end z-10 mt-1">
        <span className="text-xs font-extrabold text-white leading-none">
          {activeStage?.title || 'Current'} Progress: {activeStageProgress?.completed || 0} / {activeStageProgress?.total || 0} Lessons
        </span>
        <span className="text-[10px] font-bold text-slate-400 leading-none">{activeStageProgress?.percent || 0}% Progress</span>
      </div>
      
      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden z-10 mt-1">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${progressGradientClass}`}
          style={{ width: `${rankProgressPercent}%` }} 
        />
      </div>
    </div>
  );
}
