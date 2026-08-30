import React, { useState } from 'react';

const Input = React.forwardRef(
  ({ label, error, hint, as: As = 'input', style = {}, containerStyle = {}, icon, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const id = props.id || props.name;
    const isTextarea = As === 'textarea';

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
        <div style={{ position: 'relative' }}>
          {icon && (
            <div style={{
              position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
              color: focused ? 'var(--indigo-500)' : 'var(--gray-400)',
              pointerEvents: 'none', display: 'flex', transition: 'color var(--t)',
            }}>
              {icon}
            </div>
          )}
          <As
            ref={ref}
            id={id}
            style={{
              width: '100%',
              padding: icon ? '9px 12px 9px 36px' : '9px 12px',
              border: `1.5px solid ${error ? 'var(--danger)' : focused ? 'var(--indigo-400)' : 'var(--gray-200)'}`,
              borderRadius: 'var(--radius)',
              fontSize: 14,
              color: 'var(--gray-800)',
              background: focused ? '#fff' : 'var(--gray-50)',
              outline: 'none',
              transition: 'all var(--t)',
              resize: isTextarea ? 'vertical' : undefined,
              minHeight: isTextarea ? 88 : undefined,
              boxShadow: focused ? '0 0 0 3px rgba(99,102,241,.12)' : 'none',
              ...style,
            }}
            onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
            onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
            {...props}
          />
        </div>
        {error && (
          <span style={{ fontSize: 12, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </span>
        )}
        {hint && !error && (
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>{hint}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
