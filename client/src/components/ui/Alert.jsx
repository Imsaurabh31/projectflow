import React from 'react';

const TYPES = {
  error:   { bg: '#fff5f5', color: '#c53030', border: '#feb2b2', icon: '⚠' },
  success: { bg: '#f0fff4', color: '#276749', border: '#9ae6b4', icon: '✓' },
  warning: { bg: '#fffaf0', color: '#c05621', border: '#fbd38d', icon: '!' },
  info:    { bg: '#ebf8ff', color: '#2b6cb0', border: '#90cdf4', icon: 'i' },
};

const Alert = ({ type = 'info', message, style = {} }) => {
  if (!message) return null;
  const s = TYPES[type] || TYPES.info;
  return (
    <div role="alert" style={{
      padding: '10px 14px',
      borderRadius: 'var(--radius)',
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: 13.5, fontWeight: 500,
      display: 'flex', alignItems: 'flex-start', gap: 8,
      animation: 'fadeIn .2s ease',
      ...style,
    }}>
      <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{s.icon}</span>
      <span>{message}</span>
    </div>
  );
};

export default Alert;
