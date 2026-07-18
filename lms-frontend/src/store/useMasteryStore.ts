import { create } from 'zustand';
import modulesData from '../data/metadata.json';
import { STAGES } from '../data/stageConfig';

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

  setMobileSyncOpen: (open) => set({ isMobileSyncOpen: open }),
  setPremiumModalOpen: (open) => set({ isPremiumModalOpen: open }),
  setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
  setReadingModeActive: (active) => set({ isReadingModeActive: active }),
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
    });
    
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
    if (process.env.NODE_ENV === 'development') {
      return false; // Under development server, no lock!
    }
    const { completedModules } = get();
    const currentIndex = modulesData.findIndex(m => m.id === moduleId);
    if (currentIndex <= 0) return false; // First module is never locked

    // Check if any previous module is incomplete (score < 70)
    for (let i = 0; i < currentIndex; i++) {
      const prevModule = modulesData[i];
      if (!completedModules.includes(prevModule.id)) {
        return true; // Locked because a previous module is not completed yet
      }
    }
    return false;
  },

  getFirstIncompleteModule: () => {
    const { completedModules } = get();
    const firstIncomplete = modulesData.find(m => !completedModules.includes(m.id));
    if (!firstIncomplete) return null;

    return {
      id: firstIncomplete.id,
      title: firstIncomplete.title,
      slug: firstIncomplete.slug || firstIncomplete.id
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
    const { userId, todayMinutes, totalMinutes } = get();
    const todayDate = new Date().toISOString().split('T')[0];
    const newTodayMinutes = todayMinutes + minutes;
    const newTotalMinutes = totalMinutes + minutes;

    set({
      lastActivityDate: todayDate,
      todayMinutes: newTodayMinutes,
      totalMinutes: newTotalMinutes
    });
    localStorage.setItem('nexus_activity_date', todayDate);
    localStorage.setItem('nexus_today_minutes', newTodayMinutes.toString());
    localStorage.setItem('nexus_total_minutes', newTotalMinutes.toString());

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
  }
}));
