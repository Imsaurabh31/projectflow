import React from 'react';

const EmptyState = ({ icon, title, description, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '64px 24px', textAlign: 'center', gap: 12,
    animation: 'fadeIn .3s ease',
  }}>
    {icon && (
      <div style={{
        width: 72, height: 72, borderRadius: 'var(--radius-xl)',
        background: 'var(--grad-subtle)',
        border: '1.5px solid var(--gray-200)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--gray-300)', marginBottom: 4,
        boxShadow: 'var(--shadow-sm)',
      }}>
        {icon}
      </div>
    )}
    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-700)', letterSpacing: '-0.02em' }}>
      {title}
    </h3>
    {description && (
      <p style={{ fontSize: 14, color: 'var(--gray-400)', maxWidth: 340, lineHeight: 1.6 }}>{description}</p>
    )}
    {action && <div style={{ marginTop: 10 }}>{action}</div>}
  </div>
);

export default EmptyState;
