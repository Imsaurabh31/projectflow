import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Alert from '../components/ui/Alert';

const STEPS = [
  { num: 1, label: 'Create account' },
  { num: 2, label: 'Set up workspace' },
  { num: 3, label: 'Invite team' },
];

const RegisterPage = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const set = (f) => (e) => { setForm((p) => ({ ...p, [f]: e.target.value })); setErrors((e2) => ({ ...e2, [f]:'' })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())               e.name     = 'Full name is required';
    if (!form.email.trim())              e.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (form.password.length < 6)        e.password = 'At least 6 characters';
    if (form.password !== form.confirm)  e.confirm  = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setApiError('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const res = await register(form.name.trim(), form.email.trim(), form.password);
    if (res.ok) navigate('/dashboard');
    else setApiError(res.message);
  };

  return (
    <div style={{ display:'flex', minHeight:'100vh', fontFamily:'Inter, sans-serif' }}>

      {/* ── Left decorative panel ── */}
      <div style={{
        width:420, flexShrink:0,
        background:'linear-gradient(160deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
        display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 52px', position:'relative', overflow:'hidden',
      }}>
        <div style={{ position:'absolute', top:-100, right:-100, width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,.2) 0%, transparent 70%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-80, left:-60, width:260, height:260, borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,.15) 0%, transparent 70%)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:60 }}>
          <div style={{ width:40, height:40, borderRadius:11, background:'var(--grad-primary)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 6px 18px rgba(99,102,241,.5)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z" opacity=".9"/><path d="M14 14h7v7h-7z" opacity=".5"/></svg>
          </div>
          <span style={{ fontWeight:800, fontSize:18, color:'#fff', letterSpacing:'-0.03em' }}>ProjectFlow</span>
        </div>

        <h2 style={{ fontSize:30, fontWeight:800, color:'#fff', lineHeight:1.2, letterSpacing:'-0.04em', marginBottom:14 }}>
          Start your<br/>
          <span style={{ background:'var(--grad-primary)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
            journey today.
          </span>
        </h2>
        <p style={{ fontSize:14, color:'rgba(255,255,255,.45)', marginBottom:52, lineHeight:1.7 }}>
          Join thousands of teams delivering better work with ProjectFlow.
        </p>

        {/* Step indicators */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{
                width:32, height:32, borderRadius:'50%', flexShrink:0,
                background: i === 0 ? 'var(--grad-primary)' : 'rgba(255,255,255,.08)',
                border: i === 0 ? 'none' : '1px solid rgba(255,255,255,.12)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:13, fontWeight:700,
                color: i === 0 ? '#fff' : 'rgba(255,255,255,.3)',
                boxShadow: i === 0 ? '0 4px 12px rgba(99,102,241,.5)' : 'none',
              }}>
                {i === 0 ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : step.num}
              </div>
              <span style={{ fontSize:13, color: i === 0 ? 'rgba(255,255,255,.85)' : 'rgba(255,255,255,.3)', fontWeight: i === 0 ? 600 : 400 }}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div style={{
        flex:1, display:'flex', flexDirection:'column', justifyContent:'center',
        padding:'60px 64px', background:'#fff', overflowY:'auto',
      }}>
        <div style={{ maxWidth:420, width:'100%', margin:'0 auto' }}>
          <h2 style={{ fontSize:26, fontWeight:800, color:'var(--gray-900)', letterSpacing:'-0.03em', marginBottom:6 }}>
            Create your account
          </h2>
          <p style={{ fontSize:14, color:'var(--gray-400)', marginBottom:32 }}>
            Free forever. No credit card required.
          </p>

          {apiError && <Alert type="error" message={apiError} style={{ marginBottom:20 }} />}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <Input
              label="Full name" name="name" type="text"
              autoComplete="name" placeholder="Alice Johnson"
              value={form.name} onChange={set('name')} error={errors.name}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            />
            <Input
              label="Email address" name="email" type="email"
              autoComplete="email" placeholder="you@example.com"
              value={form.email} onChange={set('email')} error={errors.email}
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}
            />
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <Input
                label="Password" name="password" type="password"
                autoComplete="new-password" placeholder="Min. 6 characters"
                value={form.password} onChange={set('password')} error={errors.password}
                icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              />
              <Input
                label="Confirm password" name="confirm" type="password"
                autoComplete="new-password" placeholder="Repeat password"
                value={form.confirm} onChange={set('confirm')} error={errors.confirm}
              />
            </div>

            {/* Password strength */}
            {form.password.length > 0 && (
              <div>
                <div style={{ display:'flex', gap:4, marginBottom:4 }}>
                  {[1,2,3,4].map((i) => {
                    const strength = form.password.length < 6 ? 1 : form.password.length < 8 ? 2 : form.password.length < 12 ? 3 : 4;
                    const colors = ['var(--danger)','var(--warning)','var(--indigo-500)','var(--success)'];
                    return (
                      <div key={i} style={{
                        flex:1, height:3, borderRadius:99,
                        background: i <= strength ? colors[strength-1] : 'var(--gray-100)',
                        transition:'background .3s',
                      }} />
                    );
                  })}
                </div>
                <span style={{ fontSize:11, color:'var(--gray-400)' }}>
                  {form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Good' : 'Strong'}
                </span>
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop:6 }}>
              Create free account
            </Button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'24px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--gray-100)' }} />
            <span style={{ fontSize:12, color:'var(--gray-300)', fontWeight:500 }}>OR</span>
            <div style={{ flex:1, height:1, background:'var(--gray-100)' }} />
          </div>

          <p style={{ textAlign:'center', fontSize:14, color:'var(--gray-500)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--indigo-600)', fontWeight:700 }}>
              Sign in →
            </Link>
          </p>

          <p style={{ textAlign:'center', fontSize:11.5, color:'var(--gray-300)', marginTop:24, lineHeight:1.7 }}>
            By signing up you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
