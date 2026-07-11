import React from 'react';

export default function ArchitectShield({ isActive, idSuffix = "default" }: { isActive: boolean; idSuffix?: string }) {
  return (
    <svg className={`w-13 h-13 ${isActive ? 'drop-shadow-[0_0_10px_rgba(234,179,8,0.6)]' : 'opacity-80'}`} viewBox="0 0 64 64" fill="none">
      {/* Crown Top Crest */}
      <path d="M 22 14 L 25 8 L 32 12 L 39 8 L 42 14 Z" fill={`url(#goldEmblemBorder-${idSuffix})`} stroke="#ca8a04" strokeWidth="1" />
      <circle cx="25" cy="8" r="1.2" fill="#ffffff" />
      <circle cx="32" cy="12" r="1.2" fill="#ffffff" />
      <circle cx="39" cy="8" r="1.2" fill="#ffffff" />
      {/* Shield Base */}
      <path d="M 32 14 L 52 20 L 52 40 C 52 50 32 58 32 58 C 32 58 12 50 12 40 L 12 20 Z" fill={`url(#goldEmblemBg-${idSuffix})`} stroke={`url(#goldEmblemBorder-${idSuffix})`} strokeWidth="3" />
      {/* Left Column */}
      <rect x="18" y="24" width="5" height="18" rx="0.5" fill={`url(#goldColumn-${idSuffix})`} stroke="#a16207" strokeWidth="0.75" />
      {/* Right Column */}
      <rect x="41" y="24" width="5" height="18" rx="0.5" fill={`url(#goldColumn-${idSuffix})`} stroke="#a16207" strokeWidth="0.75" />
      {/* Center Arch */}
      <path d="M 32 22 A 4.5 4.5 0 0 0 27.5 26.5 L 27.5 38 L 36.5 38 L 36.5 26.5 A 4.5 4.5 0 0 0 32 22 Z" fill={`url(#obsidianArch-${idSuffix})`} stroke="#fef08a" strokeWidth="1.5" />
      <circle cx="32" cy="28" r="2" fill="#fde047" />
      <polygon points="31,29 33,29 33.5,35 30.5,35" fill="#fde047" />
      <defs>
        <linearGradient id={"goldEmblemBg-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="50%" stopColor="#854d0e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <linearGradient id={"goldEmblemBorder-" + idSuffix} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <linearGradient id={"goldColumn-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#854d0e" />
        </linearGradient>
        <radialGradient id={"obsidianArch-" + idSuffix} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
    </svg>
  );
}
