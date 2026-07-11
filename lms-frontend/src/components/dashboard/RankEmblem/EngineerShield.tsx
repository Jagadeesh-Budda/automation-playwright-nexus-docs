import React from 'react';

export default function EngineerShield({ isActive, idSuffix = "default" }: { isActive: boolean; idSuffix?: string }) {
  return (
    <svg className={`w-13 h-13 ${isActive ? 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]' : 'opacity-80'}`} viewBox="0 0 64 64" fill="none">
      {/* Left Wing Plates */}
      <path d="M 22 24 L 2 14 L 6 36 L 22 36 Z" fill={`url(#wingMetal-${idSuffix})`} stroke="#64748b" strokeWidth="0.5" />
      <path d="M 22 30 L 6 24 L 8 44 L 22 40 Z" fill={`url(#wingMetalDark-${idSuffix})`} stroke="#475569" strokeWidth="0.5" />
      {/* Right Wing Plates */}
      <path d="M 42 24 L 62 14 L 58 36 L 42 36 Z" fill={`url(#wingMetal-${idSuffix})`} stroke="#64748b" strokeWidth="0.5" />
      <path d="M 42 30 L 58 24 L 56 44 L 42 40 Z" fill={`url(#wingMetalDark-${idSuffix})`} stroke="#475569" strokeWidth="0.5" />
      {/* Center Purple Shield */}
      <path d="M 32 10 L 46 16 L 46 36 C 46 45 32 53 32 53 C 32 53 18 45 18 36 L 18 16 Z" fill={`url(#hexBg-${idSuffix})`} stroke={`url(#hexBorder-${idSuffix})`} strokeWidth="2.5" />
      {/* Inner Chip Core */}
      <rect x="26" y="22" width="12" height="12" rx="1" fill={`url(#chipMetal-${idSuffix})`} stroke="#c084fc" strokeWidth="1" />
      <path d="M 30 22 L 30 20 M 32 22 L 32 20 M 34 22 L 34 20 M 30 34 L 30 36 M 32 34 L 32 36 M 34 34 L 34 36 M 26 26 L 24 26 M 26 28 L 24 28 M 26 30 L 24 30 M 38 26 L 40 26 M 38 28 L 40 28 M 38 30 L 40 30" stroke="#e9d5ff" strokeWidth="0.75" />
      <defs>
        <linearGradient id={"wingMetal-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <linearGradient id={"wingMetalDark-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
        <linearGradient id={"hexBg-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b0764" />
          <stop offset="100%" stopColor="#120024" />
        </linearGradient>
        <linearGradient id={"hexBorder-" + idSuffix} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d8b4fe" />
          <stop offset="100%" stopColor="#6b21a8" />
        </linearGradient>
        <linearGradient id={"chipMetal-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
    </svg>
  );
}
