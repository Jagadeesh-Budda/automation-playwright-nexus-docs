import React from 'react';

export default function JuniorShield({ isActive, idSuffix = "default" }: { isActive: boolean; idSuffix?: string }) {
  return (
    <svg className={`w-13 h-13 ${isActive ? 'drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]' : 'opacity-80'}`} viewBox="0 0 64 64" fill="none">
      {/* Clean Shield Base */}
      <path d="M 32 6 L 54 14 L 54 36 C 54 48 32 58 32 58 C 32 58 10 48 10 36 L 10 14 Z" fill={`url(#silverEmblemBg-${idSuffix})`} stroke={`url(#silverEmblemBorder-${idSuffix})`} strokeWidth="3" />
      {/* Inner Beveled Plate */}
      <path d="M 32 10 L 49 16 L 49 34 C 49 44 32 53 32 53 C 32 53 15 44 15 34 L 15 16 Z" fill={`url(#blueEmblemCore-${idSuffix})`} stroke={`url(#silverEmblemBorder-${idSuffix})`} strokeWidth="1" />
      {/* Center Star */}
      <g>
        <polygon points="32,32 32,20 29,29" fill="#e2e8f0" />
        <polygon points="32,32 32,20 35,29" fill="#ffffff" />
        <polygon points="32,32 44,32 35,29" fill="#f1f5f9" />
        <polygon points="32,32 44,32 35,35" fill="#cbd5e1" />
        <polygon points="32,32 32,44 35,35" fill="#94a3b8" />
        <polygon points="32,32 32,44 29,35" fill="#64748b" />
        <polygon points="32,32 20,32 29,35" fill="#475569" />
        <polygon points="32,32 20,32 29,29" fill="#cbd5e1" />
      </g>
      <defs>
        <linearGradient id={"silverEmblemBg-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#475569" />
        </linearGradient>
        <linearGradient id={"silverEmblemBorder-" + idSuffix} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <radialGradient id={"blueEmblemCore-" + idSuffix} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="70%" stopColor="#1d4ed8" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
    </svg>
  );
}
