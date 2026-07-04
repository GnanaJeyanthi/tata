import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { assetService } from '../services/api';
import {
  Activity,
  Battery,
  AlertTriangle,
  Award,
  TrendingUp,
  Cpu,
  Clock,
  Zap,
  DollarSign,
  Shield,
  FileWarning,
  Sliders,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await assetService.getAssets();
        if (res.success) {
          setAssets(res.data);
        } else {
          setError('Failed to load asset details');
        }
      } catch (err) {
        setError('Error connecting to backend API');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity className="simulating" style={{ marginRight: '10px' }} />
        <span>Loading executive metrics...</span>
      </div>
    );
  }

  // Calculate Aggregated Metrics
  const totalAssets = assets.length;
  const healthyAssets = assets.filter(a => a.status === 'Healthy').length;
  const warningAssets = assets.filter(a => a.status === 'Warning').length;
  const criticalAssets = assets.filter(a => a.status === 'Critical').length;
  const avgHealth = Math.round(assets.reduce((sum, a) => sum + a.healthScore, 0) / totalAssets);
  
  // Failure Predictions in next 30 days
  const predictedFailures = assets.filter(a => a.failureProbability > 40).length;

  // Business Impact calculations (simulated estimates based on actual warning states)
  // Let's check the critical/warning assets and sum up their impact potential
  let maintenanceSavings = 0;
  let downtimeAvoided = 0;
  let carbonReductionKg = 0;

  assets.forEach(a => {
    if (a.status === 'Critical') {
      maintenanceSavings += 68000; // ₹ Savings from early overhaul
      downtimeAvoided += 24;      // hours avoided
      carbonReductionKg += 180;
    } else if (a.status === 'Warning') {
      maintenanceSavings += 22000;
      downtimeAvoided += 8;
      carbonReductionKg += 65;
    }
    carbonReductionKg += Math.round(a.carbonSavedKg * 0.05); // active savings
  });

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title" style={{ fontSize: '26px' }}>Executive Engineering Dashboard</h1>
          <p className="page-subtitle">
            Welcome, <strong>{user?.username} ({user?.role})</strong>. Connected-car fleet health monitoring & degradation forecast.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn" onClick={() => navigate('/assets')}>
            <Activity size={16} />
            <span>Inspect Asset Twins</span>
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/simulation')}>
            <Sliders size={16} />
            <span>Launch What-If Sim</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card cyan">
          <div className="kpi-icon-wrapper"><Battery size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Monitored Assets</span>
            <span className="kpi-value">{totalAssets} Vehicles</span>
            <span className="kpi-trend stable" style={{ fontSize: '11px' }}>
              {healthyAssets} Healthy | {warningAssets} Warn | {criticalAssets} Critical
            </span>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon-wrapper"><Award size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Avg Fleet Health</span>
            <span className="kpi-value">{avgHealth}%</span>
            <span className="kpi-trend up" style={{ fontSize: '11px' }}>
              Target: &gt;90% threshold
            </span>
          </div>
        </div>

        <div className="kpi-card amber">
          <div className="kpi-icon-wrapper"><DollarSign size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Est. Avoided Repairs</span>
            <span className="kpi-value">₹{(maintenanceSavings / 1000).toFixed(0)}k</span>
            <span className="kpi-trend up" style={{ fontSize: '11px' }}>
              Prevented catastrophic fails
            </span>
          </div>
        </div>

        <div className="kpi-card red">
          <div className="kpi-icon-wrapper"><FileWarning size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">30-Day Fails Forecast</span>
            <span className="kpi-value">{predictedFailures} Assets</span>
            <span className="kpi-trend down" style={{ fontSize: '11px', color: predictedFailures > 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
              {predictedFailures > 0 ? 'Action Required' : 'All systems clear'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Layout Grid */}
      <div className="dashboard-layout">
        
        {/* Left Side: Fleet List & Timeline */}
        <div>
          {/* Critical Assets List */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <AlertTriangle size={18} style={{ color: 'var(--accent-red)' }} />
                High-Risk Assets (Requiring Engineering Mitigation)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {assets.filter(a => a.status !== 'Healthy').map(asset => (
                <div
                  key={asset.assetId}
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr 1fr 1fr auto',
                    alignItems: 'center',
                    gap: '16px'
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '15px', color: '#fff' }}>{asset.assetId}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{asset.model} • {asset.type}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>Health Score</span>
                    <strong style={{
                      fontSize: '15px',
                      color: asset.status === 'Critical' ? 'var(--accent-red)' : 'var(--accent-amber)'
                    }}>
                      {asset.healthScore}%
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>30D Failure Prob</span>
                    <strong style={{
                      fontSize: '15px',
                      color: asset.failureProbability > 70 ? 'var(--accent-red)' : 'var(--accent-amber)'
                    }}>
                      {asset.failureProbability}%
                    </strong>
                  </div>

                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      backgroundColor: asset.status === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                      color: asset.status === 'Critical' ? '#f87171' : '#fbbf24',
                      display: 'inline-block'
                    }}>
                      {asset.status}
                    </span>
                  </div>

                  <Link to={`/assets/${asset.assetId}`} className="btn btn-primary" style={{ padding: '8px 12px' }}>
                    <span>Twin Detail</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Business Impact Card */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <TrendingUp size={18} style={{ color: 'var(--accent-green)' }} />
                Fleet Operational Sustainability Opportunity
              </h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <Clock size={32} style={{ color: 'var(--accent-green)', margin: '0 auto 8px auto' }} />
                <h4 style={{ fontSize: '20px', color: '#fff', margin: '0 0 4px 0' }}>{downtimeAvoided} Hours</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Planned Downtime Avoided</span>
              </div>
              <div style={{ backgroundColor: 'rgba(0, 242, 254, 0.04)', border: '1px solid rgba(0, 242, 254, 0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <Zap size={32} style={{ color: 'var(--accent-cyan)', margin: '0 auto 8px auto' }} />
                <h4 style={{ fontSize: '20px', color: '#fff', margin: '0 0 4px 0' }}>8.4%</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Energy Efficiency Gain</span>
              </div>
              <div style={{ backgroundColor: 'rgba(139, 92, 246, 0.04)', border: '1px solid rgba(139, 92, 246, 0.15)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <TrendingDown size={32} style={{ color: 'var(--accent-purple)', margin: '0 auto 8px auto' }} />
                <h4 style={{ fontSize: '20px', color: '#fff', margin: '0 0 4px 0' }}>{carbonReductionKg} kg</h4>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CO₂ Emissions Reduced</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action and System notifications */}
        <div>
          {/* Decision Center Card */}
          <div className="content-card">
            <div className="card-header">
              <h3 className="card-title">
                <Cpu size={18} style={{ color: 'var(--accent-cyan)' }} />
                Pending Recommendations
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ borderLeft: '3px solid var(--accent-red)', paddingLeft: '12px', paddingBottom: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>IMMEDIATE ACTION REQUIRED</span>
                  <span style={{ color: 'var(--text-muted)' }}>AT-EV-003</span>
                </div>
                <strong style={{ color: '#fff', fontSize: '13px' }}>Brakes Pad Replacement (88% wear)</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  Postponing by 7 days increases failure risk to 22% with ₹48,000 exposure.
                </p>
                <Link to="/recommendations" style={{ fontSize: '12px', color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                  Open Recommendation Center
                </Link>
              </div>

              <div style={{ borderLeft: '3px solid var(--accent-red)', paddingLeft: '12px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                  <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>IMMEDIATE ACTION REQUIRED</span>
                  <span style={{ color: 'var(--text-muted)' }}>AT-EV-004</span>
                </div>
                <strong style={{ color: '#fff', fontSize: '13px' }}>Motor Bearings Wear (7.8mm/s vibr)</strong>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                  Catastrophic failure within 18 days if load torque remains unmitigated.
                </p>
                <Link to="/recommendations" style={{ fontSize: '12px', color: 'var(--accent-cyan)', textDecoration: 'underline' }}>
                  Resolve now
                </Link>
              </div>
            </div>
          </div>

          {/* Core Analytics explanation */}
          <div className="content-card" style={{ background: 'linear-gradient(135deg, #0f1c32 0%, #0d1321 100%)', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
            <h4 style={{ color: 'var(--accent-cyan)', margin: '0 0 8px 0', fontSize: '15px' }}>AutoTwin Analytics Paradigm</h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Unlike simple IoT telemetry reporting platforms that display historical curves, AutoTwin is built around **Physics-Informed Neural Networks (PINNs)**. 
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '8px' }}>
              By merging Fick's laws of mass diffusion and thermal energy conservation equations directly into the ML loss function, the platform isolates chemical degradation and predicts component remaining useful life with high confidence.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
