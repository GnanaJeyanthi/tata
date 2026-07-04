import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { assetService } from '../services/api';
import { Battery, Activity, Search, Sliders, ChevronRight } from 'lucide-react';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await assetService.getAssets();
        if (res.success) {
          setAssets(res.data);
        } else {
          setError('Failed to fetch assets');
        }
      } catch (err) {
        setError('Error connecting to backend server');
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity className="simulating" style={{ marginRight: '10px' }} />
        <span>Loading asset digital twins...</span>
      </div>
    );
  }

  // Filter Assets based on Search & Status dropdown
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.assetId.toLowerCase().includes(search.toLowerCase()) ||
                          asset.model.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'All' || asset.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Mobility Asset Digital Twins</h1>
          <p className="page-subtitle">
            Inspect physical assets, live operational telemetry, and component health forecasts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search assets by ID or Model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '10px 12px 10px 38px',
              color: '#fff',
              outline: 'none',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Status:</span>
          <select
            className="control-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredAssets.map(asset => {
          let statusColor = 'var(--accent-green)';
          let statusBg = 'rgba(16, 185, 129, 0.1)';
          let statusBorder = 'rgba(16, 185, 129, 0.3)';

          if (asset.status === 'Warning') {
            statusColor = 'var(--accent-amber)';
            statusBg = 'rgba(245, 158, 11, 0.1)';
            statusBorder = 'rgba(245, 158, 11, 0.3)';
          } else if (asset.status === 'Critical') {
            statusColor = 'var(--accent-red)';
            statusBg = 'rgba(239, 68, 68, 0.1)';
            statusBorder = 'rgba(239, 68, 68, 0.3)';
          }

          return (
            <div
              key={asset.assetId}
              style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '24px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
              onClick={() => window.location.href = `/assets/${asset.assetId}`}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', margin: 0 }}>{asset.assetId}</h3>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{asset.model}</span>
                  </div>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    color: statusColor,
                    backgroundColor: statusBg,
                    border: `1px solid ${statusBorder}`
                  }}>
                    {asset.status}
                  </span>
                </div>

                <div style={{ margin: '16px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Asset Health Score</span>
                    <strong style={{ color: statusColor }}>{asset.healthScore}%</strong>
                  </div>
                  <div className="metric-bar-outer" style={{ height: '6px', marginBottom: '16px' }}>
                    <div
                      className="metric-bar-inner"
                      style={{
                        width: `${asset.healthScore}%`,
                        backgroundColor: statusColor
                      }}
                    ></div>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  fontSize: '12px',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  marginBottom: '16px'
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Mileage</span>
                    <strong style={{ color: '#fff' }}>{asset.mileage.toLocaleString()} km</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Operating Hours</span>
                    <strong style={{ color: '#fff' }}>{asset.operatingHours} hrs</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Type: <strong>{asset.type}</strong>
                </span>
                <Link
                  to={`/assets/${asset.assetId}`}
                  className="btn"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Open Twin</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Assets;
