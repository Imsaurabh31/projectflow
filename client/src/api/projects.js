import api from './axios';

export const getProjects = (params) => api.get('/projects', { params });
export const getProject = (id) => api.get(`/projects/${id}`);
export const getDashboard = (id) => api.get(`/projects/${id}/dashboard`);
export const createProject = (data) => api.post('/projects', data);
export const updateProject = (id, data) => api.patch(`/projects/${id}`, data);
export const archiveProject = (id) => api.patch(`/projects/${id}/archive`);
export const addMember = (id, userId) => api.post(`/projects/${id}/members`, { userId });
export const removeMember = (id, userId) => api.delete(`/projects/${id}/members/${userId}`);
