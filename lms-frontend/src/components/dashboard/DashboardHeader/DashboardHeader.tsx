import React from 'react';
import { Target } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';

export default function DashboardHeader() {
  const { selectedPath, setSelectedPath } = useDashboardStats();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 border border-slate-800 rounded-[1.5rem] p-4">
      <div className="flex flex-col">
        <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
          <Target className="w-4 h-4 text-cyan-400" /> Active Learning Path
        </h2>
        <p className="text-[10px] text-slate-400 mt-1">Select your specialized track to focus your curriculum.</p>
      </div>
      <div className="flex bg-slate-950 rounded-xl p-1 border border-slate-800 self-stretch md:self-auto overflow-x-auto scrollbar-none">
        {[
          { id: 'all', label: 'Global (All)' },
          { id: 'foundations', label: 'Foundations' },
          { id: 'enterprise', label: 'Enterprise SDET' },
          { id: 'regulated', label: 'Regulated' }
        ].map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPath(p.id as any)}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedPath === p.id 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900 border border-transparent'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
