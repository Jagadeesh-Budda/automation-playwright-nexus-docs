// scripts/knowledge/export-handbook.ts

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { chromium } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '../..'); // lms-frontend
const WORKSPACE_ROOT = path.resolve(ROOT_DIR, '..'); // UIAutomation/ui-automation/docs
const HANDBOOK_DIR = path.join(WORKSPACE_ROOT, 'handbook');
const OUTPUT_PDF_PATH = path.join(WORKSPACE_ROOT, 'handbook.pdf');
const TEMP_HTML_PATH = path.join(ROOT_DIR, 'scripts/knowledge/temp_handbook.html');

// Phase mapping metadata
interface PhaseInfo {
  name: string;
  class: string;
  colorHex: string;
}

function getPhaseInfo(filename: string): PhaseInfo {
  if (filename.startsWith('00')) {
    return { name: 'Phase 0 – Prerequisites', class: 'phase-prereqs', colorHex: '#3b82f6' }; // Blue
  }
  const num = parseInt(filename.split('-')[0]);
  if (num >= 1 && num <= 3) {
    return { name: 'JavaScript for Automation', class: 'phase-js', colorHex: '#10b981' }; // Green
  }
  if (num === 4) {
    return { name: 'TypeScript for Automation', class: 'phase-ts', colorHex: '#8b5cf6' }; // Purple
  }
  if (num >= 5 && num <= 9) {
    return { name: 'Playwright Basics', class: 'phase-basics', colorHex: '#06b6d4' }; // Cyan
  }
  if (num >= 10 && num <= 16) {
    return { name: 'Advanced Playwright', class: 'phase-advanced', colorHex: '#f97316' }; // Orange
  }
  if (num >= 17 && num <= 20) {
    return { name: 'Framework Design', class: 'phase-framework', colorHex: '#eab308' }; // Gold
  }
  if (num >= 21 && num <= 24) {
    return { name: 'CI/CD & Enterprise', class: 'phase-cicd', colorHex: '#4b5563' }; // Dark Gray
  }
  if (num >= 25 && num <= 26) {
    return { name: 'API Testing', class: 'phase-api', colorHex: '#ef4444' }; // Red
  }
  if (num >= 27 && num <= 30) {
    return { name: 'CI/CD Pipelines', class: 'phase-cicd', colorHex: '#374151' }; // Dark Gray
  }
  return { name: 'Interview Prep', class: 'phase-interview', colorHex: '#ec4899' }; // Pink
}

