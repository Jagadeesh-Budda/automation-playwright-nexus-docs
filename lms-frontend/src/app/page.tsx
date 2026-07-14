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
import { ShoppingBag, Sparkles, ChevronRight, Play, CheckCircle } from 'lucide-react';
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

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 xl:px-8 space-y-6">
      {/* Active Learning Path Selector */}
      <DashboardHeader />

      {isFirstTimeUser ? (
        /* SPRINT 1: FIRST-TIME USER EXPERIENCES (Simplified Dashboard Grid) */
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Onboarding Welcome Card (60%) */}
          <div className="lg:col-span-3 rounded-2xl border border-slate-800 bg-slate-900/10 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
            
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Onboarding Module</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-4">
                Getting Started
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Welcome to **Automation Nexus Academy**! Let's kickstart your test engineering automation journey. Complete these quick onboarding tasks to build your foundational skills:
              </p>
              
              <ul className="space-y-3.5 mb-8">
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">1</span>
                  <span>Complete **Chapter 0.1: Variables & Data Types**</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">2</span>
                  <span>Write and validate your first real automation test in the sandbox</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">3</span>
                  <span>Claim your first verifiable academy certificate</span>
                </li>
              </ul>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-900">
              <Link 
                href={startLearningUrl}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(6,182,212,0.3)] no-underline"
              >
                <Play className="w-4 h-4 fill-white" />
                Start Learning
              </Link>
              <span className="text-xs text-slate-500">⏱ Estimated onboarding: 25 Minutes</span>
            </div>
          </div>

          {/* Bento Grid Premium Upgrade Card (40%) */}
          <div className="lg:col-span-2 rounded-2xl border border-purple-500/20 bg-purple-950/5 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />
            
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider mb-4">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Enterprise Bundle</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mb-2">
                Get LMS Source Code
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Deploy your own Learning Management System. Get access to complete backend configurations, test runners, and database schemas:
              </p>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>Full Next.js + Express.js Source Code</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>529 AST Automated Checker Rules</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>JWT Auth & PostgreSQL DB Configuration</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => setPremiumModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black text-sm uppercase tracking-widest rounded-xl transition-all duration-300 shadow-[0_4px_15px_rgba(168,85,247,0.3)] cursor-pointer"
            >
              Get Source Code
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      ) : (
        /* STANDARD ANALYTICAL DASHBOARD FOR ACTIVE USERS */
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

      {/* Row 2: Stage Progress, Current Stage Detail, Your Path to Mastery */}
      <TopicMastery />

      {/* Row 4: Today's Missions, Recent Activity, Capabilities Card */}
      {!isFirstTimeUser && <TelemetryPanel />}

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
