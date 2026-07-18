"use client";
import React, { useEffect, useState } from 'react';
import { useMasteryStore } from '../store/useMasteryStore';
import modulesData from '../data/metadata.json';
import { loadModule } from '../utils/moduleLoader';
import { Clock, Activity, Target, CheckCircle2, ChevronRight, Terminal, Info } from 'lucide-react';

export default function ChapterHeader({ moduleId }: { moduleId: string }) {
  const [mounted, setMounted] = useState(false);
  const { completedModules } = useMasteryStore();
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
  
  if (!meta) return null;

  const isCompleted = completedModules.includes(moduleId);
  
  // Dashboard > FUNDAMENTALS > 1.2: CLI & Config Mastery
  const categoryStr = meta.group.replace(/.*?MODULE \d+: /, '').toUpperCase();

  return (
    <div className="mb-5 md:mb-10 animate-fade-in font-sans">
      {/* Breadcrumbs & Dev Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 tracking-widest uppercase">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="hover:text-cyan-400 cursor-pointer transition-colors">{categoryStr}</span>
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
