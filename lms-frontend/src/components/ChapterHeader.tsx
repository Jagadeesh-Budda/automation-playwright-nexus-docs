"use client";
import React, { useEffect, useState } from 'react';
import { useMasteryStore } from '../store/useMasteryStore';
import modulesData from '../data/metadata.json';
import { loadModule } from '../utils/moduleLoader';
import { Clock, Activity, Target, CheckCircle2, ChevronRight, Heart, Bookmark } from 'lucide-react';

export default function ChapterHeader({ moduleId }: { moduleId: string }) {
  const [mounted, setMounted] = useState(false);
  const {
    completedModules,
    favoritedResources,
    bookmarkedResources,
    toggleFavorite,
    toggleBookmark,
    addRecentResource,
    addCopiedSnippet
  } = useMasteryStore();
  const [lessonContent, setLessonContent] = useState<any>(null);
  
  const meta = modulesData.find(m => m.id === moduleId);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!meta) return;
    loadModule(meta.moduleFile)
      .then((mod) => {
        const content = mod.lessons.find((l: any) => l.id === moduleId);
        setLessonContent(content);
      })
      .catch((err) => console.error("Failed to load module dynamically in ChapterHeader:", err));
  }, [moduleId, meta]);

  // Log resource visit
  useEffect(() => {
    if (mounted && meta) {
      addRecentResource({
        id: moduleId,
        title: meta.title,
        type: meta.meta?.type || 'Lesson',
        url: `/courses/playwright/${moduleId}`,
        group: meta.group
      });
    }
  }, [mounted, moduleId, meta, addRecentResource]);

  // Capture copy snippets
  useEffect(() => {
    if (!mounted) return;
    const handleCopy = () => {
      const selection = window.getSelection()?.toString() || '';
      if (selection.trim()) {
        addCopiedSnippet(selection, window.location.pathname);
      }
    };
    document.addEventListener('copy', handleCopy);
    return () => document.removeEventListener('copy', handleCopy);
  }, [mounted, addCopiedSnippet]);
  
  if (!meta) return null;

  const isCompleted = completedModules.includes(moduleId);
  const isFav = favoritedResources.includes(moduleId);
  const isBkm = bookmarkedResources.includes(moduleId);
  
  // Dashboard > FUNDAMENTALS > 1.2: CLI & Config Mastery
  const categoryStr = meta.group.replace(/.*?MODULE \d+: /, '').toUpperCase();

  return (
    <div className="mb-5 md:mb-10 animate-fade-in font-sans">
      {/* Breadcrumbs & Productivity Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest uppercase">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">{categoryStr}</span>
        </div>

        {/* Favorite & Bookmark actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(moduleId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isFav 
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.15)]'
                : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-rose-400 hover:border-rose-500/20'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
            <span>{isFav ? 'Favorited' : 'Favorite'}</span>
          </button>
          <button
            onClick={() => toggleBookmark(moduleId)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
              isBkm 
                ? 'bg-pink-500/15 border-pink-500/40 text-pink-400 shadow-[0_0_12px_rgba(236,72,153,0.15)]'
                : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-pink-400 hover:border-pink-500/20'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBkm ? 'fill-pink-400' : ''}`} />
            <span>{isBkm ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>
      </div>

      {/* Mastery Objectives */}
      {lessonContent && lessonContent.objectives && lessonContent.objectives.length > 0 && (
        <div className="mb-5 md:mb-10 pl-2">
          <h3 className="text-sm font-black text-[#38bdf8] uppercase tracking-widest mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Mastery Objectives
          </h3>
          <ul className="space-y-3">
            {lessonContent.objectives.map((obj: any) => (
              <li key={obj.id} className="flex items-start gap-3 text-slate-300 text-[15px] leading-relaxed">
                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCompleted ? 'text-emerald-500' : 'text-emerald-500/50'}`} />
                <span>{obj.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { ChapterHeader };
