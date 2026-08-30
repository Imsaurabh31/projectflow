import React, { useState } from 'react';

const Select = ({ label, error, options = [], containerStyle = {}, style = {}, ...props }) => {
  const [focused, setFocused] = useState(false);
  const id = props.id || props.name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, ...containerStyle }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: 13, fontWeight: 600,
          color: focused ? 'var(--indigo-600)' : 'var(--gray-600)',
          transition: 'color var(--t)', letterSpacing: '-0.01em',
        }}>
          {label}
        </label>
      )}
      <select
        id={id}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '9px 12px',
          border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--indigo-400)' : 'var(--gray-200)'}`,
          borderRadius: 'var(--radius)', fontSize: 14,
          color: 'var(--gray-800)', background: focused ? '#fff' : 'var(--gray-50)',
          outline: 'none', cursor: 'pointer',
          boxShadow: focused ? '0 0 0 3px rgba(99,102,241,.12)' : 'none',
          transition: 'all var(--t)',
          ...style,
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</span>}
    </div>
  );
};

export default Select;
