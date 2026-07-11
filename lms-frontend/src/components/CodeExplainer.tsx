"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, Sparkles, Code, Copy, Check, BookOpen, HelpCircle } from 'lucide-react';

interface Annotation {
  line: number;
  title: string;
  desc: string;
}

interface Preset {
  filename: string;
  code: string;
  annotations: Annotation[];
}

const PRESETS: Record<string, Preset> = {
  "admin-login-spec": {
    filename: "tests/admin/login.spec.ts",
    code: `// tests/admin/login.spec.ts
import { test, expect } from '../fixtures/baseTest';

test.describe('Admin Login', () => {
  test('should login with valid credentials', async ({ loginPage }) => {
    await loginPage.loginAs('admin');
    await expect(loginPage.dashboard).toBeVisible();
  });
});`,
    annotations: [
      {
        line: 1,
        title: "📁 File Path & Location",
        desc: "This shows the folder location of our test file. It's stored in tests/admin, separating administrator test scenarios from regular users."
      },
      {
        line: 2,
        title: "🛠️ Importing Tools",
        desc: "We import 'test' (to run the test script) and 'expect' (to perform verification checks) from our custom baseTest. This sets up our browser framework."
      },
      {
        line: 4,
        title: "📦 Grouping Tests (Suite)",
        desc: "'test.describe' groups related test scenarios together under one name ('Admin Login'). This keeps test results clean and organized."
      },
      {
        line: 5,
        title: "🏁 Creating a Test Case",
        desc: "This starts a single test scenario. The label 'should login with valid credentials' is a human-readable title. '{ loginPage }' is a fixture — it pre-launches the browser and loads our Login Page Object automatically."
      },
      {
        line: 6,
        title: "🎯 Performing the Action",
        desc: "This tells Playwright to perform the action of logging in using the 'admin' credentials. 'await' tells the runner to wait until the login completes before moving to the next line."
      },
      {
        line: 7,
        title: "🔍 Verification (Assertion)",
        desc: "This is our check. 'expect' ensures the dashboard is visible on screen. If it is, the test passes. If not, it fails. This is the quality check!"
      }
    ]
  },
  "login-page-ts": {
    filename: "pages/LoginPage.ts",
    code: `// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly dashboard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Login' });
    this.dashboard = page.getByRole('heading', { name: 'Dashboard' });
  }

  async loginAs(role: 'admin' | 'reviewer') {
    await this.usernameInput.fill(process.env[\`\${role.toUpperCase()}_USER\`]!);
    await this.passwordInput.fill(process.env[\`\${role.toUpperCase()}_PASS\`]!);
    await this.submitButton.click();
  }
}`,
    annotations: [
      {
        line: 1,
        title: "📁 Page Object Model Location",
        desc: "This Page Object is stored in the pages/ folder. It describes how to interact with the LoginPage, keeping UI details out of individual tests."
      },
      {
        line: 2,
        title: "📦 Page and Locator Imports",
        desc: "We import Playwright types: 'Page' represents a browser tab, and 'Locator' represents a search query to find elements on the screen."
      },
      {
        line: 4,
        title: "🧱 Designing the Webpage Blueprint",
        desc: "'class LoginPage' creates a reusable blueprint for the Login Page. Other test scripts will load this blueprint to type, click, and verify elements."
      },
      {
        line: 5,
        title: "⚙️ Browser Tab Reference",
        desc: "Stores a reference to the active browser page instance, allowing the class to perform interactions inside the browser."
      },
      {
        line: 6,
        title: "🏷️ Declaring UI Elements",
        desc: "Declares fields for elements on the page (inputs, buttons, and dashboard). Declaring them as fields lets other files see what exists on the page."
      },
      {
        line: 11,
        title: "🔌 Connecting elements (Constructor)",
        desc: "The 'constructor' is a setup function that runs automatically when we instantiate this class. It hooks up our labels to the actual browser elements."
      },
      {
        line: 13,
        title: "⌨️ Finding Input Boxes",
        desc: "Uses 'page.getByLabel' to locate inputs by their adjacent visible text labels ('Username' and 'Password'). This is highly resilient to layout changes."
      },
      {
        line: 15,
        title: "🖱️ Finding Buttons & Headings",
        desc: "Uses 'page.getByRole' to locate the login button and dashboard heading. This searches using accessibility standards (screen-readers structure)."
      },
      {
        line: 19,
        title: "🏃 Reusable Action Method",
        desc: "'loginAs' is a custom function (method). Instead of copying typing/clicking steps in 100 tests, we write it once here and tests just call 'loginPage.loginAs('admin')'."
      },
      {
        line: 20,
        title: "🔑 Filling Secure Credentials",
        desc: "Reads the username/password from secure environment variables (configuration files) and fills them into the input boxes."
      },
      {
        line: 22,
        title: "👆 Clicking the Button",
        desc: "Clicks the submit button to log in and waits for the form to process."
      }
    ]
  },
  "modal-ts": {
    filename: "components/Modal.ts",
    code: `// components/Modal.ts
import { Page, Locator } from '@playwright/test';

export class Modal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.confirmButton = this.dialog.getByRole('button', { name: 'Confirm' });
    this.cancelButton = this.dialog.getByRole('button', { name: 'Cancel' });
  }

  async confirm() { await this.confirmButton.click(); }
  async cancel() { await this.cancelButton.click(); }
}`,
    annotations: [
      {
        line: 1,
        title: "📁 Reusable Component Layer",
        desc: "Stored in components/ because modals are popup dialogs shared across many pages. We model it once here and import it into different page objects."
      },
      {
        line: 4,
        title: "🧱 Modal Blueprint",
        desc: "Defines the 'Modal' helper class that can be initialized inside other Page Objects, such as a DocumentPage that requires delete confirmation."
      },
      {
        line: 10,
        title: "🔌 Connecting Modal Buttons",
        desc: "Locates the dialog wrapper ('dialog') and buttons inside it. By scoping 'confirmButton' to 'this.dialog', we make sure we don't click buttons elsewhere."
      },
      {
        line: 17,
        title: "🏃 Simple Actions",
        desc: "Exposes clear, easy-to-read methods like '.confirm()' and '.cancel()' which perform the click behind the scenes."
      }
    ]
  },
  "user-ts": {
    filename: "entities/User.ts",
    code: `// entities/User.ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'reviewer' | 'viewer';
  department: string;
}`,
    annotations: [
      {
        line: 1,
        title: "📁 Entity Layer Location",
        desc: "Entities represent the shape of data models. This file lives in entities/ and doesn't write actions or click buttons; it just describes data."
      },
      {
        line: 2,
        title: "🧱 Data Shape Contract",
        desc: "An 'interface' defines a structural contract in TypeScript. It ensures that any variable representing a User has exactly these fields with the correct types."
      },
      {
        line: 3,
        title: "🗂️ Data Properties",
        desc: "Specifies fields: ID, email, role, and department. The role is restricted to a strict set of values: it can only be 'admin', 'reviewer', or 'viewer'."
      }
    ]
  },
  "custom-fixture-ts": {
    filename: "fixtures/baseTest.ts",
    code: `// fixtures/baseTest.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type MyFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page }, use) => {
    // SETUP: Run this BEFORE the test begins
    const loginPage = new LoginPage(page);
    await page.goto('/login');
    
    // YIELD: Pause here and run the actual test file!
    await use(loginPage);
    
    // TEARDOWN: Run this AFTER the test ends
    await loginPage.logout(); 
  },
});

export { expect } from '@playwright/test';`,
    annotations: [
      {
        line: 2,
        title: "📥 Importing the Base",
        desc: "We import the standard Playwright 'test' object but rename it to 'base'. We are going to build on top of it."
      },
      {
        line: 5,
        title: "🏷️ Defining the Contract",
        desc: "We define a TypeScript type called 'MyFixtures'. This tells Playwright exactly what custom objects we are adding (in this case, 'loginPage')."
      },
      {
        line: 9,
        title: "🧬 Extending Playwright",
        desc: "We call 'base.extend()' and pass it our type. This creates a super-powered version of Playwright that knows about our Page Objects."
      },
      {
        line: 10,
        title: "⚙️ The Fixture Definition",
        desc: "This is where we define how the 'loginPage' fixture is created. It takes the standard browser 'page' and the special 'use' function."
      },
      {
        line: 12,
        title: "🏗️ Setup Phase",
        desc: "Code here runs BEFORE the test starts. We instantiate the LoginPage and automatically navigate to the login URL."
      },
      {
        line: 16,
        title: "⏸️ The Yield (use)",
        desc: "The 'use()' function is magic. It pauses this setup block, hands the 'loginPage' to your test file, and waits for your test to finish running."
      },
      {
        line: 19,
        title: "🧹 Teardown Phase",
        desc: "After the test finishes (or if it fails), Playwright returns here. This is where you clean up, like logging out or deleting test data."
      },
      {
        line: 23,
        title: "📤 Exporting the Magic",
        desc: "We export the 'expect' function so our test files only need to import from this one file, not from @playwright/test directly."
      }
    ]
  }
};

