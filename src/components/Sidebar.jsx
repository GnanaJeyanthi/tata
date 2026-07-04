import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Grid,
  Battery,
  Sliders,
  AlertTriangle,
  Award,
  Database,
  Shield,
  FileText,
  TrendingUp,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-section">
          <div className="brand-icon">AT</div>
          <div className="brand-title">
            <span className="brand-name">AutoTwin AI</span>
            <span className="brand-subtitle">Smart Mobility 2030</span>
          </div>
        </div>

        <nav>
          <ul className="nav-links">
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Grid size={18} />
                <span>Executive Dashboard</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/assets" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Battery size={18} />
                <span>Asset Digital Twins</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/simulation" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Sliders size={18} />
                <span>What-If Sim Lab</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/anomalies" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <AlertTriangle size={18} />
                <span>Anomaly Center</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/recommendations" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <Shield size={18} />
                <span>Recommendation Center</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/impact" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <TrendingUp size={18} />
                <span>Business Impact</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/reports" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <FileText size={18} />
                <span>Engineering Reports</span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className="nav-footer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: 'var(--accent-cyan)',
              border: '1px solid var(--border-color)'
            }}>
              {user?.username?.substring(0, 2).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{user?.username}</span>
              <span style={{ fontSize: '9px', color: 'var(--text-secondary)' }}>{user?.role}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="nav-item"
            style={{
              width: '100%',
              textAlign: 'left',
              background: 'transparent',
              border: 'none',
              marginTop: '4px',
              padding: '10px 12px'
            }}
          >
            <LogOut size={16} style={{ color: 'var(--accent-red)' }} />
            <span style={{ color: 'var(--accent-red)' }}>Sign Out</span>
          </button>

          <div className="tata-consultant-badge">
            <div className="tata-label">TATA TECHNOLOGIES</div>
            <div style={{ fontSize: '9px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              InnoVent 2030 Competitor
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
