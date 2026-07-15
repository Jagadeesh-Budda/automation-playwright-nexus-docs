import React, { useState } from 'react';
import { Target, Check, BookOpen, CheckCircle2, Award, Activity, Star, Lock, X } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import { STAGES } from '../../../data/stageConfig';

export default function TelemetryPanel() {
  const [showAudit, setShowAudit] = useState(false);

  const {
    nextChapter,
    completedChaptersCount,
    totalChapters,
    completionPercentage,
    claimedCertificates,
    selectedPath,
    streak,
    weakAreasList,
    nextRankName,
    rankLessonsRemaining,
    telemetryLogs,
    activeStage,
    activeStageProgress,
    fndStats,
    entStats,
    regStats,
    unlockedAchievements
  } = useDashboardStats();

  const isCertMission = nextChapter?.title === 'Claim Certification' || completionPercentage === 100;
  const missions = [
    { title: `Complete ${nextChapter?.title || 'Next Lesson'}`, detail: 'Continue your journey', xp: 40, checked: isCertMission ? (claimedCertificates[selectedPath] || false) : false },
    { title: 'Maintain Streak', detail: `${streak || 0} Day Streak active`, xp: 20, checked: streak > 0 },
  ];

  if (weakAreasList.length > 0) {
    missions.push({ title: 'Improve Weak Area', detail: weakAreasList[0], xp: 50, checked: false });
  } else if (completionPercentage === 100) {
    missions.push({ title: 'Download Certificate', detail: 'Claim your credential', xp: 100, checked: claimedCertificates[selectedPath] || false });
  } else {
    missions.push({ title: 'Mastery Progress', detail: `Reach ${nextRankName}`, xp: 50, checked: rankLessonsRemaining === 0 });
  }

  const completedCount = missions.filter(m => m.checked).length;
  const compliancePercent = Math.round((completedCount / missions.length) * 100);

  return (
    <div className="contents">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full">
        {/* Today's Missions */}
        <div className="premium-depth-card rounded-[2rem] py-4 px-5 text-left flex flex-col justify-between relative overflow-hidden h-[220px]">
          <div className="absolute inset-0 cyber-scanlines opacity-[0.03] pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/20 rounded-tr-[2rem] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-2.5 relative z-10">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" /> Today's Missions
            </h3>
          </div>
          
          <div className="space-y-1.5 relative z-10">
            {missions.map((m, i) => (
              <div key={i} className={`flex items-center gap-2.5 p-2 px-3 rounded-xl border transition-all duration-300 ${
                m.checked 
                  ? 'border-emerald-500/10 bg-emerald-950/5 opacity-60' 
                  : 'border-white/5 bg-slate-950/20 hover:border-cyan-500/25 hover:bg-cyan-950/5'
              }`}>
                <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                  m.checked 
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_8px_rgba(10,185,129,0.3)]' 
                    : 'border-slate-800 bg-slate-950 text-transparent hover:border-cyan-500/50'
                }`}>
                  {m.checked ? <Check className="w-2.5 h-2.5 stroke-[3.5]" /> : <span className="text-[9px] font-mono text-slate-700">[ ]</span>}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center gap-2">
                    <span className={`text-[10px] font-black tracking-wide truncate ${m.checked ? 'text-slate-500 line-through' : 'text-white'}`}>{m.title}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                      m.checked
                        ? 'border-emerald-500/15 bg-emerald-500/10 text-emerald-400'
                        : 'border-amber-500/20 bg-amber-500/10 text-amber-400'
                    }`}>+{m.xp} XP</span>
                  </div>
                  <span className="text-[8px] text-slate-500 font-bold block mt-0.5 truncate uppercase tracking-wider">{m.detail}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-3 mt-3 relative z-10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Compliance Roster</span>
              <span className="text-[10px] font-black text-emerald-400 font-mono">{completedCount} / {missions.length} Approved</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 border border-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out" style={{ width: `${compliancePercent}%` }} />
            </div>
          </div>
        </div>

        {/* Recent Learning Activity */}
        <div className="premium-depth-card rounded-[2rem] py-4 px-5 relative overflow-hidden flex flex-col text-left h-[220px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" /> Recent Learning Activity
            </h3>
          </div>
          
          <div className="space-y-3 overflow-y-auto max-h-[140px] flex-grow scrollbar-thin pr-1">
            {!telemetryLogs || telemetryLogs.length === 0 ? (
              <div className="flex flex-col justify-center h-full text-slate-500 py-1 text-left max-w-xs mx-auto">
                <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-2 block text-center">What happens after I begin?</span>
                <div className="flex flex-col gap-0.5 text-[10px] font-bold text-slate-400 pl-4">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 text-[8px] flex items-center justify-center font-mono flex-shrink-0 text-cyan-400">1</span>
                    <span className="truncate text-slate-300">Complete Lesson 0.1 (Variables)</span>
                  </div>
                  <div className="h-2.5 w-[1px] bg-slate-800 ml-2" />
                  <div className="flex items-center gap-2 opacity-70">
                    <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 text-[8px] flex items-center justify-center font-mono flex-shrink-0">2</span>
                    <span className="truncate">Unlock Realtime Telemetry Logs</span>
                  </div>
                  <div className="h-2.5 w-[1px] bg-slate-800 ml-2" />
                  <div className="flex items-center gap-2 opacity-70">
                    <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 text-[8px] flex items-center justify-center font-mono flex-shrink-0">3</span>
                    <span className="truncate">Earn XP & Maintain Streaks</span>
                  </div>
                  <div className="h-2.5 w-[1px] bg-slate-800 ml-2" />
                  <div className="flex items-center gap-2 opacity-70">
                    <span className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 text-[8px] flex items-center justify-center font-mono flex-shrink-0">4</span>
                    <span className="truncate">Claim Verifiable Certification Keys</span>
                  </div>
                </div>
              </div>
            ) : (
              telemetryLogs.slice(0, 5).map((l, idx) => {
                const type = l.type === 'ACHIEVEMENT' ? 'BADGE' : l.type === 'SUCCESS' ? 'QUIZ' : 'MODULE';
                const detail = l.type === 'ACHIEVEMENT' ? 'Achievement unlocked' : 'Progress logged';
                const iconMap = {
                  'MODULE': <BookOpen className="w-3 h-3 text-cyan-400" />,
                  'QUIZ': <CheckCircle2 className="w-3 h-3 text-emerald-400" />,
                  'BADGE': <Award className="w-3 h-3 text-amber-400" />
                };
                return (
                  <div key={idx} className="flex gap-3 items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center flex-shrink-0">
                      {iconMap[type as keyof typeof iconMap] || <Activity className="w-3 h-3 text-slate-400" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[11px] font-bold text-slate-200 truncate">{l.message}</span>
                      <span className="text-[9px] text-slate-500 font-medium truncate">{detail}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Capability Card */}
        <div className="premium-depth-card rounded-[2rem] py-4 px-5 relative overflow-hidden flex flex-col text-left h-[220px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest m-0 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-amber-400" /> {activeStage?.title || 'Expert'} Capabilities
            </h3>
          </div>
          
          <div className="space-y-2.5 overflow-y-auto max-h-[140px] flex-grow scrollbar-thin pr-1">
            {activeStage ? (
              activeStage.milestone.capabilities.map((cap: string, idx: number) => {
                const percent = activeStageProgress?.percent || 0;
                const threshold = (idx) * (100 / activeStage.milestone.capabilities.length);
                const isEarned = percent >= threshold || activeStageProgress?.isGraduated;
                
                return (
                  <div key={idx} className="flex gap-2.5 items-center">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-500 ${isEarned ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-slate-700 bg-slate-900'}`}>
                      {isEarned ? <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />}
                    </div>
                    <span className={`text-[11px] font-bold transition-all duration-500 ${isEarned ? 'text-slate-200' : 'text-slate-500'}`}>{cap}</span>
                  </div>
                );
              })
            ) : (
              <span className="text-[11px] text-slate-500">All capabilities unlocked!</span>
            )}
            
            {!activeStageProgress?.isGraduated && activeStage && STAGES[STAGES.findIndex(s => s.key === activeStage.key) + 1] && (
               <div className="mt-3 pt-3 border-t border-white/5 opacity-50">
                 <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-2">Next Stage: {STAGES[STAGES.findIndex(s => s.key === activeStage.key) + 1].title}</span>
                 <div className="flex gap-2.5 items-center">
                    <div className="w-4 h-4 rounded-full border border-slate-800 bg-slate-950 flex items-center justify-center flex-shrink-0">
                      <Lock className="w-2 h-2 text-slate-600" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-600">{STAGES[STAGES.findIndex(s => s.key === activeStage.key) + 1].milestone.capabilities[0]}</span>
                 </div>
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Achievement Audit Panel (Developer Only) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          onClick={() => setShowAudit(!showAudit)}
          className="bg-slate-800 text-slate-400 p-2 rounded-full hover:bg-slate-700 transition-colors cursor-pointer border-none"
          title="Toggle Audit Panel"
        >
          <Activity className="w-4 h-4" />
        </button>
      </div>

      {showAudit && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-4 flex flex-col gap-3 text-xs text-left">
          <div className="flex justify-between items-center pb-2 border-b border-slate-800">
            <h3 className="font-bold text-white flex items-center gap-2"><Target className="w-4 h-4 text-cyan-400" /> Achievement Audit</h3>
            <button onClick={() => setShowAudit(false)} className="text-slate-400 hover:text-white cursor-pointer bg-transparent border-none"><X className="w-4 h-4" /></button>
          </div>
          
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-slate-300">
              <span>Foundations Progress:</span>
              <span className="font-mono text-cyan-400">{fndStats.completedModules}/{fndStats.totalModules}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Foundations Graduate:</span>
              <span className={unlockedAchievements.includes('foundations-grad') ? 'text-emerald-400' : ''}>
                {unlockedAchievements.includes('foundations-grad') ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-slate-300">
              <span>Enterprise Progress:</span>
              <span className="font-mono text-cyan-400">{entStats.completedModules}/{entStats.totalModules}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Enterprise Practitioner:</span>
              <span className={unlockedAchievements.includes('enterprise-prac') ? 'text-emerald-400' : ''}>
                {unlockedAchievements.includes('enterprise-prac') ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-slate-300">
              <span>Regulated Progress:</span>
              <span className="font-mono text-cyan-400">{regStats.completedModules}/{regStats.totalModules}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Regulated Specialist:</span>
              <span className={unlockedAchievements.includes('regulated-spec') ? 'text-emerald-400' : ''}>
                {unlockedAchievements.includes('regulated-spec') ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 pb-2 border-b border-slate-800">
            <div className="flex justify-between text-slate-300">
              <span>Overall Progress:</span>
              <span className="font-mono text-cyan-400">{completedChaptersCount}/{totalChapters}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-[10px]">
              <span>Curriculum Master:</span>
              <span className={unlockedAchievements.includes('curriculum-master') ? 'text-emerald-400' : ''}>
                {unlockedAchievements.includes('curriculum-master') ? 'Unlocked' : 'Locked'}
              </span>
            </div>
          </div>

          <div className="flex justify-between text-slate-500 text-[10px]">
            <span>Path Explorer:</span>
            <span className={unlockedAchievements.includes('path-explorer') ? 'text-emerald-400' : ''}>
              {unlockedAchievements.includes('path-explorer') ? 'Unlocked' : 'Locked'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
