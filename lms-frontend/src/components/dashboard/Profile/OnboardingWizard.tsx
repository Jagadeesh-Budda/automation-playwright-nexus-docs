"use client";
import React, { useState } from 'react';
import { Sparkles, Trophy, BookOpen, Clock, Target, ArrowRight, ArrowLeft, Check, ShieldAlert } from 'lucide-react';
import { useMasteryStore } from '../../../store/useMasteryStore';

const GOALS = [
  { id: 'expert', label: 'Become Playwright Expert' },
  { id: 'sdet', label: 'Switch to SDET' },
  { id: 'api', label: 'Learn API Automation' },
  { id: 'interview', label: 'Crack Interviews' },
  { id: 'framework', label: 'Build Framework' },
  { id: 'ts', label: 'Learn TypeScript' },
  { id: 'enterprise', label: 'Enterprise Testing' },
  { id: 'cicd', label: 'CI/CD Automation' }
];

const TARGETS = [
  { value: 15, label: '15 min' },
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 90, label: '90 min' }
];

const QUESTIONS = [
  {
    id: 1,
    question: "How familiar are you with JavaScript or TypeScript?",
    options: [
      { key: 'A', text: "No prior experience. I'm a beginner.", weight: 'Novice' },
      { key: 'B', text: "I know basic variables, arrays, and functions.", weight: 'Competent' },
      { key: 'C', text: "I write async/await, classes, and modular code.", weight: 'Expert' }
    ]
  },
  {
    id: 2,
    question: "Have you written test automation scripts before?",
    options: [
      { key: 'A', text: "No, I'm new to automation testing.", weight: 'Novice' },
      { key: 'B', text: "Yes, using Selenium, Cypress, or other tools.", weight: 'Competent' },
      { key: 'C', text: "Yes, I have written Playwright scripts.", weight: 'Expert' }
    ]
  },
  {
    id: 3,
    question: "Do you understand Promises and async/await?",
    options: [
      { key: 'A', text: "No, I don't know what they are.", weight: 'Novice' },
      { key: 'B', text: "I know the theory but get stuck writing them.", weight: 'Competent' },
      { key: 'C', text: "Yes, I use them daily in async execution.", weight: 'Expert' }
    ]
  },
  {
    id: 4,
    question: "Have you built Page Object Models (POMs) before?",
    options: [
      { key: 'A', text: "No, I haven't used POM design pattern.", weight: 'Novice' },
      { key: 'B', text: "I know how it works but haven't implemented one.", weight: 'Competent' },
      { key: 'C', text: "Yes, I structure framework designs using POM.", weight: 'Expert' }
    ]
  }
];

