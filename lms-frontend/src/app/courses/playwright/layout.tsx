"use client";
import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useMasteryStore } from '../../../store/useMasteryStore';
import modulesData from '../../../data/metadata.json';
import ChapterHeader from '../../../components/ChapterHeader';
import LessonFooter from '../../../components/LessonFooter';

export default function PlaywrightCourseLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { initUser, isModuleLocked, getFirstIncompleteModule, completedModules, loading } = useMasteryStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initUser();
  }, [initUser]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
        <p className="text-[var(--text-muted)] font-medium animate-pulse">Decrypting progress ledger...</p>
      </div>
    );
  }

  // Extract moduleId from pathname (e.g. /courses/playwright/01-js-ts-variables)
  const slug = pathname?.split('/').pop() || '';
  const moduleId = slug; // The ID in modules.json matches the folder slug exactly

  const locked = isModuleLocked(moduleId);

  if (locked) {
    // Find preceding incomplete modules to list them
    const currentIndex = modulesData.findIndex(m => m.id === moduleId);
    const incompletePreceding: any[] = [];
    
    if (currentIndex !== -1) {
      for (let i = 0; i < currentIndex; i++) {
        const prevMod = modulesData[i];
        if (!completedModules.includes(prevMod.id)) {
          const folderPrefix = (i + 1).toString().padStart(2, '0');
          incompletePreceding.push({
            id: prevMod.id,
            title: prevMod.title,
            slug: `${folderPrefix}-${prevMod.id}`
          });
        }
      }
    }

    const handleJumpToFirstIncomplete = () => {
      const target = getFirstIncompleteModule();
      if (target) {
        router.push(`/courses/playwright/${target.slug}`);
      }
    };

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 py-8">
        {/* Glassmorphism container */}
        <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center shadow-2xl backdrop-blur-xl">
          {/* Subtle neon background glow */}
          <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-500/10 blur-[100px] pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

          {/* Glowing Lock Icon */}
          <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.15)] animate-pulse">
            <Lock className="w-10 h-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
          </div>

          <h2 className="mb-3 text-2xl font-extrabold tracking-tight text-white uppercase drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
            Module Gate Locked
          </h2>
          <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-slate-400">
            This module contains advanced engineering concepts that build upon previous units. 
            To unlock this chapter, please clear the assessment for preceding modules.
          </p>

          {/* List of blockers */}
          {incompletePreceding.length > 0 && (
            <div className="mb-8 text-left bg-slate-950/40 border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                Required Modules Left:
              </div>
              <ul className="space-y-2 m-0 p-0 list-none">
                {incompletePreceding.map(mod => (
                  <li key={mod.id} className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    <button 
                      onClick={() => router.push(`/courses/playwright/${mod.slug}`)}
                      className="text-sm text-slate-300 hover:text-cyan-400 bg-transparent border-none p-0 m-0 cursor-pointer transition-colors text-left font-medium"
                    >
                      {mod.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action button */}
          <button
            onClick={handleJumpToFirstIncomplete}
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] cursor-pointer border-none"
          >
            Resume Learning Path
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 md:px-12 lg:px-16">
      <ChapterHeader moduleId={moduleId} />
      {children}
      <LessonFooter moduleId={moduleId} />
    </div>
  );
}
