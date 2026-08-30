import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => (
  <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-50)' }}>
    <Sidebar />
    <main style={{
      marginLeft: 'var(--sidebar-width)',
      flex: 1, minWidth: 0,
      padding: '36px 32px',
    }}>
      <Outlet />
    </main>
  </div>
);

export default AppLayout;