export default function OnboardingWizard({ onClose }: { onClose: () => void }) {
  const { updateLearningProfile } = useMasteryStore();
  const [step, setStep] = useState<number>(1); // Steps: 1: Welcome, 2: Assessment, 3: Goals, 4: Targets, 5: Recommendation
  
  // Assessment Questionnaire States
  const [answers, setAnswers] = useState<Record<number, string>>({});
  
  // Profile Configuration States
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<number>(30); // Default 30 min
  
  // Calculated Recommendation States
  const [calculatedLevel, setCalculatedLevel] = useState<string>('Novice');
  const [recDetails, setRecDetails] = useState({
    stage: 'Stage 1: JavaScript/TypeScript Foundations',
    module: 'JS/TS Variables & Scope',
    duration: '15 hours',
    difficulty: 'Beginner Friendly'
  });

  const handleNext = () => setStep(s => s + 1);
  const handlePrev = () => setStep(s => s - 1);

  // Skip Assessment
  const handleSkipAssessment = () => {
    setCalculatedLevel('Novice');
    setRecDetails({
      stage: 'Stage 1: JavaScript/TypeScript Foundations',
      module: 'JS/TS Variables & Scope',
      duration: '15 hours',
      difficulty: 'Beginner Friendly'
    });
    setStep(3); // Skip straight to Goals selection
  };

  const handleSelectAnswer = (qId: number, optionKey: string) => {
    setAnswers(prev => ({ ...prev, [qId]: optionKey }));
  };

  const calculateRecommendations = () => {
    let noviceCount = 0;
    let competentCount = 0;
    let expertCount = 0;

    Object.keys(answers).forEach((qIdStr) => {
      const qId = parseInt(qIdStr);
      const q = QUESTIONS.find(q => q.id === qId);
      const opt = q?.options.find(o => o.key === answers[qId]);
      if (opt?.weight === 'Novice') noviceCount++;
      else if (opt?.weight === 'Competent') competentCount++;
      else if (opt?.weight === 'Expert') expertCount++;
    });

    let level = 'Novice';
    let details = {
      stage: 'Stage 1: JavaScript/TypeScript Foundations',
      module: 'JS/TS Variables & Scope',
      duration: '15 hours',
      difficulty: 'Beginner Friendly'
    };

    if (expertCount >= 2) {
      level = 'Proficient';
      details = {
        stage: 'Stage 3: Advanced Automation',
        module: 'Dynamic Element Strategies',
        duration: '6 hours',
        difficulty: 'Advanced / Intermediate'
      };
    } else if (competentCount >= 2 || (expertCount === 1 && competentCount === 1)) {
      level = 'Competent';
      details = {
        stage: 'Stage 2: Playwright Fundamentals',
        module: 'Writing Your First Playwright Test',
        duration: '10 hours',
        difficulty: 'Intermediate'
      };
    }

    setCalculatedLevel(level);
    setRecDetails(details);
    setStep(5); // Go to recommendation step
  };

  const handleFinish = async () => {
    await updateLearningProfile({
      skillLevel: calculatedLevel,
      learningGoals: selectedGoals,
      dailyTargetMinutes: selectedTarget,
      recommendedStage: recDetails.stage,
      recommendedModule: recDetails.module
    });
    onClose();
  };

  const handleToggleGoal = (id: string) => {
    setSelectedGoals(prev => 
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md font-sans">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Background decorative glow */}
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        {/* Step Progress Dots */}
        <div className="flex justify-center gap-2.5 mb-6 relative z-10">
          {[1, 2, 3, 4, 5].map((s) => (
            <div 
              key={s} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'w-8 bg-cyan-400' 
                  : s < step 
                    ? 'w-3 bg-cyan-500/50' 
                    : 'w-3 bg-slate-800'
              }`}
            />
          ))}
        </div>

        {/* STEP 1: WELCOME SCREEN */}
        {step === 1 && (
          <div className="text-center animate-fade-in relative z-10">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Welcome to Nexus Academy</h2>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              Let's customize your test automation learning path. We will configure your goals, recommend a starting point, and set daily study targets to build learning consistency.
            </p>
            <button
              onClick={handleNext}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:shadow-[0_0_25px_rgba(34,211,238,0.45)] hover:scale-[1.01] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: SKILL ASSESSMENT */}
        {step === 2 && (
          <div className="animate-fade-in relative z-10 text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Skill Assessment</h3>
            <p className="text-xs text-slate-400 mb-6">Answer these questions to help us identify your skill level, or skip to start from the beginning.</p>

            <div className="space-y-6 max-h-[300px] overflow-y-auto pr-1 mb-8">
              {QUESTIONS.map((q) => (
                <div key={q.id} className="border-b border-white/5 pb-4 last:border-none">
                  <span className="text-xs font-black text-cyan-400 uppercase tracking-wider block mb-2.5">Question {q.id} of 4</span>
                  <p className="text-sm font-semibold text-white mb-3">{q.question}</p>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.key}
                        onClick={() => handleSelectAnswer(q.id, opt.key)}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                          answers[q.id] === opt.key
                            ? 'bg-cyan-500/10 border-cyan-500 text-white font-semibold'
                            : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <span className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          answers[q.id] === opt.key ? 'border-cyan-400 text-cyan-400' : 'border-slate-600'
                        }`}>
                          {answers[q.id] === opt.key && <span className="w-2 h-2 rounded-full bg-cyan-400" />}
                        </span>
                        <span>{opt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="py-3 px-4 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:text-white cursor-pointer bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleSkipAssessment}
                className="py-3 px-4 rounded-xl border border-cyan-500/20 text-cyan-400 font-bold text-xs hover:bg-cyan-500/10 cursor-pointer bg-cyan-500/5 flex-1"
              >
                Skip for now
              </button>
              <button
                onClick={calculateRecommendations}
                disabled={Object.keys(answers).length < 4}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:scale-[1.01] transition-all disabled:opacity-40 cursor-pointer border-none flex-1 flex items-center justify-center gap-1.5"
              >
                Calculate Level
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: LEARNING GOALS */}
        {step === 3 && (
          <div className="animate-fade-in relative z-10 text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Select Your Goals</h3>
            <p className="text-xs text-slate-400 mb-6">Choose what you want to achieve on Automation Nexus Academy.</p>

            <div className="grid grid-cols-2 gap-3 mb-8">
              {GOALS.map((goal) => {
                const selected = selectedGoals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    onClick={() => handleToggleGoal(goal.id)}
                    className={`flex items-center justify-between p-3.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer ${
                      selected
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                        : 'bg-slate-950/40 border-white/5 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span>{goal.label}</span>
                    {selected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="py-3 px-5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:text-white cursor-pointer bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                disabled={selectedGoals.length === 0}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:scale-[1.01] transition-all disabled:opacity-40 cursor-pointer border-none flex-1 flex items-center justify-center gap-1.5"
              >
                Set Goals
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: DAILY TARGETS */}
        {step === 4 && (
          <div className="animate-fade-in relative z-10 text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Set Daily target</h3>
            <p className="text-xs text-slate-400 mb-6">Choose how much time you want to spend learning test automation each day.</p>

            <div className="flex flex-wrap gap-3 justify-center mb-10">
              {TARGETS.map((t) => {
                const selected = selectedTarget === t.value;
                return (
                  <button
                    key={t.value}
                    onClick={() => setSelectedTarget(t.value)}
                    className={`px-5 py-3 rounded-xl border text-sm font-black uppercase tracking-wider transition-all cursor-pointer ${
                      selected
                        ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.15)] scale-105'
                        : 'bg-slate-950/40 border-white/5 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="py-3 px-5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:text-white cursor-pointer bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs shadow-[0_0_15px_rgba(34,211,238,0.25)] hover:scale-[1.01] transition-all cursor-pointer border-none flex-1 flex items-center justify-center gap-1.5"
              >
                Confirm Target
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: RECOMMENDATION SUMMARY */}
        {step === 5 && (
          <div className="animate-fade-in relative z-10 text-left">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Your Profile is Ready</h3>
            <p className="text-xs text-slate-400 mb-6">Here is our AI-recommended starting point based on your profile config:</p>

            {/* Recommendation Card */}
            <div className="bg-slate-950/50 border border-cyan-500/20 rounded-2xl p-5 mb-8 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Assessed Level</span>
                  <span className="text-lg font-black text-cyan-400 uppercase tracking-wide">{calculatedLevel}</span>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedTarget}m / day target
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Recommended Starting Stage</span>
                  <span className="text-xs font-bold text-white mt-1 block">{recDetails.stage}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Recommended Starting Lesson</span>
                  <span className="text-xs font-bold text-white mt-1 block">{recDetails.module}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Estimated study time</span>
                  <span className="text-xs font-bold text-slate-300 mt-1 block">{recDetails.duration}</span>
                </div>
                <div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Stage Difficulty</span>
                  <span className="text-xs font-bold text-slate-300 mt-1 block">{recDetails.difficulty}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrev}
                className="py-3 px-5 rounded-xl border border-slate-700 text-slate-300 font-bold text-xs hover:text-white cursor-pointer bg-slate-800"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.01] transition-all cursor-pointer border-none flex-1 flex items-center justify-center gap-1.5"
              >
                Start Learning Path
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
