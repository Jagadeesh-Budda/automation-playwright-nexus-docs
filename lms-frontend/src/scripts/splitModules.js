const fs = require('fs');
const path = require('path');

const groupMapping = {
  '🌱 MODULE 0: JS/TS FOR AUTOMATION': 'module-0-js-ts',
  '🚀 MODULE 1: YOUR FIRST TEST': 'module-1-first-test',
  '🔍 MODULE 2: LOCATORS & ASSERTIONS': 'module-2-locators-assertions',
  '📁 MODULE 3: TEST ORGANIZATION': 'module-3-test-organization',
  '🏛️ MODULE 4: PAGE OBJECTS': 'module-4-page-objects',
  '🧩 MODULE 5: FIXTURES & DI': 'module-5-fixtures-di',
  '🏗️ MODULE 6: THE FRAMEWORK CHALLENGE': 'module-6-framework-challenge',
  '⏱️ MODULE 7: SYNCHRONIZATION & RELIABILITY': 'module-7-synchronization-reliability',
  '🧱 MODULE 8: ENTERPRISE PRACTICES': 'module-8-enterprise-practices',
  '🎭 MODULE 9: PLAYWRIGHT ADVANCED CORE': 'module-9-playwright-advanced-core',
  '🗝️ MODULE 10: ADVANCED LOCATORS': 'module-10-advanced-locators',
  '⚔️ MODULE 11: WAR ROOM': 'module-11-war-room',
  '🏗️ MODULE 12: ADVANCED ARCHITECTURE': 'module-12-advanced-architecture',
  '🎓 MODULE 13: MILESTONE PROJECT': 'module-13-milestone-project',
  '⚡ MODULE 14: ADVANCED FEATURES': 'module-14-advanced-features',
  '✍️ MODULE 15: E-SIGNATURE & MODALS': 'module-15-e-signature-modals',
  '🔌 MODULE 16: API TESTING & HYBRID FLOWS': 'module-16-api-testing-hybrid-flows',
  '⚙️ MODULE 16: ORCHESTRATION': 'module-16-orchestration',
  '📊 MODULE 17: DATA-DRIVEN ENGINEERING': 'module-17-data-driven-engineering',
  '🛠️ MODULE 18: FRAMEWORK ENGINEERING & AST': 'module-18-framework-engineering-ast',
  '🌐 MODULE 19: ADVANCED ENTERPRISE TOPOLOGIES': 'module-19-advanced-enterprise-topologies',
  '🚀 MODULE 20: INDUSTRY TRACKS': 'module-20-industry-tracks',
  '🎤 MODULE 21: INTERVIEW PREP': 'module-21-interview-prep',
  '📦 MODULE 22: ENTERPRISE TEMPLATES': 'module-22-enterprise-templates',
  '🏆 MODULE 23: FINAL CAPSTONE CERTIFICATION': 'module-23-final-capstone-certification',
  '💎 ELITE TIER: ENGINEERING': 'elite-tier-engineering'
};

function sanitizeGroup(group) {
  if (groupMapping[group]) return groupMapping[group];
  let clean = group.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, '');
  clean = clean.toLowerCase();
  clean = clean.replace(/[^a-z0-9]+/g, '-');
  clean = clean.replace(/^-+|-+$/g, '');
  return clean || 'module-unknown';
}

const inputPath = path.join(__dirname, '../data/modules.json');
const dataDir = path.join(__dirname, '../data');
const modulesOutDir = path.join(dataDir, 'modules');

console.log('Reading input modules.json...');
if (!fs.existsSync(inputPath)) {
  console.error(`Error: modules.json not found at ${inputPath}`);
  process.exit(1);
}

const rawData = fs.readFileSync(inputPath, 'utf8');
const allLessons = JSON.parse(rawData);

// Ensure output directories exist
if (!fs.existsSync(modulesOutDir)) {
  fs.mkdirSync(modulesOutDir, { recursive: true });
}

// 1. Build metadata, module files list, and dynamic data arrays
const metadata = [];
const progressIndex = {};
const modulesContent = {};

