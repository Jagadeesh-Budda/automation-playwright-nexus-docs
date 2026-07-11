import React from 'react';

export default function LegendShield({ isActive, idSuffix = "default" }: { isActive: boolean; idSuffix?: string }) {
  return (
    <svg className={`w-13 h-13 ${isActive ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.75)]' : 'opacity-80'}`} viewBox="0 0 64 64" fill="none">
      {/* Spiky Ornate Legendary Background Frame */}
      <path d="M 32 2 L 37 10 L 47 6 L 44 16 L 56 12 L 48 24 L 58 32 L 48 40 L 56 52 L 44 48 L 47 58 L 37 54 L 32 62 L 27 54 L 17 58 L 20 48 L 8 52 L 16 40 L 6 32 L 16 24 L 8 12 L 20 16 L 17 6 L 27 10 Z" fill={`url(#legendFrameGold-${idSuffix})`} stroke="#78350f" strokeWidth="1" />
      {/* Inner Crest Shield */}
      <path d="M 32 10 L 47 17 L 44 41 L 32 52 L 20 41 L 17 17 Z" fill={`url(#legendCrestBg-${idSuffix})`} stroke={`url(#legendCrestBorder-${idSuffix})`} strokeWidth="2.5" />
      {/* Faceted Ruby Gemstone */}
      <g>
        <polygon points="32,31 32,20 23,31" fill="#ef4444" />
        <polygon points="32,31 32,20 41,31" fill="#fca5a5" />
        <polygon points="32,31 41,31 32,43" fill="#b91c1c" />
        <polygon points="32,31 23,31 32,43" fill="#7f1d1d" />
      </g>
      <circle cx="32" cy="31" r="1.5" fill="#ffffff" opacity="0.8" />
      <defs>
        <linearGradient id={"legendFrameGold-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="50%" stopColor="#ca8a04" />
          <stop offset="100%" stopColor="#78350f" />
        </linearGradient>
        <linearGradient id={"legendCrestBg-" + idSuffix} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="50%" stopColor="#7f1d1d" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
        <linearGradient id={"legendCrestBorder-" + idSuffix} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fca5a5" />
          <stop offset="50%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
      </defs>
    </svg>
  );
}
