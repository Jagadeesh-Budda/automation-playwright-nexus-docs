import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SkillTooltip from './SkillTooltip';

export default function SkillNode({
  name,
  lessons,
  xp,
  prereq,
  status,
  link,
  align = 'center'
}: {
  name: string;
  lessons: number;
  xp: number;
  prereq: string;
  status: 'completed' | 'in-progress' | 'locked';
  link: string;
  align?: 'left' | 'center' | 'right';
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  
  const colorMap = {
    'completed': 'border-emerald-500/40 bg-gradient-to-br from-slate-950 to-emerald-950/40 text-emerald-400 shadow-[0_4px_12px_rgba(16,185,129,0.15)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]',
    'in-progress': 'border-cyan-400/50 bg-gradient-to-br from-slate-950 to-cyan-950/50 text-cyan-400 shadow-[0_4px_12px_rgba(34,211,238,0.25)] hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-node-pulse',
    'locked': 'border-slate-900 bg-slate-950/80 text-slate-600 cursor-not-allowed opacity-45 shadow-none'
  };

  return (
    <div 
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => {
          if (status !== 'locked') {
            router.push(link);
          }
        }}
        className={`px-5 py-2.5 rounded-[1.2rem] border-2 font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 scale-100 hover:scale-[1.1] hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] ${colorMap[status]} cursor-pointer`}
        disabled={status === 'locked'}
      >
        {name}
      </button>

      {hovered && (
        <SkillTooltip 
          name={name}
          status={status}
          lessons={lessons}
          xp={xp}
          prereq={prereq}
          align={align}
        />
      )}
    </div>
  );
}
