import { create } from 'zustand';
import modulesData from '../data/metadata.json';
import { STAGES } from '../data/stageConfig';
import { RecommendationEngine, PrerequisiteStatus } from '../lib/recommendationEngine';
import dailyChallengesData from '../data/challenges/daily.json';
import weeklyChallengesData from '../data/challenges/weekly.json';

export interface ChallengeAttempt {
  id: string;
  type: "daily" | "weekly";
  difficulty: string;
  attempts: number;
  passed: boolean;
  xpEarned: number;
  timeTaken: number;
  completedAt: string;
}

export interface ActiveChallengeMeta {
  id: string;
  assignedAt: string;
  expiresAt: string;
}

export interface WeeklyProgressMeta {
  challengeId: string;
  current: number;
  target: number;
}

/** Remove all code_verified_* flags from localStorage (called on sync/reset) */
function clearCodeVerifiedFlags() {
  if (typeof window === 'undefined') return;
  Object.keys(localStorage)
    .filter(k => k.startsWith('code_verified_'))
    .forEach(k => localStorage.removeItem(k));
}

interface MasteryState {
  completedModules: string[];
  userProgress: Record<string, number>; // maps moduleId -> score
  userName: string;
  userId: string;
  loading: boolean;
  isMobileSyncOpen: boolean;
  isSidebarExpanded: boolean;
  claimedCertificates: Record<string, boolean>;
  selectedPath: 'all' | 'foundations' | 'enterprise' | 'regulated';
  
  isPremiumModalOpen: boolean;
  isReadingModeActive: boolean;

  checkPrerequisiteStatus: (moduleId: string) => PrerequisiteStatus;

  // Learning Profile & Preferences (v1.1.0 Phase 1)
  skillLevel: string;
  learningGoals: string[];
  dailyTargetMinutes: number;
  lastActivityDate: string;
  todayMinutes: number;
  totalMinutes: number;
  recommendedStage: string;
  recommendedModule: string;
  updateLearningProfile: (profileData: { skillLevel?: string, learningGoals?: string[], dailyTargetMinutes?: number, recommendedStage?: string, recommendedModule?: string }) => Promise<void>;
  updateTimeSpentToday: (minutes: number) => Promise<void>;
  
  setMobileSyncOpen: (open: boolean) => void;
  setPremiumModalOpen: (open: boolean) => void;
  setSidebarExpanded: (expanded: boolean) => void;
  setReadingModeActive: (active: boolean) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setSelectedPath: (path: 'all' | 'foundations' | 'enterprise' | 'regulated') => void;
  setClaimedCertificate: (path: string) => void;
  setUser: (name: string, id: string) => Promise<void>;
  initUser: () => Promise<void>;
  fetchProgress: () => Promise<void>;
  completeModule: (moduleId: string, score: number) => Promise<void>;
  isModuleLocked: (moduleId: string) => boolean;
  getFirstIncompleteModule: () => { id: string; title: string; slug: string } | null;
  syncFromPayload: (payload: { userId: string; userName: string; progress: { moduleId: string; score: number }[] }) => Promise<boolean>;
  
  // Dynamic tracking
  telemetryLogs: { timestamp: string; type: 'INFO' | 'SUCCESS' | 'ACHIEVEMENT' | 'WARNING'; message: string }[];
  streak: number;
  bestStreak: number;
  unlockedAchievements: string[];
  timeSpentSeconds: number;
  unreadCount: number;
  addTelemetryLog: (type: 'INFO' | 'SUCCESS' | 'ACHIEVEMENT' | 'WARNING', message: string) => void;
  evaluateAchievementsAndStreak: () => void;
  incrementTimeSpent: (seconds: number) => void;
  markAllAsRead: () => void;

  // Stage Tracking
  unlockedStageBadges: string[];
  showMilestoneCelebration: string | null;
  dismissMilestoneCelebration: () => void;
  getStageProgress: (stageKey: string) => { total: number; completed: number; percent: number; allLessonsPassed: boolean; milestoneChallengePassed: boolean; isGraduated: boolean; status: 'completed' | 'milestone-pending' | 'in-progress' | 'upcoming' } | null;
  getCurrentStage: () => { key: string; title: string; goal: string; emoji: string; milestone: { challengeLessonId: string; badgeName: string; capabilities: string[]; badgeEmoji: string; }; groups: string[] };
  getCompletedStages: () => string[];
  getPathStats: (path: string) => { totalModules: number; completedModules: number; remainingModules: number; completionPercentage: number; estimatedMinutes: number; };

