import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widths = { sm: 420, md: 580, lg: 760, xl: 960 };

  return createPortal(
    <div
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(15,23,42,.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20, animation: 'fadeIn .15s ease',
      }}
    >
      <div
        className="animate-scaleIn"
        style={{
          background: '#fff',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%', maxWidth: widths[size] || 580,
          maxHeight: '92vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--gray-100)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--gray-100)',
          flexShrink: 0,
          background: 'var(--gray-50)',
        }}>
          <h2 id="modal-title" style={{
            fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', letterSpacing: '-0.02em',
          }}>
            {title}
          </h2>
          <button
            onClick={onClose} aria-label="Close"
            style={{
              background: 'var(--gray-100)', border: 'none', cursor: 'pointer',
              color: 'var(--gray-500)', width: 30, height: 30,
              borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--t)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-200)'; e.currentTarget.style.color = 'var(--gray-700)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-500)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
