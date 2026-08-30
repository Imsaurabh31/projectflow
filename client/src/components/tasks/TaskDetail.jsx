import React, { useEffect, useState, useCallback } from 'react';
import * as commentsApi from '../../api/comments';
import { useAuth } from '../../context/AuthContext';
import { timeAgo, formatDate, STATUS_META, PRIORITY_META, extractError } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { PageSpinner } from '../ui/Spinner';

const MetaRow = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
    </span>
    {children}
  </div>
);

const InlineEditBtn = ({ onClick }) => (
  <button onClick={onClick} style={{
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'var(--gray-300)', padding: '2px 3px',
    borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center',
    transition: 'all var(--t)',
  }}
    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--indigo-500)'; e.currentTarget.style.background = 'var(--indigo-50)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gray-300)'; e.currentTarget.style.background = 'none'; }}
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  </button>
);

const metaSelect = {
  width: '100%', padding: '6px 9px',
  border: '1.5px solid var(--indigo-300)', borderRadius: 'var(--radius-sm)',
  fontSize: 12.5, outline: 'none', background: '#fff',
  boxShadow: '0 0 0 3px rgba(99,102,241,.1)',
};

const TaskDetail = ({ task, members, onUpdate }) => {
  const { user } = useAuth();
  const [comments, setComments]           = useState([]);
  const [commentsLoading, setCommLoading] = useState(true);
  const [newComment, setNewComment]       = useState('');
  const [posting, setPosting]             = useState(false);
  const [commentError, setCommentError]   = useState('');
  const [editingCid, setEditingCid]       = useState(null);
  const [editBody, setEditBody]           = useState('');
  const [editingField, setEditingField]   = useState(null);
  const [fieldValue, setFieldValue]       = useState('');
  const [fieldSaving, setFieldSaving]     = useState(false);

  const fetchComments = useCallback(async () => {
    setCommLoading(true);
    try {
      const res = await commentsApi.getComments(task._id);
      setComments(res.data.data.comments);
    } finally { setCommLoading(false); }
  }, [task._id]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const postComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true); setCommentError('');
    try {
      await commentsApi.createComment({ body: newComment.trim(), task: task._id });
      setNewComment(''); fetchComments();
    } catch (err) { setCommentError(extractError(err)); }
    finally { setPosting(false); }
  };

  const deleteComment = async (id) => {
    try { await commentsApi.deleteComment(id); setComments((c) => c.filter((x) => x._id !== id)); }
    catch (err) { setCommentError(extractError(err)); }
  };

  const saveEditComment = async (id) => {
    try {
      const res = await commentsApi.updateComment(id, editBody);
      setComments((c) => c.map((x) => (x._id === id ? res.data.data.comment : x)));
      setEditingCid(null);
    } catch (err) { setCommentError(extractError(err)); }
  };

  const startEdit = (field, val) => { setEditingField(field); setFieldValue(val ?? ''); };
  const cancelEdit = () => setEditingField(null);

  const saveField = async (field) => {
    setFieldSaving(true);
    try { await onUpdate(task._id, { [field]: fieldValue || null }); setEditingField(null); }
    finally { setFieldSaving(false); }
  };

  const STATUS_OPTS   = ['todo', 'in_progress', 'done'];
  const PRIORITY_OPTS = ['low', 'medium', 'high', 'urgent'];
  const memberOptions = members.map((m) => ({ value: m._id, label: m.name }));

  const EditControls = ({ field }) => (
    <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
      <Button size="xs" loading={fieldSaving} onClick={() => saveField(field)}>Save</Button>
      <Button size="xs" variant="ghost" onClick={cancelEdit} style={{ color: 'var(--gray-400)' }}>✕</Button>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 28, minHeight: 0 }}>

      {/* ── Main content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Title + badges */}
        <div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <Badge type="status"   value={task.status} />
            <Badge type="priority" value={task.priority} />
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.03em', lineHeight: 1.3 }}>
            {task.title}
          </h2>
        </div>

        {/* Description */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Description
          </p>
          {task.description ? (
            <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {task.description}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--gray-300)', fontStyle: 'italic' }}>No description provided.</p>
          )}
        </div>

        {/* ── Comments ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>
            Comments ({comments.length})
          </p>

          {commentsLoading ? <PageSpinner label="Loading comments…" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {comments.map((c) => (
                <div key={c._id} style={{ display: 'flex', gap: 10 }}>
                  <Avatar name={c.author?.name} size={32} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div style={{
                    flex: 1, background: 'var(--gray-50)',
                    border: '1px solid var(--gray-100)',
                    borderRadius: 'var(--radius-lg)', padding: '10px 14px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-800)' }}>{c.author?.name}</span>
                        <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{timeAgo(c.createdAt)}</span>
                      </div>
                      {(c.author?._id === user._id || user.role === 'admin') && (
                        <div style={{ display: 'flex', gap: 2 }}>
                          <button onClick={() => { setEditingCid(c._id); setEditBody(c.body); }}
                            style={{ ...microBtn }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--indigo-500)'; e.currentTarget.style.background = 'var(--indigo-50)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gray-300)'; e.currentTarget.style.background = 'none'; }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button onClick={() => deleteComment(c._id)}
                            style={{ ...microBtn }}
                            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-light)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--gray-300)'; e.currentTarget.style.background = 'none'; }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
                          </button>
                        </div>
                      )}
                    </div>
                    {editingCid === c._id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input value={editBody} onChange={(e) => setEditBody(e.target.value)}
                          style={{ flex: 1, padding: '6px 10px', border: '1.5px solid var(--indigo-300)', borderRadius: 'var(--radius-sm)', fontSize: 13, outline: 'none', boxShadow: '0 0 0 3px rgba(99,102,241,.1)' }} />
                        <Button size="sm" onClick={() => saveEditComment(c._id)}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingCid(null)}>✕</Button>
                      </div>
                    ) : (
                      <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{c.body}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* New comment */}
              <form onSubmit={postComment} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Avatar name={user?.name} size={32} style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  {commentError && <Alert type="error" message={commentError} style={{ marginBottom: 6 }} />}
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment… (Ctrl+Enter to post)"
                    rows={2}
                    style={{
                      width: '100%', padding: '10px 12px',
                      border: '1.5px solid var(--gray-200)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 13, resize: 'vertical', outline: 'none',
                      transition: 'all var(--t)', background: 'var(--gray-50)',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--indigo-400)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,.1)'; }}
                    onBlur={(e)  => { e.target.style.borderColor = 'var(--gray-200)';   e.target.style.background = 'var(--gray-50)'; e.target.style.boxShadow = 'none'; }}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) postComment(e); }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <Button type="submit" size="sm" loading={posting}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                      Post comment
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Right metadata panel ── */}
      <div style={{
        width: 210, flexShrink: 0,
        borderLeft: '1px solid var(--gray-100)',
        paddingLeft: 24,
        display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        {/* Status */}
        <MetaRow label="Status">
          {editingField === 'status' ? (
            <><select value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} style={metaSelect}>
              {STATUS_OPTS.map((s) => <option key={s} value={s}>{STATUS_META[s].label}</option>)}
            </select><EditControls field="status" /></>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Badge type="status" value={task.status} />
              <InlineEditBtn onClick={() => startEdit('status', task.status)} />
            </div>
          )}
        </MetaRow>

        {/* Priority */}
        <MetaRow label="Priority">
          {editingField === 'priority' ? (
            <><select value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} style={metaSelect}>
              {PRIORITY_OPTS.map((p) => <option key={p} value={p}>{PRIORITY_META[p].label}</option>)}
            </select><EditControls field="priority" /></>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <Badge type="priority" value={task.priority} />
              <InlineEditBtn onClick={() => startEdit('priority', task.priority)} />
            </div>
          )}
        </MetaRow>

        {/* Assignee */}
        <MetaRow label="Assignee">
          {editingField === 'assignee' ? (
            <><select value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} style={metaSelect}>
              <option value="">Unassigned</option>
              {memberOptions.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select><EditControls field="assignee" /></>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {task.assignee ? (
                <>
                  <Avatar name={task.assignee.name} size={22} />
                  <span style={{ fontSize: 13, color: 'var(--gray-700)', fontWeight: 500 }}>{task.assignee.name}</span>
                </>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--gray-300)' }}>Unassigned</span>
              )}
              <InlineEditBtn onClick={() => startEdit('assignee', task.assignee?._id || '')} />
            </div>
          )}
        </MetaRow>

        {/* Due date */}
        <MetaRow label="Due Date">
          {editingField === 'dueDate' ? (
            <><input type="date" value={fieldValue} onChange={(e) => setFieldValue(e.target.value)} style={metaSelect} />
            <EditControls field="dueDate" /></>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: task.dueDate ? 'var(--gray-700)' : 'var(--gray-300)',
              }}>
                {task.dueDate ? formatDate(task.dueDate) : 'No date set'}
              </span>
              <InlineEditBtn onClick={() => startEdit('dueDate', task.dueDate ? task.dueDate.slice(0,10) : '')} />
            </div>
          )}
        </MetaRow>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--gray-100)' }} />

        {/* Created by */}
        <MetaRow label="Created by">
          {task.createdBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Avatar name={task.createdBy.name} size={24} />
              <span style={{ fontSize: 12.5, color: 'var(--gray-600)', fontWeight: 500 }}>{task.createdBy.name}</span>
            </div>
          )}
        </MetaRow>

        <MetaRow label="Created">
          <span style={{ fontSize: 12.5, color: 'var(--gray-500)', fontWeight: 500 }}>{timeAgo(task.createdAt)}</span>
        </MetaRow>

        <MetaRow label="Last updated">
          <span style={{ fontSize: 12.5, color: 'var(--gray-500)', fontWeight: 500 }}>{timeAgo(task.updatedAt)}</span>
        </MetaRow>
      </div>
    </div>
  );
};

const microBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--gray-300)', padding: '3px 4px',
  borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center',
  transition: 'all var(--t)',
};

export default TaskDetail;
