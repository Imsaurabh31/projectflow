import React from 'react';
import Select from '../ui/Select';

const STATUS_OPTIONS   = [
  { value: '', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
];
const PRIORITY_OPTIONS = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const TaskFilters = ({ filters, onChange, members = [] }) => {
  const memberOptions = [
    { value: '', label: 'All Members' },
    { value: 'me', label: '👤 Assigned to me' },
    ...members.map((m) => ({ value: m._id, label: m.name })),
  ];
  const set = (f) => (e) => onChange({ ...filters, [f]: e.target.value });

  return (
    <div style={{
      display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end',
      background: '#fff',
      border: '1px solid var(--gray-100)',
      borderRadius: 'var(--radius-lg)',
      padding: '14px 16px',
      boxShadow: 'var(--shadow-xs)',
    }}>
      {/* Search */}
      <div style={{ flex: '1 1 200px', minWidth: 160 }}>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--gray-500)', marginBottom: 5, letterSpacing: '-0.01em' }}>
          Search tasks
        </label>
        <div style={{ position: 'relative' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-300)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="search" placeholder="Search by title…"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            style={{
              width: '100%', padding: '8px 10px 8px 32px',
              border: '1.5px solid var(--gray-200)', borderRadius: 'var(--radius)',
              fontSize: 13, outline: 'none', background: 'var(--gray-50)',
              transition: 'all var(--t)',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--indigo-400)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'var(--gray-200)';   e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      <div style={{ flex: '0 0 140px' }}>
        <Select label="Status"   name="status"   value={filters.status}   onChange={set('status')}   options={STATUS_OPTIONS}   style={{ fontSize: 13 }} />
      </div>
      <div style={{ flex: '0 0 140px' }}>
        <Select label="Priority" name="priority" value={filters.priority} onChange={set('priority')} options={PRIORITY_OPTIONS} style={{ fontSize: 13 }} />
      </div>
      <div style={{ flex: '0 0 170px' }}>
        <Select label="Assignee" name="assignee" value={filters.assignee} onChange={set('assignee')} options={memberOptions}    style={{ fontSize: 13 }} />
      </div>
    </div>
  );
};

export default TaskFilters;
