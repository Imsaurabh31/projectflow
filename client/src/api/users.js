import api from './axios';

export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.patch(`/users/${id}`, data);
