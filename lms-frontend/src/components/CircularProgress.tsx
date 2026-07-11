import React from 'react';

export interface CircularProgressProps {
  percent: number;
  color: string;
  label: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({ percent, color, label }) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700/20" />
          <circle cx="32" cy="32" r={radius} stroke={color} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
        </svg>
        <span className="absolute text-[10px] font-black text-white">{percent}%</span>
      </div>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center leading-tight">{label}</span>
    </div>
  );
};

export default CircularProgress;