// 40 Chapters Mermaid Diagrams Mapping
const MERMAID_DIAGRAMS: Record<string, string> = {
  '00a-terminal-basics.md': `flowchart TD
  User([You typing commands]) --> Terminal[Terminal / PowerShell / Bash]
  Terminal --> OS[Operating System executes command]
  style User fill:#eff6ff,stroke:#3b82f6,stroke-width:2px
  style Terminal fill:#faf5ff,stroke:#a855f7,stroke-width:2px
  style OS fill:#f0fdf4,stroke:#22c55e,stroke-width:2px`,

  '00b-install-nodejs.md': `flowchart TD
  DL[nodejs.org] --> Installer[Download LTS Installer] --> Setup[Run Setup] --> Terminal[node & npm available in terminal]
  style DL fill:#f0fdf4,stroke:#22c55e
  style Terminal fill:#eff6ff,stroke:#3b82f6`,

  '00c-first-program.md': `flowchart LR
  Create[Create File] --> Write[Write Code] --> Run[Run with node] --> Output[See Output] --> Edit[Edit & Repeat]
  style Edit stroke-dasharray: 5 5`,

  '00d-variables-controlflow.md': `flowchart TD
  Vars[Store Data: let / const] --> Cond{Condition check}
  Cond -->|If True| ActionA[Execute Action A]
  Cond -->|If False| ActionB[Execute Action B]
  ActionA & ActionB --> Loop[Repeat: for loop]`,

  '00e-objects-arrays.md': `flowchart LR
  Obj[Object: key-value pairs] --> Prop[Named properties]
  Arr[Array: ordered list] --> Index[Indexed elements]
  style Obj fill:#eef2ff,stroke:#6366f1
  style Arr fill:#f0fdf4,stroke:#10b981`,

  '00f-functions-modules.md': `flowchart LR
  subgraph helpers.js
    A[export function login]
  end
  subgraph test.js
    B[import { login }]
  end
  A -->|Import| B
  style helpers.js fill:#f8fafc,stroke:#cbd5e1
  style test.js fill:#f8fafc,stroke:#cbd5e1`,

  '00g-errors-debugging.md': `flowchart TD
  Err[Error Occurred] --> Read[Read Error Type & Message] --> Loc[Read File & Line Number] --> Fix[Fix & Re-run]`,

  '00h-first-playwright-test.md': `flowchart TD
  Install[Install Playwright] --> Write[Write spec.ts] --> Run[Run npx playwright test] --> Open[Browser Opens] --> Finish[Test passes / fails]`,

  '01-language-scoping.md': `flowchart TD
  Global[Global Scope] --> Block[Block Scope: const / let]
  Global --> Function[Function Scope: var]
  style Block fill:#f0fdf4,stroke:#10b981
  style Function fill:#fff1f2,stroke:#f43f5e`,

  '02-closures-callbacks.md': `flowchart TD
  Parent[Parent Function Scope] --> Child[Child Function Scope] --> Callback[Callback Execution]
  style Parent fill:#eff6ff,stroke:#3b82f6
  style Child fill:#f5f3ff,stroke:#8b5cf6`,

  '03-async-promises.md': `flowchart TD
  subgraph Node.js Process
    Stack[Call Stack] --> EventLoop[Event Loop] --> Queue[Microtask Queue]
  end
  subgraph Browser Process
    CDP[CDP WebSocket Connection]
  end
  Stack -->|Send Command| CDP
  CDP -->|Resolve Promise| Queue`,

  '04-typescript-types.md': `flowchart LR
  Input[Raw Input: unknown] --> Guard{Type Guard} -->|Success| Typed[Typed Output: T]
  Guard -->|Failure| Error[Runtime Error]`,

  '05-installation-architecture.md': `flowchart TD
  Runner[Test Runner] -->|BrowserContext| Browser[Browser Instance] -->|Page| Page[Tab / Page]
  style Runner fill:#f5f3ff,stroke:#8b5cf6
  style Browser fill:#eff6ff,stroke:#3b82f6
  style Page fill:#f0fdf4,stroke:#10b981`,

  '06-navigation-actions.md': `flowchart TD
  Goto[page.goto] --> Load[Wait for LoadState] --> Fill[locator.fill] --> Click[locator.click]`,

  '07-locators-deep.md': `flowchart TD
  Code[Test Code] -->|Locator Created| Lazy[Lazy Evaluation]
  Action[Action Executed] -->|Trigger DOM Query| Search[DOM Search & Retry]
  Lazy --> Action --> Search`,

  '08-assertions-webfirst.md': `flowchart TD
  Assert[Expect Assertion] --> Query[Query Element State] --> Match{State Matches?}
  Match -->|Yes| Pass[Pass]
  Match -->|No & Timeout?| Fail[Fail]
  Match -->|No & Retrying| Query`,

  '09-test-organization.md': `flowchart TD
  All[beforeAll] --> Each[beforeEach] --> Test[test] --> After[afterEach] --> End[afterAll]`,

  '10-autowait-internals.md': `flowchart TD
  Action[Action Called] --> Attached? --> Visible? --> Stable? --> Enabled? --> Editable? --> Execute
  style Stable? fill:#fffbeb,stroke:#eab308
  style Execute fill:#f0fdf4,stroke:#10b981`,

  '11-trace-viewer.md': `flowchart TD
  Run[Test Run] -->|Zip Archive| Trace[trace.zip] -->|npx playwright show-trace| UI[Trace Viewer UI]`,

  '12-debugging-workflows.md': `flowchart LR
  VS[VS Code Extension] --> Tool[Debug Tool] --> Break[Breakpoints] --> Step[Step Over / Into]`,

  '13-storage-state.md': `flowchart TD
  Auth[Setup Auth] -->|Save State| File[storageState.json] -->|Inject| Context[New BrowserContext] --> Test[Authenticated Test]
  style File fill:#fff7ed,stroke:#f97316`,

  '14-network-interception.md': `flowchart TD
  Page[Page Request] -->|Intercept| Route[page.route] -->|Mock Fulfill| Client[Mock Response]
  style Route fill:#fef2f2,stroke:#ef4444`,

  '15-iframes-tabs.md': `flowchart TD
  Page[Main Page] -->|frameLocator| Frame[IFrame Context]
  Page -->|waitForEvent| Popup[New Tab / Popup Context]`,

  '16-emulation-settings.md': `flowchart LR
  Config[playwright.config] -->|Emulate| Context[Context: Locale / Timezone / Viewport]`,

  '17-pom-design.md': `flowchart TD
  PageObject[Page Object Class] -->|Properties| Locators[Readonly Locators]
  PageObject -->|Methods| Workflows[Async Action Workflows]
  style Locators fill:#f8fafc,stroke:#cbd5e1`,

  '18-component-encapsulation.md': `flowchart TD
  Page[Page Object] -->|Composed of| Header[Header Component]
  Page -->|Composed of| Sidebar[Sidebar Component]`,

  '19-fixtures-di.md': `flowchart LR
  Base[base.extend] -->|Inject| POM[Page Objects] -->|Use| Spec[Test Spec]`,

  '20-architecture-topology.md': `flowchart TD
  L1[Layer 1: Test Specs] --> L2[Layer 2: Page Objects] --> L3[Layer 3: UI Components] --> L4[Layer 4: Data Models]
  style L1 fill:#eef2ff,stroke:#6366f1
  style L4 fill:#f0fdf4,stroke:#10b981`,

  '21-test-runner.md': `flowchart TD
  Runner[Runner] --> Worker1[Worker 1: Context 1] & Worker2[Worker 2: Context 2]`,

  '22-flaky-troubleshooting.md': `flowchart TD
  Fail[Test Failed] --> Retry[Retry Triggered] --> Success{Pass on retry?}
  Success -->|Yes| Flaky[Mark Flaky]
  Success -->|No| Failed[Mark Failed]`,

  '23-onboarding-transition.md': `flowchart TD
  Commit[Git Commit] --> Hook[Pre-commit hook] --> AST[AST Linter: check waitForTimeout] --> Build[CI Build]`,

  '24-test-data.md': `flowchart TD
  Pool[Connection Pool] --> Client[Checkout Client] --> BEGIN[BEGIN Transaction] --> Test[Test Run] --> ROLLBACK[ROLLBACK & Release]`,

  '25-api-request.md': `flowchart LR
  Request[request fixture] -->|HTTP POST| API[API Server] -->|JSON| Validate[Assert Status]`,

  '26-hybrid-topologies.md': `flowchart TD
  API[Login API] --> Token[Auth Token] --> Cookie[Inject Context Cookie] --> UI[Navigate Directly]`,

  '27-reporting-ecosystem.md': `flowchart TD
  Run[Run Finished] --> HTML[HTML Report] & JUnit[JUnit XML]`,

  '28-docker-execution.md': `flowchart LR
  Local[Local Workspace] -->|Mount Volume| Docker[Docker Container: Playwright Image] -->|Match Fonts| Baseline[Visual Test]`,

  '29-github-actions.md': `flowchart TD
  Push[Git Push] --> GHA[GitHub Actions] --> Install[npm ci & browsers] --> Test[npx playwright test]`,

  '30-jenkins-azure.md': `flowchart TD
  Build[Build Trigger] --> Vault[Bind Credentials] --> Exec[Playwright Test] --> Publish[Publish JUnit XML]`,

  '31-system-design.md': `flowchart TD
  PR[PR Trigger] --> CI[CI Runner] --> Seed[DB Seed API] & Mocks[Interceptions] & Test[Execution]`,

  '32-coding-challenges.md': `flowchart TD
  Table[Read Table Rows] --> Map[Map text to numbers] --> Check[Verify sorting order]`
};

