import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { timeAgo } from '../../utils/helpers';

const PROJECT_COLORS = [
  { bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', light: '#eef2ff' },
  { bg: 'linear-gradient(135deg,#0ea5e9,#0284c7)', light: '#e0f2fe' },
  { bg: 'linear-gradient(135deg,#10b981,#059669)', light: '#d1fae5' },
  { bg: 'linear-gradient(135deg,#f59e0b,#d97706)', light: '#fef3c7' },
  { bg: 'linear-gradient(135deg,#ef4444,#dc2626)', light: '#fee2e2' },
  { bg: 'linear-gradient(135deg,#ec4899,#db2777)', light: '#fce7f3' },
];

const colorFor = (name = '') => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return PROJECT_COLORS[Math.abs(h) % PROJECT_COLORS.length];
};

const ProjectCard = ({ project, onEdit, onArchive, index = 0 }) => {
  const navigate = useNavigate();
  const { taskStats = {} } = project;
  const pct = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;
  const palette = colorFor(project.name);

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-100)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        transition: 'all var(--t-slow)',
        opacity: project.status === 'archived' ? 0.6 : 1,
        animation: `fadeIn .35s ease ${index * .05}s both`,
        display: 'flex', flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.borderColor = 'var(--indigo-200)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = '';
        e.currentTarget.style.borderColor = 'var(--gray-100)';
      }}
    >
      {/* ── Gradient header band ── */}
      <div style={{
        background: palette.bg,
        height: 7, width: '100%', flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,.1)',
      }} />

      <div style={{ padding: '20px 22px 22px', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Title row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3 style={{
                fontSize: 15, fontWeight: 700, color: 'var(--gray-900)',
                letterSpacing: '-0.02em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {project.name}
              </h3>
              {project.status === 'archived' && (
                <span style={{
                  fontSize: 10.5, padding: '2px 8px', borderRadius: 99, fontWeight: 600,
                  background: 'var(--gray-100)', color: 'var(--gray-400)',
                  border: '1px solid var(--gray-200)',
                }}>
                  ARCHIVED
                </span>
              )}
            </div>
            {project.description && (
              <p style={{
                fontSize: 13, color: 'var(--gray-400)', marginTop: 4, lineHeight: 1.5,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {project.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            {[
              { title: 'Edit', action: () => onEdit(project), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
              { title: project.status === 'archived' ? 'Unarchive' : 'Archive', action: () => onArchive(project), icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
            ].map(({ title, action, icon }) => (
              <button
                key={title} title={title} onClick={action}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  width: 28, height: 28, borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--gray-300)', transition: 'all var(--t)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gray-100)'; e.currentTarget.style.color = 'var(--gray-600)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--gray-300)'; }}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        {/* ── Task stats chips ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'To Do',       value: taskStats.todo        || 0, color: 'var(--gray-500)', bg: 'var(--gray-100)' },
            { label: 'In Progress', value: taskStats.in_progress || 0, color: '#d97706',         bg: '#fef3c7' },
            { label: 'Done',        value: taskStats.done        || 0, color: '#059669',         bg: '#d1fae5' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{
              padding: '4px 10px', borderRadius: 99, fontSize: 11.5, fontWeight: 600,
              color, background: bg, display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <span style={{ fontWeight: 800 }}>{value}</span> {label}
            </div>
          ))}
        </div>

        {/* ── Progress ── */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 500 }}>Completion</span>
            <span style={{
              fontSize: 12, fontWeight: 800,
              color: pct === 100 ? 'var(--success)' : 'var(--indigo-600)',
            }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 7, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct}%`, borderRadius: 99,
              background: pct === 100 ? 'var(--grad-success)' : palette.bg,
              transition: 'width .6s ease',
              boxShadow: pct > 0 ? '0 1px 4px rgba(0,0,0,.15)' : 'none',
            }} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
          <div style={{ display: 'flex' }}>
            {(project.members || []).slice(0, 5).map((m, i) => (
              <Avatar key={m._id} name={m.name} size={26}
                style={{ marginLeft: i === 0 ? 0 : -8, border: '2px solid #fff', zIndex: 5 - i }} />
            ))}
            {project.members?.length > 5 && (
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: 'var(--gray-100)', fontSize: 10.5, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginLeft: -8, border: '2px solid #fff', color: 'var(--gray-500)',
              }}>
                +{project.members.length - 5}
              </div>
            )}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--gray-300)', fontWeight: 500 }}>
            {timeAgo(project.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
