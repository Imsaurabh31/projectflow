import React, { useEffect, useState, useCallback } from 'react';
import * as projectsApi from '../api/projects';
import { extractError } from '../utils/helpers';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Alert from '../components/ui/Alert';
import EmptyState from '../components/ui/EmptyState';
import { PageSpinner } from '../components/ui/Spinner';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';

const Tab = ({ label, active, onClick, count }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 20px', borderRadius: 99, border: 'none', cursor: 'pointer',
      fontSize: 13, fontWeight: 600, transition: 'all var(--t)',
      background: active ? 'var(--grad-primary)' : '#fff',
      color: active ? '#fff' : 'var(--gray-500)',
      boxShadow: active ? 'var(--shadow-colored)' : 'var(--shadow-xs)',
      display: 'flex', alignItems: 'center', gap: 6,
    }}
  >
    {label}
    {count !== undefined && (
      <span style={{
        fontSize: 11, fontWeight: 700, minWidth: 18, height: 18,
        borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'rgba(255,255,255,.25)' : 'var(--gray-100)',
        color: active ? '#fff' : 'var(--gray-500)', padding: '0 5px',
      }}>
        {count}
      </span>
    )}
  </button>
);

const ProjectsPage = () => {
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [modalOpen, setModalOpen]       = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState('');

  const fetchProjects = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const res = await projectsApi.getProjects({ status: statusFilter });
      setProjects(res.data.data.projects);
    } catch (err) { setError(extractError(err)); }
    finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => { setEditTarget(null); setFormError(''); setModalOpen(true); };
  const openEdit   = (p) => { setEditTarget(p);  setFormError(''); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); setFormError(''); };

  const handleFormSubmit = async (data) => {
    setFormLoading(true); setFormError('');
    try {
      if (editTarget) await projectsApi.updateProject(editTarget._id, data);
      else            await projectsApi.createProject(data);
      closeModal(); fetchProjects();
    } catch (err) { setFormError(extractError(err)); }
    finally { setFormLoading(false); }
  };

  const handleArchive = async (project) => {
    try { await projectsApi.archiveProject(project._id); fetchProjects(); }
    catch (err) { setError(extractError(err)); }
  };

  return (
    <div style={{ animation: 'fadeIn .3s ease' }}>

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 28, flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em', marginBottom: 4 }}>
            Projects
          </h1>
          <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
            Manage and track all your team projects
          </p>
        </div>
        <Button onClick={openCreate}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Project
        </Button>
      </div>

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <Tab label="Active"   active={statusFilter === 'active'}   onClick={() => setStatusFilter('active')}   count={statusFilter === 'active' ? projects.length : undefined} />
        <Tab label="Archived" active={statusFilter === 'archived'} onClick={() => setStatusFilter('archived')} count={statusFilter === 'archived' ? projects.length : undefined} />
      </div>

      {error && <Alert type="error" message={error} style={{ marginBottom: 20 }} />}

      {loading ? <PageSpinner label="Loading projects…" /> : projects.length === 0 ? (
        <EmptyState
          icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
          title={statusFilter === 'archived' ? 'No archived projects' : 'No projects yet'}
          description={statusFilter === 'active' ? 'Create your first project to start collaborating with your team.' : 'Archived projects will appear here.'}
          action={statusFilter === 'active' ? <Button onClick={openCreate}>Create your first project</Button> : null}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 20 }}>
          {projects.map((p, i) => (
            <ProjectCard key={p._id} project={p} index={i} onEdit={openEdit} onArchive={handleArchive} />
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={closeModal} title={editTarget ? 'Edit Project' : 'New Project'}>
        <ProjectForm
          initial={editTarget || {}}
          onSubmit={handleFormSubmit}
          loading={formLoading}
          error={formError}
        />
      </Modal>
    </div>
  );
};

export default ProjectsPage;
