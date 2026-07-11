"use client";
import React, { useState, useMemo } from 'react';
import { GitPullRequest, MessageSquare, CheckCircle2, ShieldAlert, Award, Star } from 'lucide-react';
import { useMasteryStore } from '../store/useMasteryStore';

type Category = 'Bug' | 'Flakiness' | 'Architecture' | 'Maintainability' | 'Security' | 'Performance';
type Severity = 'Critical' | 'Major' | 'Minor';

export interface EmbeddedIssue {
  id: string;
  lineNumber: number;
  category: Category;
  severity: Severity;
  description: string;
}

interface PRReviewChallengeProps {
  challengeId: string;
  diffContent: string;
  issues: EmbeddedIssue[];
}

interface StudentFlag {
  lineNumber: number;
  category: Category;
}

export default function PRReviewChallenge({
  challengeId,
  diffContent,
  issues
}: PRReviewChallengeProps) {
  const { completeModule } = useMasteryStore();
  const [flags, setFlags] = useState<StudentFlag[]>([]);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);

  // Parse diff into lines
  const lines = useMemo(() => {
    return diffContent.split('\n').map((content, index) => {
      const type = content.startsWith('+') ? 'add' : content.startsWith('-') ? 'remove' : 'context';
      return { content, type, index: index + 1 }; // 1-indexed
    });
  }, [diffContent]);

  const handleFlagLine = (lineNumber: number) => {
    if (isSubmitted) return;
    if (flags.some(f => f.lineNumber === lineNumber)) {
      setFlags(flags.filter(f => f.lineNumber !== lineNumber)); // toggle off
      setActiveLine(null);
    } else {
      setActiveLine(lineNumber);
    }
  };

  const submitFlag = (category: Category) => {
    if (activeLine === null) return;
    setFlags([...flags, { lineNumber: activeLine, category }]);
    setActiveLine(null);
  };

  const getPoints = (severity: Severity) => {
    switch (severity) {
      case 'Critical': return 5;
      case 'Major': return 3;
      case 'Minor': return 1;
      default: return 0;
    }
  };

  const handleSubmit = () => {
    let earned = 0;
    let total = 0;

    // Calculate max possible score
    issues.forEach(issue => {
      total += getPoints(issue.severity);
    });

    // Calculate earned score
    flags.forEach(flag => {
      const matchedIssue = issues.find(i => i.lineNumber === flag.lineNumber && i.category === flag.category);
      if (matchedIssue) {
        earned += getPoints(matchedIssue.severity);
      }
    });

    setScore(earned);
    setMaxScore(total);
    setIsSubmitted(true);

    // If they score > 0, consider it a completion, or require a threshold? 
    // Let's just grant mastery if they score > 0 for now
    if (earned > 0) {
      completeModule(challengeId, Math.round((earned / total) * 100)).catch(console.error);
    }
  };

  const categories: Category[] = ['Bug', 'Flakiness', 'Architecture', 'Maintainability', 'Security', 'Performance'];

  return (
    <div data-testid="pr-review-challenge" className="mt-8 mb-12 font-sans border border-slate-700 bg-[#0f172a] rounded-2xl overflow-hidden shadow-2xl">
      <div className="bg-slate-800 border-b border-slate-700 p-6">
        <h3 className="text-2xl font-black text-white m-0 flex items-center gap-3">
          <GitPullRequest className="w-6 h-6 text-purple-400" />
          Code Review Academy
        </h3>
        <p className="text-slate-400 text-sm mt-2 mb-0 max-w-3xl">
          Review the PR diff below. Click on a line to flag an issue. Categorize your findings correctly to earn points.
          (Critical = 5pts, Major = 3pts, Minor = 1pt).
        </p>
      </div>

      <div className="p-0 overflow-x-auto bg-[#1e1e1e]" tabIndex={0}>
        <table className="w-full text-left border-collapse font-mono text-sm">
          <tbody>
            {lines.map((line) => {
              const isFlagged = flags.some(f => f.lineNumber === line.index);
              const isActive = activeLine === line.index;
              const hasActualIssue = isSubmitted && issues.some(i => i.lineNumber === line.index);
              const flaggedIssue = flags.find(f => f.lineNumber === line.index);
              const correctIssue = issues.find(i => i.lineNumber === line.index);
              
              let rowClass = "group hover:bg-[#2d2d2d] cursor-pointer transition-colors";
              const numClass = "text-slate-500 w-12 text-right pr-4 select-none border-r border-slate-700";
              const contentClass = "whitespace-pre pl-4 pr-8 py-1 relative";
              let textColor = '#cbd5e1'; // slate-300
              if (line.type === 'add') {
                rowClass += " bg-emerald-950 hover:bg-emerald-900";
                textColor = '#34d399'; // emerald-400
              } else if (line.type === 'remove') {
                rowClass += " bg-rose-950 hover:bg-rose-900";
                textColor = '#fb7185'; // rose-400
              }

              if (isFlagged && !isSubmitted) {
                rowClass = "bg-yellow-900/40";
              }

              return (
                <React.Fragment key={line.index}>
                  <tr data-line={line.index} className={rowClass} onClick={() => handleFlagLine(line.index)}>
                    <td className={numClass}>{line.index}</td>
                    <td className={contentClass} style={{ color: textColor }}>
                      {line.content}
                      {isFlagged && !isSubmitted && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs bg-yellow-600/30 text-yellow-500 px-2 py-0.5 rounded border border-yellow-600">
                          <MessageSquare className="w-3 h-3" />
                          {flaggedIssue?.category}
                        </div>
                      )}
                      {isSubmitted && hasActualIssue && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1 z-10">
                           <div className={`text-xs px-2 py-1 rounded border shadow-lg ${correctIssue?.category === flaggedIssue?.category ? 'bg-emerald-900 text-emerald-400 border-emerald-600' : 'bg-red-900 text-red-400 border-red-600'}`}>
                              Real: {correctIssue?.severity} {correctIssue?.category}
                              <br/>
                              {correctIssue?.description}
                           </div>
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {/* Category Selection Popover */}
                  {isActive && !isSubmitted && (
                    <tr>
                      <td colSpan={2} className="p-4 bg-slate-800 border-y border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-white">Flag Issue as:</span>
                          <div className="flex flex-wrap gap-2">
                            {categories.map(cat => (
                              <button 
                                key={cat}
                                onClick={(e) => { e.stopPropagation(); submitFlag(cat); }}
                                className="px-3 py-1.5 bg-slate-700 hover:bg-purple-600 text-slate-200 text-xs font-bold rounded border border-slate-600 hover:border-purple-500 transition-colors"
                              >
                                {cat}
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-700">
        {!isSubmitted ? (
          <>
            <div className="flex items-center gap-4 text-slate-400 text-sm">
               <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-yellow-500"/> {flags.length} lines flagged</span>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-500 transition-colors shadow-lg"
            >
              Submit Review
            </button>
          </>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
            <div className="flex items-center gap-5">
               <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-inner">
                 <Award className={`w-8 h-8 ${score > 0 ? 'text-purple-400' : 'text-slate-500'}`} />
               </div>
               <div>
                 <h4 className="text-white font-bold text-xl m-0">Review Completed</h4>
                 <p className="text-slate-400 m-0 text-sm mt-1">
                   You earned {score} out of {maxScore} points.
                 </p>
               </div>
            </div>
            <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < Math.round((score / maxScore) * 5) ? 'text-yellow-400 fill-yellow-400' : 'text-slate-700'}`} />
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
