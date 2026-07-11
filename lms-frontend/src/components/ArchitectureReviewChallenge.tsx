"use client";
import React, { useState } from 'react';
import { Layers, CheckSquare, Target, AlertTriangle } from 'lucide-react';
import { useMasteryStore } from '../store/useMasteryStore';

export interface ArchitectureIssue {
  id: string;
  fileIndex: number;
  lineNumber: number;
  description: string;
}

interface CodeFile {
  filename: string;
  content: string;
}

interface ArchitectureReviewChallengeProps {
  challengeId: string;
  files: CodeFile[];
  issues: ArchitectureIssue[]; // Exact known issues (e.g., 12 issues)
}

export default function ArchitectureReviewChallenge({
  challengeId,
  files,
  issues
}: ArchitectureReviewChallengeProps) {
  const { completeModule } = useMasteryStore();
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [flags, setFlags] = useState<{ fileIndex: number, lineNumber: number }[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [coverage, setCoverage] = useState(0);

  const activeFile = files[activeFileIndex];
  const lines = activeFile.content.split('\n');

  const handleFlagLine = (lineNumber: number) => {
    if (isSubmitted) return;
    const exists = flags.some(f => f.fileIndex === activeFileIndex && f.lineNumber === lineNumber);
    if (exists) {
      setFlags(flags.filter(f => !(f.fileIndex === activeFileIndex && f.lineNumber === lineNumber)));
    } else {
      setFlags([...flags, { fileIndex: activeFileIndex, lineNumber }]);
    }
  };

  const handleSubmit = () => {
    let found = 0;
    
    // Calculate how many known issues were correctly flagged
    issues.forEach(issue => {
      if (flags.some(f => f.fileIndex === issue.fileIndex && f.lineNumber === issue.lineNumber)) {
        found++;
      }
    });

    const calculatedCoverage = Math.round((found / issues.length) * 100);
    setCoverage(calculatedCoverage);
    setIsSubmitted(true);

    if (calculatedCoverage > 0) {
      completeModule(challengeId, calculatedCoverage).catch(console.error);
    }
  };

  return (
    <div data-testid="arch-review-challenge" className="mt-8 mb-12 font-sans border border-slate-700 bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white m-0 flex items-center gap-3">
            <Layers className="w-6 h-6 text-emerald-400" />
            Architecture Review Academy
          </h3>
          <p className="text-slate-400 text-sm mt-2 mb-0 max-w-3xl">
            Explore the framework files below. There are exactly <strong>{issues.length}</strong> architectural issues hidden in this codebase. 
            Click on the offending lines to flag them. Find as many as possible.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg">
           <Target className="w-5 h-5 text-emerald-400" />
           <span className="text-slate-300 font-bold">{flags.length} / {issues.length} Flagged</span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row border-b border-slate-700">
        {files.map((file, idx) => (
          <button
            key={idx}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${
              activeFileIndex === idx 
                ? 'border-emerald-500 text-emerald-400 bg-emerald-900/10' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {file.filename}
            {flags.filter(f => f.fileIndex === idx).length > 0 && (
              <span className="ml-2 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {flags.filter(f => f.fileIndex === idx).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="p-0 overflow-x-auto bg-[#1e1e1e] max-h-[600px] overflow-y-auto" tabIndex={0}>
        <table className="w-full text-left border-collapse font-mono text-sm">
          <tbody>
            {lines.map((content, idx) => {
              const lineNumber = idx + 1;
              const isFlagged = flags.some(f => f.fileIndex === activeFileIndex && f.lineNumber === lineNumber);
              const isActualIssue = issues.some(i => i.fileIndex === activeFileIndex && i.lineNumber === lineNumber);
              const actualIssueData = issues.find(i => i.fileIndex === activeFileIndex && i.lineNumber === lineNumber);

              let rowClass = "group hover:bg-[#2d2d2d] cursor-pointer transition-colors";
              const numClass = "text-slate-500 w-12 text-right pr-4 select-none border-r border-slate-700";
              const contentClass = "whitespace-pre pl-4 pr-8 py-1 relative";

              if (isFlagged && !isSubmitted) {
                rowClass = "bg-emerald-900/40";
              } else if (isSubmitted) {
                if (isActualIssue && isFlagged) {
                  rowClass = "bg-emerald-900/60";
                } else if (isActualIssue && !isFlagged) {
                  rowClass = "bg-yellow-900/40"; // Missed
                } else if (!isActualIssue && isFlagged) {
                  rowClass = "bg-red-900/40"; // False positive
                }
              }

              return (
                <tr key={lineNumber} data-line={lineNumber} className={rowClass} onClick={() => handleFlagLine(lineNumber)}>
                  <td className={numClass}>{lineNumber}</td>
                  <td className={contentClass} style={{ color: '#cbd5e1' }}>
                    {content || ' '}
                    {isFlagged && !isSubmitted && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs bg-emerald-600/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-600">
                        <CheckSquare className="w-3 h-3" />
                        Flagged
                      </div>
                    )}
                    {isSubmitted && isActualIssue && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex items-center gap-2">
                         <div className={`text-xs px-2 py-1 rounded border shadow-lg ${isFlagged ? 'bg-emerald-900 text-emerald-400 border-emerald-600' : 'bg-yellow-900 text-yellow-500 border-yellow-600'}`}>
                            {isFlagged ? 'Found: ' : 'Missed: '} {actualIssueData?.description}
                         </div>
                       </div>
                    )}
                    {isSubmitted && !isActualIssue && isFlagged && (
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-xs px-2 py-1 rounded border shadow-lg bg-red-900 text-red-400 border-red-600">
                         False Positive
                       </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-700">
        {!isSubmitted ? (
          <>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
               <span className="flex items-center gap-1"><AlertTriangle className="w-4 h-4 text-emerald-500"/> {flags.length} issues identified</span>
            </div>
            <button onClick={handleSubmit} disabled={isSubmitted} className="w-full sm:w-auto px-8 py-3 bg-emerald-700 text-white rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
              Submit Architecture Review
            </button>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                 <Target className={`w-8 h-8 ${coverage >= 80 ? 'text-emerald-400' : 'text-slate-500'}`} />
               </div>
               <div>
                 <h4 className="text-white font-bold text-xl m-0">Review Completed</h4>
                 <p className="text-slate-400 m-0 text-sm mt-1">
                   You found {coverage}% of the embedded architectural flaws.
                 </p>
               </div>
            </div>
            {coverage >= 80 ? (
              <div className="px-4 py-2 bg-emerald-900/50 text-emerald-400 rounded border border-emerald-500/50 font-bold">
                Elite Standard Met
              </div>
            ) : (
              <div className="px-4 py-2 bg-yellow-900/50 text-yellow-400 rounded border border-yellow-500/50 font-bold">
                Keep Practicing
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
