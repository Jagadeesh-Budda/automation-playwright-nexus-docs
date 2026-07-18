"use client";
import React, { useEffect, useState } from 'react';
import { Moon, Sun, User, Settings, Check, X, QrCode, Flame, Bell, Clock, Award, Menu, ShoppingBag } from 'lucide-react';
import SearchBar from './SearchBar';
import AudioReader from './AudioReader';
import NotificationCenter from './NotificationCenter';
import { useMasteryStore } from '../store/useMasteryStore';

export default function Header() {
  const [theme, setTheme] = useState('light');
  const { userName, userId, setUser, setMobileSyncOpen, streak, completedModules, unlockedAchievements, setPremiumModalOpen, isSidebarExpanded, setSidebarExpanded, isReadingModeActive, dailyTargetMinutes, learningGoals, updateLearningProfile } = useMasteryStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [editTarget, setEditTarget] = useState(20);
  const [editGoals, setEditGoals] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState(false);
  const [timeStr, setTimeStr] = useState('');
  const [sessionSecs, setSessionSecs] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    document.body.setAttribute('data-theme', saved);

    // Live ticking clock
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Session timer
    const sessionInterval = setInterval(() => {
      setSessionSecs(s => s + 1);
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(sessionInterval);
    };
  }, []);

  if (isReadingModeActive) return null;

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleOpenEdit = () => {
    setNewName(userName);
    setEditTarget(dailyTargetMinutes);
    setEditGoals(learningGoals);
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      await setUser(newName.trim(), userId);
      await updateLearningProfile({
        dailyTargetMinutes: editTarget,
        learningGoals: editGoals
      });
      setShowEditModal(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Dynamic Rank & Level Logic
  const totalChapters = 76;
  const completedChaptersCount = completedModules.length;
  const completionPercentage = Math.round((completedChaptersCount / totalChapters) * 100);

  let currentRankIndex = 0;
  if (completionPercentage >= 20 && completionPercentage < 50) currentRankIndex = 1;
  else if (completionPercentage >= 50 && completionPercentage < 80) currentRankIndex = 2;
  else if (completionPercentage >= 80) currentRankIndex = 3;

  const RANKS = ["Junior Specialist", "Automation Engineer", "Framework Architect", "Automation Legend"];
  const rankName = RANKS[currentRankIndex];

  const simulatedProjectsBuilt = Math.floor(completionPercentage / 20); 
  const simulatedAchievements = unlockedAchievements ? unlockedAchievements.length : 0;
  
  let calculatedXP = (completedChaptersCount * 15) + (streak > 0 ? 20 : 0);
  calculatedXP += simulatedProjectsBuilt * 250; 
  calculatedXP += simulatedAchievements * 100;  
  for (let i = 0; i < currentRankIndex; i++) {
    calculatedXP += (i + 1) * 500;
  }
  const level = Math.floor(calculatedXP / 100) + 1;

  return (
    <>
      <header className="h-16 border-b border-[var(--glass-border)] bg-[var(--sidebar-bg)]/80 backdrop-blur-xl px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
        
        <div className="flex items-center gap-4 flex-1">
          <button 
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
            className="p-2 -ml-2 rounded-lg hover:bg-[var(--sidebar-bg)] text-[var(--text-main)] transition-colors border-none bg-transparent cursor-pointer flex md:hidden"
            title="Toggle Sidebar Menu"
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </button>
          <SearchBar />
        </div>
        <div className="flex items-center gap-5">
          {/* Day Streak */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-orange-500/20 bg-orange-500/5 hidden sm:flex text-xs font-black text-orange-400 uppercase tracking-wider">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
            <span>{streak || 1} Day Streak</span>
          </div>

          {/* Premium Source Code Link */}
          <button
            onClick={() => setPremiumModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-xs font-black text-purple-300 uppercase tracking-wider transition-all duration-300 shadow-[0_0_10px_rgba(168,85,247,0.05)] hover:shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
            title="Get Premium LMS Source Code"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Get Code</span>
          </button>

          <NotificationCenter />

          {/* User Info Bar (Glassmorphic) */}
          {userId && (
            <div 
              onClick={handleOpenEdit}
              className="flex items-center gap-3 md:px-3.5 md:py-1.5 p-1.5 rounded-xl border border-transparent md:border-[var(--glass-border)] bg-transparent md:bg-[var(--sidebar-bg)] hover:bg-[var(--border-color)] cursor-pointer transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="hidden md:flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[var(--text-main)] leading-tight">
                    {userName || 'Jagadeesh'}
                  </span>
                  <span className={`text-[8px] font-black bg-blue-500/10 border px-1.5 py-0.5 rounded-md flex items-center gap-0.5 ${
                    currentRankIndex === 3 ? 'text-rose-400 border-rose-500/20 bg-rose-500/10' :
                    currentRankIndex === 2 ? 'text-amber-400 border-amber-500/20 bg-amber-500/10' :
                    currentRankIndex === 1 ? 'text-purple-400 border-purple-500/20 bg-purple-500/10' :
                    'text-blue-400 border-blue-500/20 bg-blue-500/10'
                  }`}>
                    <Award className="w-2.5 h-2.5" />
                    Level {level}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wide leading-none">
                    {rankName}
                  </span>
                  <span className="text-[9px] font-black text-emerald-400 font-mono">
                    • {timeStr || '17:48:52'}
                  </span>
                </div>
              </div>
            </div>
          )}

          <AudioReader />

          <button 
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-full hover:bg-[var(--sidebar-bg)] text-[var(--text-main)] transition-colors border-none bg-transparent cursor-pointer"
          >
            {theme === 'light' ? <Moon className="w-5 h-5 text-slate-400" /> : <Sun className="w-5 h-5 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer border-none bg-transparent"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-5 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyan-400" />
              Profile Settings
            </h3>

            <form onSubmit={handleSaveProfile} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Update Candidate Name
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-slate-950/40 text-white focus:outline-none focus:border-cyan-500 transition-colors text-sm"
                />
              </div>

              {/* Daily Target Duration Chips */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Daily Study Target
                </label>
                <div className="flex flex-wrap gap-2">
                  {[15, 30, 45, 60, 90].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setEditTarget(t)}
                      className={`px-3 py-1.5 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                        editTarget === t
                          ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'bg-slate-950/40 border-white/5 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                      }`}
                    >
                      {t} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Learning Goals Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Your Learning Goals
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'expert', label: 'Become Playwright Expert' },
                    { id: 'sdet', label: 'Switch to SDET' },
                    { id: 'api', label: 'Learn API Automation' },
                    { id: 'interview', label: 'Crack Interviews' },
                    { id: 'framework', label: 'Build Framework' },
                    { id: 'ts', label: 'Learn TypeScript' },
                    { id: 'enterprise', label: 'Enterprise Testing' },
                    { id: 'cicd', label: 'CI/CD Automation' }
                  ].map((goal) => {
                    const selected = editGoals.includes(goal.id);
                    return (
                      <button
                        type="button"
                        key={goal.id}
                        onClick={() => {
                          setEditGoals(prev => 
                            prev.includes(goal.id) ? prev.filter(g => g !== goal.id) : [...prev, goal.id]
                          );
                        }}
                        className={`p-2.5 rounded-xl border text-left text-[10px] font-bold transition-all cursor-pointer flex items-center justify-between ${
                          selected
                            ? 'bg-cyan-500/10 border-cyan-500 text-white'
                            : 'bg-slate-950/40 border-white/5 text-slate-500 hover:border-slate-700 hover:text-slate-350'
                        }`}
                      >
                        <span className="truncate pr-1">{goal.label}</span>
                        {selected && <Check className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1.5">
                  Your Unique Sync Token (User ID)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={userId}
                    className="flex-1 px-3 py-2 bg-slate-950/60 border border-white/15 rounded-lg text-slate-400 font-mono text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="px-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5" /> : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-white/5">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm cursor-pointer border-none"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setMobileSyncOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
