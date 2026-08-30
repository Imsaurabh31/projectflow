import React from 'react';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';
import { formatDate, PRIORITY_META } from '../../utils/helpers';

const PRIORITY_LEFT = {
  low:    'var(--success)',
  medium: 'var(--warning)',
  high:   'var(--danger)',
  urgent: 'var(--urgent)',
};

const TaskCard = ({ task, onClick, onDelete, canDelete }) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--gray-100)',
      borderLeft: `3px solid ${PRIORITY_LEFT[task.priority] || 'var(--gray-200)'}`,
      padding: '13px 14px',
      cursor: 'pointer',
      boxShadow: 'var(--shadow-xs)',
      transition: 'all var(--t)',
      display: 'flex', flexDirection: 'column', gap: 10,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.borderColor = 'var(--indigo-200)';
      e.currentTarget.style.borderLeftColor = PRIORITY_LEFT[task.priority] || 'var(--gray-200)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
      e.currentTarget.style.transform = '';
      e.currentTarget.style.borderColor = 'var(--gray-100)';
      e.currentTarget.style.borderLeftColor = PRIORITY_LEFT[task.priority] || 'var(--gray-200)';
    }}
  >
    {/* Top row */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <Badge type="priority" value={task.priority} />
      {canDelete && (
        <button
          title="Delete task"
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 3px',
            borderRadius: 'var(--radius-xs)', color: 'var(--gray-200)',
            display: 'flex', transition: 'all var(--t)', flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gray-200)'; e.currentTarget.style.background = 'none'; }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      )}
    </div>

    {/* Title */}
    <p style={{
      fontSize: 13, fontWeight: 600, color: 'var(--gray-800)', lineHeight: 1.45,
      letterSpacing: '-0.01em',
    }}>
      {task.title}
    </p>

    {task.description && (
      <p style={{
        fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.4,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {task.description}
      </p>
    )}

    {/* Footer */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
      {task.assignee ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Avatar name={task.assignee.name} size={20} />
          <span style={{ fontSize: 11.5, color: 'var(--gray-400)', fontWeight: 500 }}>
            {task.assignee.name.split(' ')[0]}
          </span>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 20, height: 20, borderRadius: '50%',
            border: '1.5px dashed var(--gray-200)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span style={{ fontSize: 11, color: 'var(--gray-300)' }}>Unassigned</span>
        </div>
      )}
      {task.dueDate && (
        <span style={{
          fontSize: 11, color: 'var(--gray-400)', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 3,
        }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {formatDate(task.dueDate)}
        </span>
      )}
    </div>
  </div>
);

export default TaskCard;
