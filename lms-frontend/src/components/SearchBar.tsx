"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { Search, X, Clock, BookOpen, ChevronRight, Bookmark, Heart, Star, Sparkles, Filter, Settings, Award, Compass, RefreshCw, Trophy } from "lucide-react";
import Fuse from "fuse.js";
import searchIndexData from "../data/search-index.json";
import { useMasteryStore } from "../store/useMasteryStore";

interface SearchEntry {
  id: string;
  title: string;
  group: string;
  url: string;
  type: string;
  time: string;
  outcome: string;
  keywords: string;
  content: string;
  snippet: string;
}

const fuse = new Fuse(searchIndexData as SearchEntry[], {
  keys: [
    { name: "title", weight: 3 },
    { name: "outcome", weight: 2 },
    { name: "keywords", weight: 2 },
    { name: "content", weight: 1 },
    { name: "snippet", weight: 1 },
  ],
  threshold: 0.4,
  includeMatches: true,
  minMatchCharLength: 2,
});

const TYPE_COLORS: Record<string, string> = {
  Concept: "#6366f1",
  Code: "#10b981",
  Execution: "#f59e0b",
  Debug: "#ef4444",
  Architecture: "#8b5cf6",
};

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<'All' | 'Lessons' | 'Exercises' | 'Quizzes' | 'Challenges' | 'Interview' | 'API'>('All');
  const [activeIndex, setActiveIndex] = useState(0);
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    recentResources,
    favoritedResources,
    bookmarkedResources,
    getFirstIncompleteModule,
    isReadingModeActive,
    setReadingModeActive
  } = useMasteryStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Focus input on command palette open
  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isCommandPaletteOpen]);

  // Click outside or ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setCommandPaletteOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setCommandPaletteOpen(false);
    }
  };

  const navigate = (url: string) => {
    setQuery("");
    setCommandPaletteOpen(false);
    router.push(url.startsWith('/') ? url : `/${url}`);
  };

  // Perform search & filter
  const results = useMemo(() => {
    let filtered = searchIndexData as SearchEntry[];

    // 1. Search Query
    if (query.trim()) {
      filtered = fuse.search(query).map((r) => r.item);
    }

    // 2. Category Filter
    if (activeTab !== 'All') {
      filtered = filtered.filter(item => {
        const titleLower = item.title.toLowerCase();
        const contentLower = item.content.toLowerCase();
        const keywordsLower = item.keywords.toLowerCase();

        switch (activeTab) {
          case 'Lessons':
            return item.type === 'Concept' || titleLower.includes('lesson') || titleLower.includes('chapter');
          case 'Exercises':
            return item.type === 'Code' || item.type === 'Execution' || titleLower.includes('exercise') || titleLower.includes('sandbox');
          case 'Quizzes':
            return titleLower.includes('quiz') || contentLower.includes('quiz') || keywordsLower.includes('quiz');
          case 'Challenges':
            return titleLower.includes('challenge') || item.group.toLowerCase().includes('challenge') || titleLower.includes('capstone');
          case 'Interview':
            return titleLower.includes('interview') || item.group.toLowerCase().includes('interview') || contentLower.includes('career');
          case 'API':
            const apiWords = ['locator', 'expect', 'page.', 'fixture', 'pom', 'page object', 'goto', 'waitfor'];
            return apiWords.some(w => titleLower.includes(w) || contentLower.includes(w) || keywordsLower.includes(w));
          default:
            return true;
        }
      });
    }

    // 3. Search Ranking
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      return [...filtered].sort((a, b) => {
        const aRecent = recentResources.some(r => r.id === a.id);
        const bRecent = recentResources.some(r => r.id === b.id);
        if (aRecent && !bRecent) return -1;
        if (!aRecent && bRecent) return 1;

        const aFav = favoritedResources.includes(a.id);
        const bFav = favoritedResources.includes(b.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;

        const aExact = a.title.toLowerCase() === q;
        const bExact = b.title.toLowerCase() === q;
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;

        const aStart = a.title.toLowerCase().startsWith(q);
        const bStart = b.title.toLowerCase().startsWith(q);
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;

        return 0;
      }).slice(0, 10);
    }

    return filtered.slice(0, 8);
  }, [query, activeTab, recentResources, favoritedResources]);

  // Reset active index on filter change
  useEffect(() => {
    setActiveIndex(0);
  }, [query, activeTab]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].url);
    }
  };

  // Playwright Syntax Highlighter
  const highlightText = (text: string) => {
    if (!text) return "";
    const terms = ['locator', 'expect', 'fixture', 'page\\.', 'POM', 'Page Object Model', 'goto'];
    let formatted = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      formatted = formatted.replace(regex, '<span class="px-1 py-0.5 mx-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono text-[11px] border border-cyan-500/20 font-bold">$1</span>');
    });
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  // Quick Actions List
  const quickActions = [
    { label: 'Resume Learning', icon: <Compass className="w-4 h-4 text-cyan-400" />, action: () => {
        const next = getFirstIncompleteModule();
        if (next) navigate(`/courses/playwright/${next.slug}`);
      }
    },
    { label: 'Start Revision', icon: <RefreshCw className="w-4 h-4 text-emerald-400" />, action: () => navigate('/revision-center') },
    { label: 'Random Quiz', icon: <Trophy className="w-4 h-4 text-amber-400" />, action: () => navigate('/courses/playwright/01-js-ts-variables') },
    { label: 'Open Dashboard', icon: <Star className="w-4 h-4 text-indigo-400" />, action: () => navigate('/') },
    { label: 'Bookmarks', icon: <Bookmark className="w-4 h-4 text-pink-400" />, action: () => navigate('/#bookmarks') },
    { label: 'Reading Mode', icon: <BookOpen className="w-4 h-4 text-purple-400" />, action: () => {
        setReadingModeActive(!isReadingModeActive);
        setCommandPaletteOpen(false);
      }
    },
  ];

  return (
    <>
      {/* Mini Search Trigger Bar (In Header) */}
      <button 
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border-color)] bg-[var(--sidebar-bg)] hover:border-cyan-500/40 text-[var(--text-muted)] cursor-pointer transition-all w-full max-w-[260px] md:max-w-[320px] select-none focus-ring text-left"
        aria-haspopup="dialog"
        aria-expanded={isCommandPaletteOpen}
        aria-label="Open Command Palette"
      >
        <Search className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-xs md:text-sm flex-grow text-left">Search resources... (Ctrl+K)</span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300">Ctrl+K</kbd>
      </button>

      {/* Command Palette Modal */}
      {isCommandPaletteOpen && (
        <div 
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex items-start justify-center pt-[10vh] px-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
        >
          <div 
            ref={dropdownRef}
            className="w-full max-w-3xl bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[75vh]"
          >
            {/* Search Input Area */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-900 relative">
              <Search className="w-5 h-5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search lessons, quizzes, Playwright APIs, exercises..."
                className="bg-transparent border-none outline-none text-white text-base flex-grow w-full placeholder-slate-500 font-sans focus-ring px-2"
                aria-autocomplete="list"
                aria-controls="search-results-list"
              />
              {query && (
                <button 
                  onClick={() => setQuery("")}
                  className="p-1 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white border-none bg-transparent cursor-pointer focus-ring"
                  aria-label="Clear search query"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400">ESC to close</kbd>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-950/60 border-b border-slate-900 overflow-x-auto scrollbar-none">
              <Filter className="w-3.5 h-3.5 text-slate-500 mr-2 flex-shrink-0" aria-hidden="true" />
              {(['All', 'Lessons', 'Exercises', 'Quizzes', 'Challenges', 'Interview', 'API'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border-none cursor-pointer flex-shrink-0 focus-ring ${
                    activeTab === tab 
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400' 
                      : 'bg-transparent text-slate-400 hover:text-slate-200'
                  }`}
                  aria-label={`Filter by ${tab}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Drawer */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {/* Quick Actions Panel (shown only when query is empty) */}
              {!query && (
                <div>
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">Quick Actions</div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={action.action}
                        className="flex items-center gap-3 p-3 rounded-xl border border-slate-900 bg-slate-950/30 hover:border-slate-800 hover:bg-slate-900/50 transition-all text-left text-xs font-bold text-slate-300 cursor-pointer focus-ring"
                        role="button"
                        aria-label={action.label}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results / Lists */}
              <div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-2">
                  {query ? 'Search Results' : 'Recently Visited & Popular Resources'}
                </div>
                <div className="space-y-1" id="search-results-list" role="listbox">
                  {results.map((result, i) => {
                    const isFav = favoritedResources.includes(result.id);
                    const isBkm = bookmarkedResources.includes(result.id);
                    
                    return (
                      <button
                        key={result.id}
                        onClick={() => navigate(result.url)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer w-full border-none bg-transparent text-left focus-ring ${
                          i === activeIndex ? 'bg-slate-900 border border-slate-800' : 'bg-transparent border border-transparent'
                        }`}
                        onMouseEnter={() => setActiveIndex(i)}
                        role="option"
                        aria-selected={i === activeIndex}
                        aria-label={`Result: ${result.title}. Type: ${result.type}`}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-grow">
                          <span
                            style={{
                              display: "inline-block",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              background: (TYPE_COLORS[result.type] || "#6366f1") + "22",
                              color: TYPE_COLORS[result.type] || "#6366f1",
                              marginTop: "2px",
                              minWidth: "60px",
                              textAlign: "center"
                            }}
                          >
                            {result.type}
                          </span>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                              {highlightText(result.title)}
                              {isFav && <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 flex-shrink-0" aria-label="Favorited" />}
                              {isBkm && <Bookmark className="w-3.5 h-3.5 text-pink-400 fill-pink-400 flex-shrink-0" aria-label="Bookmarked" />}
                            </div>
                            <div className="text-xs text-slate-400 mt-1 line-clamp-1">
                              {highlightText(result.snippet || result.outcome)}
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" aria-hidden="true" />
                      </button>
                    );
                  })}
                  {results.length === 0 && (
                    <div className="text-center py-8 text-slate-500 text-xs">
                      No matching resources found for "{query}".
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-900 bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <div className="flex items-center gap-4">
                <span>{searchIndexData.length} indexed items</span>
                <span>↑↓ to navigate</span>
                <span>Enter to select</span>
              </div>
              <div>Command Palette v1.1</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
