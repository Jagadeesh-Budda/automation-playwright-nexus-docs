// scripts/knowledge/extract-knowledge.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  LessonKnowledgeAtom,
  LessonMetadata,
  CodeBlock,
  BestPractice,
  CommonMistake,
  IgnoredElement,
  ExtractionOutput,
  ExtractionReport,
  ErrorLog,
  SourceReference
} from './knowledge-schema';

// Setup paths relative to the Next.js app project root (using ESNext-compliant paths)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..');
const COURSES_DIR = path.join(ROOT_DIR, 'src/app/courses/playwright');
const DATA_DIR = path.join(ROOT_DIR, 'src/data');
const MODULES_DIR = path.join(DATA_DIR, 'modules');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Clean and prepare output folder
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Predefined identifiers for generic/boilerplate structures
const GENERIC_SUMMARY_KEYWORDS = [
  'Ensures stability and scalability in the framework',
  'Prevents technical debt and flaky test runs',
  'Saves hours of debugging time in the future'
];

const GENERIC_WARNING_KEYWORDS = [
  'Brittle Implementation',
  'Missing Synchronization',
  'Hardcoding Waits',
  'Overly Broad Locators',
  'Ignoring Errors'
];

const PLACEHOLDER_SOLUTION_KEYWORDS = [
  '// Reference implementation',
  '// Always prioritize web-first assertions',
  '// Decouples data from logic'
];

function isGenericSummary(text: string): boolean {
  return GENERIC_SUMMARY_KEYWORDS.some(kw => text.includes(kw));
}

function isGenericWarning(text: string): boolean {
  return GENERIC_WARNING_KEYWORDS.some(kw => text.includes(kw));
}

function isPlaceholderSolution(code: string): boolean {
  return PLACEHOLDER_SOLUTION_KEYWORDS.some(kw => code.includes(kw));
}

// Build stage folder map (mapping lesson slug -> relative path e.g. "(01-novice)/10-first-test")
function buildFolderMap(): Record<string, string> {
  const folderMap: Record<string, string> = {};
  if (!fs.existsSync(COURSES_DIR)) return folderMap;

  function traverse(dir: string, relativePrefix: string = '') {
    const entries = fs.readdirSync(dir);
    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const isDir = fs.statSync(fullPath).isDirectory();
      if (!isDir) continue;

      if (entry.startsWith('(')) {
        // It's a stage or category group folder (e.g. (01-novice), (05-expert), (05a-expert-core))
        traverse(fullPath, relativePrefix ? `${relativePrefix}/${entry}` : entry);
      } else {
        // It's a lesson folder (e.g. 10-first-test)
        const slug = entry.replace(/^\d+-/, '');
        const relativePath = relativePrefix ? `${relativePrefix}/${entry}` : entry;
        folderMap[slug] = relativePath;
        folderMap[entry] = relativePath;
      }
    }
  }

  traverse(COURSES_DIR);
  return folderMap;
}

