// scripts/knowledge/merge-knowledge.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import {
  LessonKnowledgeAtom,
  SourceReference,
  CodeBlock,
  CommonMistake,
  BestPractice
} from './knowledge-schema';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ATOMS_PATH = path.join(__dirname, 'output', 'knowledge-atoms.json');
const DB_DIR = path.join(__dirname, 'knowledge-db');

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 1. Concept Taxonomy Mapping
const CONCEPT_TAXONOMY: Record<string, string[]> = {
  'Language Fundamentals': [
    '01-js-ts-variables', '02-js-ts-functions', '03-js-ts-es6', '04-js-ts-objects',
    '05-js-ts-async', '06-js-ts-dom', '07-js-ts-lite', '08-js-ts-control-flow',
    '09-js-ts-modules', '23-js-ts-ts-oop', '28-js-ts-generics'
  ],
  'Core Automation': [
    '10-first-test', '11-navigating-clicking', '12-writing-assertions', '13-running-reading', '14-break-it'
  ],
  'Locators & Assertions': [
    '15-getbyrole', '16-assertions-deep', '17-dynamic-elements', '18-strict-mode',
    '52-locators-code', '53-locators-exec', '54-locators-arch', '64-adv-assertions'
  ],
  'Test Organization & POM': [
    '19-test-org', '20-describe-blocks', '21-before-after', '22-duplication-problem',
    '24-what-are-poms', '25-first-pom', '26-multi-page', '27-refactor-exercise'
  ],
  'Fixtures & Dependency Injection': [
    '29-what-are-fixtures', '30-custom-fixtures', '31-fixture-dependencies', '32-basetest-pattern',
    '33-the-brief', '34-hints', '35-reference-solution'
  ],
  'Synchronization & Timeouts': [
    '36-auto-waiting', '37-assertions-vs-waits', '38-timeouts', '39-network-sync'
  ],
  'Enterprise Best Practices': [
    '40-onboarding', '45-quality-gates', '47-migration-guide', '62-anti-patterns', '103-adv-auth', '106-observability'
  ],
  'Advanced Browser Controls': [
    '48-js-execution-context', '49-browser-network-mechanics', '50-core-context', '51-debugging-workflow',
    '55-iframes-dialogs', '56-file-handling', '57-multi-tab', '70-clock-emulation'
  ],
  'Architecture & Design Patterns': [
    '58-arch-layers', '59-arch-interface', '60-arch-debug', '61-arch-entity'
  ],
  'Visual & Accessibility Testing': [
    '65-adv-visual', '68-accessibility'
  ],
  'Compliance & E-Signatures': [
    '72-esign-compliance', '73-esign-modal', '74-esign-exec', '75-esign-debug', '76-esign-arch'
  ],
  'API & Hybrid Testing': [
    '77-api-pyramid', '78-api-request', '79-api-hybrid', '80-api-auth', '81-api-controller', '102-api-mocking'
  ],
  'Data-Driven Engineering': [
    '82-data-logic', '83-data-iteration', '84-data-bulk', '85-data-debug', '86-data-factory'
  ],
  'AST & Framework Engineering': [
    '87-ast-concept', '88-ast-linter', '89-ast-waits', '90-ast-debug', '91-ast-gate'
  ],
  'Test Orchestration & CI/CD': [
    '98-github-actions', '99-env-mastery', '100-reporting', '101-docker-ci'
  ],
  'Interview & Portfolio Projects': [
    '92-war-room-sandbox', '93-war-room-blind', '94-capstone-brief', '95-capstone-pom', '96-capstone-exec',
    '97-capstone-audit', '108-capstone-project', '109-capstone-verify', '110-industry-banking',
    '111-industry-ecommerce', '112-industry-healthcare', '113-interview-coding', '114-interview-system-design',
    '115-interview-behavioral', '116-template-api', '117-template-hybrid', '118-template-reporting',
    '200-test-data-management', '201-network-mocking-deep-dive', '202-refactor-bloathouse', '203-failure-academy'
  ]
};

// Reverse map for lookup: lessonId -> conceptCategory
const LESSON_TO_CONCEPT: Record<string, string> = {};
Object.entries(CONCEPT_TAXONOMY).forEach(([category, lessons]) => {
  lessons.forEach(lessonId => {
    LESSON_TO_CONCEPT[lessonId] = category;
  });
});

// List of known APIs and their search patterns
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