interface CodeExplainerProps {
  preset: string;
}

export default function CodeExplainer({ preset }: CodeExplainerProps) {
  const presetData = PRESETS[preset];
  const [mode, setMode] = useState<'code' | 'explain'>('explain');
  const [activeLine, setActiveLine] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const playTimer = useRef<NodeJS.Timeout | null>(null);

  if (!presetData) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded">
        Invalid CodeExplainer preset: "{preset}"
      </div>
    );
  }

  const lines = presetData.code.split('\n');
  const annotationsMap = new Map(presetData.annotations.map(a => [a.line, a]));
  const annotatedLines = presetData.annotations.map(a => a.line);

  // Set initial line selection to the first annotated line in explain mode
  useEffect(() => {
    if (mode === 'explain' && activeLine === 0 && annotatedLines.length > 0) {
      setActiveLine(annotatedLines[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Handle Autoplay slideshow
  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        setActiveLine(prev => {
          const currentIndex = annotatedLines.indexOf(prev);
          if (currentIndex === -1 || currentIndex === annotatedLines.length - 1) {
            return annotatedLines[0]; // loop back to first
          }
          return annotatedLines[currentIndex + 1];
        });
      }, 3500); // 3.5 seconds per slide
    } else {
      if (playTimer.current) clearInterval(playTimer.current);
    }

    return () => {
      if (playTimer.current) clearInterval(playTimer.current);
    };
  }, [isPlaying, annotatedLines]);

  const handleNext = () => {
    setIsPlaying(false);
    const currentIndex = annotatedLines.indexOf(activeLine);
    if (currentIndex === -1 || currentIndex === annotatedLines.length - 1) {
      setActiveLine(annotatedLines[0]);
    } else {
      setActiveLine(annotatedLines[currentIndex + 1]);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false);
    const currentIndex = annotatedLines.indexOf(activeLine);
    if (currentIndex === -1 || currentIndex === 0) {
      setActiveLine(annotatedLines[annotatedLines.length - 1]);
    } else {
      setActiveLine(annotatedLines[currentIndex - 1]);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(presetData.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeAnnotation = annotationsMap.get(activeLine);
  const currentStepNum = annotatedLines.indexOf(activeLine) + 1;

  // Simple, fast syntax highlighter token helper
  function highlightTokens(text: string) {
    if (text.trim().startsWith('//')) {
      return <span className="text-gray-500 dark:text-gray-400 italic">{text}</span>;
    }

    const regex = /(\/\/.*)|("[^"]*"|'[^']*')|\b(import|from|const|await|async|class|export|readonly|constructor|interface|return|extends|new|private)\b|\b(test|expect|page|Locator|Page|describe)\b/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const [full, comment, str, keyword, pwKeyword] = match;
      if (comment) {
        parts.push(<span key={keyIndex++} className="text-gray-500 dark:text-gray-400 italic">{comment}</span>);
      } else if (str) {
        parts.push(<span key={keyIndex++} className="text-green-500 dark:text-green-400 font-medium">{str}</span>);
      } else if (keyword) {
        parts.push(<span key={keyIndex++} className="text-pink-600 dark:text-pink-400 font-bold">{keyword}</span>);
      } else if (pwKeyword) {
        parts.push(<span key={keyIndex++} className="text-cyan-600 dark:text-cyan-400 font-bold">{pwKeyword}</span>);
      }
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    return parts.length > 0 ? parts : text;
  }

  return (
    <div className="my-8 border border-[var(--border-color)] rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl bg-white dark:bg-slate-900">
      {/* Header controls bar */}
      <div className="flex border-b border-[var(--border-color)] px-4 py-3 bg-gray-50 dark:bg-slate-800 items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" />
          <span className="text-sm font-mono font-semibold text-[var(--text-main)]">{presetData.filename}</span>
        </div>
        <div className="flex bg-gray-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => { setMode('code'); setIsPlaying(false); }}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
              mode === 'code'
                ? 'bg-white dark:bg-slate-600 text-[var(--text-main)] shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            Developer Code
          </button>
          <button
            onClick={() => setMode('explain')}
            className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-all duration-200 ${
              mode === 'explain'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Beginner Walkthrough
          </button>
        </div>
      </div>

      {/* Main Body */}
      {mode === 'code' ? (
        // Standard Developer Code View
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg border border-slate-700 transition-all z-10 flex items-center gap-1 text-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <pre className="p-5 font-mono text-sm overflow-x-auto bg-[#1e293b] text-slate-300 leading-relaxed rounded-b-xl">
            <code>
              {lines.map((line, idx) => (
                <div key={idx} className="flex">
                  <span className="w-8 select-none text-slate-500 text-right pr-4 font-mono text-xs">{idx + 1}</span>
                  <span>{line}</span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      ) : (
        // Interactive Explainer View
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] divide-y md:divide-y-0 md:divide-x divide-[var(--border-color)]">
          
          {/* Code side (7 cols) */}
          <div className="md:col-span-7 bg-[#0f172a] text-slate-300 py-4 overflow-y-auto max-h-[450px]">
            <div className="flex flex-col">
              {lines.map((lineText, index) => {
                const lineNum = index + 1;
                const isLineAnnotated = annotationsMap.has(lineNum);
                const isHighlighted = activeLine === lineNum;
                
                return (
                  <div
                    key={lineNum}
                    onClick={() => {
                      if (isLineAnnotated) {
                        setIsPlaying(false);
                        setActiveLine(lineNum);
                      }
                    }}
                    className={`flex items-start py-1.5 transition-all duration-200 border-l-4 group ${
                      isHighlighted
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : isLineAnnotated
                          ? 'border-transparent text-slate-200 hover:bg-slate-800/40 hover:text-white cursor-pointer'
                          : 'border-transparent text-slate-400 opacity-60'
                    }`}
                  >
                    {/* Line number and annotation indicator */}
                    <div className="w-12 select-none flex items-center justify-end pr-3 gap-1">
                      {isLineAnnotated && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isHighlighted ? 'bg-blue-400 animate-pulse' : 'bg-amber-400'}`} />
                      )}
                      <span className={`font-mono text-xs text-right ${isHighlighted ? 'text-blue-400 font-bold' : 'text-slate-600'}`}>
                        {lineNum}
                      </span>
                    </div>

                    {/* Code contents */}
                    <pre className="font-mono text-sm m-0 overflow-x-auto whitespace-pre pr-4 flex-1">
                      <code>{highlightTokens(lineText)}</code>
                    </pre>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation side (5 cols) */}
          <div className="md:col-span-5 bg-slate-50 dark:bg-slate-900/60 p-5 flex flex-col justify-between">
            {activeAnnotation ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    Step {currentStepNum} of {annotatedLines.length}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">Line {activeLine}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                    {activeAnnotation.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">
                    {activeAnnotation.desc}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 text-[var(--text-muted)] space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-400 animate-bounce" />
                <p className="text-sm font-medium">Select any line with a yellow dot to see what it does in plain English!</p>
              </div>
            )}

            {/* Explainer controls */}
            <div className="border-t border-[var(--border-color)] pt-4 mt-6">
              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden mb-4">
                <div 
                  className="bg-blue-500 h-1 transition-all duration-300"
                  style={{ width: `${(currentStepNum / annotatedLines.length) * 100}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    isPlaying 
                      ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300'
                      : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 dark:text-slate-200'
                  }`}
                  title={isPlaying ? "Pause auto-advancing slideshow" : "Start slideshow step-by-step"}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 animate-pulse" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      Auto Play
                    </>
                  )}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
                    aria-label="Previous step"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 transition-colors"
                    aria-label="Next step"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