// Parse Markdown/MDX line range contents using a robust state-based tokenizer
function parseMdx(
  lessonId: string,
  relativePath: string,
  content: string
): {
  headings: string[];
  codeBlocks: CodeBlock[];
  mermaidDiagrams: { diagram: string; sourceReference: SourceReference }[];
  bestPractices: BestPractice[];
  commonMistakes: CommonMistake[];
  ignoredElements: IgnoredElement[];
} {
  const lines = content.split(/\r?\n/);
  
  const headings: string[] = [];
  const codeBlocks: CodeBlock[] = [];
  const mermaidDiagrams: { diagram: string; sourceReference: SourceReference }[] = [];
  const bestPractices: BestPractice[] = [];
  const commonMistakes: CommonMistake[] = [];
  const ignoredElements: IgnoredElement[] = [];

  let currentHeading = 'Introduction';
  let isCodeBlock = false;
  let codeBlockLanguage = '';
  let codeBlockLines: string[] = [];
  let codeBlockStartLine = 0;

  // For capturing blockquotes (warnings, notes, tips)
  let isBlockquote = false;
  let blockquoteLines: string[] = [];
  let blockquoteStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Handle Code Block Transitions
    if (trimmed.startsWith('```')) {
      if (!isCodeBlock) {
        // Start of code block
        isCodeBlock = true;
        codeBlockLanguage = trimmed.substring(3).trim();
        codeBlockLines = [];
        codeBlockStartLine = lineNum;
      } else {
        // End of code block
        isCodeBlock = false;
        const codeText = codeBlockLines.join('\n');
        const ref: SourceReference = {
          file: relativePath + '/page.mdx',
          heading: currentHeading,
          lineRange: `${codeBlockStartLine}-${lineNum}`
        };

        if (codeBlockLanguage.toLowerCase() === 'mermaid') {
          mermaidDiagrams.push({
            diagram: codeText,
            sourceReference: ref
          });
        } else {
          if (isPlaceholderSolution(codeText)) {
            ignoredElements.push({
              lessonId,
              type: 'placeholder-solution',
              reason: 'Boilerplate reference implementation placeholders',
              contentSnippet: codeText.substring(0, 100),
              sourceReference: ref
            });
          } else {
            // Classify as example if it is not a generic placeholder
            codeBlocks.push({
              language: codeBlockLanguage || 'typescript',
              code: codeText,
              isExample: true,
              sourceReference: ref
            });
          }
        }
      }
      continue;
    }

    if (isCodeBlock) {
      codeBlockLines.push(rawLine);
      continue;
    }

    // 2. Handle Heading Extractions
    const headingMatch = rawLine.match(/^#{1,6}\s+(.*)$/);
    if (headingMatch) {
      const hText = headingMatch[1].replace(/<[^>]+>/g, '').trim();
      // Ignore generic summary or mistakes headings if they contain boilerplate
      if (hText.toLowerCase().includes('summary') || hText.toLowerCase().includes('mistakes')) {
        currentHeading = hText;
      } else {
        currentHeading = hText;
        headings.push(hText);
      }
      continue;
    }

    // 3. Handle Blockquotes (Best Practices and Mistakes)
    if (trimmed.startsWith('>')) {
      if (!isBlockquote) {
        isBlockquote = true;
        blockquoteLines = [];
        blockquoteStartLine = lineNum;
      }
      // Remove leading '>' and trim
      const contentLine = rawLine.replace(/^>\s?/, '');
      blockquoteLines.push(contentLine);
    } else {
      if (isBlockquote) {
        // End of blockquote block
        isBlockquote = false;
        processBlockquote(
          lessonId,
          relativePath,
          blockquoteLines,
          blockquoteStartLine,
          lineNum - 1,
          currentHeading,
          bestPractices,
          commonMistakes,
          ignoredElements
        );
      }
    }

    // 4. Capture generic React component wrappers as ignored scaffolding
    if (trimmed.startsWith('<Quiz') || trimmed.startsWith('<Quiz ')) {
      ignoredElements.push({
        lessonId,
        type: 'quiz',
        reason: 'Interactive LMS assessment component wrapper',
        contentSnippet: trimmed,
        sourceReference: { file: relativePath + '/page.mdx', heading: currentHeading, lineRange: `${lineNum}-${lineNum}` }
      });
    }

    if (trimmed.startsWith('<CodeEditor') || trimmed.startsWith('<CodeEditor ')) {
      ignoredElements.push({
        lessonId,
        type: 'challenge-wrapper',
        reason: 'LMS interactive Monaco editor sandbox component',
        contentSnippet: trimmed,
        sourceReference: { file: relativePath + '/page.mdx', heading: currentHeading, lineRange: `${lineNum}-${lineNum}` }
      });
    }

    // 5. Handle generic Summary Tables as ignored scaffolding
    if (trimmed.startsWith('|') && isGenericSummary(trimmed)) {
      // Find where table ends
      let endLine = lineNum;
      while (endLine < lines.length && lines[endLine].trim().startsWith('|')) {
        endLine++;
      }
      ignoredElements.push({
        lessonId,
        type: 'generic-summary',
        reason: 'Boilerplate "What You Learned" table used to pad lesson output',
        contentSnippet: trimmed,
        sourceReference: { file: relativePath + '/page.mdx', heading: currentHeading, lineRange: `${lineNum}-${endLine}` }
      });
      // Fast-forward line counter
      i = endLine - 1;
    }
  }

  // Handle cleanup for blockquotes extending to end of file
  if (isBlockquote) {
    processBlockquote(
      lessonId,
      relativePath,
      blockquoteLines,
      blockquoteStartLine,
      lines.length,
      currentHeading,
      bestPractices,
      commonMistakes,
      ignoredElements
    );
  }

  return {
    headings,
    codeBlocks,
    mermaidDiagrams,
    bestPractices,
    commonMistakes,
    ignoredElements
  };
}