  // Phase 5 Productivity State & Actions
  isCommandPaletteOpen: boolean;
  recentResources: { id: string; title: string; type: string; url: string; group: string; timestamp: number }[];
  bookmarkedResources: string[];
  favoritedResources: string[];
  copiedSnippets: { text: string; originUrl: string; timestamp: number }[];
  weeklyMinutes: number;
  monthlyMinutes: number;

  addRecentResource: (resource: { id: string; title: string; type: string; url: string; group: string }) => void;
  toggleBookmark: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addCopiedSnippet: (text: string, originUrl: string) => void;
  clearCopiedSnippets: () => void;

  // Phase 6.1 State & Actions
  activeDailyChallenge: ActiveChallengeMeta | null;
  activeWeeklyChallenge: ActiveChallengeMeta | null;
  challengeHistory: ChallengeAttempt[];
  weeklyProgress: WeeklyProgressMeta | null;
  challengeStreak: number;
  loginStreak: number;
  lessonStreak: number;
  challengeDifficultyLevel: "Easy" | "Medium" | "Hard" | "Expert" | "Master";

  submitChallengeAttempt: (challengeId: string, passed: boolean, timeTaken: number, answer?: string) => void;
  initChallengeState: () => void;
}

export const useMasteryStore = create<MasteryState>((set, get) => ({
  completedModules: [],
  userProgress: {},
  userName: '',
  userId: '',
  loading: true,
  isMobileSyncOpen: false,
  isSidebarExpanded: false,
  isPremiumModalOpen: false,
  isReadingModeActive: false,
  claimedCertificates: {},
  selectedPath: 'all',
  isCommandPaletteOpen: false,

  // Learning Profile Defaults
  skillLevel: '',
  learningGoals: [],
  dailyTargetMinutes: 20,
  lastActivityDate: '',
  todayMinutes: 0,
  totalMinutes: 0,
  recommendedStage: '',
  recommendedModule: '',
  
  telemetryLogs: [],
  streak: 0,
  bestStreak: 0,
  unlockedAchievements: [],
  timeSpentSeconds: 0,
  unreadCount: 0,

  unlockedStageBadges: [],
  showMilestoneCelebration: null,

  // Phase 5 defaults
  recentResources: [],
  bookmarkedResources: [],
  favoritedResources: [],
  copiedSnippets: [],
  weeklyMinutes: 0,
  monthlyMinutes: 0,

  // Phase 6.1 defaults
  activeDailyChallenge: null,
  activeWeeklyChallenge: null,
  challengeHistory: [],
  weeklyProgress: null,
  challengeStreak: 0,
  loginStreak: 0,
  lessonStreak: 0,
  challengeDifficultyLevel: "Easy",

  setMobileSyncOpen: (open) => set({ isMobileSyncOpen: open }),
  setPremiumModalOpen: (open) => set({ isPremiumModalOpen: open }),
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
  setReadingModeActive: (active) => set({ isReadingModeActive: active }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
  setSelectedPath: (path) => {
    set({ selectedPath: path });
    localStorage.setItem('asa_selected_path', path);
  },
  setClaimedCertificate: (path: string) => {
    const { claimedCertificates } = get();
    const newClaimed = { ...claimedCertificates, [path]: true };
    localStorage.setItem('asa_claimed_certs', JSON.stringify(newClaimed));
    set({ claimedCertificates: newClaimed });
  },

  setUser: async (name, id) => {
    localStorage.setItem('asa_user_name', name);
    localStorage.setItem('asa_user_id', id);
    set({ userName: name, userId: id });
    await get().fetchProgress();
  },

  initUser: async () => {
    if (typeof window === 'undefined') return;
    const storedName = localStorage.getItem('asa_user_name') || '';
    const storedId = localStorage.getItem('asa_user_id') || '';
    const claimedCerts = JSON.parse(localStorage.getItem('asa_claimed_certs') || '{}');
    const storedPath = (localStorage.getItem('asa_selected_path') as 'all' | 'foundations' | 'enterprise' | 'regulated') || 'all';
    
    // Load local stats
    const storedLogs = JSON.parse(localStorage.getItem('asa_telemetry') || '[]');
    const storedStreakData = JSON.parse(localStorage.getItem('asa_streak') || '{"current":0,"best":0,"lastLogin":""}');
    const storedTime = parseInt(localStorage.getItem('asa_time_spent') || '0', 10);

    // Load local learning preferences
    const localPrefs = JSON.parse(localStorage.getItem('nexus_profile_preferences') || '{}');
    const localActivityDate = localStorage.getItem('nexus_activity_date') || '';
    const localTotalMinutes = parseInt(localStorage.getItem('nexus_total_minutes') || '0', 10);
    let localTodayMinutes = parseInt(localStorage.getItem('nexus_today_minutes') || '0', 10);
    
    // Evaluate streak on load
    const today = new Date().toISOString().split('T')[0];
    let newStreak = storedStreakData.current;
    let newBest = storedStreakData.best;
    
    if (storedStreakData.lastLogin) {
      const lastLoginDate = new Date(storedStreakData.lastLogin);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (storedStreakData.lastLogin === today) {
        // Already logged in today, keep streak
      } else if (lastLoginDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
        // Logged in yesterday, increment
        newStreak += 1;
        newBest = Math.max(newStreak, newBest);
      } else {
        // Missed a day, reset
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    localStorage.setItem('asa_streak', JSON.stringify({
      current: newStreak,
      best: newBest,
      lastLogin: today
    }));

    // Reset todayMinutes if activity date has changed
    if (localActivityDate && localActivityDate !== today) {
      localTodayMinutes = 0;
      localStorage.setItem('nexus_today_minutes', '0');
      localStorage.setItem('nexus_activity_date', today);
    }

    const currentWeekStart = (() => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    })();
    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    const lastWeekStart = localStorage.getItem('asa_last_week_start') || '';
    const lastMonthStart = localStorage.getItem('asa_last_month_start') || '';

    let localWeeklyMinutes = parseInt(localStorage.getItem('asa_weekly_minutes') || '0', 10);
    let localMonthlyMinutes = parseInt(localStorage.getItem('asa_monthly_minutes') || '0', 10);

    if (lastWeekStart !== currentWeekStart) {
      localWeeklyMinutes = 0;
      localStorage.setItem('asa_weekly_minutes', '0');
      localStorage.setItem('asa_last_week_start', currentWeekStart);
    }
    if (lastMonthStart !== currentMonthStart) {
      localMonthlyMinutes = 0;
      localStorage.setItem('asa_monthly_minutes', '0');
      localStorage.setItem('asa_last_month_start', currentMonthStart);
    }

    const localRecentResources = JSON.parse(localStorage.getItem('asa_recent_resources') || '[]');
    const localBookmarkedResources = JSON.parse(localStorage.getItem('asa_bookmarked_resources') || '[]');
    const localFavoritedResources = JSON.parse(localStorage.getItem('asa_favorited_resources') || '[]');
    const localCopiedSnippets = JSON.parse(localStorage.getItem('asa_copied_snippets') || '[]');

    set({ 
      userName: storedName, 
      userId: storedId,
      telemetryLogs: storedLogs,
      streak: newStreak,
      bestStreak: newBest,
      timeSpentSeconds: storedTime,
      unlockedStageBadges: JSON.parse(localStorage.getItem('asa_stage_badges') || '[]'),
      claimedCertificates: claimedCerts,
      selectedPath: storedPath,

      skillLevel: localPrefs.skillLevel || '',
      learningGoals: localPrefs.learningGoals || [],
      dailyTargetMinutes: localPrefs.dailyTargetMinutes || 20,
      recommendedStage: localPrefs.recommendedStage || '',
      recommendedModule: localPrefs.recommendedModule || '',
      lastActivityDate: localActivityDate || today,
      todayMinutes: localTodayMinutes,
      totalMinutes: localTotalMinutes,

      recentResources: localRecentResources,
      bookmarkedResources: localBookmarkedResources,
      favoritedResources: localFavoritedResources,
      copiedSnippets: localCopiedSnippets,
      weeklyMinutes: localWeeklyMinutes,
      monthlyMinutes: localMonthlyMinutes,

      activeDailyChallenge: JSON.parse(localStorage.getItem('asa_active_daily_challenge') || 'null'),
      activeWeeklyChallenge: JSON.parse(localStorage.getItem('asa_active_weekly_challenge') || 'null'),
      challengeHistory: JSON.parse(localStorage.getItem('asa_challenge_history') || '[]'),
      weeklyProgress: JSON.parse(localStorage.getItem('asa_weekly_progress') || 'null'),
      challengeStreak: parseInt(localStorage.getItem('asa_challenge_streak') || '0', 10),
      loginStreak: parseInt(localStorage.getItem('asa_login_streak') || '0', 10),
      lessonStreak: parseInt(localStorage.getItem('asa_lesson_streak') || '0', 10),
      challengeDifficultyLevel: (localStorage.getItem('asa_challenge_difficulty_level') || 'Easy') as any,
    });
    
    // Deterministically initialize/refresh challenges
    get().initChallengeState();

    if (storedId) {
      await get().fetchProgress();
    } else {
      set({ loading: false });
    }
    const lastLog = get().telemetryLogs[0];
    if (!lastLog || lastLog.message !== 'System initialized. User active.') {
      get().addTelemetryLog('INFO', 'System initialized. User active.');
    }
  },

  fetchProgress: async () => {
    const { userId, userName } = get();
    if (!userId) {
      set({ loading: false });
      return;
    }
    try {
      const res = await fetch('/api/progress', {
        headers: {
          'x-user-id': userId,
          'x-user-name': userName,
        }
      });
      const data = await res.json();
      if (data.success && data.progress) {
        // Sync completed list (modules with score = 80 — passing score matching Quiz logic)
        const completed = data.progress
          .filter((p: { score: number; module_id: string }) => p.score >= 80)
          .map((p: { score: number; module_id: string }) => p.module_id);
          
        const progressMap: Record<string, number> = {};
        data.progress.forEach((p: { score: number; module_id: string }) => {
          progressMap[p.module_id] = p.score;
        });

        // Set user profile preferences and statistics returned from DB
        const todayDate = new Date().toISOString().split('T')[0];
        let dbPrefs = data.profile?.learningPreferences;
        if (typeof dbPrefs === 'string') {
          dbPrefs = JSON.parse(dbPrefs);
        }
        dbPrefs = dbPrefs || {};

        let dbTodayMinutes = data.profile?.todayMinutes || 0;
        const dbTotalMinutes = data.profile?.totalMinutes || 0;
        const dbLastActivityDate = data.profile?.lastActivityDate || '';

        // Auto-Reset on new day check
        if (dbLastActivityDate && dbLastActivityDate !== todayDate) {
          dbTodayMinutes = 0;
          // Sync reset to DB in background
          fetch('/api/user/profile', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': userId
            },
            body: JSON.stringify({
              lastActivityDate: todayDate,
              todayMinutes: 0
            })
          }).catch(err => console.error('Failed to sync background date reset:', err));
        }

        set({ 
          completedModules: completed, 
          userProgress: progressMap,
          skillLevel: dbPrefs.skillLevel || '',
          learningGoals: dbPrefs.learningGoals || [],
          dailyTargetMinutes: dbPrefs.dailyTargetMinutes || 20,
          recommendedStage: dbPrefs.recommendedStage || '',
          recommendedModule: dbPrefs.recommendedModule || '',
          lastActivityDate: dbLastActivityDate || todayDate,
          todayMinutes: dbTodayMinutes,
          totalMinutes: dbTotalMinutes
        });
        
        // Cache to localStorage
        localStorage.setItem('nexus_profile_preferences', JSON.stringify(dbPrefs));
        localStorage.setItem('nexus_activity_date', dbLastActivityDate || todayDate);
        localStorage.setItem('nexus_today_minutes', dbTodayMinutes.toString());
        localStorage.setItem('nexus_total_minutes', dbTotalMinutes.toString());

        get().evaluateAchievementsAndStreak();
      }
    } catch (err) {
      console.error('Failed to fetch progress from database:', err);
    } finally {
      set({ loading: false });
    }
  },

  completeModule: async (moduleId, score) => {
    const { userId, userName } = get();
    if (!userId) return;
    
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': userId,
          'x-user-name': userName,
        },
        body: JSON.stringify({ moduleId, score, failedObjectives: "" }),
      });
      const data = await res.json();
      if (data.success) {
        const moduleTitle = modulesData.find(m => m.id === moduleId)?.title || moduleId;
        if (score >= 80) {
            get().addTelemetryLog('SUCCESS', `Completed lesson "${moduleTitle}".`);
        } else {
            get().addTelemetryLog('WARNING', `Attempted "${moduleTitle}" with score ${score}%.`);
        }
        // Refresh local store
        await get().fetchProgress();
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  },

  isModuleLocked: (moduleId) => {
    return false; // Under v1.1.0 Phase 2, we never hard-lock lessons to allow full exploration!
  },

  checkPrerequisiteStatus: (moduleId: string) => {
    const { completedModules, selectedPath } = get();
    return RecommendationEngine.checkPrerequisites(moduleId, completedModules, selectedPath);
  },

  getFirstIncompleteModule: () => {
    const { completedModules, userProgress, selectedPath } = get();
    const nextLesson = RecommendationEngine.getNextLesson(completedModules, userProgress, selectedPath);
    if (!nextLesson) return null;

    return {
      id: nextLesson.id,
      title: nextLesson.title,
      slug: nextLesson.slug || nextLesson.id
    };
  },

  dismissMilestoneCelebration: () => set({ showMilestoneCelebration: null }),

  getStageProgress: (stageKey) => {
    const { completedModules } = get();
    const stage = STAGES.find(s => s.key === stageKey);
    if (!stage) return null;
    
    const stageModules = modulesData.filter(m => stage.groups.includes(m.group));
    const total = stageModules.length;
    const completed = stageModules.filter(m => completedModules.includes(m.id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const allLessonsPassed = total > 0 && completed === total;
    const milestoneChallengePassed = completedModules.includes(stage.milestone.challengeLessonId);
    const isGraduated = allLessonsPassed && milestoneChallengePassed;
    
    let status: 'completed' | 'milestone-pending' | 'in-progress' | 'upcoming' = 'upcoming';
    if (isGraduated) status = 'completed';
    else if (allLessonsPassed && !milestoneChallengePassed) status = 'milestone-pending';
    else if (completed > 0) status = 'in-progress';
    
    return { total, completed, percent, allLessonsPassed, milestoneChallengePassed, isGraduated, status };
  },

  getCompletedStages: () => {
    return STAGES.filter(s => get().getStageProgress(s.key)?.isGraduated).map(s => s.key);
  },

  getCurrentStage: () => {
    return STAGES.find(s => !get().getStageProgress(s.key)?.isGraduated) || STAGES[STAGES.length - 1];
  },

  getPathStats: (path) => {
    const { completedModules } = get();
    const pathModules = path === 'all' 
      ? modulesData 
      : modulesData.filter(m => (m as { learningPaths?: string[] }).learningPaths?.includes(path));
    
    const totalModules = pathModules.length;
    const completedCount = completedModules.filter(id => pathModules.some(m => m.id === id)).length;
    const remainingModules = totalModules - completedCount;
    const completionPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;
    
    // Estimate 20 mins per lesson
    const estimatedMinutes = remainingModules * 20;

    return {
      totalModules,
      completedModules: completedCount,
      remainingModules,
      completionPercentage,
      estimatedMinutes
    };
  },

  syncFromPayload: async (payload) => {
    try {
      const res = await fetch('/api/progress/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        // Clear stale code-verified flags before loading new profile
        clearCodeVerifiedFlags();
        // Save user identity in local storage
        localStorage.setItem('asa_user_name', payload.userName);
        localStorage.setItem('asa_user_id', payload.userId);
        set({ userName: payload.userName, userId: payload.userId });
        await get().fetchProgress();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to execute bulk progress sync:', err);
      return false;
    }
  },

  addTelemetryLog: (type, message) => {
    const { telemetryLogs, unreadCount } = get();
    const newLog = {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message
    };
    const updatedLogs = [newLog, ...telemetryLogs].slice(0, 50); // Keep last 50
    const newUnreadCount = type !== 'INFO' ? unreadCount + 1 : unreadCount;
    set({ telemetryLogs: updatedLogs, unreadCount: newUnreadCount });
    localStorage.setItem('asa_telemetry', JSON.stringify(updatedLogs));
  },

  evaluateAchievementsAndStreak: () => {
    const { completedModules, unlockedAchievements, streak } = get();
    const newAchievements = [...unlockedAchievements];
    let achievementsChanged = false;

    const checkAndUnlock = (id: string, condition: boolean, title: string) => {
      if (condition && !newAchievements.includes(id)) {
        newAchievements.push(id);
        achievementsChanged = true;
        get().addTelemetryLog('ACHIEVEMENT', `Unlocked "${title}" badge.`);
      }
    };

    checkAndUnlock('first-test', completedModules.some(m => m.includes('first-test')), 'First Test Passed');
    checkAndUnlock('pom-creator', completedModules.some(m => m.includes('pom')), 'POM Creator');
    checkAndUnlock('cli-commander', completedModules.some(m => m.includes('fundamentals-exec')), 'CLI Commander');
    checkAndUnlock('bug-hunter', completedModules.some(m => m.includes('war-room')), 'Bug Hunter');

    // Phase 4 Achievements
    const fndStats = get().getPathStats('foundations');
    const entStats = get().getPathStats('enterprise');
    const regStats = get().getPathStats('regulated');
    const allStats = get().getPathStats('all');

    checkAndUnlock('foundations-grad', fndStats.completionPercentage === 100, 'Foundations Graduate');
    checkAndUnlock('enterprise-prac', entStats.completionPercentage === 100, 'Enterprise Practitioner');
    checkAndUnlock('regulated-spec', regStats.completionPercentage === 100, 'Regulated Specialist');
    checkAndUnlock('curriculum-master', allStats.completionPercentage === 100, 'Curriculum Master');
    checkAndUnlock('path-explorer', fndStats.completedModules >= 1 && entStats.completedModules >= 1 && regStats.completedModules >= 1, 'Path Explorer');

    if (achievementsChanged) {
      set({ unlockedAchievements: newAchievements });
    }

    // Occasional streak log
    if (streak > 0 && Math.random() > 0.8) {
      get().addTelemetryLog('INFO', `Tracking continuous streak: ${streak} days.`);
    }

    // Evaluate stages
    const newUnlockedStageBadges = [...get().unlockedStageBadges];
    let showCelebration = null;
    
    STAGES.forEach(stage => {
      const progress = get().getStageProgress(stage.key);
      if (progress?.isGraduated && !newUnlockedStageBadges.includes(stage.key)) {
        newUnlockedStageBadges.push(stage.key);
        showCelebration = stage.key;
        get().addTelemetryLog('ACHIEVEMENT', `Graduated Stage: ${stage.title} (${stage.milestone.badgeName})`);
      }
    });

    if (showCelebration) {
      set({ unlockedStageBadges: newUnlockedStageBadges, showMilestoneCelebration: showCelebration });
      localStorage.setItem('asa_stage_badges', JSON.stringify(newUnlockedStageBadges));
    }
  },

  updateLearningProfile: async (profileData) => {
    const { userId, skillLevel, learningGoals, dailyTargetMinutes, recommendedStage, recommendedModule } = get();

    const updatedPreferences = {
      skillLevel: profileData.skillLevel !== undefined ? profileData.skillLevel : skillLevel,
      learningGoals: profileData.learningGoals !== undefined ? profileData.learningGoals : learningGoals,
      dailyTargetMinutes: profileData.dailyTargetMinutes !== undefined ? profileData.dailyTargetMinutes : dailyTargetMinutes,
      recommendedStage: profileData.recommendedStage !== undefined ? profileData.recommendedStage : recommendedStage,
      recommendedModule: profileData.recommendedModule !== undefined ? profileData.recommendedModule : recommendedModule,
    };

    set({
      skillLevel: updatedPreferences.skillLevel,
      learningGoals: updatedPreferences.learningGoals,
      dailyTargetMinutes: updatedPreferences.dailyTargetMinutes,
      recommendedStage: updatedPreferences.recommendedStage,
      recommendedModule: updatedPreferences.recommendedModule,
    });
    localStorage.setItem('nexus_profile_preferences', JSON.stringify(updatedPreferences));

    if (!userId) return;

    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          learningPreferences: updatedPreferences
        })
      });
    } catch (err) {
      console.error('Failed to sync learning profile with database:', err);
    }
  },

  updateTimeSpentToday: async (minutes) => {
    const { userId, todayMinutes, totalMinutes, weeklyMinutes, monthlyMinutes } = get();
    const todayDate = new Date().toISOString().split('T')[0];
    const newTodayMinutes = todayMinutes + minutes;
    const newTotalMinutes = totalMinutes + minutes;
    const newWeeklyMinutes = weeklyMinutes + minutes;
    const newMonthlyMinutes = monthlyMinutes + minutes;

    set({
      lastActivityDate: todayDate,
      todayMinutes: newTodayMinutes,
      totalMinutes: newTotalMinutes,
      weeklyMinutes: newWeeklyMinutes,
      monthlyMinutes: newMonthlyMinutes,
    });
    localStorage.setItem('nexus_activity_date', todayDate);
    localStorage.setItem('nexus_today_minutes', newTodayMinutes.toString());
    localStorage.setItem('nexus_total_minutes', newTotalMinutes.toString());
    localStorage.setItem('asa_weekly_minutes', newWeeklyMinutes.toString());
    localStorage.setItem('asa_monthly_minutes', newMonthlyMinutes.toString());

    if (!userId) return;

    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          lastActivityDate: todayDate,
          todayMinutes: newTodayMinutes,
          totalMinutes: newTotalMinutes
        })
      });
    } catch (err) {
      console.error('Failed to sync study time with database:', err);
    }
  },

  incrementTimeSpent: (seconds) => {
    const newTime = get().timeSpentSeconds + seconds;
    set({ timeSpentSeconds: newTime });
    localStorage.setItem('asa_time_spent', newTime.toString());
    
    // When timeSpentSeconds hits a multiple of 60, increment active minutes
    if (newTime > 0 && newTime % 60 === 0) {
      get().updateTimeSpentToday(1);
    }
  },

  markAllAsRead: () => {
    set({ unreadCount: 0 });
  },

  addRecentResource: (resource) => {
    const { recentResources } = get();
    const timestamp = Date.now();
    // Filter out previous occurrences of this resource ID
    const filtered = recentResources.filter(r => r.id !== resource.id);
    const updated = [{ ...resource, timestamp }, ...filtered].slice(0, 8); // Keep up to 8 recent resources
    set({ recentResources: updated });
    localStorage.setItem('asa_recent_resources', JSON.stringify(updated));
  },

  toggleBookmark: (id) => {
    const { bookmarkedResources } = get();
    const updated = bookmarkedResources.includes(id)
      ? bookmarkedResources.filter(b => b !== id)
      : [...bookmarkedResources, id];
    set({ bookmarkedResources: updated });
    localStorage.setItem('asa_bookmarked_resources', JSON.stringify(updated));
  },

  toggleFavorite: (id) => {
    const { favoritedResources } = get();
    const updated = favoritedResources.includes(id)
      ? favoritedResources.filter(f => f !== id)
      : [...favoritedResources, id];
    set({ favoritedResources: updated });
    localStorage.setItem('asa_favorited_resources', JSON.stringify(updated));
  },

  addCopiedSnippet: (text, originUrl) => {
    const { copiedSnippets } = get();
    const timestamp = Date.now();
    const filtered = copiedSnippets.filter(s => s.text !== text);
    const updated = [{ text, originUrl, timestamp }, ...filtered].slice(0, 10); // Keep last 10 copied snippets
    set({ copiedSnippets: updated });
    localStorage.setItem('asa_copied_snippets', JSON.stringify(updated));
  },

  clearCopiedSnippets: () => {
    set({ copiedSnippets: [] });
    localStorage.setItem('asa_copied_snippets', '[]');
  },

  initChallengeState: () => {
    if (typeof window === 'undefined') return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const {
      activeDailyChallenge,
      activeWeeklyChallenge,
      challengeHistory,
      challengeDifficultyLevel
    } = get();

    // 1. Check/Reset Daily Challenge
    let dailyChallengeChanged = false;
    let newDailyChallenge = activeDailyChallenge;

    if (!activeDailyChallenge || new Date(activeDailyChallenge.expiresAt) <= now) {
      // Midnight of today
      const expiresAt = new Date();
      expiresAt.setHours(23, 59, 59, 999);

      // Determine eligible difficulties
      const difficulties = ["Easy"];
      if (challengeDifficultyLevel === "Medium" || challengeDifficultyLevel === "Hard" || challengeDifficultyLevel === "Expert" || challengeDifficultyLevel === "Master") difficulties.push("Medium");
      if (challengeDifficultyLevel === "Hard" || challengeDifficultyLevel === "Expert" || challengeDifficultyLevel === "Master") difficulties.push("Hard");
      if (challengeDifficultyLevel === "Expert" || challengeDifficultyLevel === "Master") difficulties.push("Expert");
      if (challengeDifficultyLevel === "Master") difficulties.push("Master");

      // Filter daily challenges pool
      let pool = dailyChallengesData.filter((c: any) => difficulties.includes(c.difficulty));
      
      // Filter out completed ones
      const completedIds = challengeHistory.filter(h => h.passed && h.type === 'daily').map(h => h.id);
      let eligiblePool = pool.filter((c: any) => !completedIds.includes(c.id));

      if (eligiblePool.length === 0) {
        eligiblePool = pool; // fallback/reset pool if all completed
      }

      if (eligiblePool.length > 0) {
        const daySeed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        const selected = eligiblePool[daySeed % eligiblePool.length];
        newDailyChallenge = {
          id: selected.id,
          assignedAt: now.toISOString(),
          expiresAt: expiresAt.toISOString()
        };
        dailyChallengeChanged = true;
      }
    }

    // 2. Check/Reset Weekly Challenge
    let weeklyChallengeChanged = false;
    let newWeeklyChallenge = activeWeeklyChallenge;

    if (!activeWeeklyChallenge || new Date(activeWeeklyChallenge.expiresAt) <= now) {
      // Find Sunday midnight
      const expiresAt = new Date();
      const day = expiresAt.getDay();
      const diff = expiresAt.getDate() + (7 - day) % 7; // sunday
      expiresAt.setDate(diff);
      expiresAt.setHours(23, 59, 59, 999);

      const weekSeed = now.getFullYear() * 100 + Math.floor(now.getDate() / 7);
      const selected = weeklyChallengesData[weekSeed % weeklyChallengesData.length];
      
      newWeeklyChallenge = {
        id: selected.id,
        assignedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };
      weeklyChallengeChanged = true;
    }

    if (dailyChallengeChanged) {
      set({ activeDailyChallenge: newDailyChallenge });
      localStorage.setItem('asa_active_daily_challenge', JSON.stringify(newDailyChallenge));
    }
    if (weeklyChallengeChanged) {
      set({ activeWeeklyChallenge: newWeeklyChallenge });
      localStorage.setItem('asa_active_weekly_challenge', JSON.stringify(newWeeklyChallenge));
      
      // Reset weekly progress too
      const weeklyMeta = weeklyChallengesData.find(w => w.id === newWeeklyChallenge?.id);
      const newProgress = weeklyMeta ? { challengeId: weeklyMeta.id, current: 0, target: weeklyMeta.target } : null;
      set({ weeklyProgress: newProgress });
      localStorage.setItem('asa_weekly_progress', JSON.stringify(newProgress));
    }
  },

  submitChallengeAttempt: (challengeId, passed, timeTaken, answer) => {
    const {
      activeDailyChallenge,
      activeWeeklyChallenge,
      challengeHistory,
      weeklyProgress,
      challengeStreak,
      challengeDifficultyLevel
    } = get();

    const isDaily = activeDailyChallenge?.id === challengeId;
    const isWeekly = activeWeeklyChallenge?.id === challengeId;
    const type = isDaily ? 'daily' : 'weekly';

    const nowStr = new Date().toISOString();
    
    // Find the challenge from definition pool
    const challengeDef: any = isDaily 
      ? dailyChallengesData.find((c: any) => c.id === challengeId)
      : weeklyChallengesData.find((w: any) => w.id === challengeId);

    if (!challengeDef) return;

    // Check if already completed today
    const alreadyPassed = challengeHistory.some(h => h.id === challengeId && h.passed);
    if (alreadyPassed) {
      get().addTelemetryLog('WARNING', `Challenge "${challengeDef.id}" already completed today.`);
      return;
    }

    // Update history entry
    const existingIndex = challengeHistory.findIndex(h => h.id === challengeId);
    let attempts = 1;
    let xpEarned = 0;

    if (existingIndex !== -1) {
      attempts = challengeHistory[existingIndex].attempts + 1;
    }

    if (passed) {
      xpEarned = challengeDef.xpReward;
    }

    const newHistoryEntry: ChallengeAttempt = {
      id: challengeId,
      type: type as any,
      difficulty: challengeDef.difficulty || 'Medium',
      attempts,
      passed,
      xpEarned,
      timeTaken,
      completedAt: nowStr
    };

    let updatedHistory = [...challengeHistory];
    if (existingIndex !== -1) {
      updatedHistory[existingIndex] = newHistoryEntry;
    } else {
      updatedHistory.push(newHistoryEntry);
    }

    set({ challengeHistory: updatedHistory });
    localStorage.setItem('asa_challenge_history', JSON.stringify(updatedHistory));

    // Handle rewards
    if (passed) {
      // Award XP
      const currentXP = parseInt(localStorage.getItem('asa_time_spent') || '0', 10);
      const newXP = currentXP + xpEarned;
      set({ timeSpentSeconds: newXP });
      localStorage.setItem('asa_time_spent', newXP.toString());

      // Update streaks
      let newStreak = challengeStreak;
      if (isDaily) {
        newStreak = challengeStreak + 1;
        set({ challengeStreak: newStreak });
        localStorage.setItem('asa_challenge_streak', newStreak.toString());
      }

      // Check difficulty scaling rules
      const DIFFICULTY_RULES = { Easy: 5, Medium: 8, Hard: 10, Expert: 12 };
      let newDifficulty = challengeDifficultyLevel;
      const passedCount = updatedHistory.filter(h => h.passed && h.difficulty === challengeDifficultyLevel).length;

      if (challengeDifficultyLevel === "Easy" && passedCount >= DIFFICULTY_RULES.Easy) {
        newDifficulty = "Medium";
      } else if (challengeDifficultyLevel === "Medium" && passedCount >= DIFFICULTY_RULES.Medium) {
        newDifficulty = "Hard";
      } else if (challengeDifficultyLevel === "Hard" && passedCount >= DIFFICULTY_RULES.Hard) {
        newDifficulty = "Expert";
      } else if (challengeDifficultyLevel === "Expert" && passedCount >= DIFFICULTY_RULES.Expert) {
        newDifficulty = "Master";
      }

      if (newDifficulty !== challengeDifficultyLevel) {
        set({ challengeDifficultyLevel: newDifficulty });
        localStorage.setItem('asa_challenge_difficulty_level', newDifficulty);
        get().addTelemetryLog('SUCCESS', `New Difficulty Unlocked: ${newDifficulty}!`);
      }

      get().addTelemetryLog('SUCCESS', `Completed Challenge: +${xpEarned} XP! Streak: x${newStreak}`);
    } else {
      get().addTelemetryLog('WARNING', `Failed challenge attempt for: ${challengeDef.id}`);
    }
  }
  
  // End of store
}));
