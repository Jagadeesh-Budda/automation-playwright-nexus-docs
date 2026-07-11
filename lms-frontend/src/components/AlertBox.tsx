import React from 'react';
import { Info, Lightbulb, AlertTriangle, AlertOctagon, ShieldAlert } from 'lucide-react';

interface AlertBoxProps {
  type: string;
  children: React.ReactNode;
}

export default function AlertBox({ type, children }: AlertBoxProps) {
  const config = {
    NOTE: {
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'NOTE',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-300 dark:border-blue-500/30',
      text: 'text-blue-800 dark:text-blue-200'
    },
    TIP: {
      icon: <Lightbulb className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      title: 'TIP',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-300 dark:border-emerald-500/30',
      text: 'text-emerald-800 dark:text-emerald-200'
    },
    IMPORTANT: {
      icon: <AlertTriangle className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      title: 'IMPORTANT',
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      border: 'border-purple-300 dark:border-purple-500/30',
      text: 'text-purple-800 dark:text-purple-200'
    },
    WARNING: {
      icon: <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      title: 'WARNING',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-300 dark:border-amber-500/30',
      text: 'text-amber-800 dark:text-amber-200'
    },
    CAUTION: {
      icon: <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-500" />,
      title: 'CAUTION',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-300 dark:border-red-500/30',
      text: 'text-red-800 dark:text-red-200'
    }
  };

  const style = config[type as keyof typeof config] || config.NOTE;

  return (
    <div className={`my-6 border-l-4 rounded-r-xl p-5 ${style.bg} ${style.border} shadow-lg backdrop-blur-sm relative overflow-hidden group`}>
      {/* Decorative gradient blur in background */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full mix-blend-screen filter blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${style.bg.replace('/40', '').replace('dark:', '')}`}></div>
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="flex-shrink-0 mt-0.5">
          {style.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className={`text-sm font-black tracking-widest mb-2 ${style.text}`}>
            {style.title}
          </h5>
          <div className="text-slate-800 dark:text-slate-300 text-[15px] leading-relaxed [&>p]:mb-3 last:[&>p]:mb-0 [&>ul]:mt-2 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