// Process a captured blockquote to classify as Best Practice or Common Mistake
function processBlockquote(
  lessonId: string,
  relativePath: string,
  lines: string[],
  startLine: number,
  endLine: number,
  heading: string,
  bestPractices: BestPractice[],
  commonMistakes: CommonMistake[],
  ignoredElements: IgnoredElement[]
) {
  const fullText = lines.join('\n').trim();
  const ref: SourceReference = {
    file: relativePath + '/page.mdx',
    heading,
    lineRange: `${startLine}-${endLine}`
  };

  // Check for AlertBox headers
  const alertHeaderMatch = fullText.match(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
  if (alertHeaderMatch) {
    const type = alertHeaderMatch[1].toUpperCase() as any;
    const bodyContent = fullText.replace(/^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i, '').trim();

    // Check if warning block is generic
    if (type === 'WARNING' && isGenericWarning(bodyContent)) {
      ignoredElements.push({
        lessonId,
        type: 'generic-warning',
        reason: 'Boilerplate Warning/Caution element repeated across multiple modules',
        contentSnippet: bodyContent.substring(0, 100),
        sourceReference: ref
      });
      return;
    }

    // Attempt to extract structured common mistake inside WARNING
    if (type === 'WARNING' && bodyContent.includes('**Wrong:**')) {
      const mistakeTitleMatch = bodyContent.match(/^\*\*Mistake\s+\d+:\s*(.*?)\*\*/i);
      const title = mistakeTitleMatch ? mistakeTitleMatch[1].trim() : 'Common Mistake';
      
      const wrongMatch = bodyContent.match(/\*\*Wrong:\*\*\s*([\s\S]*?)(?=\*\*Correct:\*\*|\*\*Why:\*\*|$)/i);
      const correctMatch = bodyContent.match(/\*\*Correct:\*\*\s*([\s\S]*?)(?=\*\*Why:\*\*|$)/i);
      const whyMatch = bodyContent.match(/\*\*Why:\*\*\s*([\s\S]*?)$/i);

      commonMistakes.push({
        title,
        wrong: wrongMatch ? wrongMatch[1].trim() : '',
        correct: correctMatch ? correctMatch[1].trim() : '',
        why: whyMatch ? whyMatch[1].trim() : bodyContent,
        sourceReference: ref
      });
    } else {
      // Treat other alerts as best practices
      bestPractices.push({
        type,
        title: heading,
        content: bodyContent,
        sourceReference: ref
      });
    }
  } else {
    // Standard markdown blockquote: extract as Best Practice NOTE
    if (!isGenericWarning(fullText)) {
      bestPractices.push({
        type: 'NOTE',
        title: heading,
        content: fullText,
        sourceReference: ref
      });
    } else {
      ignoredElements.push({
        lessonId,
        type: 'generic-warning',
        reason: 'Boilerplate standard blockquote warning',
        contentSnippet: fullText.substring(0, 100),
        sourceReference: ref
      });
    }
  }
}

// Load objectives and specs from module JSON configs (precedence merge)
function loadModuleSpecs(lessonId: string, moduleFile: string): { objectives: string[]; specConcepts: string[] } {
  const objectives: string[] = [];
  const specConcepts: string[] = [];

  const modulePath = path.join(MODULES_DIR, `${moduleFile}.json`);
  if (!fs.existsSync(modulePath)) {
    return { objectives, specConcepts };
  }

  try {
    const raw = fs.readFileSync(modulePath, 'utf-8');
    const data = JSON.parse(raw);
    const lesson = data.lessons?.find((l: any) => l.id === lessonId);
    
    if (lesson) {
      if (Array.isArray(lesson.objectives)) {
        lesson.objectives.forEach((obj: any) => {
          if (obj.title) objectives.push(obj.title);
        });
      }
      if (lesson.spec) {
        Object.entries(lesson.spec).forEach(([key, val]) => {
          if (typeof val === 'string') {
            specConcepts.push(val);
          } else if (Array.isArray(val)) {
            specConcepts.push(...val);
          }
        });
      }
    }
  } catch (err) {
    // Silent catch, script continues
  }

  return { objectives, specConcepts };
}

// Calculate extraction quality confidence based on features present vs placeholder markers
function calculateConfidence(
  codeBlocks: CodeBlock[],
  bestPractices: BestPractice[],
  commonMistakes: CommonMistake[],
  ignoredCount: number
): number {
  let score = 0.99; // Base high confidence for successful processing

  if (codeBlocks.length === 0) score -= 0.15; // Lacking code examples reduces confidence slightly
  if (bestPractices.length === 0 && commonMistakes.length === 0) score -= 0.1;

  // Significant presence of ignored boilerplate items scales down slightly
  if (ignoredCount > 5) {
    score -= 0.05;
  }

  return parseFloat(Math.max(0.5, Math.min(0.99, score)).toFixed(2));
}

// Execution Entrypoint
function run() {
  console.log('🏁 Starting Knowledge Extraction Engine (Phase 1)...');

  const metadataPath = path.join(DATA_DIR, 'metadata.json');
  if (!fs.existsSync(metadataPath)) {
    console.error(`❌ Core metadata not found at: ${metadataPath}`);
    process.exit(1);
  }

  const lessonsMetadata: any[] = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  const folderMap = buildFolderMap();

  const atoms: LessonKnowledgeAtom[] = [];
  const ignoredElements: IgnoredElement[] = [];
  const errors: ErrorLog[] = [];

  let lessonsScanned = 0;
  let lessonsExtracted = 0;

  let totalCodeBlocks = 0;
  let totalMermaidDiagrams = 0;
  let totalBestPractices = 0;
  let totalCommonMistakes = 0;
  
  let ignoredSummaryTablesCount = 0;
  let ignoredChallengeWrappersCount = 0;
  let ignoredQuizzesCount = 0;
  let ignoredGenericWarningsCount = 0;

  for (const metadata of lessonsMetadata) {
    lessonsScanned++;
    const lessonId = metadata.id;
    const slug = metadata.slug || lessonId;
    const folder = folderMap[slug] || folderMap[lessonId];

    let parsed = {
      headings: [] as string[],
      codeBlocks: [] as CodeBlock[],
      mermaidDiagrams: [] as any[],
      bestPractices: [] as BestPractice[],
      commonMistakes: [] as CommonMistake[],
      ignoredElements: [] as IgnoredElement[]
    };

    let hasMdx = false;
    let mdxPath = 'N/A';
    let relativePath = 'N/A';

    if (folder) {
      mdxPath = path.join(COURSES_DIR, folder, 'page.mdx');
      relativePath = `src/app/courses/playwright/${folder}`;

      if (fs.existsSync(mdxPath)) {
        try {
          const mdxContent = fs.readFileSync(mdxPath, 'utf-8');
          parsed = parseMdx(lessonId, relativePath, mdxContent);
          hasMdx = true;
        } catch (err: any) {
          errors.push({
            lessonId,
            filePath: mdxPath,
            error: `Failed parsing MDX: ${err.message || String(err)}`,
            stack: err.stack
          });
        }
      }
    }

    if (!hasMdx && metadata.group !== '💎 ELITE TIER: ENGINEERING') {
      errors.push({
        lessonId,
        filePath: mdxPath,
        error: `Could not map lesson slug/ID to stage directory structure or missing MDX file`
      });
      continue;
    }

    try {
      // 2. Perform metadata conflict merges
      const moduleFile = metadata.moduleFile || '';
      const { objectives, specConcepts } = loadModuleSpecs(lessonId, moduleFile);

      const conceptsSet = new Set<string>();
      if (metadata.meta?.outcome) conceptsSet.add(metadata.meta.outcome);
      objectives.forEach(obj => conceptsSet.add(obj));
      specConcepts.forEach(spec => conceptsSet.add(spec));
      
      // Seed categories and groups as concepts
      conceptsSet.add(metadata.category);
      if (metadata.title.includes(':')) {
        conceptsSet.add(metadata.title.split(':')[1].trim());
      } else {
        conceptsSet.add(metadata.title);
      }

      const concepts = Array.from(conceptsSet);

      // 3. Increment counters
      totalCodeBlocks += parsed.codeBlocks.length;
      totalMermaidDiagrams += parsed.mermaidDiagrams.length;
      totalBestPractices += parsed.bestPractices.length;
      totalCommonMistakes += parsed.commonMistakes.length;

      parsed.ignoredElements.forEach(elem => {
        ignoredElements.push(elem);
        if (elem.type === 'generic-summary') ignoredSummaryTablesCount++;
        if (elem.type === 'challenge-wrapper') ignoredChallengeWrappersCount++;
        if (elem.type === 'quiz') ignoredQuizzesCount++;
        if (elem.type === 'generic-warning') ignoredGenericWarningsCount++;
      });

      const confidence = hasMdx
        ? calculateConfidence(
            parsed.codeBlocks,
            parsed.bestPractices,
            parsed.commonMistakes,
            parsed.ignoredElements.length
          )
        : 0.90; // High confidence for JSON-only elite tasks

      const metadataFields: LessonMetadata = {
        id: lessonId,
        title: metadata.title,
        url: `/courses/playwright/${slug}`,
        group: metadata.group,
        level: metadata.level || 0,
        estimatedMinutes: metadata.estimatedMinutes || 45,
        category: metadata.category || 'core',
        outcome: metadata.meta?.outcome
      };

      // 4. Record output atom
      atoms.push({
        metadata: metadataFields,
        concepts,
        headings: parsed.headings,
        codeBlocks: parsed.codeBlocks,
        mermaidDiagrams: parsed.mermaidDiagrams,
        bestPractices: parsed.bestPractices,
        commonMistakes: parsed.commonMistakes,
        confidence
      });

      lessonsExtracted++;
    } catch (err: any) {
      errors.push({
        lessonId,
        filePath: mdxPath,
        error: `Failed to compile specs: ${err.message || String(err)}`,
        stack: err.stack
      });
    }
  }

  // Calculate metrics and write outputs
  const dateStr = new Date().toISOString();
  
  const finalOutput: ExtractionOutput = {
    version: '1.0',
    generatedAt: dateStr,
    academyVersion: 'Playwright Academy Bridge + Core v1.0',
    lessonCount: lessonsExtracted,
    atoms
  };

  const report: ExtractionReport = {
    version: '1.0',
    generatedAt: dateStr,
    lessonsScanned,
    lessonsExtracted,
    knowledgeAtomsCount: atoms.length,
    totalCodeBlocks,
    totalMermaidDiagrams,
    totalBestPractices,
    totalCommonMistakes,
    ignoredScaffolding: {
      summaryTables: ignoredSummaryTablesCount,
      challengeWrappers: ignoredChallengeWrappersCount,
      quizzes: ignoredQuizzesCount,
      genericWarnings: ignoredGenericWarningsCount
    },
    errorsCount: errors.length
  };

  // Write outputs
  fs.writeFileSync(path.join(OUTPUT_DIR, 'knowledge-atoms.json'), JSON.stringify(finalOutput, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'ignored-elements.json'), JSON.stringify(ignoredElements, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'extraction-report.json'), JSON.stringify(report, null, 2));
  fs.writeFileSync(path.join(OUTPUT_DIR, 'errors.json'), JSON.stringify(errors, null, 2));

  // Generate markdown report
  const markdownReport = `
# Knowledge Extraction Report
**Generated At:** ${dateStr}  
**Engine Version:** 1.0  
**Academy Version:** Playwright Academy Bridge + Core v1.0

## Run Statistics

| Metric | Count |
|---|---|
| Lessons Scanned | ${report.lessonsScanned} |
| Lessons Extracted Successfully | ${report.lessonsExtracted} |
| Total Knowledge Atoms | ${report.knowledgeAtomsCount} |
| Unique Code Blocks | ${report.totalCodeBlocks} |
| Mermaid Diagrams | ${report.totalMermaidDiagrams} |
| Best Practices | ${report.totalBestPractices} |
| Common Mistakes | ${report.totalCommonMistakes} |
| Errors Encountered | ${report.errorsCount} |

## Ignored Scaffolding Details

| Scaffolding Type | Ignored Count | Action Taken |
|---|---|---|
| Summary Tables | ${report.ignoredScaffolding.summaryTables} | Cataloged as ignored / omitted from atoms |
| Challenge Wrappers | ${report.ignoredScaffolding.challengeWrappers} | JSX block stripped |
| Quiz Component References | ${report.ignoredScaffolding.quizzes} | Component invocation skipped |
| Boilerplate Warnings | ${report.ignoredScaffolding.genericWarnings} | Tagged as generic warning |

## Error Log Summary
There were **${report.errorsCount}** errors during execution. Please check \`errors.json\` for the full stacks.
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'extraction-report.md'), markdownReport.trim());

  console.log(`✅ Extraction Complete!`);
  console.log(`- Atoms extracted: ${report.knowledgeAtomsCount}`);
  console.log(`- Errors: ${report.errorsCount}`);
  console.log(`- Report written to: scripts/knowledge/output/extraction-report.md`);
}

// Execute script if run directly
const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(__filename);
if (isMain) {
  run();
}
export { run };
