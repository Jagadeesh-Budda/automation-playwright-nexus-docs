"use client";
import React from "react";
import { X, Check, ShoppingBag, Gift, Sparkles, Code, Server, Award, Key } from "lucide-react";

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8 shadow-2xl shadow-purple-500/10">
        
        {/* Glow Effects */}
        <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full hover:bg-slate-900 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Package</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
            Automation Nexus Upgrade
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1.5">
            Claim the complete source code framework used to build this platform and deploy your own LMS.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Left Column: Community Version */}
          <div className="rounded-xl border border-slate-900 bg-slate-900/20 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-300 mb-1">Community Sandbox</h3>
              <p className="text-xs text-slate-500 mb-6">Free browser-based learning environment</p>
              
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3 text-xs text-slate-400">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Access to all 122 interactive lessons online</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-400">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Interactive editor validation logic</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-400">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Learning path progress tracking</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-400">
                  <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Basic profile & badge statistics</span>
                </li>
              </ul>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-900">
              <span className="text-2xl font-bold text-slate-400 uppercase tracking-tight">Free Access</span>
              <p className="text-[10px] text-slate-500 mt-1">Available online at your live URL</p>
            </div>
          </div>

          {/* Right Column: Enterprise Bundle */}
          <div className="relative rounded-xl border border-purple-500/30 bg-purple-950/10 p-6 flex flex-col justify-between overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.05)]">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500 to-purple-600 text-white font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-bl-lg">
              Best Deal
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                Enterprise Bundle
              </h3>
              <p className="text-xs text-purple-400 mb-6 font-medium">Complete self-hosted stack & source files</p>
              
              <ul className="space-y-3.5">
                <li className="flex items-start gap-3 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Full LMS Codebase:</strong> Next.js frontend + Express API server</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>AST Compiler Engines:</strong> ACORN linter scripts code</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Database Architecture:</strong> Local Postgres SQL schema files</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Secure Authentication:</strong> JWT token and profile modules</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Certificates:</strong> Custom PDFs & cryptographically signed keys</span>
                </li>
                <li className="flex items-start gap-3 text-xs text-slate-200">
                  <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <span><strong>B2B Readiness:</strong> Resell or deploy as a private corporate hub</span>
                </li>
              </ul>
            </div>

            <div className="mt-8 pt-4 border-t border-purple-500/20 flex items-end justify-between">
              <div>
                <span className="text-xs text-purple-400 line-through">₹4,999</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black text-white">₹1,499</span>
                  <span className="text-[10px] text-slate-400">One-time</span>
                </div>
              </div>
              
              <a
                href="https://topmate.io/jagadeesh_budda/2203055"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider rounded-lg transition-all duration-300 no-underline shadow-[0_4px_15px_rgba(168,85,247,0.3)] cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Buy Bundle
              </a>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-500 text-center m-0">
          * Upon purchase, you will receive a secure download link containing the `.zip` archive. Includes deployment readme for Vercel/Render hosting.
        </p>
      </div>
    </div>
  );
}
