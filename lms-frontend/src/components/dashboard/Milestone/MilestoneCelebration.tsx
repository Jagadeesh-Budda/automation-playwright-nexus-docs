import React from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import { STAGES } from '../../../data/stageConfig';

export default function MilestoneCelebration() {
  const { showMilestoneCelebration, dismissMilestoneCelebration } = useDashboardStats();

  if (!showMilestoneCelebration) return null;

  const stage = STAGES.find(s => s.key === showMilestoneCelebration);
  const stageTitle = stage ? stage.title : 'New Stage';
  const stageEmoji = stage ? stage.emoji : '🎉';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-lg animate-fade-in">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-slate-900/90 p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center backdrop-blur-xl animate-scale-up">
        {/* Floating Sparkles */}
        <div className="absolute top-6 left-6 text-cyan-400 animate-pulse"><Sparkles className="w-5 h-5" /></div>
        <div className="absolute bottom-6 right-6 text-purple-400 animate-pulse"><Sparkles className="w-5 h-5" /></div>
        
        <button 
          onClick={dismissMilestoneCelebration} 
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-6 shadow-[0_0_24px_rgba(6,182,212,0.2)] animate-bounce">
          <span className="text-4xl">{stageEmoji}</span>
        </div>

        <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-white to-blue-400">
          Stage Graduated!
        </h2>
        
        <h3 className="text-base font-black text-cyan-400 uppercase tracking-widest mt-2">
          {stageTitle} Completed
        </h3>

        <p className="text-sm text-slate-400 leading-relaxed mt-4">
          Congratulations! You have completed all lessons and passed the milestone challenge for the <span className="text-white font-bold">{stageTitle}</span> phase. Your capabilities are officially recorded on the progress ledger.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button 
            onClick={dismissMilestoneCelebration}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black uppercase tracking-wider text-[10px] shadow-[0_4px_20px_rgba(6,182,212,0.3)] hover:scale-[1.02] transition-all cursor-pointer border-none"
          >
            Claim Stage Reward Badge
          </button>
        </div>
      </div>
    </div>
  );
}
