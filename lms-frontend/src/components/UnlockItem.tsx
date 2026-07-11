import React from 'react';

export interface UnlockItemProps {
  name: string;
  icon: React.ComponentType<any>;
  subtitle: string;
  progress: {
    percent: number;
    completed: number;
    total: number;
    remaining: number;
  };
  xp: string;
  color: {
    text: string;
    bg: string;
    border: string;
    glow: string;
    bar: string;
  };
  isUnlocked?: boolean;
}

export const UnlockItem: React.FC<UnlockItemProps> = ({
  name,
  icon: Icon,
  subtitle,
  progress,
  xp,
  color,
  isUnlocked
}) => {
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, progress.percent) / 100) * circumference;
  const actualUnlocked = isUnlocked || progress.percent >= 100;

  return (
    <div className={`group flex items-center justify-between p-2.5 rounded-2xl border bg-slate-950/40 transition-all duration-300 ${
      actualUnlocked 
        ? 'border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
        : 'border-white/5 hover:border-cyan-500/25 hover:bg-slate-900/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.08)] hover:-translate-y-0.5'
    }`}>
      {/* Left: Circular progress ring around icon */}
      <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0 mr-3">
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-slate-800" />
          <circle cx="22" cy="22" r={radius} stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className={`transition-all duration-1000 ease-out ${color.text}`} />
        </svg>
        <div className={`relative w-8 h-8 rounded-xl flex items-center justify-center ${color.bg} border ${color.border} group-hover:scale-105 transition-transform duration-300`}>
          <Icon className={`w-4.5 h-4.5 ${color.text} group-hover:rotate-6 transition-transform duration-300`} />
        </div>
      </div>

      {/* Middle: Details & progress bar */}
      <div className="flex-1 min-w-0 pr-3">
        <div className="flex justify-between items-baseline mb-0.5">
          <span className="text-[10.5px] font-black tracking-wide text-white uppercase truncate">{name}</span>
          <span className="text-[9px] font-bold text-slate-500 font-mono">{progress.percent}%</span>
        </div>
        <span className="text-[9.5px] text-slate-400 font-medium block truncate mb-1">{subtitle}</span>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 h-1 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
            <div className={`h-full ${color.bar} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, progress.percent)}%` }} />
          </div>
          <span className="text-[8.5px] text-slate-500 font-black uppercase flex-shrink-0 tracking-wider">
            {actualUnlocked ? (
              <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">✔ Unlocked</span>
            ) : (
              `${progress.remaining} left`
            )}
          </span>
        </div>
      </div>

      {/* Right: XP tag */}
      <div className="flex-shrink-0">
        <span className={`text-[9px] font-black px-2 py-0.75 rounded border ${
          actualUnlocked
            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]'
            : `border-white/5 bg-slate-900/60 text-slate-300 group-hover:${color.border} group-hover:${color.bg} group-hover:${color.text} transition-all duration-300`
        }`}>
          {xp}
        </span>
      </div>
    </div>
  );
};

export default UnlockItem;
