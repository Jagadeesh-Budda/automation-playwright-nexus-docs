import React from 'react';
import { Award, Zap, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDashboardStats } from '../../../hooks/dashboard/useDashboardStats';
import RankEmblem from '../RankEmblem/RankEmblem';
import { RANKS } from '../../../constants/dashboard/ranks';
import { STAGES } from '../../../data/stageConfig';

export default function HeroCard() {
  const router = useRouter();
  const {
    currentRankIndex,
    activeStage,
    pathCompletionPercentage,
    selectedPath,
    claimedCertificates,
    nextChapter,
    nextStageName,
  } = useDashboardStats();

  const handleClaimCertificate = async () => {
    try {
      const res = await fetch('/api/certify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'student_1'
        },
        body: JSON.stringify({ name: 'Student', path: selectedPath })
      });
      const data = await res.json();
      if (data.certId) {
        alert(`Certificate successfully claimed!`);
        router.push(`/verify/${data.certId}`);
      } else {
        alert(data.message || 'Failed to claim certificate');
      }
    } catch (err) {
      console.error(err);
      alert('Error claiming certificate');
    }
  };

  const currentRankName = RANKS[currentRankIndex]?.name || 'Student';

  return (
    <div className="premium-depth-card rounded-[2rem] p-5 md:p-6 relative overflow-hidden flex flex-col justify-between h-full min-h-[300px]">
      <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-60 w-60 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col md:flex-row items-center gap-6 h-full">
        {/* Left Column: Glowing Holographic Shield */}
        <div className="flex-shrink-0 flex items-center justify-center relative py-2">
          <div className="absolute w-36 h-36 rounded-full bg-cyan-500/5 blur-[40px] animate-pulse" />
          <svg className="w-40 h-44 overflow-visible drop-shadow-[0_12px_32px_rgba(6,182,212,0.4)] animate-float-slow" viewBox="0 0 200 220">
            {/* Tech targeting radar orbit rings at the back */}
            <circle cx="100" cy="105" r="95" fill="none" stroke="rgba(6,182,212,0.18)" strokeWidth="1" strokeDasharray="3 8" />
            <circle cx="100" cy="105" r="85" fill="none" stroke="rgba(37,99,235,0.1)" strokeWidth="1.5" />
            <line x1="2" y1="105" x2="198" y2="105" stroke="rgba(6,182,212,0.06)" strokeWidth="1" strokeDasharray="4 4" />
            <line x1="100" y1="5" x2="100" y2="205" stroke="rgba(6,182,212,0.06)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Holographic Projection Platform */}
            <ellipse cx="100" cy="195" rx="70" ry="14" fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeDasharray="6 4" className="animate-spin-slow opacity-80" />
            <ellipse cx="100" cy="195" rx="50" ry="10" fill="none" stroke="#2563eb" strokeWidth="3" />
            <ellipse cx="100" cy="195" rx="35" ry="7" fill="rgba(6,182,212,0.25)" stroke="#06b6d4" strokeWidth="1.5" />
            <path d="M50 195 L75 110 L125 110 L150 195 Z" fill="url(#lightBeamGrad)" className="opacity-30" />
            
            {/* Dynamic Rank Emblem injected here */}
            <svg x="25" y="10" width="150" height="150" viewBox="0 0 64 64">
              <RankEmblem rankIndex={currentRankIndex} isActive={true} idSuffix="hero" />
            </svg>

            <defs>
              <linearGradient id="lightBeamGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.3" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Right Column: Hero Information */}
        <div className="flex-grow flex flex-col justify-between h-full w-full text-left">
          <div>
            <div className="flex items-center mb-3">
              <span className={`px-3 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider shadow-lg animate-shimmer ${
                currentRankIndex === 0 ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]' :
                currentRankIndex === 1 ? 'border-purple-500/30 bg-purple-950/20 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]' :
                currentRankIndex === 2 ? 'border-amber-500/30 bg-amber-950/20 text-amber-400 shadow-[0_0_12px_rgba(234,179,8,0.2)]' :
                'border-rose-500/30 bg-rose-950/20 text-rose-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
              }`}>
                🛡️ {currentRankName}
              </span>
            </div>
            <div className="flex items-center mb-3">
              <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider">
                📍 Stage {STAGES.findIndex(s => s.key === activeStage?.key) + 1}: {activeStage?.title}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] uppercase leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-cyan-400 drop-shadow-[0_4px_20px_rgba(6,182,212,0.25)]">
              {currentRankIndex === 3 ? "AUTOMATION LEGEND" : "AUTOMATION ENGINEER PATH"}
            </h1>
            <p className="text-slate-400 text-xs mt-1.5 mb-3 font-semibold leading-relaxed">
              Master automation. Build frameworks. Become a legend.
            </p>

            <div className="mb-3 grid grid-cols-2 gap-3 max-w-sm">
              <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-xl">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Current Objective</span>
                <span className="text-xs font-bold text-white block mt-0.5">{activeStage?.title || 'Expert'}</span>
              </div>
              <div className="p-2.5 bg-slate-950/40 border border-white/5 rounded-xl">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Current Stage Goal</span>
                <span className="text-xs font-bold text-cyan-400 block mt-0.5">{pathCompletionPercentage === 100 ? "COMPLETED" : `Become an ${nextStageName}`}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-auto">
            <button
              onClick={pathCompletionPercentage === 100 ? handleClaimCertificate : () => router.push(`/courses/playwright/${nextChapter.slug || nextChapter.id}`)}
              className={`px-6 py-3 rounded-xl text-white font-black transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] cursor-pointer border-none uppercase tracking-wider text-[10px] flex-grow sm:flex-grow-0 ${
                pathCompletionPercentage === 100 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-[0_4px_20px_rgba(16,185,129,0.3)]'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_4px_20px_rgba(6,182,212,0.3)] animate-glow-pulse'
              }`}
            >
              {pathCompletionPercentage === 100 
                ? <Award className="w-4 h-4 fill-emerald-200 text-emerald-200 animate-pulse" /> 
                : <Zap className="w-3.5 h-3.5 fill-cyan-300 text-cyan-300 animate-bounce" />
              }
              {pathCompletionPercentage === 100 
                ? claimedCertificates[selectedPath]
                  ? `DOWNLOAD ${selectedPath === 'all' ? 'GLOBAL' : selectedPath.toUpperCase()} CERTIFICATE`
                  : `CLAIM ${selectedPath === 'all' ? 'GLOBAL' : selectedPath.toUpperCase()} CERTIFICATE`
                : `Continue Mission: ${nextChapter.title.split(':')[0] || '1.4'}`
              }
            </button>
            
            <button className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center hover:border-cyan-500/30 transition-all cursor-pointer text-cyan-400 flex-shrink-0">
              <Activity className="w-4 h-4 animate-pulse" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
