"use client";
import React, { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle, ArrowRight, Play } from 'lucide-react';
import { useMasteryStore } from '../store/useMasteryStore';
import Link from 'next/link';

export default function PrerequisiteBanner({ moduleId }: { moduleId: string }) {
  const { checkPrerequisiteStatus } = useMasteryStore();
  const [dismissedFor, setDismissedFor] = useState<string>('');
  
  // Re-enable banner if lesson changes
  useEffect(() => {
    setDismissedFor('');
  }, [moduleId]);

  const prepStatus = checkPrerequisiteStatus(moduleId);

  if (prepStatus.status === 'green' || dismissedFor === moduleId) {
    return null;
  }

  const isRed = prepStatus.status === 'red';

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 mb-6 backdrop-blur-xl transition-all duration-300 ${
      isRed 
        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200' 
        : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
    }`}>
      {/* Decorative indicator side glow */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${isRed ? 'bg-rose-500' : 'bg-amber-500'}`} />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl mt-0.5 md:mt-0 flex items-center justify-center flex-shrink-0 ${
            isRed ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className={`text-[10px] font-black uppercase tracking-widest block ${
              isRed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            } px-2 py-0.5 rounded-md w-fit`}>
              {isRed ? 'May Be Difficult' : 'Advanced Concept'}
            </span>
            <p className="text-xs font-semibold leading-relaxed text-slate-300">
              {prepStatus.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <button
            onClick={() => setDismissedFor(moduleId)}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-bold rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-900/40"
          >
            Continue Anyway
          </button>
          
          {prepStatus.prerequisiteModule && (
            <Link
              href={`/courses/playwright/${prepStatus.prerequisiteModule.slug}`}
              className={`flex-1 md:flex-none px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl text-slate-950 no-underline inline-flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-all cursor-pointer border-none shadow-md ${
                isRed 
                  ? 'bg-rose-400 hover:bg-rose-350 shadow-rose-950/20' 
                  : 'bg-amber-400 hover:bg-amber-350 shadow-amber-950/20'
              }`}
            >
              <span>Go to Prerequisite</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
