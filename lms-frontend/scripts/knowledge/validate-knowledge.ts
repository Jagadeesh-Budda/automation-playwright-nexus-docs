// scripts/knowledge/validate-knowledge.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..'); // Next.js project root (lms-frontend)
const DB_DIR = path.join(__dirname, 'knowledge-db');
const OUTPUT_DIR = path.join(__dirname, 'output');
const ATOMS_PATH = path.join(OUTPUT_DIR, 'knowledge-atoms.json');

// Interface for validation issues
interface ValidationIssue {
  type: 'ERROR' | 'WARNING';
  category: string;
  message: string;
  details?: string;
}

// Predefined API patterns to check
const KNOWN_APIS = [
  { name: 'page.goto()', pattern: /page\.goto/ },
  { name: 'locator.click()', pattern: /(\.click|page\.click)/ },
  { name: 'locator.fill()', pattern: /(\.fill|page\.fill)/ },
  { name: 'locator.getByRole()', pattern: /(\.getByRole|page\.getByRole)/ },
  { name: 'locator.getByLabel()', pattern: /(\.getByLabel|page\.getByLabel)/ },
  { name: 'locator.getByText()', pattern: /(\.getByText|page\.getByText)/ },
  { name: 'locator.getByTestId()', pattern: /(\.getByTestId|page\.getByTestId)/ },
  { name: 'expect()', pattern: /expect\(/ },
  { name: 'page.route()', pattern: /page\.route/ },
  { name: 'route.fulfill()', pattern: /route\.fulfill/ },
  { name: 'test.extend()', pattern: /test\.extend/ },
  { name: 'test.describe()', pattern: /test\.describe/ },
  { name: 'locator.frameLocator()', pattern: /(\.frameLocator|page\.frameLocator)/ },
  { name: 'page.on(\'dialog\')', pattern: /page\.on\(\s*['"]dialog['"]/ }
];

// Additional Playwright APIs to check for potential undocumented usage
const UNDOCUMENTED_API_CANDIDATES = [
  { name: 'page.screenshot()', pattern: /page\.screenshot/ },
  { name: 'page.evaluate()', pattern: /page\.evaluate/ },
  { name: 'page.waitForSelector()', pattern: /page\.waitForSelector/ },
  { name: 'page.waitForTimeout()', pattern: /page\.waitForTimeout/ }, // Banned anti-pattern candidate
  { name: 'page.waitForLoadState()', pattern: /page\.waitForLoadState/ },
  { name: 'locator.hover()', pattern: /(\.hover|page\.hover)/ },
  { name: 'locator.press()', pattern: /(\.press|page\.press)/ },
  { name: 'locator.selectOption()', pattern: /(\.selectOption|page\.selectOption)/ },
  { name: 'locator.setInputFiles()', pattern: /(\.setInputFiles|page\.setInputFiles)/ },
  { name: 'locator.check()', pattern: /(\.check|page\.check)/ },
  { name: 'locator.uncheck()', pattern: /(\.uncheck|page\.uncheck)/ },
  { name: 'locator.scrollIntoViewIfNeeded()', pattern: /(\.scrollIntoViewIfNeeded|page\.scrollIntoViewIfNeeded)/ },
  { name: 'locator.count()', pattern: /(\.count|page\.count)/ }
];

// Cache file line counts to prevent redundant disk reads
const fileLineCountCache: Record<string, number> = {};
function getFileLineCount(filePath: string): number {
  if (fileLineCountCache[filePath] !== undefined) {
    return fileLineCountCache[filePath];
  }
  try {
    if (!fs.existsSync(filePath)) {
      fileLineCountCache[filePath] = -1;
      return -1;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/).length;
    fileLineCountCache[filePath] = lines;
    return lines;
  } catch {
    fileLineCountCache[filePath] = -1;
    return -1;
  }
}

function runValidation() {
  console.log('🔍 Starting Phase 3: Knowledge Validation...');

  const issues: ValidationIssue[] = [];

  // Helper to load DB file
  const loadDbFile = (fileName: string): any => {
    const filePath = path.join(DB_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      issues.push({
        type: 'ERROR',
        category: 'Database Integrity',
        message: `Missing database asset file: ${fileName}`,
        details: `Expected at path: ${filePath}`
      });
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err: any) {
      issues.push({
        type: 'ERROR',
        category: 'Database Integrity',
        message: `Failed parsing JSON file: ${fileName}`,
        details: err.message || String(err)
      });
      return null;
    }
  };

  // Load raw atoms
  let rawAtomsOutput: any = null;
  if (fs.existsSync(ATOMS_PATH)) {
    try {
      rawAtomsOutput = JSON.parse(fs.readFileSync(ATOMS_PATH, 'utf-8'));
    } catch (err: any) {
      issues.push({
        type: 'ERROR',
        category: 'Database Integrity',
        message: `Failed parsing knowledge-atoms.json`,
        details: err.message || String(err)
      });
    }
  } else {
    issues.push({
      type: 'WARNING',
      category: 'Database Integrity',
      message: `Missing raw knowledge-atoms.json at ${ATOMS_PATH}`,
      details: 'Will skip checks relying on original atoms.'
    });
  }

  // Load compiled database assets
  const concepts = loadDbFile('concepts.json') || [];
  const apis = loadDbFile('apis.json') || [];
  const patterns = loadDbFile('patterns.json') || [];
  const mistakes = loadDbFile('mistakes.json') || [];
  const examples = loadDbFile('examples.json') || [];
  const diagrams = loadDbFile('diagrams.json') || [];
  const relationships = loadDbFile('relationships.json') || null;

  const atomsList = rawAtomsOutput?.atoms || [];
  const atomLessonsMap = new Map<string, any>();
  atomsList.forEach((atom: any) => {
    atomLessonsMap.set(atom.metadata.id, atom);
  });

  // Map concept names for fast lookup
  const conceptNamesSet = new Set<string>();
  concepts.forEach((c: any) => {
    if (c.name) conceptNamesSet.add(c.name);
  });

  // ----------------------------------------------------
  // 1. DUPLICATE CONCEPTS CHECK
  // ----------------------------------------------------
  const conceptNamesSeen = new Set<string>();
  const conceptNamesLowerSeen = new Set<string>();

  concepts.forEach((concept: any, index: number) => {
    const name = concept.name;
    if (!name) {
      issues.push({
        type: 'ERROR',
        category: 'Duplicate Concepts',
        message: `Concept at index ${index} is missing its name property.`
      });
      return;
    }

    // Exact name match
    if (conceptNamesSeen.has(name)) {
      issues.push({
        type: 'ERROR',
        category: 'Duplicate Concepts',
        message: `Duplicate concept name found: "${name}"`
      });
    }
    conceptNamesSeen.add(name);

    // Case-insensitive name match
    const nameLower = name.toLowerCase();
    if (conceptNamesLowerSeen.has(nameLower) && !conceptNamesSeen.has(name)) {
      issues.push({
        type: 'WARNING',
        category: 'Duplicate Concepts',
        message: `Case-insensitive concept name overlap: "${name}"`
      });
    }
    conceptNamesLowerSeen.add(nameLower);

    // Duplicate source lessons within the same concept
    const lessonIds = concept.sourceLessons?.map((sl: any) => sl.id) || [];
    const lessonIdsSeen = new Set<string>();
    lessonIds.forEach((id: string) => {
      if (lessonIdsSeen.has(id)) {
        issues.push({
          type: 'WARNING',
          category: 'Duplicate Concepts',
          message: `Concept "${name}" contains duplicate source lesson ID: "${id}"`
        });
      }
      lessonIdsSeen.add(id);
    });
  });

  // Overlap analysis: different concepts sharing > 80% of same source lessons
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const cA = concepts[i];
      const cB = concepts[j];
      if (!cA.name || !cB.name) continue;

      const lessonsA = new Set(cA.sourceLessons?.map((sl: any) => sl.id) || []);
      const lessonsB = new Set(cB.sourceLessons?.map((sl: any) => sl.id) || []);
      if (lessonsA.size === 0 || lessonsB.size === 0) continue;

      let intersectionCount = 0;
      lessonsA.forEach(id => {
        if (lessonsB.has(id)) intersectionCount++;
      });

      const smallerSize = Math.min(lessonsA.size, lessonsB.size);
      const overlapRatio = intersectionCount / smallerSize;

      if (overlapRatio > 0.8) {
        issues.push({
          type: 'WARNING',
          category: 'Duplicate Concepts',
          message: `High lesson overlap between concept "${cA.name}" and "${cB.name}"`,
          details: `Overlap: ${(overlapRatio * 100).toFixed(1)}% (${intersectionCount} shared lessons)`
        });
      }
    }
  }

  // ----------------------------------------------------
  // 2. MISSING DEFINITIONS CHECK
  // ----------------------------------------------------
  // Concepts
  concepts.forEach((c: any) => {
    if (!c.description || c.description.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Concept "${c.name}" has an empty description.`
      });
    } else if (c.description === `Mastery of Playwright ${c.name} concepts.`) {
      issues.push({
        type: 'WARNING',
        category: 'Missing Definitions',
        message: `Concept "${c.name}" uses default boilerplate description.`,
        details: `Fallback string matches: "Mastery of Playwright ${c.name} concepts."`
      });
    }

    if (!c.headings || c.headings.length === 0) {
      issues.push({
        type: 'WARNING',
        category: 'Missing Definitions',
        message: `Concept "${c.name}" has no registered headings.`
      });
    }
  });

  // APIs
  apis.forEach((api: any) => {
    if (!api.description || api.description.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `API method "${api.name}" has an empty description.`
      });
    } else if (api.description === `Playwright client interface method: ${api.name}`) {
      issues.push({
        type: 'WARNING',
        category: 'Missing Definitions',
        message: `API "${api.name}" uses default boilerplate description.`
      });
    }

    if (!api.sourceLessons || api.sourceLessons.length === 0) {
      issues.push({
        type: 'WARNING',
        category: 'Missing Definitions',
        message: `API method "${api.name}" is not referenced by any source lessons.`
      });
    }
  });

  // Patterns
  patterns.forEach((pat: any) => {
    if (!pat.description || pat.description.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Pattern "${pat.name}" has an empty description.`
      });
    }
  });

  // Mistakes
  mistakes.forEach((m: any, idx: number) => {
    const mistakeName = m.title || `Mistake #${idx}`;
    if (!m.title || m.title.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Common mistake at index ${idx} is missing its title.`
      });
    }
    if (!m.wrong || m.wrong.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Mistake "${mistakeName}" is missing its "wrong" implementation example.`
      });
    }
    if (!m.correct || m.correct.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Mistake "${mistakeName}" is missing its "correct" implementation example.`
      });
    }
    if (!m.why || m.why.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Mistake "${mistakeName}" is missing its "why" explanation.`
      });
    }
  });

  // Examples
  examples.forEach((ex: any, idx: number) => {
    const label = ex.title || `Example #${idx}`;
    if (!ex.title || ex.title.trim() === '') {
      issues.push({
        type: 'WARNING',
        category: 'Missing Definitions',
        message: `Example at index ${idx} is missing a title.`
      });
    }
    if (!ex.code || ex.code.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Example "${label}" contains empty code contents.`
      });
    }
  });

  // Diagrams
  diagrams.forEach((diag: any, idx: number) => {
    const label = diag.title || `Diagram #${idx}`;
    if (!diag.diagram || diag.diagram.trim() === '') {
      issues.push({
        type: 'ERROR',
        category: 'Missing Definitions',
        message: `Mermaid diagram "${label}" contains empty diagram text.`
      });
    }
  });

  // ----------------------------------------------------
  // 3. ORPHAN EXAMPLES CHECK
  // ----------------------------------------------------
  // Build a map of which lesson IDs are mapped under concepts
  const conceptLessonIds = new Set<string>();
  concepts.forEach((c: any) => {
    c.sourceLessons?.forEach((sl: any) => {
      conceptLessonIds.add(sl.id);
    });
  });

  // Build a map of API example code snippets to check direct mapping
  const apiExampleCodes = new Set<string>();
  apis.forEach((api: any) => {
    api.examples?.forEach((ex: any) => {
      apiExampleCodes.add(ex.code);
    });
  });

  examples.forEach((ex: any, idx: number) => {
    const title = ex.title || `Example #${idx}`;
    const sourceLessons = ex.sourceLessons || [];

    if (sourceLessons.length === 0) {
      issues.push({
        type: 'WARNING',
        category: 'Orphan Examples',
        message: `Example "${title}" has no associated source lessons.`
      });
      return;
    }

    // Check if the lesson belongs to any concept
    const isCategorized = sourceLessons.some((id: string) => conceptLessonIds.has(id));
    if (!isCategorized) {
      issues.push({
        type: 'WARNING',
        category: 'Orphan Examples',
        message: `Example "${title}" belongs to lessons (${sourceLessons.join(', ')}) that are not categorized in any concept.`
      });
    }

    // Check if associated with an API (either code is registered or matches known patterns)
    const isApiRelated = apiExampleCodes.has(ex.code) || KNOWN_APIS.some(api => api.pattern.test(ex.code));
    if (!isApiRelated) {
      issues.push({
        type: 'WARNING',
        category: 'Orphan Examples',
        message: `Example "${title}" is not linked to any API in apis.json and matches no known core API patterns.`,
        details: `Code: ${ex.code.substring(0, 80).replace(/\n/g, ' ')}...`
      });
    }
  });

  // ----------------------------------------------------
  // 4. INVALID REFERENCES CHECK
  // ----------------------------------------------------
  const validateSourceReference = (ref: any, contextName: string) => {
    if (!ref || typeof ref !== 'object') return;

    const file = ref.file;
    const lineRange = ref.lineRange;

    if (!file || typeof file !== 'string') {
      issues.push({
        type: 'ERROR',
        category: 'Invalid References',
        message: `Reference in "${contextName}" is missing a valid file path.`
      });
      return;
    }

    // Resolve file relative to project root
    const fullPath = path.join(ROOT_DIR, file);
    if (!fs.existsSync(fullPath)) {
      issues.push({
        type: 'ERROR',
        category: 'Invalid References',
        message: `File path does not exist on disk: "${file}"`,
        details: `Referenced by: ${contextName}`
      });
      return;
    }

    // Validate line range format and bounds
    if (!lineRange || typeof lineRange !== 'string') {
      issues.push({
        type: 'WARNING',
        category: 'Invalid References',
        message: `Reference to file "${file}" is missing lineRange.`,
        details: `Referenced by: ${contextName}`
      });
      return;
    }

    const rangeRegex = /^(\d+)-(\d+)$/;
    const singleRegex = /^(\d+)$/;
    const fileLineCount = getFileLineCount(fullPath);

    if (rangeRegex.test(lineRange)) {
      const match = lineRange.match(rangeRegex);
      if (match) {
        const start = parseInt(match[1], 10);
        const end = parseInt(match[2], 10);

        if (start <= 0 || end <= 0) {
          issues.push({
            type: 'ERROR',
            category: 'Invalid References',
            message: `Line range "${lineRange}" contains invalid line numbers in file "${file}".`,
            details: `Referenced by: ${contextName}`
          });
        } else if (start > end) {
          issues.push({
            type: 'ERROR',
            category: 'Invalid References',
            message: `Start line ${start} is greater than end line ${end} in range "${lineRange}" for file "${file}".`,
            details: `Referenced by: ${contextName}`
          });
        } else if (fileLineCount > 0 && (start > fileLineCount || end > fileLineCount)) {
          issues.push({
            type: 'ERROR',
            category: 'Invalid References',
            message: `Line range "${lineRange}" is out of bounds for file "${file}" (contains ${fileLineCount} lines).`,
            details: `Referenced by: ${contextName}`
          });
        }
      }
    } else if (singleRegex.test(lineRange)) {
      const match = lineRange.match(singleRegex);
      if (match) {
        const lineNum = parseInt(match[1], 10);
        if (lineNum <= 0) {
          issues.push({
            type: 'ERROR',
            category: 'Invalid References',
            message: `Line number ${lineNum} is invalid in file "${file}".`,
            details: `Referenced by: ${contextName}`
          });
        } else if (fileLineCount > 0 && lineNum > fileLineCount) {
          issues.push({
            type: 'ERROR',
            category: 'Invalid References',
            message: `Line number ${lineNum} is out of bounds for file "${file}" (contains ${fileLineCount} lines).`,
            details: `Referenced by: ${contextName}`
          });
        }
      }
    } else {
      issues.push({
        type: 'ERROR',
        category: 'Invalid References',
        message: `Line range "${lineRange}" has invalid format in file "${file}".`,
        details: `Expected format: "start-end" or "lineNum". Referenced by: ${contextName}`
      });
    }
  };

  // Run validation on all references
  concepts.forEach((c: any) => {
    c.references?.forEach((ref: any, idx: number) => {
      validateSourceReference(ref, `Concept "${c.name}" Reference #${idx}`);
    });
  });

  apis.forEach((api: any) => {
    api.references?.forEach((ref: any, idx: number) => {
      validateSourceReference(ref, `API "${api.name}" Reference #${idx}`);
    });
    api.examples?.forEach((ex: any, idx: number) => {
      validateSourceReference(ex.sourceReference, `API "${api.name}" Example #${idx}`);
    });
  });

  patterns.forEach((pat: any) => {
    pat.references?.forEach((ref: any, idx: number) => {
      validateSourceReference(ref, `Pattern "${pat.name}" Reference #${idx}`);
    });
  });

  mistakes.forEach((m: any) => {
    m.references?.forEach((ref: any, idx: number) => {
      validateSourceReference(ref, `Common Mistake "${m.title}" Reference #${idx}`);
    });
  });

  examples.forEach((ex: any) => {
    ex.references?.forEach((ref: any, idx: number) => {
      validateSourceReference(ref, `Example "${ex.title}" Reference #${idx}`);
    });
  });

  diagrams.forEach((diag: any) => {
    diag.references?.forEach((ref: any, idx: number) => {
      validateSourceReference(ref, `Mermaid Diagram "${diag.title}" Reference #${idx}`);
    });
  });


  // ----------------------------------------------------
  // 5. BROKEN RELATIONSHIPS CHECK
  // ----------------------------------------------------
  if (relationships) {
    // 5a. Validate Hierarchy
    const hierarchy = relationships.hierarchy || [];
    hierarchy.forEach((group: any, idx: number) => {
      const parent = group.parent;
      if (!parent) {
        issues.push({
          type: 'ERROR',
          category: 'Broken Relationships',
          message: `Hierarchy category at index ${idx} is missing its parent name.`
        });
        return;
      }

      // Check if parent corresponds to a valid concept
      if (!conceptNamesSet.has(parent)) {
        issues.push({
          type: 'ERROR',
          category: 'Broken Relationships',
          message: `Hierarchy parent "${parent}" does not exist in concepts.json`
        });
      }

      // Check if all children (lessons) exist
      const children = group.children || [];
      children.forEach((childId: string) => {
        if (!atomLessonsMap.has(childId)) {
          issues.push({
            type: 'WARNING',
            category: 'Broken Relationships',
            message: `Hierarchy parent "${parent}" lists missing child lesson ID: "${childId}"`,
            details: 'Lesson is not found in knowledge-atoms.json metadata.'
          });
        }
      });
    });

    // 5b. Validate Prerequisites
    const prerequisites = relationships.prerequisites || [];
    prerequisites.forEach((prereq: any, idx: number) => {
      const concept = prereq.concept;
      if (!concept) {
        issues.push({
          type: 'ERROR',
          category: 'Broken Relationships',
          message: `Prerequisite definition at index ${idx} is missing its concept name.`
        });
        return;
      }

      if (!conceptNamesSet.has(concept)) {
        issues.push({
          type: 'ERROR',
          category: 'Broken Relationships',
          message: `Prerequisite source concept "${concept}" does not exist in concepts.json`
        });
      }

      const requires = prereq.requires || [];
      requires.forEach((reqConcept: string) => {
        if (!conceptNamesSet.has(reqConcept)) {
          issues.push({
            type: 'ERROR',
            category: 'Broken Relationships',
            message: `Concept "${concept}" requires non-existent prerequisite concept: "${reqConcept}"`
          });
        }
      });
    });
  } else {
    issues.push({
      type: 'ERROR',
      category: 'Broken Relationships',
      message: 'Skipping relationships validation due to missing relationships.json file.'
    });
  }

  // ----------------------------------------------------
  // 6. MISSING APIS CHECK
  // ----------------------------------------------------
  // Scan all raw atom code blocks for matches against KNOWN_APIS
  atomsList.forEach((atom: any) => {
    const lessonId = atom.metadata.id;
    atom.codeBlocks?.forEach((cb: any) => {
      KNOWN_APIS.forEach(api => {
        if (api.pattern.test(cb.code)) {
          // Look up this API in apis.json
          const matchedApiObj = apis.find((a: any) => a.name === api.name);
          if (!matchedApiObj) {
            issues.push({
              type: 'WARNING',
              category: 'Missing APIs',
              message: `Core API pattern "${api.name}" detected in lesson "${lessonId}" but is not registered in apis.json`
            });
          } else {
            // Confirm lesson ID is cataloged in api's sourceLessons
            const sourceLessons = matchedApiObj.sourceLessons || [];
            if (!sourceLessons.includes(lessonId)) {
              issues.push({
                type: 'WARNING',
                category: 'Missing APIs',
                message: `Lesson "${lessonId}" uses API "${api.name}" but is not registered in its sourceLessons list.`,
                details: `Code: ${cb.code.substring(0, 80).replace(/\n/g, ' ')}...`
              });
            }
          }
        }
      });
    });
  });

  // Scan all example files for potential undocumented Playwright APIs
  const undocumentedHitsMap = new Map<string, Set<string>>();
  atomsList.forEach((atom: any) => {
    const lessonId = atom.metadata.id;
    atom.codeBlocks?.forEach((cb: any) => {
      UNDOCUMENTED_API_CANDIDATES.forEach(cand => {
        if (cand.pattern.test(cb.code)) {
          // Check if this api is in apis.json
          const existsInDb = apis.some((a: any) => a.name.toLowerCase().includes(cand.name.split('(')[0].toLowerCase()));
          if (!existsInDb) {
            if (!undocumentedHitsMap.has(cand.name)) {
              undocumentedHitsMap.set(cand.name, new Set<string>());
            }
            undocumentedHitsMap.get(cand.name)!.add(lessonId);
          }
        }
      });
    });
  });

  undocumentedHitsMap.forEach((lessons, apiName) => {
    const lessonList = Array.from(lessons);
    issues.push({
      type: 'WARNING',
      category: 'Missing APIs',
      message: `Undocumented API candidate detected: "${apiName}" in lessons: [${lessonList.join(', ')}]`,
      details: 'This Playwright interface is used in code blocks but is not represented in apis.json.'
    });
  });

  // ----------------------------------------------------
  // GENERATE VALIDATION REPORT
  // ----------------------------------------------------
  const errors = issues.filter(i => i.type === 'ERROR');
  const warnings = issues.filter(i => i.type === 'WARNING');

  const reportDate = new Date().toISOString();
  
  // Group issues by category for clean report layout
  const categories = Array.from(new Set(issues.map(i => i.category)));
  let categorySections = '';
  
  categories.forEach(cat => {
    const catIssues = issues.filter(i => i.category === cat);
    if (catIssues.length === 0) return;

    categorySections += `\n### ${cat}\n\n`;
    catIssues.forEach(issue => {
      const emoji = issue.type === 'ERROR' ? '❌' : '⚠️';
      categorySections += `- **${emoji} [${issue.type}]** ${issue.message}\n`;
      if (issue.details) {
        categorySections += `  *Details:* ${issue.details}\n`;
      }
    });
  });

  const markdownReport = `
# Playwright Academy Knowledge Validation Report

**Generated At:** ${reportDate}  
**Validator Version:** 1.0  
**Overall Status:** ${errors.length > 0 ? 'FAILED ❌' : 'PASSED ⚠️ (with warnings)'}

## Summary Table

| Metric | Count | Status |
|---|---|---|
| **Critical Errors** | ${errors.length} | ${errors.length === 0 ? '✅ Clear' : '❌ Action Required'} |
| **Warnings** | ${warnings.length} | ${warnings.length === 0 ? '✅ Clear' : '⚠️ Review Recommended'} |
| **Concepts Validated** | ${concepts.length} | - |
| **APIs Validated** | ${apis.length} | - |
| **Patterns Validated** | ${patterns.length} | - |
| **Mistakes Validated** | ${mistakes.length} | - |
| **Examples Validated** | ${examples.length} | - |
| **Diagrams Validated** | ${diagrams.length} | - |

---

## Detailed Findings
${categorySections || '\nNo issues found! Database is fully consistent. 🎉\n'}

---

## Recommended Action Plan

${errors.length > 0 ? `### Critical Fixes Needed
Please resolve all **${errors.length} Critical Errors** reported above. Pay particular attention to:
1. Missing DB files or parsing problems.
2. Invalid file references where paths are broken or line ranges are out of bounds on disk.
3. Broken prerequisites and parent/child mappings in relationships.
4. Blank definitions/descriptions across concepts, mistakes, and examples.` : ''}

### Warning Remediations
1. **Default Boilerplates**: Replace generic outcome/description fallbacks with custom written text.
2. **Missing API Registrations**: Cross-reference the reported missing source lessons in \`apis.json\` to maintain complete API usage mappings.
3. **Undocumented API Candidates**: Consider registering candidates like \`${Array.from(undocumentedHitsMap.keys()).join(', ') || 'N/A'}\` inside the \`KNOWN_APIS\` list in \`merge-knowledge.ts\` if they are vital to the curriculum.
`;

  // Write markdown report out
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  const reportPath = path.join(OUTPUT_DIR, 'validation-report.md');
  fs.writeFileSync(reportPath, markdownReport.trim());

  console.log(`\n🏁 Validation Complete!`);
  console.log(`- Errors: ${errors.length}`);
  console.log(`- Warnings: ${warnings.length}`);
  console.log(`- Report written to: scripts/knowledge/output/validation-report.md\n`);
}

// Execute if run directly
if (require.main === module || (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(__filename))) {
  runValidation();
}
export { runValidation };
