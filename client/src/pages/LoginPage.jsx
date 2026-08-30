import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

const FEATURES = [
  { icon: '🗂️', title: 'Project Management', desc: 'Organise work across teams with ease' },
  { icon: '✅', title: 'Task Tracking',       desc: 'Kanban boards with priorities & due dates' },
  { icon: '💬', title: 'Team Collaboration',  desc: 'Comments and real-time member updates' },
  { icon: '📊', title: 'Analytics Dashboard', desc: 'Visualise progress with live statistics' },
];

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.password);
    if (res.ok) navigate('/dashboard');
    else setError(res.message);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Left panel ── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 64px',
        background: 'linear-gradient(145deg, var(--gray-900) 0%, #1a1040 50%, #0f1729 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position:'absolute', top:-80, left:-80, width:320, height:320, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-60, right:-40, width:280, height:280, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,.15) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'40%', right:'10%', width:180, height:180, borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,.10) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Brand */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:56 }}>
          <div style={{
            width:42, height:42, borderRadius:12,
            background:'var(--grad-primary)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 6px 20px rgba(99,102,241,.55)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" opacity=".9"/>
              <path d="M14 14h7v7h-7z" opacity=".5"/>
            </svg>
          </div>
          <span style={{ fontWeight:800, fontSize:20, color:'#fff', letterSpacing:'-0.03em' }}>ProjectFlow</span>
        </div>

        <h1 style={{ fontSize:38, fontWeight:800, color:'#fff', lineHeight:1.15, letterSpacing:'-0.04em', marginBottom:16, maxWidth:420 }}>
          Manage projects<br />
          <span style={{ background:'var(--grad-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            like a pro.
          </span>
        </h1>
        <p style={{ fontSize:16, color:'rgba(255,255,255,.5)', marginBottom:52, lineHeight:1.7, maxWidth:380 }}>
          Everything your team needs to stay organised, move fast and ship great work.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
              <div style={{
                width:40, height:40, borderRadius:10,
                background:'rgba(255,255,255,.06)',
                border:'1px solid rgba(255,255,255,.10)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:18, flexShrink:0,
              }}>
                {f.icon}
              </div>
              <div>
                <p style={{ fontSize:14, fontWeight:600, color:'rgba(255,255,255,.9)', marginBottom:2 }}>{f.title}</p>
                <p style={{ fontSize:13, color:'rgba(255,255,255,.4)', lineHeight:1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{
        width: 480, flexShrink:0,
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 52px',
        background:'#fff',
        overflowY:'auto',
      }}>
        <div style={{ maxWidth:380, width:'100%', margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em', marginBottom:6 }}>
            Welcome back
          </h2>
          <p style={{ fontSize:14, color:'var(--gray-400)', marginBottom:32 }}>
            Sign in to continue to your workspace
          </p>

          {error && <Alert type="error" message={error} style={{ marginBottom:20 }} />}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:18 }}>
            <Input
              label="Email address"
              name="email" type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={form.email} onChange={set('email')}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            />
            <Input
              label="Password"
              name="password" type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password} onChange={set('password')}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
            />
            <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop:4 }}>
              Sign in to workspace
            </Button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--gray-100)' }} />
            <span style={{ fontSize:12, color:'var(--gray-300)', fontWeight:500 }}>OR</span>
            <div style={{ flex:1, height:1, background:'var(--gray-100)' }} />
          </div>

          <p style={{ textAlign:'center', fontSize:14, color:'var(--gray-500)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--indigo-600)', fontWeight:700 }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
