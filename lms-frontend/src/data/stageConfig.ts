export interface StageMilestone {
  capabilities: string[];
  badgeName: string;
  badgeEmoji: string;
  challengeLessonId: string;
}

export interface Stage {
  id: number;
  key: string;
  emoji: string;
  title: string;
  description: string;
  goal: string;
  studentOutcome: string;
  groups: string[];
  milestone: StageMilestone;
}

export interface ExpertSubSection {
  label: string;
  groups: string[];
}

export const STAGES: Stage[] = [
  {
    id: 1,
    key: 'novice',
    emoji: '🌱',
    title: 'Novice',
    description: 'Learn basic Playwright automation.',
    goal: 'I can write basic Playwright tests.',
    studentOutcome: 'The student can automate simple workflows independently.',
    groups: [
      '🌱 MODULE 0: JS/TS FOR AUTOMATION',
      '🚀 MODULE 1: YOUR FIRST TEST',
      '🔍 MODULE 2: LOCATORS & ASSERTIONS',
    ],
    milestone: {
      capabilities: ['Write Playwright tests', 'Use locators', 'Create assertions', 'Debug basic failures'],
      badgeName: 'Novice Explorer',
      badgeEmoji: '🌱',
      challengeLessonId: '14-break-it',
    },
  },
  {
    id: 2,
    key: 'advanced-beginner',
    emoji: '🚀',
    title: 'Advanced Beginner',
    description: 'Learn to organize and maintain automation code.',
    goal: 'I can organize and maintain automation code.',
    studentOutcome: 'The student can maintain small automation projects.',
    groups: [
      '📁 MODULE 3: TEST ORGANIZATION',
      '🏛️ MODULE 4: PAGE OBJECTS',
    ],
    milestone: {
      capabilities: ['Organize test suites', 'Use hooks', 'Build Page Objects', 'Refactor duplicated code'],
      badgeName: 'Automation Practitioner',
      badgeEmoji: '🚀',
      challengeLessonId: '27-refactor-exercise',
    },
  },
  {
    id: 3,
    key: 'competent',
    emoji: '🏗',
    title: 'Competent',
    description: 'Learn to build a Playwright framework from scratch.',
    goal: 'I can build a Playwright framework from scratch.',
    studentOutcome: 'The student can create a maintainable Playwright framework without guidance.',
    groups: [
      '🧩 MODULE 5: FIXTURES & DI',
      '🏗️ MODULE 6: THE FRAMEWORK CHALLENGE',
      '⏱️ MODULE 7: SYNCHRONIZATION & RELIABILITY',
    ],
    milestone: {
      capabilities: ['Create fixtures', 'Build frameworks', 'Configure Playwright projects', 'Solve synchronization issues'],
      badgeName: 'Framework Engineer',
      badgeEmoji: '🏗',
      challengeLessonId: '35-reference-solution',
    },
  },
  {
    id: 4,
    key: 'proficient',
    emoji: '⚙️',
    title: 'Proficient',
    description: 'Learn to scale automation across teams.',
    goal: 'I can scale automation across teams.',
    studentOutcome: 'The student can lead automation efforts and support larger teams.',
    groups: [
      '🧱 MODULE 8: ENTERPRISE PRACTICES',
      '🎭 MODULE 9: PLAYWRIGHT ADVANCED CORE',
      '🗝️ MODULE 10: ADVANCED LOCATORS',
      '⚔️ MODULE 11: WAR ROOM',
      '🏗️ MODULE 12: ADVANCED ARCHITECTURE',
      '🎓 MODULE 13: MILESTONE PROJECT',
      '⚡ MODULE 14: ADVANCED FEATURES',
    ],
    milestone: {
      capabilities: ['Scale automation across teams', 'Design enterprise test architecture', 'Implement quality gates', 'Lead automation initiatives'],
      badgeName: 'Automation Architect',
      badgeEmoji: '⚙️',
      challengeLessonId: '109-capstone-verify',
    },
  },
  {
    id: 5,
    key: 'expert',
    emoji: '🧠',
    title: 'Expert',
    description: 'Learn to architect enterprise automation systems.',
    goal: 'I can architect enterprise automation systems.',
    studentOutcome: 'The student can operate at Senior SDET, Staff Engineer, or Automation Architect level.',
    groups: [
      '✍️ MODULE 15: E-SIGNATURE & MODALS',
      '🔌 MODULE 16: API TESTING & HYBRID FLOWS',
      '⚙️ MODULE 16: ORCHESTRATION',
      '📊 MODULE 17: DATA-DRIVEN ENGINEERING',
      '🛠️ MODULE 18: FRAMEWORK ENGINEERING & AST',
      '🏆 MODULE 23: FINAL CAPSTONE CERTIFICATION',
      '🌐 MODULE 19: ADVANCED ENTERPRISE TOPOLOGIES',
      '🚀 MODULE 20: INDUSTRY TRACKS',
      '🎤 MODULE 21: INTERVIEW PREP',
      '📦 MODULE 22: ENTERPRISE TEMPLATES',
      '💎 ELITE TIER: ENGINEERING',
    ],
    milestone: {
      capabilities: ['Design enterprise automation ecosystems', 'Mentor engineers', 'Create reusable automation platforms', 'Drive testing strategy'],
      badgeName: 'Enterprise Expert',
      badgeEmoji: '🧠',
      challengeLessonId: '97-capstone-audit',
    },
  },
];

export const EXPERT_SUBSECTIONS: ExpertSubSection[] = [
  {
    label: 'Expert Core',
    groups: [
      '✍️ MODULE 15: E-SIGNATURE & MODALS',
      '🔌 MODULE 16: API TESTING & HYBRID FLOWS',
      '⚙️ MODULE 16: ORCHESTRATION',
      '📊 MODULE 17: DATA-DRIVEN ENGINEERING',
      '🛠️ MODULE 18: FRAMEWORK ENGINEERING & AST',
      '🏆 MODULE 23: FINAL CAPSTONE CERTIFICATION',
    ],
  },
  {
    label: 'Expert Specializations',
    groups: [
      '🌐 MODULE 19: ADVANCED ENTERPRISE TOPOLOGIES',
      '🚀 MODULE 20: INDUSTRY TRACKS',
      '🎤 MODULE 21: INTERVIEW PREP',
      '📦 MODULE 22: ENTERPRISE TEMPLATES',
    ],
  },
  {
    label: 'Elite Engineering',
    groups: [
      '💎 ELITE TIER: ENGINEERING',
    ],
  },
];
