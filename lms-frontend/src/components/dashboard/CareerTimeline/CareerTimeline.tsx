import React, { useState } from 'react';
import { TrendingUp, BookOpen, Target, Clock, ShieldCheck, AlertTriangle, Lock, X, FolderGit2 } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import RankEmblem from '../RankEmblem/RankEmblem';
import XPProgress from '../StatsOverview/XPProgress';
import { STAGES } from '../../../data/stageConfig';

export default function CareerTimeline() {
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  const {
    currentRankIndex,
    nextRank,
    nextRankName,
    completedChaptersCount,
    totalChapters,
    completionPercentage,
    pathCompletedCount,
    pathTotalChapters,
    pathCompletionPercentage,
    averageScore,
    weakAreasCount,
    simulatedHoursInvested,
    getStageProgress
  } = useDashboardStats();

  return (
    <div className="premium-depth-card rounded-[2rem] p-5 flex flex-col justify-between text-left h-full min-h-[300px]">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Career Trajectory
          </h3>
          <span 
            className="text-[9px] text-slate-400 hover:text-cyan-400 font-bold uppercase tracking-widest cursor-pointer transition-colors" 
            onClick={() => setShowTrackModal(true)}
          >
            View Full Path &rarr;
          </span>
        </div>
        
        {/* Timeline badges */}
        <div className="flex items-center justify-between relative px-2 py-2 mb-4 mt-2">
          <div className="absolute top-[35px] left-[8%] right-[8%] h-[2px] bg-slate-800/40 z-0 rounded-full flex items-center">
            {/* Base filled solid path for already achieved ranks */}
            <div 
              className="h-[2px] bg-gradient-to-r from-cyan-500/70 via-blue-500/70 to-indigo-500/70 shadow-[0_0_6px_rgba(59,130,246,0.4)] transition-all duration-1000 ease-out rounded-full" 
              style={{ width: `${currentRankIndex * 33.33}%` }}
            />
            
            {/* Flowing animated energy connecting current rank to next rank */}
            {currentRankIndex < 3 && (
              <svg className="h-[2px] w-[33.33%] overflow-visible opacity-70">
                <line x1="0" y1="1" x2="100%" y2="1" stroke="#22d3ee" strokeWidth="2" className="animate-flow-timeline" />
              </svg>
            )}
          </div>
          
          {[
            { label: "Junior", sub: "Specialist", active: currentRankIndex >= 0, isCurrent: currentRankIndex === 0 },
            { label: "Automation", sub: "Engineer", active: currentRankIndex >= 1, isCurrent: currentRankIndex === 1 },
            { label: "Framework", sub: "Architect", active: currentRankIndex >= 2, isCurrent: currentRankIndex === 2 },
            { label: "Automation", sub: "Legend", active: currentRankIndex >= 3, isCurrent: currentRankIndex === 3 },
          ].map((item, idx) => {
            const emblemColor = idx === 0 ? 'rgba(6,182,212,0.4)' : idx === 1 ? 'rgba(168,85,247,0.4)' : idx === 2 ? 'rgba(234,179,8,0.4)' : 'rgba(239,68,68,0.4)';
            return (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                <div 
                  className={`w-16 h-16 rounded-xl border flex items-center justify-center transition-all duration-500 ${
                    item.isCurrent 
                      ? 'bg-slate-900 border-white/40 shadow-[0_0_24px_var(--glow-color)] scale-110 animate-float-slow' 
                      : item.active 
                        ? 'bg-slate-950 border-white/20 opacity-90 hover:scale-105' 
                        : 'bg-slate-950/60 border-slate-900 opacity-40'
                  }`}
                  style={{ 
                    '--glow-color': emblemColor 
                  } as React.CSSProperties}
                >
                  <RankEmblem rankIndex={idx} isActive={item.isCurrent} idSuffix={`timeline-${idx}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider mt-2 block leading-none ${item.isCurrent ? 'text-white font-black' : item.active ? 'text-slate-300' : 'text-slate-600'}`}>{item.label}</span>
                <span className="text-[8px] font-bold text-slate-500 mt-1 block leading-none">{item.sub}</span>
              </div>
            );
          })}
        </div>

        {/* Next Rank Progress Panel */}
        <XPProgress />
      </div>
      
      {/* Stat Cards Row */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2.5 mt-auto w-full">
        
        {/* 1. Overall Lessons */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-blue-400">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Overall Lessons</span>
          </div>
          <span className="text-[13px] font-black text-white mt-1.5 leading-none">
            {completedChaptersCount} <span className="text-[9px] text-slate-500 font-bold">/ {totalChapters}</span>
          </span>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-blue-500" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        {/* 1.5 Path Lessons */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-cyan-400">
            <Target className="w-3 h-3 flex-shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Path Progress</span>
          </div>
          <span className="text-[13px] font-black text-white mt-1.5 leading-none">
            {pathCompletedCount} <span className="text-[9px] text-slate-500 font-bold">/ {pathTotalChapters}</span>
          </span>
          <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div className="h-full bg-cyan-500" style={{ width: `${pathCompletionPercentage}%` }} />
          </div>
        </div>

        {/* 2. Average Score */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-emerald-400">
            <Target className="w-3 h-3 flex-shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Avg Score</span>
          </div>
          <span className="text-[13px] font-black text-white leading-none mt-1.5">
            {averageScore > 0 ? `${averageScore}%` : 'N/A'}
          </span>
          <span className="text-[7.5px] text-emerald-500/80 font-bold leading-none mt-1.5 truncate">
            Quiz Accuracy
          </span>
        </div>

        {/* 3. Weak Areas */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-rose-400">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Weak Areas</span>
          </div>
          <span className="text-[13px] font-black text-white leading-none mt-1.5">
            {weakAreasCount}
          </span>
          <span className="text-[7.5px] text-rose-400/80 font-bold leading-none mt-1.5 truncate">
            Score &lt; 90%
          </span>
        </div>

        {/* 4. Time Spent */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-purple-400">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Time Spent</span>
          </div>
          <span className="text-[13px] font-black text-white leading-none mt-1.5">
            {simulatedHoursInvested.toFixed(1)} <span className="text-[9px] text-slate-500 font-bold">h</span>
          </span>
          <span className="text-[7.5px] text-slate-600 font-bold leading-none mt-1.5">Invested</span>
        </div>

        {/* 5. Cert. Readiness */}
        <div className="bg-slate-950/40 border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
          <div className="flex items-center gap-1 text-amber-400">
            <ShieldCheck className="w-3 h-3 flex-shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-500">Readiness</span>
          </div>
          <span className="text-[13px] font-black text-white leading-none mt-1.5">
            {completionPercentage}%
          </span>
          <span className="text-[7.5px] text-amber-500/80 font-bold leading-none mt-1.5">
            To Cert
          </span>
        </div>
      </div>

      {/* Track / Full Path Modal */}
      {showTrackModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <button onClick={() => setShowTrackModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-indigo-400" /> Career Trajectory & Full Path
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
               <p className="text-sm text-slate-400 leading-relaxed text-left">
                 You are currently on the <span className="text-cyan-400 font-bold">Automation Engineer Path</span>. This path spans 5 major phases, covering everything from core locators to advanced enterprise architectural patterns.
               </p>
               <div className="mt-4 border border-slate-800 rounded-xl p-4 bg-slate-900/50">
                  <h4 className="text-sm font-bold text-white mb-3 text-left">Rank Progression Thresholds:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cyan-400"></div><span className="text-xs font-semibold text-slate-300">Junior Specialist</span></div><span className="text-xs text-slate-500">Starts at 20%</span></li>
                    <li className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-400"></div><span className="text-xs font-semibold text-slate-300">Automation Engineer</span></div><span className="text-xs text-slate-500">Unlocks at 50%</span></li>
                    <li className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div><span className="text-xs font-semibold text-slate-300">Framework Architect</span></div><span className="text-xs text-slate-500">Unlocks at 80%</span></li>
                    <li className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-rose-400"></div><span className="text-xs font-semibold text-slate-300">Automation Legend</span></div><span className="text-xs text-slate-500">Unlocks at 100%</span></li>
                  </ul>
               </div>
               <p className="text-xs text-slate-500 mt-2 italic text-left">* More advanced specialized tracks (like Performance Testing & Security Automation) will unlock once you reach Automation Legend.</p>
            </div>
          </div>
        </div>
      )}

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <button onClick={() => setShowProjectsModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <FolderGit2 className="w-6 h-6 text-emerald-400" /> Projects Built
            </h3>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              {STAGES.map((stage, i) => { const prog = getStageProgress(stage.key); return (
                <div key={i} className={`p-4 rounded-xl border ${prog?.isGraduated ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/50'} flex justify-between items-center`}>
                  <div className="text-left">
                    <h4 className={`font-bold ${prog?.isGraduated ? 'text-emerald-400' : 'text-slate-300'}`}>{stage.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{prog?.total} Modules</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {prog?.isGraduated ? (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-lg border border-emerald-500/20">Completed</span>
                    ) : (
                      <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold uppercase rounded-lg border border-slate-700">{prog?.completed} / {prog?.total} Built</span>
                    )}
                  </div>
                </div>
              ); })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
