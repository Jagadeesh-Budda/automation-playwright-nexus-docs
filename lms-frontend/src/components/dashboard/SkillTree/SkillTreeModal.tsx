import React from 'react';
import { X, Zap, TrendingUp } from 'lucide-react';

export default function SkillTreeModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent">
          <X className="w-5 h-5" />
        </button>
        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-emerald-400" /> Full Automation Skill Tree
        </h3>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 text-left">
           <p className="text-sm text-slate-400 leading-relaxed">
             The Skill Tree represents the interconnected web of techniques you must master. Certain advanced capabilities are locked until you have proven competency in their prerequisites.
           </p>
           
           <div className="mt-4 border border-slate-800 rounded-xl p-4 bg-slate-900/50">
             <h4 className="text-sm font-bold text-white mb-4">Core Automation Skills</h4>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-xl">
                 <div className="text-xs font-bold text-emerald-400 uppercase">Playwright Core</div>
                 <div className="text-[10px] text-slate-400 mt-1">Foundational execution capabilities.</div>
               </div>
               <div className="p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-xl">
                 <div className="text-xs font-bold text-emerald-400 uppercase">Locators</div>
                 <div className="text-[10px] text-slate-400 mt-1">Element targeting strategies.</div>
               </div>
               <div className="p-3 border border-emerald-500/30 bg-emerald-500/5 rounded-xl">
                 <div className="text-xs font-bold text-emerald-400 uppercase">Assertions</div>
                 <div className="text-[10px] text-slate-400 mt-1">Validation and expectation logic.</div>
               </div>
             </div>
           </div>
           
           <div className="mt-4 border border-slate-800 rounded-xl p-4 bg-slate-900/50">
             <h4 className="text-sm font-bold text-white mb-4">Advanced Integrations</h4>
             <div className="grid grid-cols-2 gap-4">
               <div className="p-3 border border-cyan-500/30 bg-cyan-500/5 rounded-xl animate-pulse">
                 <div className="text-xs font-bold text-cyan-400 uppercase">Network</div>
                 <div className="text-[10px] text-slate-400 mt-1">In progress. API interception.</div>
               </div>
               <div className="p-3 border border-slate-800 bg-slate-950/50 rounded-xl opacity-60">
                 <div className="text-xs font-bold text-slate-500 uppercase">API Testing</div>
                 <div className="text-[10px] text-slate-600 mt-1">Locked. Requires Network completion.</div>
               </div>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
