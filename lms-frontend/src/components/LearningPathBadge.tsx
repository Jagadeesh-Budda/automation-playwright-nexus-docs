import React from 'react';
import { Rocket, Building2, Stethoscope } from 'lucide-react';

interface Props {
  path: string;
}

export const LearningPathBadge = ({ path }: Props) => {
  switch (path.toLowerCase()) {
    case 'foundations':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
          <Rocket className="w-3 h-3" /> Foundations
        </span>
      );
    case 'enterprise':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          <Building2 className="w-3 h-3" /> Enterprise SDET
        </span>
      );
    case 'regulated':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Stethoscope className="w-3 h-3" /> Regulated Industry
        </span>
      );
    default:
      return null;
  }
};
