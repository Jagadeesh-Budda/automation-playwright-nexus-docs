"use client";
import React from 'react';
import { Clock, Flame, Target, Settings, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useMasteryStore } from '../../../store/useMasteryStore';
import Link from 'next/link';

export default function LearningProfileWidget({ onEditProfile }: { onEditProfile: () => void }) {
  const { 
    todayMinutes, 
    dailyTargetMinutes, 
    streak, 
    skillLevel, 
    recommendedStage, 
    recommendedModule,
    getFirstIncompleteModule
  } = useMasteryStore();

  const nextModule = getFirstIncompleteModule();
  const completionPercentage = Math.min(100, Math.round((todayMinutes / dailyTargetMinutes) * 100));

  // Circular progress calculations
  const strokeRadius = 36;
  const circumference = 2 * Math.PI * strokeRadius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl flex flex-col md:flex-row items-center gap-6 text-left">
      {/* Subtle background glow */}
      <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-cyan-500/5 blur-[50px] pointer-events-none" />
      <div className="absolute -right-10 -bottom-10 h-28 w-28 rounded-full bg-purple-500/5 blur-[50px] pointer-events-none" />

      {/* 1. Radial Progress Circle */}
      <div className="relative flex items-center justify-center flex-shrink-0">
        <svg className="w-24 h-24 transform -rotate-90">
          {/* Background circle track */}
          <circle 
            cx="48" 
            cy="48" 
            r={strokeRadius} 
            className="stroke-slate-800" 
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active progress fill */}
          <circle 
            cx="48" 
            cy="48" 
            r={strokeRadius} 
            className="stroke-cyan-500 transition-all duration-500 ease-out" 
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Core Percentage/Clock text overlay */}
        <div className="absolute flex flex-col items-center justify-center">
          <Clock className="w-5.5 h-5.5 text-cyan-400" />
          <span className="text-[10px] font-black text-white mt-1">{todayMinutes}m / {dailyTargetMinutes}m</span>
        </div>
      </div>

      {/* 2. Profile Target Details */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Learning Profile</span>
            {skillLevel && (
              <span className="text-[9px] font-black bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {skillLevel}
              </span>
            )}
          </div>
          <button 
            onClick={onEditProfile}
            title="Configure Learning Settings"
            className="p-1 rounded-lg hover:bg-white/5 text-slate-500 hover:text-cyan-400 bg-transparent border-none cursor-pointer transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Target className="w-4 h-4 text-cyan-400" />
              <span>Recommended starting target:</span>
            </div>
            <div className="text-xs font-bold text-white mt-1 max-w-sm truncate">
              {recommendedStage || 'Stage 1'} · {recommendedModule || 'Fundamentals'}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-1.5 bg-orange-500/5 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-xl font-mono text-sm font-black">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse fill-orange-500" />
              <span>{streak || 1} Day Streak</span>
            </div>
          </div>
        </div>

        {/* Quick Link/Call-To-Action to continue learning */}
        {nextModule && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Next Target</span>
            <Link 
              href={`/courses/playwright/${nextModule.slug}`}
              className="text-xs font-extrabold text-cyan-400 hover:text-cyan-300 no-underline inline-flex items-center gap-1 group"
            >
              <span>{nextModule.title.split(':').slice(-1)[0]}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
