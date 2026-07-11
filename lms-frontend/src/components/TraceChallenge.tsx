"use client";
import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Download, Zap } from 'lucide-react';
import { useMasteryStore } from '../store/useMasteryStore';

interface TraceChallengeProps {
  challengeId: string;
  traceUrl: string;
  expectedFailingStepSnippet?: string;
  expectedRootCauseSnippet?: string;
  expectedEvidenceSnippet?: string;
  expectedFixSnippet?: string;
}

export default function TraceChallenge({ 
  challengeId, 
  traceUrl,
  expectedFailingStepSnippet = "submit order",
  expectedRootCauseSnippet = "race condition",
  expectedEvidenceSnippet = "request completed after assertion",
  expectedFixSnippet = "wait for response"
}: TraceChallengeProps) {
  const { completeModule } = useMasteryStore();
  const [failingStep, setFailingStep] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [evidence, setEvidence] = useState('');
  const [fix, setFix] = useState('');
  const [confidence, setConfidence] = useState(90);
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPassed, setIsPassed] = useState(false);
  const [feedback, setFeedback] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation based on keywords
    const errors: string[] = [];
    
    if (!failingStep.toLowerCase().includes(expectedFailingStepSnippet.toLowerCase()) && expectedFailingStepSnippet) {
      errors.push(`Failing Step: Look closer at which action failed in the trace. Hint: ${expectedFailingStepSnippet}`);
    }
    if (!rootCause.toLowerCase().includes(expectedRootCauseSnippet.toLowerCase()) && expectedRootCauseSnippet) {
      errors.push(`Root Cause: Why did it fail? Consider timing issues.`);
    }
    if (!evidence.toLowerCase().includes(expectedEvidenceSnippet.toLowerCase()) && expectedEvidenceSnippet) {
      errors.push(`Evidence: What in the Network or Console tab proves your root cause?`);
    }
    if (!fix.toLowerCase().includes(expectedFixSnippet.toLowerCase()) && expectedFixSnippet) {
      errors.push(`Fix: How do we prevent this flakiness?`);
    }

    setFeedback(errors);
    setIsSubmitted(true);

    if (errors.length === 0) {
      setIsPassed(true);
      // Award points and complete this challenge's underlying module logic
      completeModule(challengeId, 100).catch(console.error);
    } else {
      setIsPassed(false);
    }
  };

  return (
    <div data-testid="trace-challenge" className="mt-8 mb-12 font-sans border border-slate-700 bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-slate-800 border-b border-slate-700 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-white m-0 flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            Trace Viewer Mastery
          </h3>
          <p className="text-slate-400 text-sm mt-1 mb-0">
            Download the trace file, analyze it locally using Playwright Trace Viewer, and submit your findings.
          </p>
        </div>
        <a 
          href={traceUrl} 
          download 
          className="flex items-center gap-2 bg-[#0369a1] hover:bg-[#0284c7] text-white px-5 py-2.5 rounded-lg font-bold transition-all no-underline shadow-[0_0_15px_rgba(3,105,161,0.3)]"
        >
          <Download className="w-5 h-5" />
          Download trace.zip
        </a>
      </div>

      <div className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300">1. Failing Step</label>
            <p className="text-xs text-slate-400 mt-0">Which specific action or assertion caused the failure?</p>
            <input 
              type="text" 
              value={failingStep}
              onChange={(e) => setFailingStep(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] outline-none transition-all"
              placeholder="e.g., The 'Submit Order' button click..."
              required
              disabled={isPassed}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300">2. Root Cause</label>
            <p className="text-xs text-slate-400 mt-0">Why did this step fail? Be specific about the underlying mechanism.</p>
            <textarea 
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] outline-none transition-all min-h-[80px]"
              placeholder="e.g., An API race condition occurred where..."
              required
              disabled={isPassed}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300">3. Evidence</label>
            <p className="text-xs text-slate-400 mt-0">What in the trace proves your root cause? (Network tab, DOM snapshot, etc.)</p>
            <textarea 
              value={evidence}
              onChange={(e) => setEvidence(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] outline-none transition-all min-h-[80px]"
              placeholder="e.g., The Network tab shows the POST request resolving at 4.2s, but the assertion ran at 4.1s."
              required
              disabled={isPassed}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-300">4. Recommended Fix</label>
            <p className="text-xs text-slate-400 mt-0">How would you change the code to make this 100% reliable?</p>
            <textarea 
              value={fix}
              onChange={(e) => setFix(e.target.value)}
              className="w-full bg-[#1e293b] border border-slate-600 rounded-lg p-3 text-white placeholder-slate-500 focus:border-[#38bdf8] focus:ring-1 focus:ring-[#38bdf8] outline-none transition-all min-h-[80px]"
              placeholder="e.g., Implement page.waitForResponse() before clicking..."
              required
              disabled={isPassed}
            />
          </div>

          <div className="space-y-2 pb-4">
            <label htmlFor="confidence-slider" className="block text-sm font-bold text-slate-300">5. Confidence Score: {confidence}%</label>
            <input 
              id="confidence-slider"
              type="range" 
              min="0" 
              max="100" 
              value={confidence}
              onChange={(e) => setConfidence(Number(e.target.value))}
              className="w-full accent-[#38bdf8]"
              disabled={isPassed}
              aria-label="Confidence Score"
            />
          </div>

          {isSubmitted && !isPassed && (
            <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <h4 className="text-red-400 font-bold flex items-center gap-2 m-0 mb-2">
                <AlertCircle className="w-5 h-5" />
                Analysis Needs Refinement
              </h4>
              <ul className="list-disc pl-5 text-sm text-red-300 m-0 space-y-1">
                {feedback.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {isPassed && (
            <div className="p-5 bg-emerald-900/30 border border-emerald-500/50 rounded-lg flex items-start gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
              <div>
                <h4 className="text-emerald-400 font-bold m-0 text-lg">Elite Debugging Verified!</h4>
                <p className="text-emerald-200/80 text-sm mt-1 m-0">
                  Your analysis is spot on. You successfully identified the race condition, proved it with trace evidence, and provided the correct fix.
                </p>
              </div>
            </div>
          )}

          {!isPassed && (
            <button 
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-[var(--accent)] text-white rounded-lg font-bold hover:bg-blue-600 transition-colors shadow-lg"
            >
              Submit Analysis
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
