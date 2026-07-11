import { useMasteryStore } from '../../store/useMasteryStore';
import modulesData from '../../data/metadata.json';
import { STAGES } from '../../data/stageConfig';
import { calculateXPAndLevel } from '../../utils/dashboard/xp';
import { RANKS } from '../../constants/dashboard/ranks';

export function useDashboardStats() {
  const store = useMasteryStore();
  const { 
    userName, completedModules, userProgress, loading, 
    streak, bestStreak, unlockedAchievements, telemetryLogs, timeSpentSeconds, claimedCertificates,
    getCurrentStage, getStageProgress, unlockedStageBadges, showMilestoneCelebration, dismissMilestoneCelebration,
    selectedPath, setSelectedPath, getPathStats, initUser
  } = store;

  // OVERALL Calculate scores and health
  const totalChapters = modulesData.length;
  const validCompletedModules = completedModules.filter(id => modulesData.some(m => m.id === id));
  const completedChaptersCount = validCompletedModules.length;
  const completionPercentage = Math.round((completedChaptersCount / totalChapters) * 100);

  // PATH-SPECIFIC Calculations
  const pathModules = selectedPath === 'all' ? modulesData : modulesData.filter(m => (m as any).learningPaths?.includes(selectedPath));
  const currentPathStats = getPathStats(selectedPath);
  const pathTotalChapters = currentPathStats.totalModules;
  const pathCompletedCount = currentPathStats.completedModules;
  const pathCompletionPercentage = currentPathStats.completionPercentage;

  const fndStats = getPathStats('foundations');
  const entStats = getPathStats('enterprise');
  const regStats = getPathStats('regulated');

  // REAL ANALYTICS CALCULATIONS
  const progressValues = Object.values(userProgress || {});
  const averageScore = progressValues.length > 0 
    ? Math.round(progressValues.reduce((a, b) => a + b, 0) / progressValues.length)
    : 0;

  const weakModulesIds = Object.entries(userProgress || {}).filter(([_, score]) => score < 90).map(([id]) => id);
  const weakAreasCount = weakModulesIds.length;
  const weakAreasList = weakModulesIds.slice(0, 2).map(id => modulesData.find(m => m.id === id)?.title.split(':')[0] || id);

  // Next chapter to resume (path-specific)
  const capstoneModule = pathModules.find(m => m.id.includes('capstone-verify')) || pathModules[pathModules.length - 1];
  const firstIncompletePathModule = pathModules.find(m => !completedModules.includes(m.id));
  let nextChapter = { id: '', title: 'Path Completed', slug: '' };
  if (firstIncompletePathModule) {
    nextChapter = { id: firstIncompletePathModule.id, title: firstIncompletePathModule.title, slug: firstIncompletePathModule.slug || firstIncompletePathModule.id };
  } else if (capstoneModule) {
    nextChapter = { id: capstoneModule.id, title: 'Claim Certification', slug: capstoneModule.slug || capstoneModule.id };
  }

  // Stage calculations
  const activeStage = getCurrentStage();
  const activeStageProgress = activeStage ? getStageProgress(activeStage.key) : null;
  const simulatedProjectsBuilt = STAGES.filter(s => getStageProgress(s.key)?.isGraduated).length;
 
  const simulatedStreak = streak || 0; 
  const simulatedHoursInvested = timeSpentSeconds / 3600; 
  const simulatedAchievements = unlockedAchievements ? unlockedAchievements.length : 0;
  
  // Calculate XP and level
  const { xp: simulatedXP, level } = calculateXPAndLevel({
    completedChaptersCount,
    streak: simulatedStreak,
    simulatedProjectsBuilt,
    simulatedAchievements,
    completionPercentage,
  });
 
  // Next Unlock calculation details
  const nextStageIndex = STAGES.findIndex(s => s.key === activeStage?.key) + 1;
  const nextStageName = nextStageIndex < STAGES.length && nextStageIndex > 0 ? STAGES[nextStageIndex].title : 'Final Certification';
  const lessonsRemaining = activeStageProgress ? (activeStageProgress.total - activeStageProgress.completed) : 0;

  // Determine rank index
  let currentRankIndex = 0;
  if (completionPercentage >= 20 && completionPercentage < 50) currentRankIndex = 1;
  else if (completionPercentage >= 50 && completionPercentage < 80) currentRankIndex = 2;
  else if (completionPercentage >= 80) currentRankIndex = 3;

  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1];
  let rankProgressPercent = 0;
  let rankLessonsRemaining = 0;
  let nextRankName = "";

  if (nextRank) {
    nextRankName = nextRank.name;
    const targetCount = Math.ceil((nextRank.targetPercent / 100) * totalChapters);
    rankLessonsRemaining = Math.max(0, targetCount - completedChaptersCount);
    const prevThresholdCount = currentRankIndex === 0 ? 0 : Math.ceil((RANKS[currentRankIndex].targetPercent / 100) * totalChapters);
    const range = targetCount - prevThresholdCount;
    const completedInRange = completedChaptersCount - prevThresholdCount;
    rankProgressPercent = Math.min(100, Math.max(0, Math.round((completedInRange / range) * 100)));
  } else {
    nextRankName = "Max Rank Reached";
    rankLessonsRemaining = 0;
    rankProgressPercent = 100;
  }

  const getPathDetails = () => {
    if (selectedPath === 'foundations') return { title: 'Foundations Path', icon: '🚀', estHours: 18, rec: 'Beginners & Manual Testers' };
    if (selectedPath === 'enterprise') return { title: 'Enterprise SDET Path', icon: '🏗', estHours: 70, rec: 'Future Architects & Senior SDETs' };
    if (selectedPath === 'regulated') return { title: 'Regulated Path', icon: '🛡️', estHours: 85, rec: 'Finance, Healthcare & Gov Testers' };
    return { title: 'Global Curriculum', icon: '🌍', estHours: 85, rec: 'Everyone' };
  };

  return {
    userName,
    completedModules,
    userProgress,
    loading,
    streak: simulatedStreak,
    bestStreak,
    unlockedAchievements,
    telemetryLogs,
    timeSpentSeconds,
    claimedCertificates,
    getCurrentStage,
    getStageProgress,
    unlockedStageBadges,
    showMilestoneCelebration,
    dismissMilestoneCelebration,
    selectedPath,
    setSelectedPath,
    getPathStats,
    
    // Computed fields
    totalChapters,
    completedChaptersCount,
    completionPercentage,
    pathModules,
    pathTotalChapters,
    pathCompletedCount,
    pathCompletionPercentage,
    fndStats,
    entStats,
    regStats,
    averageScore,
    weakAreasCount,
    weakAreasList,
    nextChapter,
    activeStage,
    activeStageProgress,
    simulatedProjectsBuilt,
    simulatedHoursInvested,
    simulatedAchievements,
    simulatedXP,
    level,
    nextStageName,
    lessonsRemaining,
    currentRankIndex,
    currentRank,
    nextRank,
    rankProgressPercent,
    rankLessonsRemaining,
    nextRankName,
    initUser,
    pathDetails: getPathDetails()
  };
}
