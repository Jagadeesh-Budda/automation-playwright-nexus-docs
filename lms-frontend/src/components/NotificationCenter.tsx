import React, { useState, useRef, useEffect } from 'react';
import { Bell, Trophy, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { useMasteryStore } from '../store/useMasteryStore';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { telemetryLogs, unreadCount, markAllAsRead } = useMasteryStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!isOpen && unreadCount > 0) {
      markAllAsRead();
    }
    setIsOpen(!isOpen);
  };

  // Map log types to icons and colors
  const getLogConfig = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
      case 'ACHIEVEMENT':
        return { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10' };
      case 'WARNING':
        return { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-500/10' };
      default:
        return { icon: Info, color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    }
  };

  return (
    <div className="relative" ref={popoverRef}>
      <button 
        onClick={handleToggle}
        className="relative flex items-center justify-center p-2 rounded-full hover:bg-[var(--sidebar-bg)] text-[var(--text-main)] transition-colors border-none bg-transparent cursor-pointer"
      >
        <Bell className="w-5 h-5 text-slate-400" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-80 rounded-2xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-xl animate-fade-in z-[9999] text-left">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
            <h3 className="text-sm font-black text-white uppercase tracking-wider m-0">Notifications</h3>
            {telemetryLogs && telemetryLogs.filter(log => log.type !== 'INFO').length > 0 && (
              <span className="text-[10px] font-bold text-slate-500">
                {telemetryLogs.filter(log => log.type !== 'INFO').length} Events
              </span>
            )}
          </div>
          
          <div className="flex flex-col gap-2 max-h-[320px] overflow-y-auto scrollbar-thin pr-1">
            {telemetryLogs && telemetryLogs.filter(log => log.type !== 'INFO').length > 0 ? (
              telemetryLogs.filter(log => log.type !== 'INFO').slice(0, 15).map((log, idx) => {
                const config = getLogConfig(log.type);
                const Icon = config.icon;
                return (
                  <div key={idx} className="flex gap-3 items-start p-2.5 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/80 transition-colors">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${config.color}`}>
                          {log.type}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 flex-shrink-0">
                          {log.timestamp}
                        </span>
                      </div>
                      <span className="text-xs text-slate-300 font-medium leading-snug mt-1 break-words">
                        {log.message}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-50">
                <Bell className="w-8 h-8 text-slate-500 mb-2" />
                <span className="text-xs font-bold text-slate-400">All caught up!</span>
                <span className="text-[10px] text-slate-500 mt-1">No recent notifications.</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
