"use client";
import React from 'react';
import { Check, Star, Target, ArrowRight, Flame } from 'lucide-react';
import { useMasteryStore } from '../../../store/useMasteryStore';
import modulesData from '../../../data/metadata.json';
import Link from 'next/link';
import { RecommendationEngine } from '../../../lib/recommendationEngine';

export default function PathTimeline() {
  const { completedModules, userProgress, selectedPath, streak } = useMasteryStore();

  // Filter modules based on learning path
  const pathModules = selectedPath === 'all'
    ? modulesData
    : modulesData.filter(m => (m as any).learningPaths?.includes(selectedPath));

  // Determine active next best lesson
  const nextLesson = RecommendationEngine.getNextLesson(completedModules, userProgress, selectedPath);

  // Keep a subset of modules to fit nicely in a scrolling bar
  // Show last completed, current recommended, and next 3 modules
  const currentIdx = nextLesson ? pathModules.findIndex(m => m.id === nextLesson.id) : 0;
  const startIdx = Math.max(0, currentIdx - 1);
  const endIdx = Math.min(pathModules.length, startIdx + 5);
  const visibleModules = pathModules.slice(startIdx, endIdx);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
      {/* Background decoration */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/5 blur-[55px] pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Pipeline Progress</span>
          <h4 className="text-sm font-black text-white uppercase tracking-wider">Path Timeline ({selectedPath.toUpperCase()})</h4>
        </div>
        <div className="flex items-center gap-1 bg-cyan-500/5 border border-cyan-500/10 px-2 py-1 rounded-xl text-cyan-400 font-mono text-[10px] font-black uppercase">
          <Flame className="w-3.5 h-3.5 fill-cyan-400/20" />
          <span>{streak || 1} Day Streak</span>
        </div>
      </div>

      {/* Visual Timeline Nodes */}
      <div className="relative flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 py-2 overflow-x-auto">
        {visibleModules.map((mod, idx) => {
          const isCompleted = completedModules.includes(mod.id);
          const isNext = nextLesson && nextLesson.id === mod.id;
          const isMilestone = mod.hasTasks || mod.id.includes('first') || mod.id.includes('pom');
          
          let nodeColor = 'border-slate-800 bg-slate-950 text-slate-600';
          let icon = <span className="text-[10px] font-black font-mono">{idx + startIdx + 1}</span>;

          if (isCompleted) {
            nodeColor = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]';
            icon = <Check className="w-4 h-4 stroke-[3]" />;
          } else if (isNext) {
            nodeColor = 'border-cyan-500 bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] animate-pulse';
            icon = <Star className="w-4 h-4 fill-cyan-400/20" />;
          } else if (isMilestone) {
            nodeColor = 'border-purple-500/40 bg-purple-500/5 text-purple-400';
            icon = <Target className="w-4 h-4" />;
          }

          return (
            <div key={mod.id} className="flex-1 flex flex-row md:flex-col items-center gap-3 relative min-w-[140px]">
              {/* Connector line for desktop */}
              {idx < visibleModules.length - 1 && (
                <div className="hidden md:block absolute top-5 left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] h-0.5 bg-slate-800 z-0" />
              )}

              {/* Node Circle */}
              <Link 
                href={`/courses/playwright/${mod.slug || mod.id}`}
                className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 cursor-pointer no-underline ${nodeColor}`}
              >
                {icon}
              </Link>

              {/* Label */}
              <div className="text-left md:text-center space-y-0.5">
                <span className={`text-[10px] font-black block truncate max-w-[150px] ${
                  isNext ? 'text-cyan-400' : isCompleted ? 'text-emerald-400' : 'text-slate-400'
                }`}>
                  {mod.title.split(':').slice(-1)[0].trim()}
                </span>
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest block">
                  {isNext ? 'Recommended Next' : isCompleted ? 'Passed' : isMilestone ? 'Goal Milestone' : 'Upcoming'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
