"use client";
import React, { useState, useEffect } from 'react';
import { Lock, Unlock } from 'lucide-react';

interface SolutionGateProps {
  moduleId: string;
  children: React.ReactNode;
}

export default function SolutionGate({ moduleId, children }: SolutionGateProps) {
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    setUnlocked(localStorage.getItem(`code_verified_${moduleId}`) === 'true');

    // Listen for real-time verification event fired by CodeEditor.tsx
    const handler = (e: Event) => {
      if ((e as CustomEvent).detail?.moduleId === moduleId) {
        setUnlocked(true);
      }
    };
    window.addEventListener('codeVerified', handler);
    return () => window.removeEventListener('codeVerified', handler);
  }, [moduleId]);

  if (!unlocked) {
    return (
      <div className="my-6 border border-slate-700 rounded-xl p-6 bg-slate-900/50 text-center not-prose">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl border border-slate-700 bg-slate-800 flex items-center justify-center">
            <Lock className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-400 font-medium text-sm m-0">
            Complete the coding task above to unlock the reference solution.
          </p>
          <span className="text-xs text-slate-600 font-mono">
            code_verified_{moduleId} = pending
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-6 border border-emerald-500/30 rounded-xl overflow-hidden not-prose">
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-950/30 border-b border-emerald-500/20">
        <Unlock className="w-4 h-4 text-emerald-400" />
        <span className="text-emerald-400 font-bold text-sm">Reference Solution Unlocked</span>
        <span className="ml-auto text-xs text-emerald-600 font-mono">
          code_verified_{moduleId} = true
        </span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
