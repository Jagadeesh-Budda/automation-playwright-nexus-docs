"use client";
import React, { useState, useEffect } from 'react';
import { Play, AlertOctagon, CheckCircle2, Loader2, X, ShieldCheck, PenTool, Code } from 'lucide-react';
import modulesData from '../data/metadata.json';
import { loadModule } from '../utils/moduleLoader';

interface CodeEditorProps {
  moduleId: string;
  placeholder?: string;
  taskIndex?: number;
}

export default function CodeEditor({ moduleId, placeholder = "// Write your Playwright code here...", taskIndex = 0 }: CodeEditorProps) {
  const [code, setCode] = useState(placeholder);
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; issues?: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);

  // Sync the code with the template placeholder when the module/lesson changes
  useEffect(() => {
    setCode(placeholder);
  }, [moduleId, placeholder]);

  const meta = modulesData.find(m => m.id === moduleId);

  useEffect(() => {
    if (!meta) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    loadModule(meta.moduleFile)
      .then((mod) => {
        const content = mod.lessons.find((l: any) => l.id === moduleId);
        setLessonContent(content);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load module dynamically in CodeEditor:", err);
        setIsLoading(false);
      });
  }, [moduleId, meta]);

  // Check initial verification status and listen for updates
  useEffect(() => {
    const alreadyVerified = localStorage.getItem(`code_verified_${moduleId}_task_${taskIndex}`) === 'true';
    setCodeVerified(alreadyVerified);

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.moduleId === moduleId && detail?.taskIndex === taskIndex) setCodeVerified(true);
    };
    window.addEventListener('codeVerified', handler);
    return () => window.removeEventListener('codeVerified', handler);
  }, [moduleId, taskIndex]);

  // Close modal when verification succeeds
  useEffect(() => {
    if (result?.valid) {
      const timer = setTimeout(() => setIsModalOpen(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [result?.valid]);

  const handleValidate = async () => {
    if (!code.trim()) return;

    setIsValidating(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('/api/validate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, moduleId, taskIndex })
      });

      if (!response.ok) {
        throw new Error('Server returned an error.');
      }

      const data = await response.json();
      setResult(data);
      // Notify Quiz component that code task is verified
      if (data.valid) {
        localStorage.setItem(`code_verified_${moduleId}_task_${taskIndex}`, 'true');
        // Dispatch a custom event so Quiz re-checks instantly (same-page)
        window.dispatchEvent(new CustomEvent('codeVerified', { detail: { moduleId, taskIndex } }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to AST validator.');
    } finally {
      setIsValidating(false);
    }
  };

  if (isLoading) return null;

  const hasTasks = lessonContent && lessonContent.tasks && lessonContent.tasks.length > 0;
  if (!hasTasks) return null;

  return (
    <>
      <div className="mt-12 mb-8 font-sans">
        <div className="mb-8 bg-[#0f172a] border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold">
            <ShieldCheck className="w-5 h-5 text-slate-500" />
            <span>Skill Traceability</span>
          </div>
          {codeVerified ? (
            <span className="inline-block px-4 py-2 rounded-full bg-[#064e3b]/30 border border-emerald-500/30 text-emerald-400 text-sm font-bold shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              Validated: {moduleId} (100%)
            </span>
          ) : (
            <span className="inline-block px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-slate-500 text-sm font-bold">
              Pending: {moduleId}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl font-bold text-white">&gt;_ Practical Tasks (Execution Layer)</span>
        </div>

        <div className="space-y-4">
          {(() => {
            const task = lessonContent?.tasks?.[taskIndex];
            if (!task) return null;
            return (
              <div
                onClick={() => setIsModalOpen(true)}
                className="bg-[#0f172a] border border-slate-700 hover:border-[#38bdf8] transition-colors rounded-xl p-6 cursor-pointer flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
              >
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 font-bold shrink-0">
                    {taskIndex + 1}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white m-0 mb-2">{task.title}</h4>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Required Signature:</div>
                    <div className="text-sm font-mono text-[#38bdf8] bg-[#1e293b] inline-block px-3 py-1 rounded border border-slate-700">
                      {task.hint}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {codeVerified ? (
                    <span className="text-sm font-bold text-emerald-400">Validated</span>
                  ) : (
                    <span className="text-sm font-medium text-slate-500">Status: Pending Verification</span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>


      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[95vh] shadow-2xl flex flex-col overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#1e293b]">
              <div className="flex items-center gap-2 text-[#38bdf8] font-bold">
                <ShieldCheck className="w-5 h-5" />
                Technical Gate: Execution Proof
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Target */}
            <div className="px-6 py-4 border-b border-slate-800 bg-[#0f172a]">
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg px-4 py-3 text-sm text-slate-300">
                <span className="text-[#38bdf8] font-bold mr-2 uppercase tracking-widest text-xs">Validation Target:</span>
                <span className="font-bold">{(lessonContent?.tasks?.[taskIndex] as any)?.title}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex px-6 border-b border-slate-800 bg-[#0f172a]">
              <button className="px-4 py-3 text-sm font-bold text-[#38bdf8] border-b-2 border-[#38bdf8] bg-transparent cursor-pointer flex items-center gap-2">
                <span className="font-mono text-xs">&gt;_</span> Interactive Sandbox Workspace
              </button>
              <button className="px-4 py-3 text-sm font-medium text-slate-500 border-b-2 border-transparent bg-transparent cursor-default flex items-center gap-2 opacity-50">
                <PenTool className="w-4 h-4" />
                Manual Verification Proof
              </button>
            </div>

            {/* Workspace */}
            <div className="p-6 bg-slate-900 flex flex-col gap-4 overflow-y-auto flex-1">
              {/* Editor area */}
              <div className="bg-[#1e1e1e] rounded-xl border border-slate-700 overflow-hidden flex flex-col shadow-inner">
                <div className="flex items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-bold tracking-widest">
                    <Code className="w-4 h-4" />
                    SOURCE_FILE.JS
                  </div>
                  <button
                    onClick={handleValidate}
                    disabled={isValidating || !code.trim()}
                    className="flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded font-bold text-sm hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
                  >
                    {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    Run Suite & Verify
                  </button>
                </div>
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={`// AEGIS Sandbox Playboard\n// Hint: ${(lessonContent?.tasks?.[taskIndex] as any)?.hint || 'Write your code here'}\n\n`}
                  className="w-full h-56 p-5 font-mono text-[13px] leading-relaxed bg-[#1e1e1e] text-[#d4d4d4] focus:outline-none resize-none"
                  spellCheck="false"
                />
              </div>

              {/* Terminal area */}
              <div className="bg-[#0a0a0a] rounded-xl border border-slate-800 p-5 font-mono text-[13px] leading-relaxed text-slate-400 shadow-inner overflow-y-auto max-h-40">
                <div className="flex items-center gap-2 text-emerald-500 font-bold mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  AEGIS INDUSTRIAL WORKSPACE v2.8
                </div>
                {error ? (
                  <div className="text-red-400 mb-2">
                    [ERROR] Validation failed. {error}
                  </div>
                ) : result ? (
                  <div className={result.valid ? "text-emerald-400 mb-2" : "text-amber-400 mb-2"}>
                    {result.valid ? "[SUCCESS] AST Validation Passed! Execution logic verified." : `[FAILED] Architectural Requirements Not Met:\n${result.issues?.join('\n')}`}
                  </div>
                ) : (
                  <div className="mb-5">
                    Secure sandboxed environment ready. Type 'help' for instructions.<br />
                    Write your code in the editor above and click 'Run Suite & Verify' to execute.
                  </div>
                )}
                <div className="flex text-slate-500 items-center">
                  <span className="text-[#38bdf8] font-bold">candidate@AEGIS-workspace</span>
                  <span className="text-slate-400 mx-1">:</span>
                  <span className="text-emerald-400">~</span>
                  <span className="ml-1 text-white">$</span>
                  <div className="w-2 h-4 bg-slate-400 ml-2 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
