"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Clock, Calendar, Heart, Bookmark, Code, ChevronRight, Play, BookOpen, Trash2, CheckCircle2 } from 'lucide-react';
import { useMasteryStore } from '../../store/useMasteryStore';
import modulesData from '../../data/metadata.json';

export default function ProductivityWidgets() {
  const router = useRouter();
  const [hubTab, setHubTab] = useState<'recent' | 'bookmarks' | 'favorites'>('recent');
  
  const {
    completedModules,
    userProgress,
    recentResources,
    bookmarkedResources,
    favoritedResources,
    copiedSnippets,
    clearCopiedSnippets,
    toggleFavorite,
    toggleBookmark,
    streak,
    todayMinutes,
    weeklyMinutes,
    monthlyMinutes,
    totalMinutes,
    getFirstIncompleteModule
  } = useMasteryStore();

  // 1. Calculate the Intelligent Continue Learning Target
  const continueLearningTarget = React.useMemo(() => {
    // Priority 1: Unfinished lesson (score > 0 and < 80)
    let target = modulesData.find(m => userProgress[m.id] !== undefined && userProgress[m.id] > 0 && userProgress[m.id] < 80);
    let typeLabel = "Unfinished Lesson";

    // Priority 2: Failed challenge/quiz
    if (!target) {
      target = modulesData.find(m => userProgress[m.id] !== undefined && userProgress[m.id] < 80 && (m.hasTasks || m.hasQuiz));
      if (target) typeLabel = "Failed Challenge";
    }

    // Priority 3: Bookmarked lesson
    if (!target && bookmarkedResources.length > 0) {
      const bookmarkedId = bookmarkedResources[0];
      target = modulesData.find(m => m.id === bookmarkedId);
      if (target) typeLabel = "Bookmarked Lesson";
    }

    // Priority 4: Continue module progression
    if (!target) {
      const nextIncomplete = getFirstIncompleteModule();
      if (nextIncomplete) {
        target = modulesData.find(m => m.id === nextIncomplete.id);
        if (target) typeLabel = "Next Up";
      }
    }

    // Priority 5: Fallback to first lesson
    if (!target) {
      target = modulesData[0];
      typeLabel = "Start Learning";
    }

    return { module: target, label: typeLabel };
  }, [userProgress, bookmarkedResources, getFirstIncompleteModule]);

  const targetModule = continueLearningTarget.module;
  const isFinishedAll = completedModules.length === modulesData.length;

  const handleResume = () => {
    if (targetModule) {
      router.push(`/courses/playwright/${targetModule.slug}`);
    }
  };

  const getDifficultyColor = (level: number) => {
    if (level === 0) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (level === 1) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (level === 2) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const getDifficultyLabel = (level: number) => {
    if (level === 0) return 'Novice';
    if (level === 1) return 'Advanced Beginner';
    if (level === 2) return 'Competent';
    return 'Expert';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* COLUMN 1: Continue Learning Card */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="premium-depth-card rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between h-full bg-slate-900/40 border border-slate-800 hover-premium-float min-h-[220px]">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                <Compass className="w-3 h-3" />
                <span>Continue Learning: {continueLearningTarget.label}</span>
              </span>
              {targetModule && targetModule.level !== undefined && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(targetModule.level)}`}>
                  {getDifficultyLabel(targetModule.level)}
                </span>
              )}
            </div>

            {isFinishedAll ? (
              <div className="py-2 text-left">
                <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">🎉 Curriculum Completed!</h3>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Excellent work! You have finished all lessons. Visit the Revision Center to keep your skills sharp.
                </p>
              </div>
            ) : targetModule ? (
              <div className="text-left space-y-2">
                <h3 className="text-lg font-black text-white uppercase tracking-tight line-clamp-1">{targetModule.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                  {targetModule.meta?.outcome || "Continue your structured path to mastering Playwright automation."}
                </p>

                {/* Progress Indicators */}
                <div className="grid grid-cols-2 gap-4 pt-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Est. Remaining: {targetModule.estimatedMinutes || 20}m</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Completion: {Math.round((completedModules.length / modulesData.length) * 100)}%</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="pt-4 mt-auto">
            <button
              onClick={handleResume}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(6,182,212,0.25)] border-none cursor-pointer focus-ring"
              aria-label={`Resume learning: ${targetModule?.title}`}
            >
              <Play className="w-3.5 h-3.5 fill-white" aria-hidden="true" />
              <span>Resume Study</span>
            </button>
          </div>
        </div>

        {/* COLUMN 1 SUB ROW: Resource Hub (Recent, Bookmarks, Favorites) */}
        <div className="premium-depth-card rounded-2xl p-5 bg-slate-900/40 border border-slate-800 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white uppercase tracking-widest">Resource Hub</span>
            </div>
            
            {/* Hub tabs */}
            <div className="flex bg-slate-950/60 border border-white/5 p-0.5 rounded-lg gap-0.5" role="tablist" aria-label="Resource Hub Categories">
              {(['recent', 'bookmarks', 'favorites'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setHubTab(tab)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border-none cursor-pointer focus-ring ${
                    hubTab === tab 
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                      : 'bg-transparent text-slate-500 hover:text-slate-300'
                  }`}
                  role="tab"
                  aria-selected={hubTab === tab}
                  aria-label={`View ${tab} resources`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content lists */}
          <div className="space-y-2 min-h-[140px] max-h-[220px] overflow-y-auto pr-1">
            {hubTab === 'recent' && (
              recentResources.length > 0 ? (
                recentResources.map((res) => (
                  <div key={res.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/30 border border-slate-900 hover:border-slate-800 transition-all">
                    <div onClick={() => router.push(res.url)} className="flex items-center gap-3 cursor-pointer min-w-0 flex-grow">
                      <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-400 text-[9px] font-black border border-white/5 uppercase">{res.type}</span>
                      <span className="text-xs font-bold text-slate-300 line-clamp-1">{res.title}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No recently opened resources.</div>
              )
            )}

            {hubTab === 'bookmarks' && (
              bookmarkedResources.length > 0 ? (
                bookmarkedResources.map((id) => {
                  const m = modulesData.find(item => item.id === id);
                  if (!m) return null;
                  return (
                    <div key={id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/30 border border-slate-900 hover:border-slate-800 transition-all">
                      <div onClick={() => router.push(`/courses/playwright/${m.slug}`)} className="flex items-center gap-3 cursor-pointer min-w-0 flex-grow">
                        <Bookmark className="w-3.5 h-3.5 text-pink-400 fill-pink-400 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-300 line-clamp-1">{m.title}</span>
                      </div>
                      <button 
                        onClick={() => toggleBookmark(id)}
                        className="p-1 hover:bg-slate-900 rounded-md text-slate-500 hover:text-rose-500 border-none bg-transparent cursor-pointer focus-ring"
                        aria-label={`Remove bookmark for ${m.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No bookmarked resources.</div>
              )
            )}

            {hubTab === 'favorites' && (
              favoritedResources.length > 0 ? (
                favoritedResources.map((id) => {
                  const m = modulesData.find(item => item.id === id);
                  if (!m) return null;
                  return (
                    <div key={id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/30 border border-slate-900 hover:border-slate-800 transition-all">
                      <div onClick={() => router.push(`/courses/playwright/${m.slug}`)} className="flex items-center gap-3 cursor-pointer min-w-0 flex-grow">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-300 line-clamp-1">{m.title}</span>
                      </div>
                      <button 
                        onClick={() => toggleFavorite(id)}
                        className="p-1 hover:bg-slate-900 rounded-md text-slate-500 hover:text-rose-500 border-none bg-transparent cursor-pointer focus-ring"
                        aria-label={`Remove favorite for ${m.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-500 text-xs">No favorited resources.</div>
              )
            )}
          </div>
        </div>
      </div>

      {/* COLUMN 2: Streak, Study Time, and Copied Code Snippets */}
      <div className="flex flex-col gap-6">
        {/* Streak & Study Time stats */}
        <div className="premium-depth-card rounded-2xl p-5 bg-slate-900/40 border border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-widest">Consistency Matrix</span>
            <div className="flex items-center gap-1 text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/25">
              <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
              <span className="text-xs font-extrabold">{streak} Day Streak</span>
            </div>
          </div>

          {/* Time trackers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Today</span>
              <span className="text-lg font-black text-white leading-tight font-mono mt-1">{todayMinutes} <span className="text-xs text-slate-400">mins</span></span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">This Week</span>
              <span className="text-lg font-black text-white leading-tight font-mono mt-1">{weeklyMinutes} <span className="text-xs text-slate-400">mins</span></span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">This Month</span>
              <span className="text-lg font-black text-white leading-tight font-mono mt-1">{monthlyMinutes} <span className="text-xs text-slate-400">mins</span></span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex flex-col">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Overall</span>
              <span className="text-lg font-black text-white leading-tight font-mono mt-1">{totalMinutes} <span className="text-xs text-slate-400">mins</span></span>
            </div>
          </div>
        </div>

        {/* Recently Copied Code Snippets */}
        <div className="premium-depth-card rounded-2xl p-5 bg-slate-900/40 border border-slate-800 flex flex-col flex-grow">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Code className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-black uppercase tracking-widest text-white">Copied Snippets</span>
            </div>
            {copiedSnippets.length > 0 && (
              <button 
                onClick={clearCopiedSnippets}
                className="text-[10px] font-black text-rose-500 hover:text-rose-400 bg-transparent border-none cursor-pointer uppercase transition-colors focus-ring"
                aria-label="Clear all copied code snippets"
              >
                Clear
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
            {copiedSnippets.length > 0 ? (
              copiedSnippets.map((snippet, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/50 border border-slate-900 flex flex-col gap-1.5 text-left">
                  <pre className="text-[10px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap leading-tight bg-slate-950 p-2 rounded max-h-[60px] border border-white/5 scrollbar-thin">
                    {snippet.text}
                  </pre>
                  <div className="flex items-center justify-between text-[9px] text-slate-500">
                    <span onClick={() => router.push(snippet.originUrl)} className="hover:text-cyan-400 cursor-pointer underline font-bold">Reopen origin page</span>
                    <span>{new Date(snippet.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-500 text-xs">
                Copy Playwright code from lessons to save here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple placeholder components for Compass
function Compass({ className }: { className?: string }) {
  return <BookOpen className={className} />;
}
