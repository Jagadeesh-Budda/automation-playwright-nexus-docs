"use client";
import React from 'react';
import TraceChallenge from '../../components/TraceChallenge';
import PRReviewChallenge from '../../components/PRReviewChallenge';
import ArchitectureReviewChallenge from '../../components/ArchitectureReviewChallenge';
import FlakyCheckout from '../../components/FailureAcademy/FlakyCheckout';
import DeterministicRaceCondition from '../../components/FailureAcademy/DeterministicRaceCondition';
import BrowserBug from '../../components/FailureAcademy/BrowserBug';
import DataPollution from '../../components/FailureAcademy/DataPollution';

export default function EliteTestBed() {
  return (
    <div className="p-8 space-y-16 bg-[#0f172a] min-h-screen text-white">
      <h1>Elite Test Bed</h1>
      
      <section id="trace-challenge-section">
        <TraceChallenge 
          challengeId="test-trace-1" 
          traceUrl="/dummy-trace.zip" 
          expectedRootCauseSnippet="timeout" 
          expectedFailingStepSnippet="click" 
        />
      </section>

      <section id="pr-review-section">
        <PRReviewChallenge 
          challengeId="test-pr-1"
          diffContent={`- const x = 1;\n+ const x = 2;\n  console.log(x);`}
          issues={[
            { id: '1', lineNumber: 2, category: 'Bug', severity: 'Critical', description: 'Hardcoded variable' }
          ]}
        />
      </section>

      <section id="architecture-review-section">
        <ArchitectureReviewChallenge 
          challengeId="test-arch-1"
          files={[
            { filename: 'playwright.config.ts', content: 'export default { timeout: 0 };' }
          ]}
          issues={[
            { id: '1', fileIndex: 0, lineNumber: 1, description: 'Infinite timeout is bad architecture' }
          ]}
        />
      </section>

      <section id="failure-academy-section">
        <h2 className="text-3xl font-bold text-slate-200 mb-8 border-b border-slate-800 pb-4">Module G: The Failure Academy</h2>
        <div className="space-y-12">
          <FlakyCheckout />
          <DeterministicRaceCondition />
          <BrowserBug />
          <DataPollution />
        </div>
      </section>
    </div>
  );
}
