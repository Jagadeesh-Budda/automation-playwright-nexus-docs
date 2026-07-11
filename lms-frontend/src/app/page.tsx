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

export default function DashboardHome() {
  const [mounted, setMounted] = useState(false);
  const [showTreeModal, setShowTreeModal] = useState(false);
  const { loading, initUser } = useDashboardStats();

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

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 xl:px-8 space-y-6">
      {/* Active Learning Path Selector */}
      <DashboardHeader />

      {/* Track progress grids */}
      <StatsOverview />

      {/* Row 1: Hero Command Center (60%) & Career Trajectory Timeline (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <HeroCard />
        </div>
        <div className="lg:col-span-2">
          <CareerTimeline />
        </div>
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