allLessons.forEach((lesson) => {
  const moduleFile = sanitizeGroup(lesson.group);

  // Add lesson metadata entry
  metadata.push({
    id: lesson.id,
    title: lesson.title,
    url: lesson.url,
    group: lesson.group,
    level: lesson.level,
    weight: lesson.weight,
    icon: lesson.icon,
    slug: lesson.slug,
    learningPaths: lesson.learningPaths,
    category: lesson.category,
    optional: lesson.optional,
    estimatedMinutes: lesson.estimatedMinutes,
    certificateTrack: lesson.certificateTrack,
    moduleFile: moduleFile,
    meta: lesson.meta || null,
    hasTasks: Boolean(lesson.tasks && lesson.tasks.length > 0),
    hasQuiz: Boolean(lesson.quizPool && (lesson.quizPool.Easy?.length > 0 || lesson.quizPool.Medium?.length > 0 || lesson.quizPool.Hard?.length > 0))
  });

  // Accumulate module progress index details
  if (!progressIndex[moduleFile]) {
    progressIndex[moduleFile] = {
      lessonCount: 0,
      estimatedMinutes: 0,
      xp: 0
    };
  }
  progressIndex[moduleFile].lessonCount += 1;
  progressIndex[moduleFile].estimatedMinutes += (lesson.estimatedMinutes || 20);
  progressIndex[moduleFile].xp += ((lesson.weight || 5) * 10);

  // Group full lesson contents for dynamic modules
  if (!modulesContent[moduleFile]) {
    modulesContent[moduleFile] = [];
  }
  modulesContent[moduleFile].push(lesson);
});

// 2. Write dynamic module files
console.log('Writing dynamic module files...');
const generatedAt = new Date().toISOString();
Object.keys(modulesContent).forEach((moduleFile) => {
  const filePath = path.join(modulesOutDir, `${moduleFile}.json`);
  const content = {
    schemaVersion: 2,
    generatedAt: generatedAt,
    lessons: modulesContent[moduleFile]
  };
  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  console.log(`- Wrote ${moduleFile}.json`);
});

// 3. Write metadata.json
const metadataPath = path.join(dataDir, 'metadata.json');
fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), 'utf8');
console.log('Wrote metadata.json');

// 4. Write progressIndex.json
const progressIndexPath = path.join(dataDir, 'progressIndex.json');
fs.writeFileSync(progressIndexPath, JSON.stringify(progressIndex, null, 2), 'utf8');
console.log('Wrote progressIndex.json');

// 5. Run Integrity Validation checks
console.log('\n--- Running Integrity Validation ---');
let hasErrors = false;

// Every lesson in modules.json is in metadata
if (allLessons.length !== metadata.length) {
  console.error(`Mismatch: modules.json has ${allLessons.length} lessons, but metadata has ${metadata.length}.`);
  hasErrors = true;
}

// Every metadata entry points to a valid module file that exists
metadata.forEach((meta) => {
  const filePath = path.join(modulesOutDir, `${meta.moduleFile}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Error: Module file ${meta.moduleFile}.json doesn't exist for lesson ${meta.id}.`);
    hasErrors = true;
  }
});

// Checks inside generated module files
Object.keys(modulesContent).forEach((moduleFile) => {
  const lessons = modulesContent[moduleFile];
  const lessonIds = new Set();

  lessons.forEach((lesson) => {
    // Unique ID check
    if (lessonIds.has(lesson.id)) {
      console.error(`Error: Duplicate ID "${lesson.id}" found in ${moduleFile}.json`);
      hasErrors = true;
    }
    lessonIds.add(lesson.id);

    // Objectives list setup
    const objectiveIds = new Set();
    const objectives = lesson.objectives || [];
    objectives.forEach((obj) => {
      if (objectiveIds.has(obj.id)) {
        console.error(`Error: Duplicate objective ID "${obj.id}" in lesson "${lesson.id}".`);
        hasErrors = true;
      }
      objectiveIds.add(obj.id);
    });

    // Quiz mappings check
    const quizMapping = lesson.quizMapping || [];
    quizMapping.forEach((map) => {
      if (!objectiveIds.has(map.objective)) {
        console.error(`Error: quizMapping references missing objective ID "${map.objective}" in lesson "${lesson.id}".`);
        hasErrors = true;
      }
    });
  });
});

if (hasErrors) {
  console.error('\nIntegrity checks FAILED!');
  process.exit(1);
} else {
  console.log('Integrity checks PASSED successfully!');
}
