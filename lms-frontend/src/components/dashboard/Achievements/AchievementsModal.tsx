import React, { useState } from 'react';
import { Trophy, Lock, X } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import { ACHIEVEMENTS_CONFIG } from '../../../constants/dashboard/achievements';

export default function AchievementsModal() {
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const { unlockedAchievements } = useDashboardStats();

  return (
    <div className="contents">
      {/* Card 2: Upcoming Achievements */}
      <div className="premium-depth-card rounded-[2rem] py-4 px-5 text-left flex flex-col justify-between h-full min-h-[180px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 m-0">
            <Trophy className="w-4 h-4 text-amber-400" /> {(unlockedAchievements || []).length === 0 ? 'Upcoming Achievements' : 'Recent Achievements'}
          </h3>
          <span 
            onClick={() => setShowBadgesModal(true)} 
            className="text-[9px] text-slate-400 hover:text-cyan-400 font-bold uppercase tracking-widest cursor-pointer hover:underline transition-colors"
          >
            View All
          </span>
        </div>
        
        <div className="grid grid-cols-4 gap-3 py-3 flex-grow items-center">
          {ACHIEVEMENTS_CONFIG.slice(0, 4).map((badge, i) => {
            const isUnlocked = unlockedAchievements?.includes(badge.id);
            const hasNoAchievements = (unlockedAchievements || []).length === 0;
            return (
              <div key={i} className={`flex flex-col items-center gap-2 text-center ${!isUnlocked && !hasNoAchievements ? 'opacity-40 grayscale' : ''}`}>
                <div className={`w-14 h-14 rounded-2xl border ${isUnlocked || hasNoAchievements ? badge.border : 'border-slate-800'} ${isUnlocked || hasNoAchievements ? badge.bg : 'bg-slate-950'} flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 hover:border-slate-500`}>
                  {!isUnlocked && !hasNoAchievements ? <Lock className="w-5 h-5 text-slate-700" /> : <badge.icon className={`w-7 h-7 ${badge.color} ${hasNoAchievements ? 'opacity-70' : ''}`} />}
                </div>
                <div className="flex flex-col min-w-0 w-full mt-1">
                  <span className={`text-[9.5px] font-black uppercase tracking-wider truncate block ${!isUnlocked && !hasNoAchievements ? 'text-slate-600' : 'text-slate-200'}`}>{badge.name}</span>
                  {isUnlocked && <span className="text-[7.5px] text-slate-500 font-extrabold mt-0.5">Achieved</span>}
                  {hasNoAchievements && <span className="text-[7.5px] text-slate-500 font-extrabold mt-0.5 truncate px-1" title={badge.desc}>{badge.desc}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Modal */}
      {showBadgesModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
            <button onClick={() => setShowBadgesModal(false)} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-pink-400" /> All Badges & Achievements
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto">
              {ACHIEVEMENTS_CONFIG.map((badge, i) => {
                const isUnlocked = unlockedAchievements?.includes(badge.id);
                return (
                  <div key={i} className={`flex flex-col items-center gap-3 text-center p-4 rounded-xl border ${isUnlocked ? 'border-white/10 bg-white/5' : 'border-slate-800 bg-slate-900/50'}`}>
                    <div className={`w-16 h-16 rounded-2xl border ${isUnlocked ? badge.border : 'border-slate-700'} ${isUnlocked ? badge.bg : 'bg-slate-800/50'} flex items-center justify-center shadow-lg transition-all`}>
                      {!isUnlocked ? <Lock className="w-6 h-6 text-slate-600" /> : <badge.icon className={`w-8 h-8 ${badge.color}`} />}
                    </div>
                    <div className="flex flex-col min-w-0 w-full text-center">
                      <span className={`text-[11px] font-black uppercase tracking-wider block ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{badge.name}</span>
                      <span className="text-[9px] text-slate-400 mt-1.5 leading-relaxed font-semibold">{badge.desc}</span>
                      {isUnlocked && <span className="text-[8px] text-emerald-400 font-extrabold uppercase mt-2">✓ Unlocked</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
