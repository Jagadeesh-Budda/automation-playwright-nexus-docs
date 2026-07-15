"use client";
import React, { useEffect, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Lock, CheckCircle2, Flame, Target, ChevronDown, ChevronRight, ShoppingBag
} from 'lucide-react';
import modulesData from '../data/metadata.json';
import { useMasteryStore } from '../store/useMasteryStore';
import { STAGES } from '../data/stageConfig';
import { PathEligibilityBadge } from './PathEligibilityBadge';

export default function Sidebar() {
  const pathname = usePathname();
  const { completedModules, initUser, isSidebarExpanded, setSidebarExpanded, streak, unlockedAchievements, selectedPath, setPremiumModalOpen, getFirstIncompleteModule, isReadingModeActive } = useMasteryStore();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  if (isReadingModeActive) return null;

  const pathModules = selectedPath === 'all' ? modulesData : modulesData.filter(m => (m as any).learningPaths?.includes(selectedPath));

  useEffect(() => {
    initUser();
  }, [initUser]);

  const handleMouseEnter = useCallback(() => setSidebarExpanded(true), [setSidebarExpanded]);
  const handleMouseLeave = useCallback(() => setSidebarExpanded(false), [setSidebarExpanded]);

  const isDashboard = pathname === '/';

  // --- XP & Rank Logic ---
  const totalChapters = modulesData.length;
  const completedChaptersCount = completedModules.length;
  const completionPercentage = totalChapters > 0 ? Math.round((completedChaptersCount / totalChapters) * 100) : 0;

  let currentRankIndex = 0;
  if (completionPercentage >= 20 && completionPercentage < 50) currentRankIndex = 1;
  else if (completionPercentage >= 50 && completionPercentage < 80) currentRankIndex = 2;
  else if (completionPercentage >= 80) currentRankIndex = 3;

  const RANKS = [
    { name: "Junior Specialist" },
    { name: "Automation Engineer" },
    { name: "Framework Architect" },
    { name: "Automation Legend" }
  ];
  const currentRank = RANKS[currentRankIndex];
  
  // Simulated XP logic mirroring the main dashboard calculation
  let xp = (completedChaptersCount * 15) + (streak > 0 ? 20 : 0) + (unlockedAchievements.length * 100);
  for (let i = 0; i < currentRankIndex; i++) {
    xp += (i + 1) * 500;
  }

  // --- Determine Active Stage ---
  let activeStageIndex = STAGES.findIndex((stage) => {
    const stageModules = pathModules.filter(m => stage.groups.includes(m.group));
    if (stageModules.length === 0) return false;
    const completed = stageModules.filter(m => completedModules.includes(m.id)).length;
    const allLessonsPassed = stageModules.length > 0 && completed === stageModules.length;
    const milestonePassed = completedModules.includes(stage.milestone.challengeLessonId);
    return !(allLessonsPassed && milestonePassed); // First stage that is NOT graduated
  });
  if (activeStageIndex === -1 || process.env.NODE_ENV === 'development') {
    activeStageIndex = STAGES.length - 1; // all graduated/unlocked in dev mode
  }

  const currentLesson = getFirstIncompleteModule();
  const remainingLessonsCount = pathModules.length - completedModules.length;
  const pathLabel = selectedPath === 'all' 
    ? 'Global' 
    : selectedPath.charAt(0).toUpperCase() + selectedPath.slice(1);

  return (
    <>
      <style>{`
        @keyframes particleDrop {
          0% { top: 0%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-particle {
          animation: particleDrop 4s infinite ease-in-out;
        }
      `}</style>
      {/* Mobile Backdrop Overlay */}
      {isSidebarExpanded && (
        <div 
          onClick={() => setSidebarExpanded(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[999] lg:hidden"
        />
      )}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed top-0 h-screen flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] z-[1000] shadow-[2px_0_12px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 ease-in-out w-[280px] lg:w-auto ${
          isSidebarExpanded 
            ? 'left-0 lg:w-[280px]' 
            : 'left-[-280px] lg:left-0 lg:w-[70px]'
        }`}
      >
        {/* 1. Header: Branding */}
        <div className={`flex items-center border-b border-[var(--border-color)] flex-shrink-0 transition-all duration-300 ${
          isSidebarExpanded ? 'p-5' : 'p-4 justify-center'
        }`}>
          <Link href="/" onClick={() => setSidebarExpanded(false)} className="no-underline flex items-center group">
            <div className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/20 relative overflow-hidden flex flex-shrink-0 items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
              <svg className="w-8 h-8 relative z-10" viewBox="0 0 100 100">
                <polygon points="50,15 85,30 85,65 50,85 15,65 15,30" fill="rgba(6,182,212,0.15)" stroke="#06b6d4" strokeWidth="3" />
                <line x1="50" y1="15" x2="50" y2="85" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                <line x1="15" y1="30" x2="85" y2="65" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                <line x1="15" y1="65" x2="85" y2="30" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
                <circle cx="50" cy="50" r="6" fill="#22d3ee" />
              </svg>
            </div>
            <div
              className={`flex flex-col ml-3 transition-all duration-300 overflow-hidden ${
                isSidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
              }`}
            >
              <span className="text-sm font-black text-white uppercase tracking-[0.12em] leading-none">Nexus</span>
              <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-[0.25em] leading-none mt-1">Academy</span>
            </div>
          </Link>
        </div>

        {/* 2. Global Navigation */}
        <div className={`py-4 border-b border-[var(--border-color)] flex-shrink-0 transition-all duration-300 ${
          isSidebarExpanded ? 'px-4' : 'px-2'
        }`}>
          <Link 
            href="/"
            onClick={() => setSidebarExpanded(false)}
            className={`flex items-center rounded-xl text-[0.85rem] no-underline transition-all duration-200 ${
              isSidebarExpanded ? 'px-4 py-2.5 gap-3.5' : 'p-2.5 justify-center gap-0'
            } ${
              isDashboard
                ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] font-bold' 
                : 'text-slate-400 hover:bg-slate-900/60 hover:text-white'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 flex-shrink-0 ${isDashboard ? 'text-white' : 'text-slate-400'}`} />
            <span className={`font-semibold whitespace-nowrap transition-all duration-300 overflow-hidden ${
              isSidebarExpanded ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0'
            }`}>
              Dashboard
            </span>
          </Link>
        </div>

        {/* 3. The Roadmap (Primary Content) */}
        <div className="flex-1 relative px-2 py-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isSidebarExpanded && (
            <div className="px-3 mb-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block">Your Journey</span>
            </div>
          )}

          <div className="relative pb-2">
            {STAGES.map((stage, idx) => {
              const stageModules = pathModules.filter(m => stage.groups.includes(m.group));
              const total = stageModules.length;
              if (total === 0) return null; // Hide empty stages

              const completed = stageModules.filter(m => completedModules.includes(m.id)).length;
              
              const isCompleted = idx < activeStageIndex;
              const isActive = idx === activeStageIndex;
              const isLocked = idx > activeStageIndex;

              const nodeSizeClass = isActive 
                ? 'w-[52px] h-[52px] ml-1.5 rounded-[14px]' 
                : 'w-11 h-11 ml-2.5 rounded-xl';

              return (
                <div key={stage.key} className="relative flex items-start mb-5 group w-full">
                  {/* Connector Line to Next Node */}
                  {idx < STAGES.length - 1 && (
                    <div className={`absolute left-[31.5px] w-[1.5px] z-0 hidden md:block ${isActive ? 'top-[52px] bottom-[-20px]' : 'top-[44px] bottom-[-20px]'}`}>
                      {/* Base Track */}
                      <div className={`absolute inset-0 ${isCompleted ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'bg-slate-800/60'}`} />
                      
                      {/* Moving Energy Particle */}
                      {isActive && (
                        <div className="absolute left-[-0.25px] w-[2px] h-3 bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,1)] rounded-full animate-particle" />
                      )}
                    </div>
                  )}

                  {/* Node icon */}
                  <div className={`relative z-10 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${nodeSizeClass} ${
                    isActive 
                      ? 'bg-slate-900 border border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.35)]' 
                      : isCompleted 
                        ? 'bg-slate-900/50 border border-cyan-500/20' 
                        : 'bg-slate-950 border border-slate-800/70 opacity-60'
                  }`}>
                    <span className={`${isActive ? 'text-2xl' : 'text-lg'} ${!isSidebarExpanded && isActive ? 'animate-pulse' : ''}`}>{stage.emoji}</span>
                    {isActive && (
                      <div className="absolute inset-0 rounded-[14px] border border-cyan-400 animate-ping opacity-20" />
                    )}
                  </div>

                  {/* Node Content (Visible only when expanded) */}
                  <div className={`ml-4 flex flex-col justify-center transition-all duration-300 overflow-hidden ${
                    isSidebarExpanded ? 'opacity-100 w-full' : 'opacity-0 w-0'
                  } ${isActive ? 'pt-1.5' : 'pt-0.5'}`}>
                    <h3 className={`text-sm font-black uppercase tracking-wider leading-tight whitespace-nowrap ${
                      isActive ? 'text-white text-[15px]' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                    }`}>
                      {stage.title}
                    </h3>
                    
                    {isActive && (
                      <div className="mt-1.5 flex flex-col gap-1.5 whitespace-nowrap">
                        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 w-max px-2 py-0.5 rounded border border-cyan-500/20">Current Stage</span>
                        <span className="text-xs font-medium text-slate-400">{completed} / {total} Lessons</span>
                      </div>
                    )}
                    
                    {isCompleted && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-emerald-500 whitespace-nowrap">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Completed</span>
                      </div>
                    )}

                      {isLocked && (
                        <div className="mt-1.5 flex items-center gap-1.5 text-slate-500 whitespace-nowrap">
                          <Lock className="w-3.5 h-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Locked</span>
                        </div>
                      )}

                      {/* Final Destination Indicator for Expert */}
                      {stage.key === 'expert' && isSidebarExpanded && (
                        <div className="mt-3 flex items-center gap-1.5 opacity-60">
                          <Target className="w-3 h-3 text-purple-400" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-purple-400/80">Final Destination</span>
                        </div>
                      )}

                      {/* Chapter List (Visible only when expanded) */}
                      {isSidebarExpanded && (
                        <div className="mt-3 flex flex-col gap-0.5 w-[220px] pr-2">
                          {stage.groups.map((group, i) => {
                            const groupModules = pathModules.filter(m => m.group === group);
                            if (groupModules.length === 0) return null; // Hide empty groups

                            const isCompletedGroup = groupModules.every(m => completedModules.includes(m.id)) && groupModules.length > 0;
                            const isExpanded = expandedGroup === group;
                            
                            return (
                              <div key={i} className="flex flex-col gap-0.5">
                                <button 
                                  onClick={() => setExpandedGroup(isExpanded ? null : group)}
                                  className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-slate-800/80 transition-colors group/link no-underline border border-transparent hover:border-cyan-500/30 w-full text-left cursor-pointer"
                                >
                                   <div className="flex items-center gap-1.5 truncate pr-2">
                                     {isExpanded ? <ChevronDown className="w-3 h-3 text-cyan-400 flex-shrink-0" /> : <ChevronRight className="w-3 h-3 text-slate-500 group-hover/link:text-cyan-400 flex-shrink-0" />}
                                     <span className={`text-[10px] font-bold truncate transition-colors ${isCompletedGroup ? 'text-emerald-500/80' : isExpanded ? 'text-cyan-400' : 'text-slate-400 group-hover/link:text-cyan-400'}`}>
                                       {group.split(' ').slice(1).join(' ')}
                                     </span>
                                   </div>
                                   {isCompletedGroup && <CheckCircle2 className="w-3 h-3 text-emerald-500/50 flex-shrink-0" />}
                                </button>
                                
                                {selectedPath === 'all' && (groupModules[0] as any)?.learningPaths && (
                                  <div className="pl-7 pb-0.5 transform scale-75 origin-left opacity-70 -mt-0.5">
                                    <PathEligibilityBadge paths={(groupModules[0] as any).learningPaths} />
                                  </div>
                                )}
                                
                                {isExpanded && (
                                  <div className="flex flex-col gap-0.5 ml-3.5 border-l border-white/10 pl-2 py-1">
                                    {groupModules.map((module) => {
                                      const isModuleCompleted = completedModules.includes(module.id);
                                      const moduleUrl = `/courses/playwright/${module.slug || module.id}`;
                                      const isActiveModule = pathname === moduleUrl;
                                      
                                      return (
                                        <div key={module.id} className="flex flex-col gap-0.5 mb-1">
                                          <Link 
                                            href={moduleUrl}
                                            onClick={() => setSidebarExpanded(false)}
                                            className={`py-1 px-1.5 rounded text-[9.5px] font-medium transition-colors flex items-center justify-between ${
                                              isActiveModule 
                                                ? 'bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20' 
                                                : isModuleCompleted 
                                                  ? 'text-emerald-500/70 hover:text-emerald-400 border border-transparent' 
                                                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                                            }`}
                                          >
                                            <span className="truncate">{module.title}</span>
                                            {isModuleCompleted && !isActiveModule && <CheckCircle2 className="w-2.5 h-2.5 opacity-50 flex-shrink-0 ml-2" />}
                                          </Link>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* 3.5. Premium Upgrade Call-to-Action */}
        {isSidebarExpanded && (
          <div className="px-4 mb-4 flex-shrink-0">
            <button
              onClick={() => setPremiumModalOpen(true)}
              className="flex items-center justify-center gap-2.5 w-full py-2.5 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-600/10 to-pink-500/10 hover:from-purple-600/20 hover:to-pink-500/20 hover:border-purple-500/50 text-purple-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_20px_rgba(168,85,247,0.2)] cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-purple-400" />
              Build Your Own LMS
            </button>
          </div>
        )}

        {/* 4. Bottom Anchor (User Stats) */}
        <div className={`border-t border-[var(--border-color)] bg-slate-950/60 transition-all duration-300 flex-shrink-0 ${
          isSidebarExpanded ? 'p-4 opacity-100 max-h-[200px]' : 'p-0 opacity-0 max-h-0 overflow-hidden'
        }`}>
          <div className="flex flex-col gap-3 w-[248px]"> {/* Fixed width to prevent reflow during animation */}
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Current Rank</span>
                <span className="text-sm font-bold text-white leading-tight">{currentRank.name}</span>
              </div>
              <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-1 rounded-md">
                <Flame className="w-3 h-3" />
                <span className="text-xs font-black">{streak}</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-cyan-400">{xp.toLocaleString()} XP</span>
                <span className="font-bold text-slate-500">{completionPercentage}% Total</span>
              </div>
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
              </div>
            </div>

            {/* Sidebar Details Grid (Sprint 3) */}
            <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950 border border-slate-900 p-2.5 rounded-xl text-left">
              <div>
                <span className="text-slate-500 text-[8px] block uppercase tracking-wider">Path</span>
                <span className="font-black text-slate-300 truncate block uppercase tracking-wider">{pathLabel}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[8px] block uppercase tracking-wider">Stage</span>
                <span className="font-black text-cyan-400 truncate block uppercase tracking-wider">{STAGES[activeStageIndex]?.title || 'Legend'}</span>
              </div>
              <div className="col-span-2 border-t border-slate-900/80 pt-1.5 mt-0.5">
                <span className="text-slate-500 text-[8px] block uppercase tracking-wider">Current Target</span>
                <span className="font-extrabold text-white truncate block text-[11px] mt-0.5" title={currentLesson?.title || 'None'}>
                  {currentLesson ? currentLesson.title.split(':').slice(-1)[0] : 'All Completed'}
                </span>
                <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                  {remainingLessonsCount} remaining lessons
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
