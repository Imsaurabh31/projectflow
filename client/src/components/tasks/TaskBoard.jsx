import React from 'react';
import TaskCard from './TaskCard';

const COLUMNS = [
  { key: 'todo',        label: 'To Do',        color: 'var(--gray-400)',   bg: 'var(--gray-100)',  dot: '#94a3b8' },
  { key: 'in_progress', label: 'In Progress',   color: 'var(--warning)',    bg: '#fef3c7',           dot: '#f59e0b' },
  { key: 'done',        label: 'Done',          color: 'var(--success)',    bg: 'var(--success-light)', dot: '#10b981' },
];

const TaskBoard = ({ tasks, onTaskClick, onDeleteTask, canDelete }) => {
  const byStatus = COLUMNS.reduce((acc, col) => {
    acc[col.key] = tasks.filter((t) => t.status === col.key);
    return acc;
  }, {});

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 18, alignItems: 'start',
    }}>
      {COLUMNS.map((col) => (
        <div key={col.key} style={{
          background: 'var(--gray-50)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--gray-100)',
          overflow: 'hidden',
        }}>
          {/* Column header */}
          <div style={{
            padding: '14px 16px 12px',
            borderBottom: '1px solid var(--gray-100)',
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fff',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: col.dot, flexShrink: 0,
              boxShadow: `0 0 0 3px ${col.bg}`,
            }} />
            <span style={{
              fontSize: 13, fontWeight: 700, color: 'var(--gray-700)', letterSpacing: '-0.01em', flex: 1,
            }}>
              {col.label}
            </span>
            <span style={{
              fontSize: 11.5, fontWeight: 700, minWidth: 22, height: 22,
              borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: col.bg, color: col.color, padding: '0 6px',
              border: `1px solid ${col.color}33`,
            }}>
              {byStatus[col.key].length}
            </span>
          </div>

          {/* Cards */}
          <div style={{ padding: '10px 10px 12px', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 120 }}>
            {byStatus[col.key].length === 0 ? (
              <div style={{
                border: '2px dashed var(--gray-150)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px 16px',
                textAlign: 'center',
                color: 'var(--gray-300)',
                fontSize: 12, fontWeight: 500,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3"/>
                  <line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
                </svg>
                No tasks here
              </div>
            ) : (
              byStatus[col.key].map((task) => (
                <TaskCard
                  key={task._id} task={task}
                  onClick={() => onTaskClick(task)}
                  onDelete={onDeleteTask}
                  canDelete={canDelete(task)}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;
