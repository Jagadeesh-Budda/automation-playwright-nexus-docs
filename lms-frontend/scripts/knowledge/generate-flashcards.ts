// scripts/knowledge/generate-flashcards.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..'); // lms-frontend
const DATA_DIR = path.join(ROOT_DIR, 'src/data');
const MODULES_DIR = path.join(DATA_DIR, 'modules');
const WORKSPACE_ROOT = path.resolve(ROOT_DIR, '..'); // UIAutomation/ui-automation/docs
const OUTPUT_PATH = path.join(WORKSPACE_ROOT, 'flashcards.json');

interface Flashcard {
  front: string;
  back: string;
  difficulty: string;
  tags: string[];
  references: {
    file: string;
    heading: string;
    lineRange: string;
  }[];
}

function generateFlashcards() {
  console.log('🏁 Starting Flashcards Generation (Phase 8)...');

  if (!fs.existsSync(MODULES_DIR)) {
    console.error(`❌ Modules directory not found at: ${MODULES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(MODULES_DIR);
  const flashcards: Flashcard[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(MODULES_DIR, file);
    
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const lessons = content.lessons || [];

      for (const lesson of lessons) {
        const quizPool = lesson.quizPool || {};
        const levels = ['Easy', 'Medium', 'Hard'];

        for (const level of levels) {
          const quizzes = quizPool[level] || [];
          for (const quiz of quizzes) {
            const q = quiz.q || '';
            const code = quiz.code || '';
            const options: string[] = quiz.options || [];
            const a = quiz.a || '';
            const explanation = quiz.explanation || '';
            const type = quiz.type || 'multiple-choice';

            // Construct Front (Markdown)
            let front = `${q}\n`;
            if (code) {
              // Wrap code in appropriate Markdown fenced block
              const lang = code.includes('html') || code.includes('<html>') ? 'html' : 'typescript';
              front += `\n\`\`\`${lang}\n${code}\n\`\`\`\n`;
            }
            if (options.length > 0) {
              front += `\n**Options:**\n${options.map(opt => `- ${opt}`).join('\n')}\n`;
            }

            // Construct Back (Markdown)
            const back = `**Correct Answer:** ${a}\n\n**Explanation:** ${explanation}`;

            // Construct Tags
            const tags = [
              lesson.id,
              type.toLowerCase()
            ];
            if (lesson.category) tags.push(lesson.category.toLowerCase());
            if (lesson.group) {
              // Clean up the module group string (e.g. "🌱 MODULE 0: JS/TS FOR AUTOMATION" -> "module-0")
              const match = lesson.group.match(/MODULE\s+(\d+[a-z]?)/i);
              if (match) {
                tags.push(`module-${match[1].toLowerCase()}`);
              }
            }

            // References
            const refFile = `lms-frontend/src/data/modules/${file}`;
            const refHeading = lesson.title || 'Introduction';

            flashcards.push({
              front: front.trim(),
              back: back.trim(),
              difficulty: level.toLowerCase(),
              tags: Array.from(new Set(tags)),
              references: [
                {
                  file: refFile,
                  heading: refHeading,
                  lineRange: '1-200'
                }
              ]
            });
          }
        }
      }
    } catch (err: any) {
      console.error(`❌ Failed parsing file ${file}: ${err.message || String(err)}`);
    }
  }

  // Write out the flashcards JSON file
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(flashcards, null, 2));

  console.log(`✅ Flashcards compiled successfully!`);
  console.log(`- Total flashcards generated: ${flashcards.length}`);
  console.log(`- File written to: ${OUTPUT_PATH}`);
}

// Execute
generateFlashcards();
