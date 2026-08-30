import React, { createContext, useContext, useEffect, useReducer } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, error: null, user: action.payload.user, token: action.payload.token };
    case 'LOGOUT':
      return { ...state, user: null, token: null };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  // On mount, verify the stored token is still valid
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    authApi.getMe().catch(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    });
  }, []);

  const persist = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const login = async (email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authApi.login({ email, password });
      const { token, user } = res.data.data;
      persist(token, user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { ok: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await authApi.register({ name, email, password });
      const { token, user } = res.data.data;
      persist(token, user);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } });
      return { ok: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { ok: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      const user = res.data.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'UPDATE_USER', payload: user });
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
