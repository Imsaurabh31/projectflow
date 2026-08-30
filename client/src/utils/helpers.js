import { formatDistanceToNow, format, isValid, parseISO } from 'date-fns';

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return '';
  return formatDistanceToNow(d, { addSuffix: true });
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  if (!isValid(d)) return '—';
  return format(d, 'MMM d, yyyy');
};

export const getInitials = (name = '') =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

export const PRIORITY_META = {
  low:    { label: 'Low',    color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
  medium: { label: 'Medium', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
  high:   { label: 'High',   color: '#dc2626', bg: '#fee2e2', border: '#fca5a5' },
  urgent: { label: 'Urgent', color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
};

export const STATUS_META = {
  todo:        { label: 'To Do',       color: '#64748b', bg: '#f1f5f9', border: '#cbd5e1' },
  in_progress: { label: 'In Progress', color: '#d97706', bg: '#fef3c7', border: '#fcd34d' },
  done:        { label: 'Done',        color: '#059669', bg: '#d1fae5', border: '#6ee7b7' },
};

export const extractError = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.message ||
  err?.message ||
  'Something went wrong';
