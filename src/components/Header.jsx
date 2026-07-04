import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, Shield } from 'lucide-react';

const Header = ({ title }) => {
  const { user } = useContext(AuthContext);

  return (
    <header className="app-header">
      <div className="header-title-area">
        <span className="header-title">{title}</span>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div className="header-status">
          <span className="status-dot simulating"></span>
          <span>Core API Connected</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-tertiary)',
          padding: '6px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          fontSize: '13px'
        }}>
          <Shield size={14} style={{ color: 'var(--accent-cyan)' }} />
          <span>{user?.role || 'Guest Mode'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