async function exportHandbook() {
  console.log('🏁 Starting PDF Export Pipeline with Premium Aesthetics...');

  if (!fs.existsSync(HANDBOOK_DIR)) {
    console.error(`❌ Handbook directory not found at: ${HANDBOOK_DIR}`);
    process.exit(1);
  }

  // 1. Read and sort all chapter files
  const files = fs.readdirSync(HANDBOOK_DIR)
    .filter(file => file.endsWith('.spec.ts') === false && file.endsWith('.md'))
    .sort();

  console.log(`- Found ${files.length} chapters to compile`);

  let fullMarkdown = '';

  files.forEach((file, index) => {
    const filePath = path.join(HANDBOOK_DIR, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const chNum = String(index + 1).padStart(2, '0');
    const phaseInfo = getPhaseInfo(file);

    // 1. Swap ASCII diagrams for clean vector Mermaid code
    const baseName = file;
    const mermaidCode = MERMAID_DIAGRAMS[baseName];
    if (mermaidCode) {
      content = content.replace(/### Execution Flow Diagram[\s\S]*?```[\s\S]*?```/, `### Execution Flow Diagram\n\`\`\`mermaid\n${mermaidCode}\n\`\`\``);
    }

    // 2. Parse metadata out of the Markdown file to build the Chapter Cover Page
    const titleMatch = content.match(/# Chapter \d+: (.*)/);
    const title = titleMatch ? titleMatch[1].trim() : 'Title';
    
    const difficultyMatch = content.match(/\* \*\*Difficulty Level\*\*:\s*(.*)/i);
    const difficulty = difficultyMatch ? difficultyMatch[1].trim() : 'Beginner';
    
    const timeMatch = content.match(/\* \*\*Estimated Reading Time\*\*:\s*(.*)/i);
    const time = timeMatch ? timeMatch[1].trim() : '15 mins';

    const objectivesMatch = content.match(/\* \*\*Learning Objectives\*\*:\s*([\s\S]*?)(?=\* \*\*Prerequisites\*\*)/i);
    const objectivesRaw = objectivesMatch ? objectivesMatch[1] : '';
    const objectives = objectivesRaw
      .split('\n')
      .map(l => l.replace(/^\s*-\s*/, '').trim())
      .filter(Boolean);

    // Remove raw metadata block from markdown since we'll render it in the cover page
    content = content.replace(/## Metadata[\s\S]*?(?=## 1\. Why This Matters)/i, '');
    content = content.replace(/# Chapter \d+: (.*)/, ''); // Remove the raw H1 title

    // Calculate progress
    const progress = Math.round(((index + 1) / files.length) * 100);

    // Build the Chapter Cover Page HTML
    const coverPageHtml = `
<div class="chapter-cover-container page-break-after">
  <div class="cover-phase-tag">${phaseInfo.name}</div>
  <div class="cover-number-badge">CHAPTER ${chNum}</div>
  <h2 class="cover-chapter-title">${title}</h2>
  
  <div class="cover-meta-grid">
    <div class="meta-item">⏱️ ${time} Reading</div>
    <div class="meta-item">⭐ ${difficulty} Level</div>
  </div>
  
  <div class="cover-skills-card">
    <div class="card-header">🎯 What You'll Master</div>
    <ul class="skills-list">
      ${objectives.map(obj => `<li>✓ ${obj}</li>`).join('')}
    </ul>
  </div>
</div>
    `;

    // Build progress tracker html
    const progressTrackerHtml = `
<div class="chapter-progress-tracker-card">
  <div class="progress-bar-container">
    <div class="progress-bar-bg">
      <div class="progress-bar-fill" style="width: ${progress}%; background-color: ${phaseInfo.colorHex};"></div>
    </div>
  </div>
  <div class="progress-metadata">
    <span class="progress-label">✓ Completed Chapter ${chNum} / ${files.length}</span>
    <span class="progress-percentage">${progress}%</span>
  </div>
  <div class="progress-phase">${phaseInfo.name}</div>
</div>
    `;

    // Assemble the full chapter markup
    fullMarkdown += `\n\n<div class="chapter-container ${phaseInfo.class}">\n\n`;
    fullMarkdown += coverPageHtml;
    // Add clean styled heading
    fullMarkdown += `\n\n# 📘 CHAPTER ${index + 1} &nbsp;&bull;&nbsp; ${title}\n\n`;
    fullMarkdown += content;
    fullMarkdown += progressTrackerHtml;
    fullMarkdown += `\n\n</div>\n`;
  });

  // 2. Generate styled HTML Template containing the markdown payload
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Playwright Academy Handbook</title>
  <!-- Load Marked, Tailwind CSS and Prism.js for Syntax Highlighting -->
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;900&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet" />
  <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.css" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-typescript.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-groovy.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-yaml.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-bash.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
  
  <!-- Load Mermaid for diagrams -->
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
    }

    body {
      font-family: 'Outfit', system-ui, -apple-system, sans-serif;
      color: #1e293b;
      line-height: 1.625;
      background-color: #ffffff;
    }
    
    /* Cover Page styling */
    .cover-page {
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: radial-gradient(circle at top right, #1e1b4b 0%, #0f172a 60%, #020617 100%);
      color: white;
      padding: 3rem;
      position: relative;
      page-break-after: always;
    }

    .cover-badge {
      border: 1px solid rgba(99, 102, 241, 0.4);
      background: rgba(99, 102, 241, 0.1);
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      color: #818cf8;
      margin-bottom: 2rem;
    }

    /* Chapter Cover Page Container */
    .chapter-cover-container {
      page: chapter-cover;
      height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      background-color: #0f172a;
      color: white;
      padding: 4rem;
      border-right: 1.5rem solid #3b82f6; /* default */
      box-sizing: border-box;
      position: relative;
      page-break-inside: avoid;
      page-break-after: always;
    }

    .cover-phase-tag {
      font-size: 0.85rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.15em;
      margin-bottom: 1.5rem;
      color: #cbd5e1;
    }

    .cover-number-badge {
      font-size: 1.75rem;
      font-weight: 900;
      letter-spacing: 0.05em;
      color: #3b82f6; /* default */
      margin-bottom: 1rem;
    }

    .cover-chapter-title {
      font-size: 3.25rem !important;
      font-weight: 900 !important;
      line-height: 1.15 !important;
      color: white !important;
      margin: 0 0 2rem 0 !important;
      border-bottom: none !important;
      padding-bottom: 0 !important;
    }

    .cover-meta-grid {
      display: flex;
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .cover-meta-grid .meta-item {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      padding: 0.5rem 1.25rem;
      border-radius: 0.375rem;
      font-size: 0.95rem;
      font-weight: 500;
      color: #e2e8f0;
    }

    .cover-skills-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.75rem;
      padding: 2rem;
      max-w: 32rem;
    }

    .cover-skills-card .card-header {
      font-weight: 800;
      font-size: 1.15rem;
      margin-bottom: 1rem;
      color: #ffffff;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 0.5rem;
    }

    .skills-list {
      list-style-type: none !important;
      padding-left: 0 !important;
      margin-bottom: 0 !important;
    }

    .skills-list li {
      color: #94a3b8;
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    /* Phase specific colors mapped into CSS variables */
    .chapter-container.phase-prereqs { --phase-color: #3b82f6; }
    .chapter-container.phase-js { --phase-color: #10b981; }
    .chapter-container.phase-ts { --phase-color: #8b5cf6; }
    .chapter-container.phase-basics { --phase-color: #06b6d4; }
    .chapter-container.phase-advanced { --phase-color: #f97316; }
    .chapter-container.phase-framework { --phase-color: #eab308; }
    .chapter-container.phase-api { --phase-color: #ef4444; }
    .chapter-container.phase-cicd { --phase-color: #475569; }
    .chapter-container.phase-interview { --phase-color: #ec4899; }

    .chapter-container {
      page-break-before: always;
      position: relative;
    }

    /* Assign phase colors dynamically using variables */
    .chapter-container .chapter-cover-container {
      border-right-color: var(--phase-color);
    }
    .chapter-container .cover-number-badge {
      color: var(--phase-color);
    }
    .chapter-container h1 {
      border-bottom-color: var(--phase-color);
    }
    .chapter-container h2 {
      border-left-color: var(--phase-color);
    }
    .chapter-container ul li::marker {
      color: var(--phase-color);
    }

    @page {
      size: A4;
      margin-top: 25mm;
      margin-bottom: 25mm;
      margin-left: 20mm;
      margin-right: 20mm;
    }
    @page :first {
      margin: 0;
    }
    @page chapter-cover {
      size: A4;
      margin: 0;
    }

    h1 {
      font-size: 2.35rem;
      font-weight: 900;
      color: #0f172a;
      margin-top: 3.5rem;
      margin-bottom: 1.5rem;
      line-height: 1.2;
      letter-spacing: -0.025em;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 0.5rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #1e293b;
      margin-top: 2.25rem;
      margin-bottom: 1rem;
      border-left: 4px solid #3b82f6;
      padding-left: 0.75rem;
      line-height: 1.25;
      page-break-inside: avoid;
    }

    h3 {
      font-size: 1.2rem;
      font-weight: 600;
      color: #334155;
      margin-top: 1.75rem;
      margin-bottom: 0.75rem;
      page-break-inside: avoid;
    }

    p {
      margin-bottom: 1.25rem;
      color: #334155;
    }

    /* Premium styled Code Block Card design */
    .code-block-container {
      border-radius: 0.5rem;
      overflow: hidden;
      border: 1px solid #1e293b;
      margin: 1.75rem 0;
      page-break-inside: avoid;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .code-block-header {
      background-color: #0f172a;
      border-bottom: 1px solid #1e293b;
      padding: 0.6rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .code-file-badge {
      font-family: 'Fira Code', monospace;
      font-size: 0.75rem;
      color: #cbd5e1;
      font-weight: 500;
    }

    .code-lang-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: #6366f1;
      background: rgba(99, 102, 241, 0.15);
      padding: 0.15rem 0.4rem;
      border-radius: 0.25rem;
    }

    /* Prism Syntax Override */
    pre[class*="language-"] {
      background: #090d16 !important;
      margin: 0 !important;
      padding: 1.25rem !important;
      border: none !important;
      border-radius: 0 !important;
    }

    code[class*="language-"] {
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace !important;
      font-size: 0.825em !important;
      text-shadow: none !important;
    }

    /* Inline code styling */
    :not(pre) > code {
      font-family: 'Fira Code', Menlo, Monaco, Consolas, monospace;
      font-size: 0.85em;
      background-color: #f1f5f9;
      padding: 0.15rem 0.35rem;
      border-radius: 0.25rem;
      color: #0f172a;
      border: 1px solid #e2e8f0;
      font-weight: 500;
    }

    /* Line Numbers override */
    .line-numbers-rows {
      border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
      padding-right: 0.75rem !important;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      page-break-inside: avoid;
      font-size: 0.95rem;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.875rem 1rem;
      text-align: left;
    }

    th {
      background-color: #f8fafc;
      color: #0f172a;
      font-weight: 700;
      border-bottom: 2px solid #cbd5e1;
    }

    tr:nth-child(even) {
      background-color: #fafafa;
    }

    ul, ol {
      margin-bottom: 1.5rem;
      padding-left: 1.75rem;
      color: #334155;
    }

    ul {
      list-style-type: square;
    }

    ol {
      list-style-type: decimal;
    }

    li {
      margin-bottom: 0.5rem;
    }

    /* Collapsible exercise details box */
    details {
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1rem;
      margin: 1.25rem 0;
      background-color: #fafbfc;
      page-break-inside: avoid;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }

    summary {
      font-weight: 600;
      cursor: pointer;
      color: #4f46e5;
      outline: none;
      user-select: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    summary::marker {
      color: #818cf8;
    }

    /* Custom Beautiful Alert Callouts */
    .alert-box {
      border-left: 4px solid;
      padding: 1.25rem 1.5rem;
      margin: 1.75rem 0;
      border-radius: 0.375rem;
      page-break-inside: avoid;
      font-size: 0.95rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .alert-tip {
      border-color: #10b981;
      background-color: #f0fdf4;
      color: #065f46;
    }

    .alert-example {
      border-color: #3b82f6;
      background-color: #eff6ff;
      color: #1e40af;
    }

    .alert-best-practice {
      border-color: #6366f1;
      background-color: #eef2ff;
      color: #3730a3;
    }

    .alert-common-mistake {
      border-color: #f97316;
      background-color: #fff7ed;
      color: #9a3412;
    }

    .alert-caution {
      border-color: #ef4444;
      background-color: #fef2f2;
      color: #991b1b;
    }

    .alert-interview {
      border-color: #d946ef;
      background-color: #fdf4ff;
      color: #86198f;
    }

    .alert-remember {
      border-color: #eab308;
      background-color: #fefce8;
      color: #854d0e;
    }

    /* Progress Tracker Card layout */
    .chapter-progress-tracker-card {
      margin-top: 4rem;
      border-top: 1px solid #e2e8f0;
      padding-top: 2rem;
      page-break-inside: avoid;
    }

    .progress-bar-container {
      width: 100%;
      height: 0.5rem;
      background-color: #f1f5f9;
      border-radius: 9999px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress-bar-bg {
      width: 100%;
      height: 100%;
      background-color: #e2e8f0;
    }

    .progress-bar-fill {
      height: 100%;
      transition: width 0.3s ease;
    }

    .progress-metadata {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      font-weight: 600;
      color: #64748b;
      margin-bottom: 0.25rem;
    }

    .progress-phase {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
    }

    /* Page breaks inside PDF */
    .page-break-after {
      page-break-after: always;
    }

    .mermaid {
      margin: 2rem 0;
      display: flex;
      justify-content: center;
      page-break-inside: avoid;
    }

    .mermaid svg {
      max-width: 100%;
      height: auto;
    }
  </style>
</head>
<body>

  <!-- Cover Page -->
  <div class="cover-page">
    <div class="cover-badge">Enterprise Education Edition</div>
    <div class="max-w-3xl px-6">
      <h1 class="text-6xl font-black text-white mb-6 tracking-tight leading-none">Playwright Academy<br/><span class="text-indigo-400">Handbook</span></h1>
      <p class="text-xl text-gray-300 mb-12 max-w-xl mx-auto font-light leading-relaxed">A complete curriculum of engineering principles, code designs, and automation blueprints.</p>
      <div class="h-1.5 w-24 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto mb-12 rounded-full"></div>
      <p class="text-sm text-gray-500 uppercase tracking-widest font-semibold">Playwright Curriculum Engineering Board &copy; 2026</p>
    </div>
  </div>

  <!-- Main Content Wrapper -->
  <div id="content"></div>

  <script id="markdown-data" type="application/json">PLACEHOLDER_JSON_MARKDOWN</script>

  <script>
    // Parse JSON embedded markdown
    const markdownContent = JSON.parse(document.getElementById('markdown-data').textContent);
    
    // Parse using marked
    document.getElementById('content').innerHTML = marked.parse(markdownContent);

    // Style the default blockquotes to custom Callout Banners with intents
    document.querySelectorAll('blockquote').forEach(bq => {
      let html = bq.innerHTML;
      const lower = html.toLowerCase();
      
      const removeTag = (tag) => {
        const idx = html.toLowerCase().indexOf(tag.toLowerCase());
        if (idx !== -1) {
          html = html.substring(0, idx) + html.substring(idx + tag.length);
        }
      };

      if (lower.includes('[!tip]')) {
        removeTag('[!tip]');
        bq.className = 'alert-box alert-tip';
        bq.innerHTML = '<strong>🟢 Tip</strong>' + html;
      } else if (lower.includes('[!example]')) {
        removeTag('[!example]');
        bq.className = 'alert-box alert-example';
        bq.innerHTML = '<strong>🔵 Example</strong>' + html;
      } else if (lower.includes('[!best_practice]')) {
        removeTag('[!best_practice]');
        bq.className = 'alert-box alert-best-practice';
        bq.innerHTML = '<strong>🟠 Best Practice</strong>' + html;
      } else if (lower.includes('[!common_mistake]')) {
        removeTag('[!common_mistake]');
        bq.className = 'alert-box alert-common-mistake';
        bq.innerHTML = '<strong>🔴 Common Mistake</strong>' + html;
      } else if (lower.includes('[!interview_focus]') || lower.includes('[!interview]')) {
        removeTag('[!interview_focus]');
        removeTag('[!interview]');
        bq.className = 'alert-box alert-interview';
        bq.innerHTML = '<strong>🟣 Interview Focus</strong>' + html;
      } else if (lower.includes('[!remember]') || lower.includes('[!note]')) {
        removeTag('[!remember]');
        removeTag('[!note]');
        bq.className = 'alert-box alert-remember';
        bq.innerHTML = '<strong>💡 Remember</strong>' + html;
      } else if (lower.includes('[!important]')) {
        removeTag('[!important]');
        bq.className = 'alert-box alert-best-practice';
        bq.innerHTML = '<strong>🔵 Important Note</strong>' + html;
      } else if (lower.includes('[!caution]') || lower.includes('[!warning]')) {
        removeTag('[!caution]');
        removeTag('[!warning]');
        bq.className = 'alert-box alert-caution';
        bq.innerHTML = '<strong>🔴 Caution</strong>' + html;
      } else {
        bq.className = 'border-l-4 border-slate-300 pl-4 py-1 my-4 italic text-slate-600';
      }
    });

    // Consistent section icons injecting into h2 and h3
    document.querySelectorAll('h2').forEach(el => {
      const txt = el.innerText;
      if (txt.includes('1. Why This Matters')) {
        el.innerHTML = '🧠 1. Why This Matters';
      } else if (txt.includes('2. Conceptual Overview')) {
        el.innerHTML = '📖 2. Conceptual Overview';
      } else if (txt.includes('3. Implementation and Code Examples') || txt.includes('3. Implementation & Code Examples')) {
        el.innerHTML = '🏢 3. Implementation & Code Examples';
      } else if (txt.includes('4. Best Practices')) {
        el.innerHTML = '🏆 4. Best Practices (Do\\'s and Don\\'ts)';
      } else if (txt.includes('5. Chapter Summary')) {
        el.innerHTML = '📝 5. Chapter Summary';
      } else if (txt.includes('6. Exercises & Mini-Project')) {
        el.innerHTML = '🏋️ 6. Exercises & Mini-Project';
      } else if (txt.includes('7. Progressive Project')) {
        el.innerHTML = '💻 7. Progressive Project: TodoMVC Automation';
      } else if (txt.includes('8. Interview Q&A')) {
        el.innerHTML = '🎯 8. Interview Q&A Preparation';
      } else if (txt.includes('9. Chapter Cheat Sheet') || txt.includes('8. Chapter Cheat Sheet')) {
        el.innerHTML = '📚 ' + txt;
      }
    });

    document.querySelectorAll('h3').forEach(el => {
      const txt = el.innerText;
      if (txt.toLowerCase() === 'do') {
        el.innerHTML = '🟢 Do';
      } else if (txt.toLowerCase() === 'don\\'t') {
        el.innerHTML = '🔴 Don\\'t';
      } else if (txt.toLowerCase() === 'exercises') {
        el.innerHTML = '🎯 Exercises';
      } else if (txt.toLowerCase() === 'mini-project') {
        el.innerHTML = '🚀 Mini-Project';
      }
    });

    // Auto-open all details solutions for static PDF compilation
    document.querySelectorAll('details').forEach(el => el.setAttribute('open', 'true'));

    // Convert mermaid code blocks to <div class="mermaid"> before processing other code blocks
    document.querySelectorAll('pre code.language-mermaid').forEach(codeBlock => {
      const pre = codeBlock.parentNode;
      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.textContent = codeBlock.textContent;
      pre.parentNode.replaceChild(mermaidDiv, pre);
    });

    // Restructure all pre code blocks to add header badges
    document.querySelectorAll('pre code').forEach(codeBlock => {
      const text = codeBlock.textContent;
      let filename = '';
      
      const lines = text.split('\\n');
      const firstLine = lines[0].trim();
      
      if (firstLine.startsWith('// File:') || firstLine.startsWith('# File:') || firstLine.startsWith('// --- File:')) {
        filename = firstLine.replace(/^\\/\\/ File:\\s*/, '')
                            .replace(/^# File:\\s*/, '')
                            .replace(/^\\/\\/ ---\\s*File:\\s*/, '')
                            .replace(/\\s*---$/, '')
                            .trim();
        codeBlock.textContent = lines.slice(1).join('\\n');
      }

      let lang = 'Code';
      const classes = codeBlock.className.split(' ');
      const langClass = classes.find(c => c.startsWith('language-'));
      if (langClass) {
        lang = langClass.replace('language-', '').toUpperCase();
      }

      const pre = codeBlock.parentNode;
      const container = document.createElement('div');
      container.className = 'code-block-container';
      
      const header = document.createElement('div');
      header.className = 'code-block-header';
      
      const fileBadge = document.createElement('span');
      fileBadge.className = 'code-file-badge';
      fileBadge.innerText = filename || (lang === 'TYPESCRIPT' ? 'typescript' : lang.toLowerCase());
      
      const langBadge = document.createElement('span');
      langBadge.className = 'code-lang-badge';
      langBadge.innerText = lang === 'TYPESCRIPT' ? 'TS' : lang === 'JAVASCRIPT' ? 'JS' : lang;

      header.appendChild(fileBadge);
      header.appendChild(langBadge);

      pre.parentNode.insertBefore(container, pre);
      container.appendChild(header);
      container.appendChild(pre);
      
      // Add line numbers class to pre
      pre.classList.add('line-numbers');
    });

    // Initialize mermaid and set theme
    mermaid.initialize({ startOnLoad: true, theme: 'neutral' });
    mermaid.run();
  </script>
</body>
</html>
  `;
 
   // Write temporary HTML file
   const escapedMarkdown = JSON.stringify(fullMarkdown).replace(/<\/script>/g, '<\\/script>');
   const finalHtml = htmlTemplate.replace('PLACEHOLDER_JSON_MARKDOWN', () => escapedMarkdown);
   fs.writeFileSync(TEMP_HTML_PATH, finalHtml);
   console.log(`- Created temporary HTML layout at: ${TEMP_HTML_PATH}`);

  // 3. Launch Playwright headless browser to render PDF
  console.log('- Launching headless browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('- Rendering handbook...');
  await page.goto(`file://${TEMP_HTML_PATH}`);
  
  // Wait for mermaid to compile flowcharts into SVG vector images
  console.log('- Waiting for diagram renders...');
  await page.evaluate(async () => {
    await new Promise(resolve => setTimeout(resolve, 3500));
  });

  // PDF settings for A4 print layout
  console.log('- Generating PDF file...');
  await page.pdf({
    path: OUTPUT_PDF_PATH,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 8px; font-family: sans-serif; color: #9ca3af; width: 100%; text-align: right; padding-right: 20mm;">
        Playwright Academy Handbook
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 8px; font-family: sans-serif; color: #9ca3af; width: 100%; text-align: center;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>
    `
  });

  await browser.close();

  // Clean up temporary HTML file
  if (fs.existsSync(TEMP_HTML_PATH)) {
    fs.unlinkSync(TEMP_HTML_PATH);
  }

  console.log(`✅ PDF Export pipeline finished successfully!`);
  console.log(`- File written to: ${OUTPUT_PDF_PATH}`);
}

// Execute
exportHandbook().catch(err => {
  console.error(`❌ PDF Export Pipeline failed:`, err);
  process.exit(1);
});
