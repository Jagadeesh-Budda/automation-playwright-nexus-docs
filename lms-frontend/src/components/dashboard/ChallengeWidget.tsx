"use client";
import React, { useState, useEffect } from 'react';
import { Flame, Clock, Trophy, CheckCircle, AlertCircle, ArrowRight, ShieldAlert, Award } from 'lucide-react';
import { useMasteryStore } from '../../store/useMasteryStore';
import dailyChallengesData from '../../data/challenges/daily.json';
import weeklyChallengesData from '../../data/challenges/weekly.json';

export default function ChallengeWidget() {
  const {
    activeDailyChallenge,
    activeWeeklyChallenge,
    challengeHistory,
    challengeStreak,
    challengeDifficultyLevel,
    submitChallengeAttempt,
    completedModules,
    streak
  } = useMasteryStore();

  const [dailyCountdown, setDailyCountdown] = useState('');
  const [weeklyCountdown, setWeeklyCountdown] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ status: 'success' | 'error' | null; msg: string }>({ status: null, msg: '' });
  const startTimeRef = React.useRef(Date.now());

  // 1. Resolve Challenge Definitions
  const currentDaily = React.useMemo(() => {
    if (!activeDailyChallenge) return null;
    return dailyChallengesData.find((c: any) => c.id === activeDailyChallenge.id) || null;
  }, [activeDailyChallenge]);

  const currentWeekly = React.useMemo(() => {
    if (!activeWeeklyChallenge) return null;
    return weeklyChallengesData.find((w: any) => w.id === activeWeeklyChallenge.id) || null;
  }, [activeWeeklyChallenge]);

  const isDailyCompleted = React.useMemo(() => {
    if (!currentDaily) return false;
    return challengeHistory.some(h => h.id === currentDaily.id && h.passed);
  }, [currentDaily, challengeHistory]);

  // 2. Countdown Timers
  useEffect(() => {
    const updateCountdowns = () => {
      const now = new Date().getTime();

      // Daily Reset
      if (activeDailyChallenge) {
        const dailyExpiry = new Date(activeDailyChallenge.expiresAt).getTime();
        const diff = dailyExpiry - now;
        if (diff > 0) {
          const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const mins = Math.floor((diff / (1000 * 60)) % 60);
          const secs = Math.floor((diff / 1000) % 60);
          setDailyCountdown(`${hrs}h ${mins}m ${secs}s`);
        } else {
          setDailyCountdown('Resetting...');
        }
      }

      // Weekly Reset
      if (activeWeeklyChallenge) {
        const weeklyExpiry = new Date(activeWeeklyChallenge.expiresAt).getTime();
        const diff = weeklyExpiry - now;
        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hrs = Math.floor((diff / (1000 * 60 * 60)) % 24);
          setWeeklyCountdown(`${days}d ${hrs}h remaining`);
        } else {
          setWeeklyCountdown('Resetting...');
        }
      }
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [activeDailyChallenge, activeWeeklyChallenge]);

  // 3. Weekly Mission Progress calculation
  const weeklyProgress = React.useMemo(() => {
    if (!currentWeekly) return { current: 0, target: 1 };
    
    // Calculate progress based on weekly challenge type
    let currentVal = 0;
    if (currentWeekly.type === 'lessons') {
      currentVal = completedModules.length % currentWeekly.target; // mock lesson progression this week
    } else if (currentWeekly.type === 'quizzes') {
      currentVal = challengeHistory.filter(h => h.passed).length;
    } else if (currentWeekly.type === 'streak') {
      currentVal = streak;
    } else {
      currentVal = Math.min(2, currentWeekly.target); // fallback default
    }

    return {
      current: Math.min(currentVal, currentWeekly.target),
      target: currentWeekly.target
    };
  }, [currentWeekly, completedModules, streak, challengeHistory]);

  // 4. Submit Answer Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDaily || isDailyCompleted) return;

    setSubmitting(true);
    const userAnswer = currentDaily.options ? selectedOption : textAnswer.trim();
    const isCorrect = userAnswer.toLowerCase() === currentDaily.answer.toLowerCase();
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);

    setTimeout(() => {
      submitChallengeAttempt(currentDaily.id, isCorrect, timeTaken, userAnswer);
      setSubmitting(false);

      if (isCorrect) {
        setFeedback({ status: 'success', msg: `Correct! +${currentDaily.xpReward} XP awarded! Streak advanced.` });
      } else {
        setFeedback({ status: 'error', msg: `Incorrect answer. Try again!` });
      }
    }, 400);
  };

  const getDifficultyBadge = (difficulty: string) => {
    if (difficulty === 'Easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (difficulty === 'Medium') return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
    if (difficulty === 'Hard') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* 1. Daily Challenge Panel */}
      <div className="premium-depth-card rounded-2xl p-6 bg-slate-900/40 border border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-wider">
              <Flame className="w-4 h-4 fill-amber-500 animate-pulse" />
              <span>Daily Challenge</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{dailyCountdown}</span>
            </span>
          </div>

          {currentDaily ? (
            <div className="text-left space-y-4">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold border uppercase ${getDifficultyBadge(currentDaily.difficulty)}`}>
                  {currentDaily.difficulty}
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{currentDaily.category}</span>
              </div>

              <h3 className="text-sm font-bold text-slate-200 leading-snug">{currentDaily.question}</h3>

              {isDailyCompleted ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 flex items-center gap-3" role="alert">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  <div className="text-xs">
                    <div className="font-black uppercase">Completed Today!</div>
                    <div className="mt-0.5 opacity-80">You earned +{currentDaily.xpReward} XP. Check back tomorrow!</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                  {/* Options Renderer */}
                  {currentDaily.options ? (
                    <div className="space-y-2" role="radiogroup" aria-label="Daily challenge multiple choice options">
                      {currentDaily.options.map((opt: string, idx: number) => (
                        <label
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer text-xs font-semibold focus-ring ${
                            selectedOption === opt 
                              ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' 
                              : 'border-slate-900 bg-slate-950/40 text-slate-400 hover:border-slate-800'
                          }`}
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === ' ' || e.key === 'Enter') {
                              e.preventDefault();
                              setSelectedOption(opt);
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="challenge-opt"
                            value={opt}
                            checked={selectedOption === opt}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="hidden"
                          />
                          <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] flex-shrink-0" aria-hidden="true">
                            {selectedOption === opt && <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />}
                          </span>
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    // Text Input Renderer (Selector builder, DOM prediction, Fill blank)
                    <div>
                      <input
                        type="text"
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        className="w-full p-3 rounded-xl border border-slate-900 bg-slate-950/40 text-xs font-mono text-slate-200 outline-none focus:border-cyan-500/40 placeholder-slate-600 focus-ring"
                        aria-label="Daily challenge answer text input"
                        required
                      />
                    </div>
                  )}

                  {/* Feedback Panel */}
                  {feedback.status && (
                    <div 
                      role="alert" 
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs ${
                        feedback.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}
                    >
                      {feedback.status === 'success' ? <CheckCircle className="w-4 h-4" aria-hidden="true" /> : <AlertCircle className="w-4 h-4" aria-hidden="true" />}
                      <span>{feedback.msg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all border-none cursor-pointer shadow-[0_4px_15px_rgba(6,182,212,0.15)] focus-ring"
                  >
                    {submitting ? 'Submitting...' : 'Submit Answer'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">Loading today's challenge...</div>
          )}
        </div>
      </div>

      {/* 2. Weekly Mission Panel */}
      <div className="premium-depth-card rounded-2xl p-6 bg-slate-900/40 border border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/5 blur-[80px] pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 text-xs font-black text-cyan-400 uppercase tracking-wider">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>Weekly Mission</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{weeklyCountdown}</span>
            </span>
          </div>

          {currentWeekly ? (
            <div className="text-left space-y-4 pt-2">
              <h3 className="text-base font-black text-white uppercase tracking-tight">{currentWeekly.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{currentWeekly.description}</p>

              {/* Progress Bar */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span>Progress Logs</span>
                  <span className="font-mono text-cyan-400">{weeklyProgress.current} / {weeklyProgress.target}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-950/60 overflow-hidden border border-white/5 relative">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(weeklyProgress.current / weeklyProgress.target) * 100}%` }}
                    role="progressbar"
                    aria-valuenow={weeklyProgress.current}
                    aria-valuemin={0}
                    aria-valuemax={weeklyProgress.target}
                    aria-label="Weekly Mission Progress"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs">Loading weekly mission...</div>
          )}
        </div>

        <div className="pt-4">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase">Weekly Reward:</span>
            <span className="font-mono text-cyan-400 font-extrabold">+{currentWeekly?.xpReward || 150} XP</span>
          </div>
        </div>
      </div>

      {/* 3. Challenge Streak Board */}
      <div className="premium-depth-card rounded-2xl p-6 bg-slate-900/40 border border-slate-800 flex flex-col justify-between relative overflow-hidden min-h-[360px]">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-purple-500/5 blur-[80px] pointer-events-none" />
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-1.5 text-xs font-black text-purple-400 uppercase tracking-wider">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Challenger Streak</span>
            </span>
          </div>

          <div className="text-left space-y-6 pt-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center relative shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                <Flame className="w-10 h-10 text-amber-500 fill-amber-500 animate-bounce" aria-hidden="true" />
              </div>
              <div>
                <div className="text-2xl font-black text-white font-mono leading-none">{challengeStreak} Days</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5">Current Challenge Streak</div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Next Streak Milestone</div>
              <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-900 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>3 Day Streak</span>
                  <span className="text-amber-400 font-bold">+50 XP Bonus</span>
                </div>
                <div className="text-[10px] text-slate-500">Maintain your daily challenge completion to claim.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <div className="p-3 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold uppercase">Difficulty Cap:</span>
            <span className="font-bold text-cyan-400 uppercase">{challengeDifficultyLevel} Level</span>
          </div>
        </div>
      </div>
    </div>
  );
}
