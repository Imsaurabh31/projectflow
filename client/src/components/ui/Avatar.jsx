import React from 'react';
import { getInitials } from '../../utils/helpers';

const PALETTES = [
  { bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', shadow: 'rgba(99,102,241,.4)' },
  { bg: 'linear-gradient(135deg,#06b6d4,#0891b2)', shadow: 'rgba(6,182,212,.4)' },
  { bg: 'linear-gradient(135deg,#10b981,#059669)', shadow: 'rgba(16,185,129,.4)' },
  { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', shadow: 'rgba(245,158,11,.4)' },
  { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', shadow: 'rgba(239,68,68,.4)' },
  { bg: 'linear-gradient(135deg,#ec4899,#db2777)', shadow: 'rgba(236,72,153,.4)' },
  { bg: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', shadow: 'rgba(139,92,246,.4)' },
  { bg: 'linear-gradient(135deg,#14b8a6,#0d9488)', shadow: 'rgba(20,184,166,.4)' },
];

const paletteFor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PALETTES[Math.abs(h) % PALETTES.length];
};

const Avatar = ({ name = '', size = 32, style = {}, showRing = false }) => {
  const initials = getInitials(name);
  const palette = paletteFor(name);

  return (
    <div
      title={name}
      aria-label={name}
      style={{
        width: size, height: size, borderRadius: '50%',
        background: palette.bg,
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.max(10, size * 0.36),
        fontWeight: 700, flexShrink: 0, userSelect: 'none',
        boxShadow: showRing ? `0 0 0 2px #fff, 0 0 0 4px ${palette.shadow}` : 'none',
        letterSpacing: '-0.02em',
        ...style,
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;
