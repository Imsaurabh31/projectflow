import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as projectsApi from '../api/projects';
import * as tasksApi    from '../api/tasks';
import { useAuth }      from '../context/AuthContext';
import { extractError, STATUS_META, PRIORITY_META } from '../utils/helpers';
import Button     from '../components/ui/Button';
import Modal      from '../components/ui/Modal';
import Alert      from '../components/ui/Alert';
import Badge      from '../components/ui/Badge';
import Avatar     from '../components/ui/Avatar';
import { PageSpinner } from '../components/ui/Spinner';
import TaskBoard  from '../components/tasks/TaskBoard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm   from '../components/tasks/TaskForm';
import TaskDetail from '../components/tasks/TaskDetail';

const TAB_BOARD = 'board';
const TAB_DASH  = 'dashboard';

/* ── Small stat chip ─────────────────────────────────────── */
const StatChip = ({ label, value, color, bg }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    padding: '14px 20px', borderRadius: 'var(--radius-lg)',
    background: bg, border: `1px solid ${color}33`,
    minWidth: 80,
  }}>
    <span style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.04em' }}>{value}</span>
    <span style={{ fontSize: 11, color, fontWeight: 600, opacity: .7 }}>{label}</span>
  </div>
);

const ProjectDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project,   setProject]   = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [tasks,     setTasks]     = useState([]);
  const [tasksLoading, setTL]     = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [filters,   setFilters]   = useState({ search: '', status: '', priority: '', assignee: '' });
  const [activeTab, setActiveTab] = useState(TAB_BOARD);

  const [taskModal,   setTaskModal]   = useState(false);
  const [editTask,    setEditTask]    = useState(null);
  const [taskFL,      setTaskFL]      = useState(false);
  const [taskFE,      setTaskFE]      = useState('');
  const [detailTask,  setDetailTask]  = useState(null);
  const [detailOpen,  setDetailOpen]  = useState(false);
  const [deleteConf,  setDeleteConf]  = useState(null);

  const fetchProject = useCallback(async () => {
    try {
      const res = await projectsApi.getProject(id);
      setProject(res.data.data.project);
    } catch (err) { setError(extractError(err)); }
  }, [id]);

  const fetchTasks = useCallback(async () => {
    setTL(true);
    try {
      const params = { project: id, ...filters };
      Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
      const res = await tasksApi.getTasks(params);
      setTasks(res.data.data.tasks);
    } catch (err) { setError(extractError(err)); }
    finally { setTL(false); }
  }, [id, filters]);

  const fetchDash = useCallback(async () => {
    try { const res = await projectsApi.getDashboard(id); setDashboard(res.data.data); } catch {}
  }, [id]);

  useEffect(() => {
    (async () => { setLoading(true); await fetchProject(); setLoading(false); })();
  }, [fetchProject]);

  useEffect(() => { if (!loading) fetchTasks(); }, [loading, fetchTasks]);
  useEffect(() => { if (activeTab === TAB_DASH) fetchDash(); }, [activeTab, fetchDash]);

  const isOwnerOrAdmin = project && (
    user.role === 'admin' ||
    project.owner?._id === user._id ||
    project.owner === user._id
  );

  const openCreateTask = () => { setEditTask(null); setTaskFE(''); setTaskModal(true); };
  const closeTaskModal = () => { setTaskModal(false); setEditTask(null); };

  const handleTaskSubmit = async (data) => {
    setTaskFL(true); setTaskFE('');
    try {
      if (editTask) await tasksApi.updateTask(editTask._id, data);
      else          await tasksApi.createTask({ ...data, project: id });
      closeTaskModal(); fetchTasks(); fetchProject();
    } catch (err) { setTaskFE(extractError(err)); }
    finally { setTaskFL(false); }
  };

  const handleDeleteTask = async (task) => {
    try {
      await tasksApi.deleteTask(task._id);
      setDeleteConf(null); setDetailOpen(false);
      fetchTasks(); fetchProject();
    } catch (err) { setError(extractError(err)); }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    const res = await tasksApi.updateTask(taskId, updates);
    const updated = res.data.data.task;
    setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)));
    if (detailTask?._id === taskId) setDetailTask(updated);
    fetchProject();
  };

  const canDelete = (task) =>
    user.role === 'admin' ||
    task.createdBy?._id === user._id || task.createdBy === user._id ||
    isOwnerOrAdmin;

  if (loading) return <PageSpinner label="Loading project…" />;
  if (!project) return (
    <div style={{ padding: '40px 0' }}>
      <button
        onClick={() => navigate('/projects')}
        style={{ background:'none', border:'none', cursor:'pointer', color:'var(--gray-400)', fontSize:13, fontWeight:500, display:'flex', alignItems:'center', gap:5, padding:0, marginBottom:24 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        All projects
      </button>
      <div style={{ background:'#fff', borderRadius:'var(--radius-xl)', border:'1px solid var(--gray-100)', padding:'48px 32px', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
        <h2 style={{ fontSize:18, fontWeight:700, color:'var(--gray-800)', marginBottom:8 }}>Access Denied</h2>
        <p style={{ fontSize:14, color:'var(--gray-400)', marginBottom:24, maxWidth:360, margin:'0 auto 24px' }}>
          You don't have permission to view this project, or your session has expired.
        </p>
        <button
          onClick={() => navigate('/projects')}
          style={{ background:'var(--grad-primary)', color:'#fff', border:'none', borderRadius:'var(--radius)', padding:'9px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}
        >
          Back to Projects
        </button>
      </div>
    </div>
  );

  const members   = project.members || [];
  const stats     = project.taskStats || {};
  const pct       = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>

      {/* ── Breadcrumb ── */}
      <button
        onClick={() => navigate('/projects')}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--gray-400)', fontSize: 13, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: 0, marginBottom: 20,
          transition: 'color var(--t)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--indigo-600)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--gray-400)'}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        All projects
      </button>

      {/* ── Project header ── */}
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-100)', padding: '24px 28px',
        marginBottom: 20, boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em' }}>
                {project.name}
              </h1>
              {project.status === 'archived' && (
                <span style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 700,
                  background: 'var(--gray-100)', color: 'var(--gray-400)',
                  border: '1px solid var(--gray-200)', letterSpacing: '0.04em',
                }}>
                  ARCHIVED
                </span>
              )}
            </div>
            {project.description && (
              <p style={{ fontSize: 14, color: 'var(--gray-400)', lineHeight: 1.6 }}>
                {project.description}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex' }}>
              {members.slice(0, 5).map((m, i) => (
                <Avatar key={m._id} name={m.name} size={32}
                  style={{ marginLeft: i === 0 ? 0 : -10, border: '2px solid #fff', zIndex: 5 - i }} />
              ))}
              {members.length > 5 && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--gray-100)', fontSize: 11, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginLeft: -10, border: '2px solid #fff', color: 'var(--gray-500)',
                }}>+{members.length - 5}</div>
              )}
            </div>
            {project.status === 'active' && (
              <Button onClick={openCreateTask} size="sm">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Add Task
              </Button>
            )}
          </div>
        </div>

        {/* Stats row */}
        {stats.total > 0 && (
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <StatChip label="To Do"       value={stats.todo        || 0} color="var(--gray-500)"  bg="var(--gray-100)" />
            <StatChip label="In Progress" value={stats.in_progress || 0} color="var(--warning)"   bg="#fef3c7" />
            <StatChip label="Done"        value={stats.done        || 0} color="var(--success)"   bg="var(--success-light)" />
            <StatChip label="Total"       value={stats.total       || 0} color="var(--indigo-600)" bg="var(--indigo-50)" />

            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--gray-400)', fontWeight: 500 }}>Progress</span>
                <span style={{
                  fontSize: 12, fontWeight: 800,
                  background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {pct}%
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 99, background: 'var(--gray-100)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${pct}%`, borderRadius: 99,
                  background: pct === 100 ? 'var(--grad-success)' : 'var(--grad-primary)',
                  transition: 'width .6s ease',
                  boxShadow: pct > 0 ? '0 1px 6px rgba(99,102,241,.4)' : 'none',
                }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}

      {/* ── Tabs ── */}
      <div style={{
        display: 'flex', gap: 4,
        background: '#fff', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-100)', padding: 5,
        marginBottom: 20, width: 'fit-content',
        boxShadow: 'var(--shadow-xs)',
      }}>
        {[
          { key: TAB_BOARD, label: 'Board', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="14" rx="1"/><rect x="17" y="3" width="5" height="10" rx="1"/></svg> },
          { key: TAB_DASH,  label: 'Dashboard', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 16px', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius)',
              fontSize: 13, fontWeight: 600, transition: 'all var(--t)',
              background: activeTab === tab.key ? 'var(--grad-primary)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'var(--gray-500)',
              boxShadow: activeTab === tab.key ? 'var(--shadow-colored)' : 'none',
            }}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── Board tab ── */}
      {activeTab === TAB_BOARD && (
        <>
          <div style={{ marginBottom: 16 }}>
            <TaskFilters filters={filters} onChange={setFilters} members={members} />
          </div>
          {tasksLoading ? <PageSpinner label="Loading tasks…" /> : (
            <TaskBoard
              tasks={tasks}
              onTaskClick={(t) => { setDetailTask(t); setDetailOpen(true); }}
              onDeleteTask={(t) => setDeleteConf(t)}
              canDelete={canDelete}
            />
          )}
        </>
      )}

      {/* ── Dashboard tab ── */}
      {activeTab === TAB_DASH && <DashboardTab dashboard={dashboard} />}

      {/* Modals */}
      <Modal isOpen={taskModal} onClose={closeTaskModal} title={editTask ? 'Edit Task' : 'New Task'} size="md">
        <TaskForm initial={editTask || {}} members={members} onSubmit={handleTaskSubmit} onCancel={closeTaskModal} loading={taskFL} error={taskFE} />
      </Modal>

      <Modal isOpen={detailOpen && !!detailTask} onClose={() => setDetailOpen(false)} title="Task Details" size="lg">
        {detailTask && (
          <TaskDetail task={detailTask} members={members} onUpdate={handleTaskUpdate} />
        )}
      </Modal>

      <Modal isOpen={!!deleteConf} onClose={() => setDeleteConf(null)} title="Delete Task" size="sm">
        <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 24, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong style={{ color: 'var(--gray-900)' }}>"{deleteConf?.title}"</strong>?
          This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="secondary" onClick={() => setDeleteConf(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => handleDeleteTask(deleteConf)}>Delete task</Button>
        </div>
      </Modal>
    </div>
  );
};

