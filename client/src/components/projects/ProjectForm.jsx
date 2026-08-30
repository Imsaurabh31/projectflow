import React, { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const ProjectForm = ({ initial = {}, onSubmit, loading, error }) => {
  const [form, setForm] = useState({ name: '', description: '', ...initial });

  useEffect(() => {
    setForm({ name: '', description: '', ...initial });
  }, [initial?.name]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {error && <Alert type="error" message={error} />}
      <Input
        label="Project name"
        name="name" placeholder="e.g. Website Redesign"
        value={form.name} onChange={set('name')} required
        icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
      />
      <Input
        as="textarea" label="Description"
        name="description" placeholder="What is this project about? (optional)"
        value={form.description} onChange={set('description')}
        style={{ minHeight: 96 }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 4 }}>
        <Button type="submit" loading={loading}>
          {initial?.name ? 'Save changes' : 'Create project'}
        </Button>
      </div>
    </form>
  );
};

export default ProjectForm;