function run() {
  console.log('🏁 Starting Knowledge Merger (Phase 2)...');

  if (!fs.existsSync(ATOMS_PATH)) {
    console.error(`❌ Source knowledge atoms not found at: ${ATOMS_PATH}`);
    process.exit(1);
  }

  const rawAtoms = JSON.parse(fs.readFileSync(ATOMS_PATH, 'utf-8'));
  const atoms: LessonKnowledgeAtom[] = rawAtoms.atoms || [];

  // Group atoms by their normalized concept category
  const groupedAtoms: Record<string, LessonKnowledgeAtom[]> = {};
  Object.keys(CONCEPT_TAXONOMY).forEach(cat => {
    groupedAtoms[cat] = [];
  });

  atoms.forEach(atom => {
    const category = LESSON_TO_CONCEPT[atom.metadata.id] || 'General';
    if (!groupedAtoms[category]) {
      groupedAtoms[category] = [];
    }
    groupedAtoms[category].push(atom);
  });

  // 1. Compile concepts.json
  const conceptsOutput = Object.entries(CONCEPT_TAXONOMY).map(([name, lessonIds]) => {
    const matchedAtoms = groupedAtoms[name] || [];
    
    // Aggregate metadata and descriptions
    const sourceLessons = matchedAtoms.map(a => ({
      id: a.metadata.id,
      title: a.metadata.title,
      group: a.metadata.group
    }));

    const headings = Array.from(new Set(matchedAtoms.flatMap(a => a.headings)));
    const references = matchedAtoms.flatMap(a => {
      const mainRef: SourceReference = {
        file: `src/app/courses/playwright/${a.metadata.url.replace('/courses/playwright/', '')}/page.mdx`,
        heading: a.headings[0] || 'Introduction',
        lineRange: '1-100'
      };
      return [mainRef];
    });

    const totalConfidence = matchedAtoms.reduce((acc, a) => acc + a.confidence, 0);
    const avgConfidence = matchedAtoms.length > 0 ? parseFloat((totalConfidence / matchedAtoms.length).toFixed(2)) : 0.90;

    // Synthesize conceptual description from outcomes
    const outcomes = matchedAtoms.map(a => a.metadata.outcome).filter(Boolean);
    const description = outcomes.length > 0
      ? `Covers ${outcomes.join(', ').toLowerCase()}`
      : `Mastery of Playwright ${name} concepts.`;

    return {
      name,
      description,
      headings,
      sourceLessons,
      confidence: avgConfidence,
      references
    };
  });

  // 2. Compile apis.json
  const apisOutput = KNOWN_APIS.map(api => {
    const matchingAtoms: string[] = [];
    const examples: CodeBlock[] = [];
    const references: SourceReference[] = [];

    atoms.forEach(atom => {
      atom.codeBlocks.forEach(cb => {
        if (api.pattern.test(cb.code)) {
          if (!matchingAtoms.includes(atom.metadata.id)) {
            matchingAtoms.push(atom.metadata.id);
          }
          examples.push(cb);
          references.push(cb.sourceReference);
        }
      });
    });

    const confidence = matchingAtoms.length > 0 ? 0.99 : 0.80;

    return {
      name: api.name,
      description: `Playwright client interface method: ${api.name}`,
      sourceLessons: matchingAtoms,
      examples: examples.slice(0, 5), // Keep top 5 unique examples
      confidence,
      references: references.slice(0, 10)
    };
  });

  // 3. Compile patterns.json
  const KNOWN_PATTERNS = [
    {
      name: 'Page Object Model (POM)',
      description: 'Encapsulates page UI details and selectors into classes to promote code reuse and simplify maintenance.',
      lessons: ['24-what-are-poms', '25-first-pom', '26-multi-page', '27-refactor-exercise']
    },
    {
      name: 'Dependency Injection (Fixtures)',
      description: 'Playwright engine fixture environment injector. Decouples test code execution setups using extends.',
      lessons: ['29-what-are-fixtures', '30-custom-fixtures', '31-fixture-dependencies', '32-basetest-pattern']
    },
    {
      name: '4-Layer Architecture',
      description: 'Strategic directory scaffolding separating tests, page objects, UI components, and data shape entities.',
      lessons: ['58-arch-layers', '59-arch-interface', '60-arch-debug', '61-arch-entity']
    },
    {
      name: 'AST Verification Quality Gates',
      description: 'Abstract Syntax Tree linter validating framework rules (e.g. banning timeouts, enforcing await checks).',
      lessons: ['87-ast-concept', '88-ast-linter', '89-ast-waits', '90-ast-debug', '91-ast-gate']
    },
    {
      name: 'MFA SMS Gateway Mocking',
      description: 'Mocking dynamic OTP authentication flows using route intercepts and mock fulfill handlers.',
      lessons: ['73-esign-modal', '110-industry-banking']
    },
    {
      name: 'Data Factory Pattern',
      description: 'Generates isolated dynamic database state payloads and handles execution data cleanups.',
      lessons: ['86-data-factory']
    }
  ];

  const patternsOutput = KNOWN_PATTERNS.map(pat => {
    const matchedAtoms = atoms.filter(a => pat.lessons.includes(a.metadata.id));
    const references = matchedAtoms.flatMap(a => 
      a.codeBlocks.map(cb => cb.sourceReference).concat(
        a.bestPractices.map(bp => bp.sourceReference)
      )
    );

    const confidence = matchedAtoms.length > 0 ? 0.99 : 0.85;

    return {
      name: pat.name,
      description: pat.description,
      sourceLessons: pat.lessons,
      confidence,
      references: references.slice(0, 10)
    };
  });

  // 4. Compile mistakes.json
  const mistakesOutput = atoms.flatMap(atom => 
    atom.commonMistakes.map(mistake => ({
      title: mistake.title,
      wrong: mistake.wrong,
      correct: mistake.correct,
      why: mistake.why,
      sourceLessons: [atom.metadata.id],
      confidence: atom.confidence,
      references: [mistake.sourceReference]
    }))
  );

  // 5. Compile examples.json
  const examplesOutput = atoms.flatMap(atom => 
    atom.codeBlocks.filter(cb => cb.isExample).map(cb => ({
      title: cb.sourceReference.heading,
      code: cb.code,
      language: cb.language,
      sourceLessons: [atom.metadata.id],
      confidence: atom.confidence,
      references: [cb.sourceReference]
    }))
  );

  // 6. Compile diagrams.json
  const diagramsOutput = atoms.flatMap(atom => 
    atom.mermaidDiagrams.map(diag => ({
      title: diag.sourceReference.heading,
      diagram: diag.diagram,
      sourceLessons: [atom.metadata.id],
      confidence: atom.confidence,
      references: [diag.sourceReference]
    }))
  );

  // 7. Compile relationships.json
  const relationshipsOutput = {
    hierarchy: Object.entries(CONCEPT_TAXONOMY).map(([category, lessons]) => ({
      parent: category,
      children: lessons
    })),
    prerequisites: [
      { concept: 'Core Automation', requires: ['Language Fundamentals'] },
      { concept: 'Locators & Assertions', requires: ['Core Automation'] },
      { concept: 'Test Organization & POM', requires: ['Locators & Assertions'] },
      { concept: 'Fixtures & Dependency Injection', requires: ['Test Organization & POM'] },
      { concept: 'Synchronization & Timeouts', requires: ['Core Automation'] },
      { concept: 'Advanced Browser Controls', requires: ['Synchronization & Timeouts'] },
      { concept: 'Architecture & Design Patterns', requires: ['Fixtures & Dependency Injection'] },
      { concept: 'Compliance & E-Signatures', requires: ['Architecture & Design Patterns'] },
      { concept: 'API & Hybrid Testing', requires: ['Core Automation'] },
      { concept: 'Data-Driven Engineering', requires: ['API & Hybrid Testing'] },
      { concept: 'AST & Framework Engineering', requires: ['Language Fundamentals', 'Architecture & Design Patterns'] },
      { concept: 'Test Orchestration & CI/CD', requires: ['Enterprise Best Practices'] }
    ]
  };

  // Write files out to knowledge-db/
  fs.writeFileSync(path.join(DB_DIR, 'concepts.json'), JSON.stringify(conceptsOutput, null, 2));
  fs.writeFileSync(path.join(DB_DIR, 'apis.json'), JSON.stringify(apisOutput, null, 2));
  fs.writeFileSync(path.join(DB_DIR, 'patterns.json'), JSON.stringify(patternsOutput, null, 2));
  fs.writeFileSync(path.join(DB_DIR, 'mistakes.json'), JSON.stringify(mistakesOutput, null, 2));
  fs.writeFileSync(path.join(DB_DIR, 'examples.json'), JSON.stringify(examplesOutput, null, 2));
  fs.writeFileSync(path.join(DB_DIR, 'diagrams.json'), JSON.stringify(diagramsOutput, null, 2));
  fs.writeFileSync(path.join(DB_DIR, 'relationships.json'), JSON.stringify(relationshipsOutput, null, 2));

  console.log(`✅ Knowledge DB compilation completed successfully under ${DB_DIR}!`);
  console.log(`- Concepts compiled: ${conceptsOutput.length}`);
  console.log(`- API references mapped: ${apisOutput.length}`);
  console.log(`- Design patterns structured: ${patternsOutput.length}`);
  console.log(`- Specific mistakes consolidated: ${mistakesOutput.length}`);
  console.log(`- Mermaid diagrams recorded: ${diagramsOutput.length}`);
}

// Execute if direct run
if (require.main === module || (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(__filename))) {
  run();
}
export { run };
