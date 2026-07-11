const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const metadataPath = path.join(dataDir, 'metadata.json');
const coursesPath = path.join(__dirname, 'src', 'app', 'courses', 'playwright');
const modulesOutDir = path.join(dataDir, 'modules');

console.log('Analyzing course readiness...');

if (!fs.existsSync(metadataPath)) {
  console.error('Error: metadata.json not found!');
  process.exit(1);
}

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));

// 1. Gather all MDX files
const mdxFiles = [];
function scanDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      scanDir(filePath);
    } else if (file.endsWith('.mdx')) {
      mdxFiles.push(filePath);
    }
  });
}
scanDir(coursesPath);

console.log(`Found ${mdxFiles.length} MDX lesson files.`);

// 2. Scan MDX files for quality
const emptyLessons = [];
const boilerplateLessons = [];
const parsedLessonsCount = mdxFiles.length;

mdxFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(coursesPath, file).replace(/\\/g, '/');
  
  if (content.trim().length < 200) {
    emptyLessons.push({ path: relativePath, size: content.trim().length });
  }
  
  if (content.includes('fill in the lesson text here') || content.includes('auto-generated from')) {
    boilerplateLessons.push(relativePath);
  }
});

// 3. Match MDX lessons against metadata
const metadataIds = metadata.map(m => m.id);
const metadataMap = {};
metadata.forEach(m => {
  metadataMap[m.id] = m;
});

// Calculate statistics
let lessonsWithQuiz = 0;
let lessonsWithTasks = 0;
let totalQuizzesQuestionsCount = 0;
let emptyQuizzes = [];

fs.readdirSync(modulesOutDir).forEach((file) => {
  if (file.endsWith('.json')) {
    const fileContent = JSON.parse(fs.readFileSync(path.join(modulesOutDir, file), 'utf-8'));
    if (fileContent.lessons) {
      fileContent.lessons.forEach(lesson => {
        const meta = metadataMap[lesson.id];
        if (meta) {
          // Check Quiz
          const hasQuiz = meta.hasQuiz;
          if (hasQuiz) {
            lessonsWithQuiz++;
            let qCount = 0;
            if (lesson.quizPool) {
              qCount += (lesson.quizPool.Easy?.length || 0);
              qCount += (lesson.quizPool.Medium?.length || 0);
              qCount += (lesson.quizPool.Hard?.length || 0);
            }
            totalQuizzesQuestionsCount += qCount;
            if (qCount === 0) {
              emptyQuizzes.push(lesson.id);
            }
          }
          // Check Tasks
          if (meta.hasTasks) {
            lessonsWithTasks++;
          }
        }
      });
    }
  }
});

// Prepare JSON Report
const report = {
  totalModules: metadata.length,
  totalMdxFiles: parsedLessonsCount,
  qualityChecks: {
    emptyLessons: emptyLessons,
    boilerplateLessons: boilerplateLessons,
    emptyQuizzes: emptyQuizzes
  },
  stats: {
    lessonsWithQuiz,
    lessonsWithTasks,
    totalQuizzesQuestionsCount,
    averageQuestionsPerQuiz: lessonsWithQuiz > 0 ? (totalQuizzesQuestionsCount / lessonsWithQuiz).toFixed(1) : 0
  },
  readinessScore: 100
};

// Deduct score for empty lessons or boilerplate
report.readinessScore -= (emptyLessons.length * 10);
report.readinessScore -= (boilerplateLessons.length * 10);
report.readinessScore -= (emptyQuizzes.length * 5);
if (report.readinessScore < 0) report.readinessScore = 0;

const reportPath = path.join(__dirname, 'course-readiness-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');

console.log(`\n===================================`);
console.log(`COURSE READINESS REPORT GENERATED`);
console.log(`===================================`);
console.log(`Readiness Score:     ${report.readinessScore}/100`);
console.log(`Total Lessons:       ${report.totalModules}`);
console.log(`Empty MDX Lessons:   ${emptyLessons.length}`);
console.log(`Boilerplate Lessons: ${boilerplateLessons.length}`);
console.log(`Lessons with Quiz:   ${lessonsWithQuiz}`);
console.log(`Empty Quizzes:       ${emptyQuizzes.length}`);
console.log(`Lessons with Code:   ${lessonsWithTasks}`);
console.log(`Total Quiz Qs:       ${totalQuizzesQuestionsCount}`);
console.log(`===================================\n`);
