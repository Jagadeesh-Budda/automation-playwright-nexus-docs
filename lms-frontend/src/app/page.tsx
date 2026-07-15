"use client";
import React, { useEffect, useState } from 'react';
import { useDashboardStats } from '../hooks/dashboard/useDashboardStats';
import DashboardHeader from '../components/dashboard/DashboardHeader/DashboardHeader';
import HeroCard from '../components/dashboard/HeroCard/HeroCard';
import StatsOverview from '../components/dashboard/StatsOverview/StatsOverview';
import CareerTimeline from '../components/dashboard/CareerTimeline/CareerTimeline';
import TopicMastery from '../components/dashboard/TopicMastery/TopicMastery';
import TelemetryPanel from '../components/dashboard/Telemetry/TelemetryPanel';
import AchievementsModal from '../components/dashboard/Achievements/AchievementsModal';
import SkillTreeModal from '../components/dashboard/SkillTree/SkillTreeModal';
import MilestoneCelebration from '../components/dashboard/Milestone/MilestoneCelebration';

import { useMasteryStore } from '../store/useMasteryStore';
import { 
  ShoppingBag, Sparkles, ChevronRight, Play, CheckCircle, 
  BookOpen, Code, Folder, Award, Map, Target 
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const [mounted, setMounted] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const { loading, initUser } = useDashboardStats();
  const { completedModules, getFirstIncompleteModule, setPremiumModalOpen } = useMasteryStore();

  useEffect(() => {
    setMounted(true);
    initUser();
  }, [initUser]);

  if (!mounted || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <p className="text-[var(--text-muted)] font-medium animate-pulse font-mono tracking-widest uppercase">Synchronizing learning journey...</p>
      </div>
    );
  }

  const isFirstTimeUser = completedModules.length === 0;
  const targetModule = getFirstIncompleteModule();
  const startLearningUrl = targetModule ? `/courses/playwright/${targetModule.slug}` : '/courses/playwright/01-js-ts-variables';

  // Platform Metrics Data
  const PLATFORM_STATS = [
    { value: '122', label: 'Lessons', desc: 'Step-by-step guides', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { value: '1100+', label: 'Quizzes', desc: 'Scenario challenges', icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> },
    { value: '529', label: 'AST Rules', desc: 'Linter checker checks', icon: <Code className="w-4 h-4 text-purple-400" /> },
    { value: '20+', label: 'Enterprise Projects', desc: 'Real-world scenarios', icon: <Folder className="w-4 h-4 text-blue-400" /> },
    { value: 'Verified', label: 'Certificates', desc: 'Secure signature credentials', icon: <Award className="w-4 h-4 text-amber-400" /> },
    { value: '5', label: 'Learning Paths', desc: 'Curated path logs', icon: <Map className="w-4 h-4 text-pink-400" /> },
  ];

  // Dynamic Motivation Message
  const motivationText = isFirstTimeUser
    ? "Your automation journey starts here. Only one lesson away from unlocking analytics."
    : "Complete today's lesson to maintain your streak. You're building enterprise automation skills!";

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 xl:px-8 space-y-6">
      {/* Active Learning Path Selector */}
      <DashboardHeader />

      {/* Dynamic Motivation Banner */}
      <div className="w-full px-5 py-3 rounded-2xl bg-slate-900/30 border border-slate-800/80 flex items-center gap-3 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-500 to-blue-600" />
        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
        <span className="text-xs md:text-sm font-semibold text-slate-300">
          {motivationText}
        </span>
      </div>

      {isFirstTimeUser ? (
        /* FIRST-TIME USER ONBOARDING */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Onboarding Welcome Card (60%) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-850 bg-slate-950/20 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl hover-premium-float">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
            
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-4">
                <Target className="w-3.5 h-3.5" />
                <span>Onboarding Checklist</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">
                Getting Started
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Welcome to **Automation Nexus Academy**! Since this is your first time here, let's start with your onboarding steps:
              </p>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3.5 text-sm text-slate-300">
                  <span className="w-5.5 h-5.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-white leading-snug">Complete Chapter 0.1: Variables & Data Types</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Learn variables declaration and base logic.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5 text-sm text-slate-300">
                  <span className="w-5.5 h-5.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-white leading-snug">Build Your First Automation Test</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Validate your code in our sandboxed interactive terminal workspace.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3.5 text-sm text-slate-300">
                  <span className="w-5.5 h-5.5 rounded-lg bg-blue-500/10 border border-blue-500/25 text-blue-400 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-white leading-snug">Earn Your First Learning Badge</span>
                    <span className="text-[11px] text-slate-500 mt-0.5">Unlock achievements and claim verifiable stage credentials.</span>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-5 border-t border-slate-900">
              <Link 
                href={startLearningUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(6,182,212,0.25)] no-underline cursor-pointer border-none glow-btn-hover"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                START LEARNING
              </Link>
              <span className="text-xs text-slate-500">⏱ Estimated onboarding time: 25 Minutes</span>
            </div>
          </div>

          {/* Bento Grid Premium Card (40%) */}
          <div className="lg:col-span-2 rounded-2xl border border-purple-500/20 bg-purple-950/5 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl hover-premium-float">
            <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider mb-4">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Enterprise Bundle Upgrade</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                Build Your Own LMS
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Deploy a production-ready learning platform with AST validation, PostgreSQL, enterprise dashboards, certificates, and complete source code.
              </p>
              
              <ul className="space-y-3.5 mb-6">
                <li className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>✓ Full Next.js & PostgreSQL Stack</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>✓ 529 AST Automated Checker Rules</span>
                </li>
                <li className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>✓ Admin Dashboard & Certificates</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => setPremiumModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(168,85,247,0.2)] cursor-pointer border-none glow-btn-hover"
            >
              Get Enterprise Bundle
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* RETURNER LAYOUT */
        <>
          <StatsOverview />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <HeroCard />
            </div>
            <div className="lg:col-span-2">
              <CareerTimeline />
            </div>
          </div>
        </>
      )}

      {/* Visual Platform Credibility Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {PLATFORM_STATS.map((stat, i) => (
          <div 
            key={i} 
            className="p-4 rounded-xl border border-slate-900 bg-slate-950/20 backdrop-blur-sm flex flex-col items-center justify-center text-center relative overflow-hidden transition-all duration-300"
          >
            <div className="p-2 rounded-lg bg-slate-900 border border-white/5 mb-3 flex items-center justify-center">
              {stat.icon}
            </div>
            <span className="text-base font-black text-white leading-tight font-mono">{stat.value}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{stat.label}</span>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">{stat.desc}</span>
          </div>
        ))}
      </div>

      {/* Row 2: Stage Progress, Current Stage Detail, Your Path to Mastery */}
      <TopicMastery />

      {/* Row 4: Today's Missions, Recent Activity, Capabilities Card */}
      <TelemetryPanel />

      {/* Modals & Popups */}
      <AchievementsModal />
      
      <SkillTreeModal 
        isOpen={showTreeModal}
        onClose={() => setShowTreeModal(false)}
      />
      
      <MilestoneCelebration />
    </div>
  );
}
