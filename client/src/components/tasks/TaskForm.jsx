import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const STATUS_OPTIONS = [
  { value: 'todo', label: '○  To Do' },
  { value: 'in_progress', label: '◑  In Progress' },
  { value: 'done', label: '●  Done' },
];
const PRIORITY_OPTIONS = [
  { value: 'low',    label: '▲  Low' },
  { value: 'medium', label: '▲▲  Medium' },
  { value: 'high',   label: '▲▲▲  High' },
  { value: 'urgent', label: '⚡  Urgent' },
];

const TaskForm = ({ initial = {}, members = [], onSubmit, onCancel, loading, error }) => {
  const normalizeInitial = (init = {}) => ({
    title: '', description: '', status: 'todo', priority: 'medium',
    ...init,
    assignee: init?.assignee?._id || init?.assignee || '',
    dueDate:  init?.dueDate ? init.dueDate.slice(0, 10) : '',
  });

  const [form, setForm] = useState(() => normalizeInitial(initial));

  useEffect(() => { setForm(normalizeInitial(initial)); }, [initial?._id]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({
      title: form.title.trim(), description: form.description.trim(),
      status: form.status, priority: form.priority,
      assignee: form.assignee || null, dueDate: form.dueDate || null,
    });
  };

  const memberOptions = [
    { value: '', label: 'Unassigned' },
    ...members.map((m) => ({ value: m._id, label: m.name })),
  ];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {error && <Alert type="error" message={error} />}

      <Input
        label="Task title" name="title" placeholder="e.g. Design login screen"
        value={form.title} onChange={set('title')} required
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>}
      />

      <Input
        as="textarea" label="Description" name="description"
        placeholder="Add details, context, acceptance criteria… (optional)"
        value={form.description} onChange={set('description')} style={{ minHeight: 84 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Status"   name="status"   value={form.status}   onChange={set('status')}   options={STATUS_OPTIONS} />
        <Select label="Priority" name="priority" value={form.priority} onChange={set('priority')} options={PRIORITY_OPTIONS} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select label="Assignee" name="assignee" value={form.assignee} onChange={set('assignee')} options={memberOptions} />
        <Input  label="Due date" name="dueDate"  type="date" value={form.dueDate} onChange={set('dueDate')} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        )}
        <Button type="submit" loading={loading}>
          {initial?._id ? 'Save changes' : 'Create task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
