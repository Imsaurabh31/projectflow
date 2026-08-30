import React from 'react';

const Spinner = ({ size = 32, color = 'var(--indigo-500)' }) => (
  <div role="status" aria-label="Loading" style={{
    width: size, height: size,
    border: `2.5px solid var(--gray-100)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin .65s linear infinite',
    display: 'inline-block', flexShrink: 0,
  }} />
);

export const PageSpinner = ({ label = 'Loading…' }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    gap: 14, minHeight: 220,
  }}>
    <Spinner size={38} />
    <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 500 }}>{label}</span>
  </div>
);

export default Spinner;
