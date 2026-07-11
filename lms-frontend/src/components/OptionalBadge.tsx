import React from 'react';
import { FastForward, Star } from 'lucide-react';

interface Props {
  optional: boolean;
  category?: string;
}

export const OptionalBadge = ({ optional, category }: Props) => {
  if (!optional) return null;
  
  if (category === 'industry-specific') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Star className="w-3 h-3" /> Specialization
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
      <FastForward className="w-3 h-3" /> Optional
    </span>
  );
};
