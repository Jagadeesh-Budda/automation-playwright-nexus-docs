"use client";
import React, { useState, useEffect } from 'react';
import { useMasteryStore } from '../../store/useMasteryStore';
import { Lock, FileText, CheckCircle2, Copy, Download, ChevronRight, Sparkles, Award } from 'lucide-react';
import Link from 'next/link';

export default function ResumeBuilder() {
  const { claimedCertificates, userProgress, userName, initUser } = useMasteryStore();
  const [copied, setCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    initUser();
    setIsClient(true);
  }, [initUser]);

  // Prevent hydration mismatch
  if (!isClient) return null;

  const hasAnyCert = Object.values(claimedCertificates).some(Boolean);

  // Access Control
  if (!hasAnyCert) {
    return (
      <div className="min-h-screen bg-[#040404] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full border border-rose-500/20 bg-rose-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(244,63,94,0.15)] relative">
          <div className="absolute inset-0 rounded-full border border-rose-500/40 animate-ping opacity-20" />
          <Lock className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Access Denied</h1>
        <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
          The Enterprise Resume Builder is an exclusive tool reserved for certified engineers. You must complete the Capstone Project and claim your Automation Nexus Certificate to unlock this feature.
        </p>
        <Link 
          href="/"
          className="px-8 py-3 bg-slate-900 border border-slate-700 text-white rounded-lg font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          Return to Dashboard <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Generate ATS-Optimized Bullets based on real mastery data
  const hasBankingBadge = (userProgress['industry-banking'] || 0) >= 70;
  const hasCommerceBadge = (userProgress['industry-ecommerce'] || 0) >= 70;
  const hasPharmaBadge = (userProgress['industry-healthcare'] || 0) >= 70;

  const generateBullets = () => {
    // Calculate topic mastery from user progress
    const apiScore = Object.entries(userProgress).filter(([k]) => k.startsWith('api')).reduce((acc, [_, v]) => acc + v, 0) / Math.max(1, Object.entries(userProgress).filter(([k]) => k.startsWith('api')).length);
    const networkScore = Object.entries(userProgress).filter(([k]) => k.includes('network') || k.includes('mock')).reduce((acc, [_, v]) => acc + v, 0) / Math.max(1, Object.entries(userProgress).filter(([k]) => k.includes('network') || k.includes('mock')).length);
    const locatorScore = Object.entries(userProgress).filter(([k]) => k.includes('locator')).reduce((acc, [_, v]) => acc + v, 0) / Math.max(1, Object.entries(userProgress).filter(([k]) => k.includes('locator')).length);
    const assertScore = Object.entries(userProgress).filter(([k]) => k.includes('assert')).reduce((acc, [_, v]) => acc + v, 0) / Math.max(1, Object.entries(userProgress).filter(([k]) => k.includes('assert')).length);

    const bullets = [
      "Architected and maintained an Enterprise E2E Test Automation Framework from scratch using Playwright and TypeScript, enforcing strict Page Object Model (POM) paradigms."
    ];

    if (apiScore > 70) {
      bullets.push("Engineered a hybrid UI/API test strategy, utilizing Playwright's `request.post` contexts to rapidly seed database state, reducing overall suite execution time by 60%.");
    }

    if (networkScore > 70) {
      bullets.push("Intercepted and mocked critical third-party network requests during test execution, ensuring hermetic environments and preventing flakiness caused by external dependencies.");
    }

    if (locatorScore > 80 || assertScore > 80) {
      bullets.push("Implemented robust, user-centric locators and auto-waiting assertions to mathematically eliminate test flakiness across dynamic, heavily-loaded React applications.");
    }

    // Since they have the certificate, they completed the CI/CD capstone
    bullets.push("Integrated automated E2E suites into CI/CD pipelines (GitHub Actions) with parallel test sharding, artifact retention, and comprehensive HTML reporting.");
    
    // Specialist Badges Bullets
    if (hasBankingBadge) {
      bullets.push("Architected a compliant E2E banking automation suite verifying Shadow DOM Web Components, multi-currency grids, and mocked 3D Secure SMS flows.");
    }
    if (hasCommerceBadge) {
      bullets.push("Engineered a global E-Commerce checkout pipeline validating localized currency logic, cart state boundary testing, and mocked inventory API intercepts.");
    }
    if (hasPharmaBadge) {
      bullets.push("Implemented a 21 CFR Part 11 compliant automation framework verifying LIMS Sample Approvals, immutable audit trails, and PHI data redaction using GraphQL intercepts.");
    }
    return bullets;
  };

  const bullets = generateBullets();
  const resumeText = bullets.map(b => `• ${b}`).join('\n\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(resumeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([resumeText], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${userName.replace(/\s+/g, '_')}_Automation_Resume_Bullets.txt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-[#040404] p-6 lg:p-12 font-sans relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white m-0 tracking-tight">Resume Builder</h1>
                <p className="text-cyan-400 font-bold uppercase tracking-widest text-xs m-0 mt-1 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5" /> Certified Engineer Exclusive
                </p>
              </div>
            </div>
            <p className="text-slate-400 max-w-xl text-sm leading-relaxed m-0">
              The following ATS-optimized resume bullet points have been dynamically generated based on the specific architectural skills you proved during your Capstone certification.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/" className="px-5 py-2.5 bg-slate-900/80 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Document Preview */}
          <div className="lg:col-span-2 space-y-6">

            {/* Specialist Badges */}
            {(hasBankingBadge || hasCommerceBadge || hasPharmaBadge) && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Earned Specialist Badges</h3>
                <div className="flex flex-wrap gap-3">
                  {hasBankingBadge && (
                    <div className="flex items-center gap-2 bg-emerald-950/30 border border-emerald-500/30 px-3 py-1.5 rounded-full">
                      <span className="text-lg">🏦</span>
                      <span className="text-emerald-400 font-bold text-sm">Banking Specialist</span>
                    </div>
                  )}
                  {hasCommerceBadge && (
                    <div className="flex items-center gap-2 bg-blue-950/30 border border-blue-500/30 px-3 py-1.5 rounded-full">
                      <span className="text-lg">🛒</span>
                      <span className="text-blue-400 font-bold text-sm">Commerce Specialist</span>
                    </div>
                  )}
                  {hasPharmaBadge && (
                    <div className="flex items-center gap-2 bg-rose-950/30 border border-rose-500/30 px-3 py-1.5 rounded-full">
                      <span className="text-lg">🏥</span>
                      <span className="text-rose-400 font-bold text-sm">Pharma Specialist</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-xl relative group">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-2xl pointer-events-none" />
              
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                <h2 className="text-lg font-black text-white tracking-wide flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Professional Experience
                </h2>
                <span className="text-xs font-mono text-slate-500">Auto-Generated for {userName}</span>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="mb-4">
                  <h3 className="text-white font-bold text-base m-0">Senior Software Development Engineer in Test (SDET)</h3>
                  <p className="text-slate-400 text-sm m-0 mt-1">Company Name • Dates of Employment</p>
                </div>
                
                <ul className="space-y-4 m-0 p-0 pl-1 list-none">
                  {bullets.map((bullet, idx) => (
                    <li key={idx} className="text-slate-300 text-sm leading-relaxed flex items-start gap-3">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 flex-shrink-0" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Export Tools</h3>
              
              <button 
                onClick={handleCopy}
                className="w-full mb-3 flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Copy className={`w-5 h-5 ${copied ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'}`} />
                  <span className={`font-bold ${copied ? 'text-emerald-400' : 'text-slate-200'}`}>
                    {copied ? 'Copied to Clipboard' : 'Copy Bullets'}
                  </span>
                </div>
                {copied && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <Download className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
                  <span className="font-bold text-cyan-400 group-hover:text-cyan-300">
                    Export to .TXT
                  </span>
                </div>
              </button>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-emerald-400 font-bold text-sm m-0 mb-1">ATS Optimized</h4>
                  <p className="text-emerald-500/70 text-xs m-0 leading-relaxed">
                    These bullets use strong action verbs and highlight measurable architectural achievements to pass through Applicant Tracking Systems.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