/* ── Dashboard Tab ──────────────────────────────────────────── */
const DashboardTab = ({ dashboard }) => {
  if (!dashboard) return <PageSpinner label="Loading analytics…" />;
  const { stats, recentTasks } = dashboard;

  const Bar = ({ label, count, total, gradient, bg, color }) => {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
          <span style={{ fontSize: 12.5, color: 'var(--gray-600)', fontWeight: 500 }}>{label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: color || 'var(--gray-700)' }}>{count}</span>
        </div>
        <div style={{ height: 8, borderRadius: 99, background: bg || 'var(--gray-100)', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: gradient, transition: 'width .6s ease' }} />
        </div>
      </div>
    );
  };

  const Card = ({ title, children }) => (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--gray-100)', padding: '20px 24px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', letterSpacing: '-0.01em', marginBottom: 18 }}>
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, animation: 'fadeIn .3s ease' }}>
      <Card title="📊 Tasks by Status">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Bar label="To Do"       count={stats.byStatus.todo}        total={stats.total} gradient="linear-gradient(90deg,#94a3b8,#64748b)" />
          <Bar label="In Progress" count={stats.byStatus.in_progress} total={stats.total} gradient="linear-gradient(90deg,#fbbf24,#f59e0b)" color="var(--warning)" />
          <Bar label="Done"        count={stats.byStatus.done}        total={stats.total} gradient="linear-gradient(90deg,#34d399,#10b981)" color="var(--success)" />
        </div>
      </Card>

      <Card title="🎯 Tasks by Priority">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Bar label="Low"    count={stats.byPriority.low}    total={stats.total} gradient="linear-gradient(90deg,#34d399,#10b981)" color="var(--success)" />
          <Bar label="Medium" count={stats.byPriority.medium} total={stats.total} gradient="linear-gradient(90deg,#fbbf24,#f59e0b)" color="var(--warning)" />
          <Bar label="High"   count={stats.byPriority.high}   total={stats.total} gradient="linear-gradient(90deg,#f87171,#ef4444)" color="var(--danger)" />
          <Bar label="Urgent" count={stats.byPriority.urgent} total={stats.total} gradient="linear-gradient(90deg,#c084fc,#8b5cf6)" color="var(--urgent)" />
        </div>
      </Card>

      <Card title="👥 Top Assignees">
        {stats.byAssignee.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--gray-300)', fontStyle: 'italic' }}>No assigned tasks yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.byAssignee.map((a) => (
              <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={a.user?.name} size={30} />
                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{a.user?.name}</span>
                <span style={{
                  fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                  background: 'var(--indigo-50)', color: 'var(--indigo-600)',
                  border: '1px solid var(--indigo-200)',
                }}>
                  {a.count} task{a.count !== 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="🕐 Recent Activity">
        {recentTasks.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--gray-300)', fontStyle: 'italic' }}>No tasks yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentTasks.map((t) => (
              <div key={t._id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 'var(--radius)',
                background: 'var(--gray-50)', border: '1px solid var(--gray-100)',
              }}>
                <p style={{
                  fontSize: 13, fontWeight: 500, color: 'var(--gray-800)',
                  flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {t.title}
                </p>
                <Badge type="status" value={t.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProjectDetailPage;
