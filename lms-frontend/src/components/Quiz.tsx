"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import modulesData from '../data/metadata.json';
import { loadModule } from '../utils/moduleLoader';
import { ShieldCheck, Lock, CheckCircle2, XCircle, ArrowRight, RotateCcw, Info, Trophy, Zap } from 'lucide-react';
import { useMasteryStore } from '../store/useMasteryStore';

interface QuizProps {
  moduleId: string;
}

export default function Quiz({ moduleId }: QuizProps) {
  const { userId, userName, completeModule } = useMasteryStore();
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<{ earned: number, total: number, passed: boolean } | null>(null);
  const [nextModuleData, setNextModuleData] = useState<any | null>(null);
  const [nextLink, setNextLink] = useState<string | null>(null);
  const [codeVerified, setCodeVerified] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lessonContent, setLessonContent] = useState<any>(null);

  useEffect(() => {
    const currentIndex = modulesData.findIndex(m => m.id === moduleId);
      if (currentIndex !== -1 && currentIndex < modulesData.length - 1) {
        const nextModule = modulesData[currentIndex + 1];
        setNextModuleData(nextModule);
        setNextLink(`/courses/playwright/${nextModule.slug}`);
      } else {
        setNextModuleData(null);
        setNextLink(null);
      }
  }, [moduleId]);

  // Track whether the code task has been verified
  useEffect(() => {
    const meta = modulesData.find(m => m.id === moduleId);
    if (!meta) {
      setCodeVerified(true);
      return;
    }

    loadModule(meta.moduleFile)
      .then((mod) => {
        const lesson = mod.lessons.find((l: any) => l.id === moduleId);
        const hasTasks = lesson && lesson.tasks && lesson.tasks.length > 0;
        if (!hasTasks) {
          setCodeVerified(true);
        } else {
          const alreadyVerified = localStorage.getItem(`code_verified_${moduleId}`) === 'true';
          setCodeVerified(alreadyVerified);
        }
      })
      .catch((err) => {
        console.error(err);
        setCodeVerified(true);
      });

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.moduleId === moduleId) setCodeVerified(true);
    };
    window.addEventListener('codeVerified', handler);
    return () => window.removeEventListener('codeVerified', handler);
  }, [moduleId]);

  useEffect(() => {
    const meta = modulesData.find(m => m.id === moduleId);
    if (!meta) return;

    loadModule(meta.moduleFile)
      .then((mod) => {
        const lesson = mod.lessons.find((l: any) => l.id === moduleId);
        setLessonContent(lesson);
        if (!lesson || !lesson.quizPool) {
          setQuestions([]);
          return;
        }

        // Helper to shuffle an array
        const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

        // Get pools
        const easyPool = lesson.quizPool.Easy ? shuffle(lesson.quizPool.Easy) : [];
        const mediumPool = lesson.quizPool.Medium ? shuffle(lesson.quizPool.Medium) : [];
        const hardPool = lesson.quizPool.Hard ? shuffle(lesson.quizPool.Hard) : [];

        // Select 2 Easy, 2 Medium, 1 Hard (or max available)
        const selected = [
          ...easyPool.slice(0, 2),
          ...mediumPool.slice(0, 2),
          ...hardPool.slice(0, 1)
        ];

        // Shuffle final question list
        const finalQuestions = shuffle(selected);

        // Shuffle options and normalize correct answers array for each question (Sprint 4.4)
        const processed = finalQuestions.map(q => {
          const isMulti = q.type === 'multi-select';
          let parsedAnswers = q.a;
          if (isMulti && typeof q.a === 'string') {
            parsedAnswers = q.a.split(',').map((s: string) => s.trim());
          }
          return {
            ...q,
            shuffledOptions: q.options ? shuffle(q.options) : [],
            a: parsedAnswers
          };
        });

        setQuestions(processed);
        setIsSubmitted(false);
        setScore(null);
        setAnswers({});

        // Check if this module is already mastered in the database
        if (userId) {
          fetch('/api/progress', {
            headers: {
              'x-user-id': userId,
              'x-user-name': userName,
            }
          })
            .then(res => res.json())
            .then(data => {
              if (data.success && data.progress) {
                const moduleProgress = data.progress.find((p: any) => p.module_id === moduleId);
                if (moduleProgress && moduleProgress.score >= 80) {
                  setIsSubmitted(true);
                  setHasStarted(true);
                  setScore({ earned: processed.length, total: processed.length, passed: true });
                  
                  // Pre-fill answers with correct answers to highlight correctly in UI
                  const prefilled: Record<number, string | string[]> = {};
                  processed.forEach((q, idx) => {
                    prefilled[idx] = q.a;
                  });
                  setAnswers(prefilled);
                }
              }
            })
            .catch(err => console.error('Failed to load initial progress', err));
        }
      })
      .catch((err) => console.error("Failed to load module dynamically in Quiz:", err));
  }, [moduleId, userId, userName]);

  const handleSelect = (qIndex: number, option: string, isMulti: boolean) => {
    if (isSubmitted) return;
    setAnswers(prev => {
      if (isMulti) {
        const current = (prev[qIndex] as string[]) || [];
        if (current.includes(option)) {
          return { ...prev, [qIndex]: current.filter(o => o !== option) };
        } else {
          return { ...prev, [qIndex]: [...current, option] };
        }
      } else {
        return { ...prev, [qIndex]: option };
      }
    });
  };

  const handleSubmit = () => {
    // Check if all questions have been answered
    const allAnswered = questions.every((q, idx) => {
      const userAns = answers[idx];
      if (q.type === 'multi-select') {
        return Array.isArray(userAns) && userAns.length > 0;
      }
      return userAns !== undefined && userAns !== '';
    });

    if (!allAnswered) {
      alert("Please answer all questions before submitting.");
      return;
    }

    let earned = 0;
    const total = questions.length;

    questions.forEach((q, idx) => {
      const isMulti = q.type === 'multi-select';
      const userAns = answers[idx];
      
      if (isMulti) {
        const userArr = (userAns as string[]) || [];
        const correctArr = (q.a as string[]) || [];
        if (userArr.length === correctArr.length && userArr.every(v => correctArr.includes(v))) {
          earned++;
        }
      } else {
        if (userAns === q.a) {
          earned++;
        }
      }
    });

    // 80% passing score
    const passThreshold = Math.ceil(total * 0.8);
    const passed = earned >= passThreshold;

    setScore({ earned, total, passed });
    setIsSubmitted(true);

    if (passed) {
      setShowCelebration(true);
    }

    // Save to database permanently!
    completeModule(moduleId, Math.round((earned / total) * 100))
      .catch(err => console.error('Failed to sync progress', err));
      
    // Telemetry can be implemented here later
  };

  const tasks = lessonContent?.tasks || [];

  return (
    <div className="mt-10 mb-20 font-sans">
      {!hasStarted ? (
        <div className="animate-fade-in">
          {/* Mastery Assessment Gate */}
          <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:border-slate-700">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <div className="w-16 h-16 rounded-2xl bg-[#1e293b] border border-slate-700 flex items-center justify-center shadow-inner flex-shrink-0">
                <ShieldCheck className="w-8 h-8 text-[#38bdf8]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white m-0 mb-1.5">Mastery Assessment Gate</h3>
                <p className="text-slate-400 text-sm m-0 leading-snug">
                  Technical content reviewed. You are now eligible for the final validation challenge.
                </p>
              </div>
            </div>
            {tasks.length > 0 && !codeVerified ? (
              <button 
                disabled
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-slate-800 text-slate-400 rounded-xl font-bold border-none cursor-not-allowed flex-shrink-0 opacity-80"
              >
                <Lock className="w-5 h-5" />
                Practical Tasks Pending
              </button>
            ) : questions.length === 0 ? (
              <button 
                onClick={() => {
                  setScore({ earned: 0, total: 0, passed: true });
                  setIsSubmitted(true);
                  setHasStarted(true);
                  completeModule(moduleId, 100).catch(err => console.error(err));
                }}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition-all border-none cursor-pointer flex-shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:-translate-y-0.5"
              >
                <CheckCircle2 className="w-5 h-5" />
                Mark Module Complete
              </button>
            ) : (
              <button 
                onClick={() => setHasStarted(true)}
                className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#38bdf8] text-white rounded-xl font-bold hover:bg-[#0ea5e9] transition-all border-none cursor-pointer flex-shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.2)] hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] hover:-translate-y-0.5"
              >
                <Zap className="w-5 h-5 fill-white" />
                Start Mastery Assessment
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-12">
        {questions.map((q, qIndex) => {
          const isMulti = q.type === 'multi-select';
          const showReveal = isSubmitted && score?.passed;
          return (
            <div key={qIndex} className="quiz-item">
              
              {/* Scenario Rendering */}
              {q.scenario && (
                <div className="mb-5 p-5 bg-gradient-to-br from-[#0f172a] to-[#1e293b] border border-indigo-500/30 rounded-xl shadow-inner relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="block text-xs font-black text-indigo-400 uppercase tracking-widest mb-1.5">Enterprise Scenario</span>
                      <p className="text-sm md:text-base text-slate-200 leading-relaxed m-0 font-medium">{q.scenario}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Code Analysis Rendering */}
              {q.code && (
                <div className="mb-4 p-4 bg-[#1e1e1e] border border-slate-700 rounded-lg text-sm text-[#d4d4d4] font-mono overflow-x-auto shadow-inner">
                  <pre className="whitespace-pre-wrap">{q.code}</pre>
                </div>
              )}

              <p className="font-semibold text-[var(--text-main)] mb-2 text-lg">{qIndex + 1}. {q.q}</p>
              {isMulti && <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-4">Select all that apply</p>}


              <div className="grid gap-2">
                {q.shuffledOptions.map((opt: string, oIndex: number) => {
                  const isSelected = isMulti 
                    ? ((answers[qIndex] as string[]) || []).includes(opt) 
                    : answers[qIndex] === opt;
                    
                  const isCorrectOpt = isMulti 
                    ? ((q.a as string[]) || []).includes(opt) 
                    : q.a === opt;

                  let btnClass = "text-left px-4 py-3 rounded border transition-all duration-200 ";
                  
                  if (!isSubmitted) {
                    btnClass += isSelected 
                      ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-md"
                      : "bg-transparent text-[var(--text-main)] border-[var(--border-color)] hover:border-[var(--accent)] hover:bg-[rgba(37,99,235,0.05)]";
                  } else {
                    if (showReveal) {
                      if (isCorrectOpt) {
                        btnClass += "bg-green-100 text-green-800 border-green-500 font-bold"; 
                      } else if (isSelected && !isCorrectOpt) {
                        btnClass += "bg-red-100 text-red-800 border-red-500"; 
                      } else {
                        btnClass += "bg-transparent text-[var(--text-muted)] border-[var(--border-color)] opacity-50";
                      }
                    } else {
                      if (isSelected) {
                        btnClass += "bg-slate-200 text-slate-800 border-slate-400 opacity-80";
                      } else {
                        btnClass += "bg-transparent text-[var(--text-muted)] border-[var(--border-color)] opacity-50";
                      }
                    }
                  }

                  return (
                    <button 
                      key={oIndex}
                      onClick={() => handleSelect(qIndex, opt, isMulti)}
                      className={btnClass}
                      disabled={isSubmitted}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Checkbox indicator for multi-select */}
                          {isMulti && !isSubmitted && (
                            <div className={`w-4 h-4 rounded-sm border ${isSelected ? 'bg-white border-white' : 'border-slate-400'} flex items-center justify-center`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" />}
                            </div>
                          )}
                          <span>{opt}</span>
                        </div>
                        {showReveal && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {showReveal && isSelected && !isCorrectOpt && <XCircle className="w-5 h-5 text-red-600" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Post-Submission Explanation */}
              {showReveal && q.explanation && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900 flex gap-3 animate-fade-in shadow-sm">
                  <Info className="w-5 h-5 flex-shrink-0 text-blue-500" />
                  <div>
                    <span className="font-bold block mb-1 text-blue-700">Explanation</span>
                    {q.explanation}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isSubmitted ? (
        <button 
          onClick={handleSubmit}
          className="mt-10 px-8 py-3 bg-[var(--accent)] text-white rounded font-bold hover:bg-blue-700 transition-colors border-none cursor-pointer shadow-lg w-full sm:w-auto"
        >
          Submit Assessment
        </button>
      ) : (
        <div className="flex flex-col gap-6 mt-12 animate-fade-in">
          {score?.passed ? (
            <div className="p-8 md:p-10 rounded-2xl border border-emerald-500/30 bg-[#064e3b]/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,1)]" />
              <h4 className="font-black text-3xl text-emerald-400 m-0 mb-6 tracking-wide drop-shadow-md">
                Mastery Attained!
              </h4>
              <div className="flex justify-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)]">
                   <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.6)]">
                   <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              </div>
              {(score?.total || 0) > 0 && (
                <p className="text-gray-300 font-bold mb-3 bg-black/30 inline-block px-4 py-2 rounded border border-gray-700">
                  Score: {Math.round(((score?.earned || 0) / (score?.total || 1)) * 100)}% ({score?.earned}/{score?.total} correct)
                </p>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-red-500/30 bg-[#7f1d1d]/20 shadow-lg text-center">
              <h4 className="font-black text-2xl text-red-500 m-0 mb-4">
                Assessment Failed
              </h4>
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg mb-6">
                <p className="text-red-400 font-semibold flex items-center gap-2 justify-center">
                  <XCircle className="w-5 h-5" /> Score is below 80%. Please review and try again.
                </p>
                <p className="text-red-400/70 text-sm mt-1">
                  (Required to pass: {Math.ceil((score?.total || 0) * 0.8)})
                </p>
              </div>
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  setScore(null);
                  setAnswers({});
                }}
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all border-none cursor-pointer shadow-md"
              >
                <RotateCcw className="w-5 h-5" />
                Retry Assessment
              </button>
            </div>
          )}

          {/* Recommended Next Step Block */}
          {score?.passed && nextLink && nextModuleData && codeVerified && (
            <div className="p-8 md:p-10 rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl text-center flex flex-col items-center mt-2 transition-all hover:border-slate-700">
              <p className="text-xs font-black text-[#38bdf8] uppercase tracking-[0.2em] mb-4 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">Recommended Next Step</p>
              <h3 className="text-3xl font-extrabold text-white m-0 mb-4">{nextModuleData.title}</h3>
              <p className="text-base text-slate-400 mb-8">
                Continue your journey in the <span className="font-bold text-slate-300 mx-1">{nextModuleData.group}</span> path.
              </p>
              <Link 
                href={nextLink}
                className="inline-flex items-center justify-center px-12 py-4 bg-[#38bdf8] hover:bg-[#0ea5e9] text-white rounded-xl font-bold text-lg transition-all no-underline shadow-[0_0_25px_rgba(56,189,248,0.3)] hover:shadow-[0_0_40px_rgba(56,189,248,0.5)] hover:-translate-y-1"
              >
                Continue Mastery
              </Link>
            </div>
          )}

          {score?.passed && nextLink && !codeVerified && (
            <div className="flex items-center gap-4 px-6 py-5 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-2xl text-base font-medium shadow-lg backdrop-blur-sm mt-4">
              <Lock className="w-6 h-6 flex-shrink-0 text-amber-400" />
              <span>Almost there! Complete the <strong className="text-amber-400 mx-1">Practical Challenge</strong> below and verify your code to unlock the next chapter.</span>
            </div>
          )}
        </div>
      )}
      {showCelebration && (() => {
        const currentModule = modulesData.find(m => m.id === moduleId);
        const cleanTitle = currentModule ? currentModule.title.split(':').pop()?.trim() : 'Automation Skill';
        const xpReward = currentModule ? (currentModule.weight ? currentModule.weight * 10 : 40) : 40;
        return (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-xl animate-fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-cyan-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 shadow-[0_0_50px_rgba(6,182,212,0.3)] animate-celebration-in text-center">
              
              {/* Confetti or spark representation */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-cyan-400" />
              
              <div className="mx-auto w-20 h-20 rounded-full bg-cyan-500/10 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] animate-bounce mb-6 mt-2">
                <Trophy className="w-10 h-10 text-cyan-400" />
              </div>
              
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-widest m-0 leading-none">
                LEVEL UP
              </h2>
              
              <h4 className="text-lg font-bold text-white mt-4 mb-2">
                Mastery Attained!
              </h4>
              
              <p className="text-slate-400 text-xs px-4 leading-relaxed mb-6 font-medium">
                You successfully validated the criteria for this deployment sub-module.
              </p>

              <div className="border-t border-b border-white/5 py-4 my-6 space-y-3.5 text-left max-w-xs mx-auto">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Rank Progress</span>
                  <span className="text-green-400 font-black font-mono">+12%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">XP Awarded</span>
                  <span className="text-amber-400 font-black font-mono">+{xpReward} XP</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-bold uppercase tracking-wider">Badge Unlocked</span>
                  <span className="text-cyan-400 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                    {cleanTitle ? (cleanTitle.length > 20 ? cleanTitle.substring(0, 18) + '...' : cleanTitle) : 'Locator Specialist'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowCelebration(false)}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black text-xs uppercase tracking-widest cursor-pointer border-none shadow-[0_4px_15px_rgba(6,182,212,0.25)] hover:from-cyan-400 hover:to-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98] mt-2 mb-2"
              >
                Continue Mission
              </button>
            </div>
          </div>
        );
      })()}
      </>
      )}
    </div>
  );
}
