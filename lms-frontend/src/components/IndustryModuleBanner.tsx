import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface Props {
  category: string;
}

export const IndustryModuleBanner = ({ category }: Props) => {
  if (category !== 'industry-specific') return null;

  return (
    <div className="my-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-1">
            ⚠️ Industry-Specific Module
          </h3>
          <p className="text-sm text-slate-300">
            This lesson focuses on regulated systems, compliance workflows, or domain-specific automation patterns.
          </p>
          <p className="text-sm text-slate-400 mt-2 flex items-center gap-1">
            <Info className="h-4 w-4" /> You can safely skip this lesson if your goal is general Playwright automation.
          </p>
        </div>
      </div>
    </div>
  );
};
