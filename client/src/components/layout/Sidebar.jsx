import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

const NAV = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/projects', label: 'Projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      position: 'fixed', top: 0, left: 0,
      background: 'var(--gray-900)',
      display: 'flex', flexDirection: 'column',
      zIndex: 100,
      overflowY: 'auto',
    }}>

      {/* ── Brand ── */}
      <div style={{
        padding: '22px 20px 18px',
        borderBottom: '1px solid rgba(255,255,255,.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(99,102,241,.5)',
            flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" opacity=".9"/>
              <path d="M14 14h7v7h-7z" opacity=".5"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1 }}>
              ProjectFlow
            </div>
            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.35)', fontWeight: 500, marginTop: 2, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Workspace
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.25)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 10px 8px' }}>
          Menu
        </p>
        {NAV.map(({ to, label, icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to + '/');
          return (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 12px', borderRadius: 'var(--radius)',
                color: active ? '#fff' : 'rgba(255,255,255,.5)',
                background: active ? 'rgba(99,102,241,.25)' : 'transparent',
                fontWeight: active ? 600 : 400, fontSize: 14,
                transition: 'all var(--t)',
                position: 'relative', overflow: 'hidden',
                borderLeft: active ? '3px solid var(--indigo-400)' : '3px solid transparent',
              }}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,.06)'; e.currentTarget.style.color = 'rgba(255,255,255,.8)'; } }}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,.5)'; } }}
              >
                <span style={{ opacity: active ? 1 : 0.7 }}>{icon}</span>
                {label}
                {active && (
                  <span style={{
                    marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--indigo-400)',
                  }} />
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      {/* ── User card ── */}
      <div style={{
        margin: '0 10px 14px',
        background: 'rgba(255,255,255,.05)',
        border: '1px solid rgba(255,255,255,.08)',
        borderRadius: 'var(--radius-lg)',
        padding: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar name={user?.name} size={36} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 700, color: '#fff',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              letterSpacing: '-0.01em',
            }}>
              {user?.name}
            </div>
            <div style={{
              fontSize: 11, color: 'rgba(255,255,255,.35)', textTransform: 'capitalize', marginTop: 1,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: user?.role === 'admin' ? 'var(--warning)' : 'var(--success)',
                display: 'inline-block',
              }} />
              {user?.role}
            </div>
          </div>
          <button
            onClick={handleLogout} title="Sign out"
            style={{
              background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.4)', width: 30, height: 30,
              borderRadius: 'var(--radius)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all var(--t)', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,.25)'; e.currentTarget.style.color = '#ef4444'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,.08)'; e.currentTarget.style.color = 'rgba(255,255,255,.4)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
