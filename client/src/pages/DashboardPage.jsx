import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as projectsApi from '../api/projects';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';
import { PageSpinner } from '../components/ui/Spinner';
import Avatar from '../components/ui/Avatar';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';

/* ── Clickable gradient stat card ── */
const StatCard = ({ label, value, sub, gradient, icon, delay, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: gradient,
      borderRadius: 'var(--radius-xl)',
      padding: '24px 26px',
      display: 'flex', flexDirection: 'column', gap: 12,
      boxShadow: '0 8px 24px rgba(0,0,0,.12)',
      position: 'relative', overflow: 'hidden',
      animation: `fadeIn .4s ease ${delay}s both`,
      cursor: 'pointer',
      transition: 'transform .15s ease, box-shadow .15s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
      e.currentTarget.style.boxShadow = '0 18px 36px rgba(0,0,0,.22)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)';
    }}
  >
    <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,.1)', pointerEvents:'none' }} />
    <div style={{ position:'absolute', bottom:-30, right:20, width:70, height:70, borderRadius:'50%', background:'rgba(255,255,255,.07)', pointerEvents:'none' }} />

    <div style={{ width:40, height:40, borderRadius:'var(--radius)', background:'rgba(255,255,255,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontSize:13, color:'rgba(255,255,255,.75)', fontWeight:500, marginBottom:4 }}>{label}</p>
      <p style={{ fontSize:32, fontWeight:800, color:'#fff', letterSpacing:'-0.04em', lineHeight:1 }}>{value}</p>
      {sub && <p style={{ fontSize:12, color:'rgba(255,255,255,.6)', marginTop:6 }}>{sub}</p>}
    </div>
    <div style={{
      position:'absolute', bottom:14, right:16,
      background:'rgba(255,255,255,.2)', borderRadius:99,
      padding:'3px 10px', fontSize:11, fontWeight:600, color:'#fff',
    }}>
      View →
    </div>
  </div>
);

/* ── Mini progress bar ── */
const ProgressBar = ({ pct, color }) => (
  <div style={{ height:5, borderRadius:99, background:'var(--gray-100)', overflow:'hidden' }}>
    <div style={{ height:'100%', width:`${pct}%`, borderRadius:99, background: color, transition:'width .6s ease' }} />
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // ── ALL hooks at the top — no hooks after any return ──
  const [projects,     setProjects]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [activeFilter, setActiveFilter] = useState(null); // null | 'in_progress' | 'done'

  useEffect(() => {
    (async () => {
      try {
        const res = await projectsApi.getProjects({ status: 'active' });
        setProjects(res.data.data.projects);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <PageSpinner label="Loading dashboard…" />;

  // ── Computed stats ──
  const totalTasks = projects.reduce((s, p) => s + (p.taskStats?.total       || 0), 0);
  const doneTasks  = projects.reduce((s, p) => s + (p.taskStats?.done        || 0), 0);
  const inProgress = projects.reduce((s, p) => s + (p.taskStats?.in_progress || 0), 0);
  const overallPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const scrollToList = () =>
    document.getElementById('projects-list')?.scrollIntoView({ behavior: 'smooth' });

  const STATS = [
    {
      label: 'Active Projects', value: projects.length, icon: '🗂️',
      gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', delay: 0,
      onClick: () => navigate('/projects'),
    },
    {
      label: 'Total Tasks', value: totalTasks, icon: '📋',
      gradient: 'linear-gradient(135deg,#0ea5e9,#0284c7)', delay: .05,
      onClick: () => { setActiveFilter(null); scrollToList(); },
    },
    {
      label: 'In Progress', value: inProgress, icon: '⚡',
      gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', delay: .1,
      onClick: () => { setActiveFilter('in_progress'); scrollToList(); },
    },
    {
      label: 'Completed', value: `${overallPct}%`, icon: '✅',
      gradient: 'linear-gradient(135deg,#10b981,#059669)', delay: .15,
      sub: `${doneTasks} of ${totalTasks} tasks done`,
      onClick: () => { setActiveFilter('done'); scrollToList(); },
    },
  ];

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>

      {/* ── Page header ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:32, flexWrap:'wrap', gap:16 }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
            <Avatar name={user?.name} size={44} showRing />
            <div>
              <p style={{ fontSize:13, color:'var(--gray-400)', fontWeight:500 }}>Good to see you,</p>
              <h1 style={{ fontSize:22, fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em', lineHeight:1.2 }}>
                {user?.name?.split(' ')[0]} 👋
              </h1>
            </div>
          </div>
          <p style={{ fontSize:14, color:'var(--gray-400)', paddingLeft:56 }}>
            Here's what's happening across your projects today.
          </p>
        </div>
        <Button onClick={() => navigate('/projects')} variant="secondary" size="sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </Button>
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom:20 }} />}

      {/* ── Stat cards ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:16, marginBottom:36 }}>
        {STATS.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* ── Overall progress bar ── */}
      {totalTasks > 0 && (
        <div style={{
          background:'#fff', borderRadius:'var(--radius-xl)',
          border:'1px solid var(--gray-100)', padding:'20px 24px',
          marginBottom:28, boxShadow:'var(--shadow-sm)',
          animation:'fadeIn .4s ease .2s both',
        }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <span style={{ fontSize:14, fontWeight:700, color:'var(--gray-700)', letterSpacing:'-0.01em' }}>
              Overall Completion
            </span>
            <span style={{ fontSize:13, fontWeight:700, background:'var(--grad-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              {overallPct}%
            </span>
          </div>
          <div style={{ height:10, borderRadius:99, background:'var(--gray-100)', overflow:'hidden' }}>
            <div style={{
              height:'100%', width:`${overallPct}%`, borderRadius:99,
              background:'var(--grad-primary)',
              boxShadow:'0 2px 8px rgba(99,102,241,.4)',
              transition:'width .8s ease',
            }} />
          </div>
          <div style={{ display:'flex', gap:20, marginTop:12, flexWrap:'wrap' }}>
            {[
              { label:'To Do',       value: totalTasks - doneTasks - inProgress, color:'var(--gray-400)' },
              { label:'In Progress', value: inProgress,  color:'var(--warning)' },
              { label:'Done',        value: doneTasks,   color:'var(--success)' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0 }} />
                <span style={{ fontSize:12, color:'var(--gray-500)' }}>{label}</span>
                <span style={{ fontSize:12, fontWeight:700, color:'var(--gray-700)' }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Projects list header ── */}
      <div id="projects-list" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <h2 style={{ fontSize:16, fontWeight:700, color:'var(--gray-800)', letterSpacing:'-0.02em' }}>
            Active Projects
          </h2>
          {activeFilter && (
            <span style={{
              fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:99,
              background: activeFilter === 'in_progress' ? '#fef3c7' : '#d1fae5',
              color:      activeFilter === 'in_progress' ? 'var(--warning)' : 'var(--success)',
              border:     `1px solid ${activeFilter === 'in_progress' ? '#fcd34d' : '#6ee7b7'}`,
              display:'flex', alignItems:'center', gap:5,
            }}>
              {activeFilter === 'in_progress' ? '⚡ In Progress' : '✅ Done'}
              <button
                onClick={() => setActiveFilter(null)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:0, fontSize:13, lineHeight:1, color:'inherit', fontWeight:800 }}
              >×</button>
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/projects')}
          style={{ fontSize:13, color:'var(--indigo-600)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}
        >
          View all →
        </button>
      </div>

      {/* ── Projects list ── */}
      {projects.length === 0 ? (
        <div style={{ background:'#fff', borderRadius:'var(--radius-xl)', border:'2px dashed var(--gray-200)', padding:'48px 32px', textAlign:'center' }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🚀</div>
          <p style={{ fontSize:16, fontWeight:700, color:'var(--gray-700)', marginBottom:6 }}>No projects yet</p>
          <p style={{ fontSize:14, color:'var(--gray-400)', marginBottom:20 }}>Create your first project to get started</p>
          <Button onClick={() => navigate('/projects')} size="sm">Create a project</Button>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {projects.map((p, i) => {
            const pct = p.taskStats?.total > 0
              ? Math.round((p.taskStats.done / p.taskStats.total) * 100) : 0;
            const filteredCount = activeFilter ? (p.taskStats?.[activeFilter] || 0) : (p.taskStats?.total || 0);
            const dimmed = activeFilter && filteredCount === 0;

            return (
              <div
                key={p._id}
                onClick={() => navigate(`/projects/${p._id}`)}
                style={{
                  background:'#fff', borderRadius:'var(--radius-lg)',
                  border:'1px solid var(--gray-100)', padding:'16px 20px',
                  display:'flex', alignItems:'center', gap:18,
                  cursor:'pointer', boxShadow:'var(--shadow-xs)',
                  transition:'all var(--t)',
                  animation:`fadeIn .3s ease ${i * .04}s both`,
                  opacity: dimmed ? 0.35 : 1,
                }}
                onMouseEnter={(e) => {
                  if (dimmed) return;
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.borderColor = 'var(--indigo-200)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.borderColor = 'var(--gray-100)';
                }}
              >
                <div style={{
                  width:42, height:42, borderRadius:'var(--radius)',
                  background:`hsl(${(i * 55 + 220) % 360}, 70%, 92%)`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:18, flexShrink:0,
                }}>📁</div>

                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontWeight:700, fontSize:14, color:'var(--gray-900)', letterSpacing:'-0.01em' }}>
                    {p.name}
                  </p>
                  <p style={{ fontSize:12, color:'var(--gray-400)', marginTop:2 }}>
                    {activeFilter ? (
                      <span style={{ fontWeight:600, color: activeFilter === 'in_progress' ? 'var(--warning)' : 'var(--success)' }}>
                        {filteredCount} {activeFilter === 'in_progress' ? 'in progress' : 'done'}
                      </span>
                    ) : `${p.taskStats?.total || 0} tasks`}
                    {' · '}Updated {timeAgo(p.updatedAt)}
                  </p>
                </div>

                <div style={{ display:'flex', flexShrink:0 }}>
                  {(p.members || []).slice(0, 4).map((m, j) => (
                    <Avatar key={m._id} name={m.name} size={28}
                      style={{ marginLeft: j === 0 ? 0 : -8, border:'2px solid #fff', zIndex: 4 - j }} />
                  ))}
                </div>

                <div style={{ width:110, flexShrink:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                    <span style={{ fontSize:11, color:'var(--gray-400)', fontWeight:500 }}>Progress</span>
                    <span style={{ fontSize:11, fontWeight:700, color: pct === 100 ? 'var(--success)' : 'var(--gray-600)' }}>
                      {pct}%
                    </span>
                  </div>
                  <ProgressBar pct={pct} color={pct === 100 ? 'var(--success)' : 'var(--grad-primary)'} />
                </div>

                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
