import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, BookOpen, ShieldCheck, Check, Lock, Trophy } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import { useTopicMastery } from '../../../hooks/dashboard/useTopicMastery';
import { STAGES, EXPERT_SUBSECTIONS } from '../../../data/stageConfig';
import { generateChartPath } from '../../../utils/dashboard/charts';
import RankEmblem from '../RankEmblem/RankEmblem';
import modulesData from '../../../data/metadata.json';

export default function TopicMastery() {
  const router = useRouter();
  const {
    activeStage,
    activeStageProgress,
    completedChaptersCount,
    totalChapters,
    completionPercentage,
    currentRankIndex,
    nextRankName,
    lessonsRemaining,
    nextStageName,
    simulatedXP,
    getStageProgress,
    completedModules,
  } = useDashboardStats();

  const { getTopicProgressDetails } = useTopicMastery();

  const chartPath = generateChartPath(completedChaptersCount);

  // SkillNode inline helper for the timeline
  const SkillNode = ({ name, id, status, link }: {
    name: string;
    id: string;
    status: 'completed' | 'in-progress' | 'locked';
    link: string;
  }) => {
    const colorMap = {
      'completed': 'border-emerald-500/40 bg-gradient-to-br from-slate-950 to-emerald-950/40 text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]',
      'in-progress': 'border-cyan-400/50 bg-gradient-to-br from-slate-950 to-cyan-950/50 text-cyan-400 shadow-[0_4px_12px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-node-pulse',
      'locked': 'border-slate-900 bg-slate-950/80 text-slate-600 cursor-not-allowed opacity-45 shadow-none'
    };

    return (
      <button
        onClick={() => {
          if (status !== 'locked') {
            router.push(link);
          }
        }}
        className={`px-5 py-2.5 rounded-[1.2rem] border-2 font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 scale-100 hover:scale-[1.1] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] ${colorMap[status]} cursor-pointer`}
        disabled={status === 'locked'}
      >
        {name}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch w-full">
      {/* Card 1: Stage Progress */}
      <div className="premium-depth-card rounded-[2rem] p-6 flex flex-col justify-between h-full text-left">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 m-0">
          <Zap className="w-4 h-4 text-emerald-400" /> Stage Progress
        </h3>
        <div className="w-full flex flex-col items-center py-2 relative z-10 overflow-visible">
          {STAGES.map((stage, idx) => {
            const prog = getStageProgress(stage.key);
            const isActive = activeStage?.key === stage.key;
            const isGraduated = prog?.isGraduated;
            const status = isGraduated ? 'completed' : isActive ? 'in-progress' : 'locked';

            const posMap = ['center', 'left', 'right', 'left', 'center'];
            const pos = posMap[idx];
            
            let wrapperClass = "relative z-10 transition-all duration-500 ";
            if (pos === 'left') wrapperClass += "mr-[100px]";
            if (pos === 'right') wrapperClass += "ml-[100px]";
            
            const nextPos = idx < STAGES.length - 1 ? posMap[idx + 1] : null;
            let connector = null;
            
            const isLineActive = isGraduated;
            const lineColor = isLineActive ? '#22d3ee' : '#1e293b';
            const lineClass = isLineActive ? 'animate-flow-timeline drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'opacity-40';
            const strokeWidth = isLineActive ? "3" : "2";

            if (pos === 'center' && nextPos === 'left') {
              connector = (
                <svg className="w-[55px] h-[38px] mr-[50px] -mt-[3px] -mb-[3px] z-0 overflow-visible">
                  <path d="M55 0 L10 0 Q0 0 0 10 L0 38" fill="none" stroke={lineColor} strokeWidth={strokeWidth} strokeDasharray={isLineActive ? "6, 6" : "none"} className={lineClass} />
                </svg>
              );
            } else if (pos === 'left' && nextPos === 'right') {
              connector = (
                <svg className="w-[100px] h-[38px] -mt-[3px] -mb-[3px] z-0 overflow-visible">
                  <path d="M0 0 L90 0 Q100 0 100 10 L100 38" fill="none" stroke={lineColor} strokeWidth={strokeWidth} strokeDasharray={isLineActive ? "6, 6" : "none"} className={lineClass} />
                </svg>
              );
            } else if (pos === 'right' && nextPos === 'left') {
              connector = (
                <svg className="w-[100px] h-[38px] -mt-[3px] -mb-[3px] z-0 overflow-visible">
                  <path d="M100 0 L10 0 Q0 0 0 10 L0 38" fill="none" stroke={lineColor} strokeWidth={strokeWidth} strokeDasharray={isLineActive ? "6, 6" : "none"} className={lineClass} />
                </svg>
              );
            } else if (pos === 'left' && nextPos === 'center') {
              connector = (
                <svg className="w-[55px] h-[38px] mr-[50px] -mt-[3px] -mb-[3px] z-0 overflow-visible">
                  <path d="M0 0 L45 0 Q55 0 55 10 L55 38" fill="none" stroke={lineColor} strokeWidth={strokeWidth} strokeDasharray={isLineActive ? "6, 6" : "none"} className={lineClass} />
                </svg>
              );
            }

            return (
              <div key={stage.key} className="contents">
                <div className={wrapperClass}>
                  <SkillNode 
                    name={stage.title} 
                    id={stage.key} 
                    status={status} 
                    link={`/courses/playwright/${stage.milestone.challengeLessonId || ''}`} 
                  />
                </div>
                {connector}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 2: Current Stage Detail */}
      <div className="premium-depth-card rounded-[2rem] p-6 flex flex-col justify-between h-full text-left">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 m-0">
          <BookOpen className="w-4 h-4 text-cyan-400" /> Current Stage Detail
        </h3>
        {activeStage ? (
          <div className="flex-grow flex flex-col">
             <div className="flex items-center gap-2 mb-2">
               <span className="text-2xl">{activeStage.emoji}</span>
               <div>
                 <h4 className="text-base font-black text-white m-0">{activeStage.title}</h4>
                 <p className="text-xs text-slate-400 m-0">{activeStage.goal}</p>
               </div>
             </div>
             
             <div className="space-y-1 overflow-y-auto pr-2 max-h-[180px] flex-grow">
               {activeStage.key === 'expert' ? (
                 EXPERT_SUBSECTIONS.map((sub, i) => (
                   <div key={i} className="mb-4">
                     <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{sub.label}</h5>
                     {sub.groups.map((group: string, j: number) => {
                        const groupModules = modulesData.filter(m => m.group === group);
                        const completedInGroup = groupModules.filter(m => completedModules.includes(m.id)).length;
                        const targetUrl = groupModules.length > 0 ? `/courses/playwright/${groupModules[0].slug || groupModules[0].id}` : '#';
                        return (
                          <button 
                            key={j} 
                            onClick={() => router.push(targetUrl)}
                            className="w-full p-2 mb-1 rounded-lg bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex justify-between items-center group text-left"
                          >
                            <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 truncate pr-2">{group.split(' ').slice(1).join(' ')}</span>
                            <span className="text-[10px] text-slate-500 group-hover:text-cyan-500 font-mono flex-shrink-0">{completedInGroup}/{groupModules.length}</span>
                          </button>
                        )
                     })}
                   </div>
                 ))
               ) : (
                 activeStage.groups.map((group: string, i: number) => {
                    const groupModules = modulesData.filter(m => m.group === group);
                    const completedInGroup = groupModules.filter(m => completedModules.includes(m.id)).length;
                    const targetUrl = groupModules.length > 0 ? `/courses/playwright/${groupModules[0].slug || groupModules[0].id}` : '#';
                    return (
                      <button 
                        key={i} 
                        onClick={() => router.push(targetUrl)}
                        className="w-full p-2 mb-1 rounded-lg bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-cyan-500/30 transition-all cursor-pointer flex justify-between items-center group text-left"
                      >
                        <span className="text-xs font-bold text-slate-300 group-hover:text-cyan-400 truncate pr-2">{group.split(' ').slice(1).join(' ')}</span>
                        <span className="text-[10px] text-slate-500 group-hover:text-cyan-500 font-mono flex-shrink-0">{completedInGroup}/{groupModules.length}</span>
                      </button>
                    )
                 })
               )}
             </div>
             
             <div className="mt-2 pt-2 border-t border-white/10">
               <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Graduation Criteria</h5>
               <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeStageProgress?.allLessonsPassed ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 bg-slate-900 text-transparent'}`}>
                      <Check className="w-3 h-3" />
                   </div>
                   <span className={`text-xs ${activeStageProgress?.allLessonsPassed ? 'text-emerald-400' : 'text-slate-400'}`}>All Lessons Completed</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${activeStageProgress?.milestoneChallengePassed ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400' : 'border-slate-700 bg-slate-900 text-transparent'}`}>
                      <Check className="w-3 h-3" />
                   </div>
                   <span className={`text-xs ${activeStageProgress?.milestoneChallengePassed ? 'text-emerald-400' : 'text-slate-400'}`}>Milestone Challenge Passed</span>
                 </div>
               </div>
               {!activeStageProgress?.milestoneChallengePassed && activeStageProgress?.allLessonsPassed && (
                 <button onClick={() => router.push(`/courses/playwright/${modulesData.find(m => m.id === activeStage.milestone.challengeLessonId)?.slug}`)} className="mt-4 w-full py-2.5 rounded-lg border border-amber-500/50 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-wider hover:bg-amber-500/20 transition-all cursor-pointer animate-pulse">
                   Complete Milestone to Graduate &rarr;
                 </button>
               )}
             </div>
          </div>
        ) : (
          <div className="flex-grow flex items-center justify-center text-slate-500 text-sm">All stages completed!</div>
        )}
      </div>

      {/* Card 3: Your Path to Mastery */}
      <div className="premium-depth-card rounded-[2rem] p-6 flex flex-col justify-between h-full text-left">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0">
            <ShieldCheck className="w-4 h-4 text-cyan-400" /> {completionPercentage === 100 ? 'Learning Analytics' : 'Your Path to Mastery'}
          </h3>
          <span className="text-[10px] text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 rounded-full border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            {simulatedXP.toLocaleString()} XP
          </span>
        </div>

        <div className="w-full h-12 border-b border-white/5 mb-2 relative flex flex-col justify-end pb-2">
          {completedChaptersCount === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 block">What happens after I begin?</span>
              <div className="flex items-center gap-1 text-[8px] font-bold text-slate-500 font-mono">
                <span className="text-slate-300">Complete Lesson 0.1</span>
                <span>➔</span>
                <span>Unlock Analytics</span>
                <span>➔</span>
                <span>Earn XP</span>
                <span>➔</span>
                <span>Claim Cert</span>
              </div>
            </div>
          ) : (
            <div className="w-full h-12 relative">
              <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path d={chartPath.line} fill="none" stroke="url(#chartLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={chartPath.fill} fill="url(#chartFill)" />
                <defs>
                  <linearGradient id="chartLine" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                  <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgba(6,182,212,0.2)" />
                    <stop offset="100%" stopColor="rgba(6,182,212,0)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
          <div className="absolute -bottom-2 left-0 w-full flex justify-between text-[6px] font-black text-slate-500 uppercase tracking-widest">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
          <span className="absolute -bottom-1.5 right-0 text-[7.5px] text-slate-500 font-bold uppercase bg-slate-900 px-1 z-10">Weekly Progress</span>
        </div>

        <div className="flex gap-2 items-center mt-1">
          <div className="flex flex-col items-center justify-center relative flex-shrink-0">
            <div className={`absolute w-12 h-12 rounded-full blur-[15px] opacity-25 animate-pulse ${
              currentRankIndex === 0 ? 'bg-purple-500' : currentRankIndex === 1 ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
            <div className="w-14 h-14 rounded-2xl border border-white/10 bg-slate-950/70 flex items-center justify-center shadow-xl relative z-10 animate-float-slow transform scale-75 origin-center">
              <RankEmblem rankIndex={completionPercentage === 100 ? 3 : currentRankIndex + 1} isActive={false} />
            </div>
          </div>
          <div className="space-y-1 flex-1 pl-2 border-l border-white/5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase tracking-wider">{completionPercentage === 100 ? 'Status' : 'Next Rank'}</span>
              <span className={`font-black uppercase tracking-wider ${
                currentRankIndex === 0 ? 'text-purple-400' : currentRankIndex === 1 ? 'text-amber-400' : 'text-rose-400'
              }`}>{completionPercentage === 100 ? 'Master Certified' : nextRankName}</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Cert. Readiness</span>
              <span className="text-emerald-400 font-extrabold">{completionPercentage}%</span>
            </div>
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-slate-500 font-bold uppercase tracking-wider">Velocity</span>
              <span className="text-amber-400 font-black">12 Lessons/wk</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
