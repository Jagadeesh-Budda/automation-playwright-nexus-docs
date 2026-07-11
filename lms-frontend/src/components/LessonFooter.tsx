"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMasteryStore } from '../store/useMasteryStore';
import modulesData from '../data/metadata.json';
import { loadModule, prefetchModule } from '../utils/moduleLoader';
import { CheckCircle2, ArrowRight, ArrowLeft, Trophy } from 'lucide-react';

export default function LessonFooter({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const { completedModules, completeModule } = useMasteryStore();
  const [isCompleting, setIsCompleting] = useState(false);
  const [lessonContent, setLessonContent] = useState<any>(null);

  const currentIndex = modulesData.findIndex((m: any) => m.id === moduleId);
  const meta = currentIndex !== -1 ? modulesData[currentIndex] : null;

  React.useEffect(() => {
    if (!meta) return;

    // Dynamically load active module
    loadModule(meta.moduleFile)
      .then((mod) => {
        const content = mod.lessons.find((l: any) => l.id === moduleId);
        setLessonContent(content);
      })
      .catch((err) => console.error("Failed to load module dynamically in LessonFooter:", err));

    // Prefetch next module
    if (currentIndex !== -1 && currentIndex < modulesData.length - 1) {
      const nextMeta = modulesData[currentIndex + 1];
      if (nextMeta && nextMeta.moduleFile !== meta.moduleFile) {
        prefetchModule(nextMeta.moduleFile);
      }
    }
  }, [moduleId, meta, currentIndex]);

  if (currentIndex === -1 || !meta) return null;

  const prevModule = currentIndex > 0 ? modulesData[currentIndex - 1] : null;
  const nextModule = currentIndex < modulesData.length - 1 ? modulesData[currentIndex + 1] : null;

  const totalModules = modulesData.length;
  const isCompleted = completedModules.includes(moduleId);

  const handleComplete = async () => {
    if (isCompleted) return;
    setIsCompleting(true);
    await completeModule(moduleId, 100);
    // Optional: trigger local event for other components listening
    localStorage.setItem(`code_verified_${moduleId}`, 'true');
    window.dispatchEvent(new CustomEvent('codeVerified', { detail: { moduleId } }));
    setIsCompleting(false);
  };

  const hasTasks = lessonContent && lessonContent.tasks && lessonContent.tasks.length > 0;

  return (
    <div className="mt-16 pt-10 border-t border-slate-800/60 font-sans animate-fade-in">
      
      {/* Top Section: Progress & Complete Action */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-xl border border-slate-700/50 shadow-inner">
          <Trophy className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          <span className="text-sm font-bold text-slate-300 tracking-wide">
            LESSON <span className="text-white">{currentIndex + 1}</span> OF <span className="text-slate-400">{totalModules}</span>
          </span>
        </div>

        {!hasTasks && (
          <button
            onClick={handleComplete}
            disabled={isCompleted || isCompleting}
            className={`relative group overflow-hidden px-8 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg cursor-pointer flex items-center justify-center gap-2 min-w-[200px] border-none
              ${isCompleted 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default' 
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 hover:shadow-[0_0_30px_rgba(34,211,238,0.4)]'
              }`}
          >
            {/* Subtle glow effect for incomplete state */}
            {!isCompleted && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_100%)] transition-opacity duration-300" />
            )}
            
            <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]' : ''}`} />
            {isCompleted ? 'Completed' : (isCompleting ? 'Marking...' : 'Mark as Complete')}
          </button>
        )}
      </div>

      {/* Bottom Section: Prev / Next Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prevModule ? (
          <button
            onClick={() => router.push(`/${prevModule.url}`)}
            className="flex flex-col items-start p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer text-left group border-solid"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-cyan-400 transition-colors">
              <ArrowLeft className="w-3 h-3" />
              Previous Lesson
            </div>
            <div className="text-sm font-semibold text-slate-300 line-clamp-2">
              {prevModule.title}
            </div>
          </button>
        ) : (
          <div /> // Empty placeholder to keep grid alignment
        )}

        {nextModule ? (
          <button
            onClick={() => router.push(`/${nextModule.url}`)}
            className="flex flex-col items-end p-5 rounded-2xl bg-slate-900/60 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-all cursor-pointer text-right group border-solid"
          >
            <div className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 group-hover:text-cyan-400 transition-colors">
              Next Lesson
              <ArrowRight className="w-3 h-3" />
            </div>
            <div className="text-sm font-semibold text-slate-300 line-clamp-2">
              {nextModule.title}
            </div>
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
