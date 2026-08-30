import api from './axios';

export const getComments = (taskId) => api.get('/comments', { params: { task: taskId } });
export const createComment = (data) => api.post('/comments', data);
export const updateComment = (id, body) => api.patch(`/comments/${id}`, { body });
export const deleteComment = (id) => api.delete(`/comments/${id}`);
