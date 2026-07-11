import React from 'react';

export default function SkillTooltip({
  name,
  status,
  lessons,
  xp,
  prereq,
  align
}: {
  name: string;
  status: 'completed' | 'in-progress' | 'locked';
  lessons: number;
  xp: number;
  prereq: string;
  align: 'left' | 'center' | 'right';
}) {
  const statusBadge = {
    'completed': '✓ Completed',
    'in-progress': '● In Progress',
    'locked': '🔒 Locked'
  };

  const statusColorClass = status === 'completed' ? 'text-green-400' :
                           status === 'in-progress' ? 'text-blue-400' :
                           'text-slate-500';

  const positionClass = align === 'left' ? 'left-[-10px]' :
                        align === 'right' ? 'right-[-10px]' :
                        'left-1/2 transform -translate-x-1/2';

  return (
    <div className={`absolute bottom-[calc(100%+8px)] ${positionClass} z-[9999] w-56 p-4 rounded-xl border border-slate-800 bg-slate-950/95 shadow-2xl flex flex-col gap-1.5 text-left text-xs pointer-events-none animate-fade-in backdrop-blur-md`}>
      <span className="font-bold text-white text-[13px]">{name}</span>
      <span className={`font-semibold text-[10px] ${statusColorClass}`}>
        {statusBadge[status]}
      </span>
      <div className="border-t border-white/5 my-1" />
      <div className="flex justify-between text-slate-400 font-medium">
        <span>Lessons:</span>
        <span className="text-white font-bold">{lessons} lessons</span>
      </div>
      <div className="flex justify-between text-slate-400 font-medium">
        <span>XP Reward:</span>
        <span className="text-amber-400 font-bold">+{xp} XP</span>
      </div>
      <div className="flex justify-between text-slate-400 font-medium">
        <span>Prereq:</span>
        <span className="text-slate-300 font-bold">{prereq}</span>
      </div>
    </div>
  );
}
