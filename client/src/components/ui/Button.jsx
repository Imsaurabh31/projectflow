import React from 'react';

const VARIANTS = {
  primary: {
    background: 'var(--grad-primary)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(99,102,241,.4)',
  },
  secondary: {
    background: '#fff',
    color: 'var(--gray-700)',
    border: '1.5px solid var(--gray-200)',
    boxShadow: 'var(--shadow-xs)',
  },
  danger: {
    background: 'var(--grad-danger)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(239,68,68,.35)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--gray-600)',
    border: 'none',
    boxShadow: 'none',
  },
  success: {
    background: 'var(--grad-success)',
    color: '#fff',
    border: 'none',
    boxShadow: '0 4px 14px rgba(16,185,129,.35)',
  },
};

const SIZES = {
  xs: { padding: '3px 9px',  fontSize: '12px', height: '26px', borderRadius: 'var(--radius-sm)', gap: '4px' },
  sm: { padding: '5px 12px', fontSize: '13px', height: '32px', borderRadius: 'var(--radius-sm)', gap: '5px' },
  md: { padding: '8px 18px', fontSize: '14px', height: '38px', borderRadius: 'var(--radius)',    gap: '7px' },
  lg: { padding: '11px 24px',fontSize: '15px', height: '46px', borderRadius: 'var(--radius-lg)', gap: '8px' },
};

const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  style = {}, onClick, ...props
}) => {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const s = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  return (
    <button
      disabled={isDisabled}
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 600, cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all var(--t)',
        whiteSpace: 'nowrap', width: fullWidth ? '100%' : 'auto',
        letterSpacing: '-0.01em',
        ...v, ...s, ...style,
      }}
      onMouseEnter={(e) => {
        if (isDisabled) return;
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = v.boxShadow?.replace(/\.4\)/, '.55)').replace(/\.35\)/, '.5)') || v.boxShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = v.boxShadow || '';
      }}
      onMouseDown={(e) => { if (!isDisabled) e.currentTarget.style.transform = 'translateY(0px)'; }}
      {...props}
    >
      {loading && (
        <span style={{
          width: 14, height: 14, flexShrink: 0,
          border: '2px solid rgba(255,255,255,.35)',
          borderTopColor: variant === 'secondary' ? 'var(--indigo-500)' : '#fff',
          borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block',
        }} />
      )}
      {children}
    </button>
  );
};

export default Button;
