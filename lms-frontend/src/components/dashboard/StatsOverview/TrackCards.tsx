import React from 'react';
import { Trophy } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';

export default function TrackCards() {
  const { fndStats, entStats, regStats } = useDashboardStats();

  const tracks = [
    { title: 'Foundations', stats: fndStats, colorClass: 'text-emerald-400', borderClass: 'border-emerald-500/20', bgGlow: 'bg-emerald-500/10', barClass: 'bg-emerald-500' },
    { title: 'Enterprise', stats: entStats, colorClass: 'text-blue-400', borderClass: 'border-blue-500/20', bgGlow: 'bg-blue-500/10', barClass: 'bg-blue-500' },
    { title: 'Regulated', stats: regStats, colorClass: 'text-purple-400', borderClass: 'border-purple-500/20', bgGlow: 'bg-purple-500/10', barClass: 'bg-purple-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tracks.map(p => (
        <div key={p.title} className={`bg-slate-900/50 border ${p.borderClass} rounded-[1.25rem] p-4 flex flex-col gap-2 relative overflow-hidden transition-all hover:bg-slate-800/50`}>
          <div className={`absolute top-0 right-0 w-24 h-24 ${p.bgGlow} blur-[30px] rounded-full pointer-events-none`} />
          <h3 className={`text-xs font-black uppercase tracking-wider ${p.colorClass}`}>{p.title} Track</h3>
          <div className="flex justify-between items-end mt-1">
            <span className="text-3xl font-black text-white leading-none">{p.stats.completionPercentage}%</span>
            <span className="text-xs text-slate-400 font-medium pb-0.5">{p.stats.completedModules} / {p.stats.totalModules} Lessons</span>
          </div>
          <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 border border-slate-800/50 overflow-hidden">
            <div 
              className={`${p.barClass} h-full rounded-full transition-all duration-1000 ease-out`}
              style={{ width: `${p.stats.completionPercentage}%` }}
            />
          </div>
          {p.stats.completionPercentage >= 25 && (
            <div className="mt-2 flex items-center gap-1.5 text-[10px] font-bold text-amber-400 bg-amber-400/10 w-fit px-2 py-0.5 rounded-full border border-amber-400/20">
              <Trophy className="w-3 h-3 text-amber-400" /> {p.title} {Math.floor(p.stats.completionPercentage / 25) * 25}% Complete
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
