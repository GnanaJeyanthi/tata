import React, { useState, useEffect } from 'react';
import { assetService } from '../services/api';
import { AlertTriangle, Activity, CheckCircle, Search } from 'lucide-react';

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await assetService.getAnomalies();
        if (res.success) {
          setAnomalies(res.data);
        } else {
          setError('Failed to fetch anomalies logs');
        }
      } catch (err) {
        setError('Error connecting to backend database');
      } finally {
        setLoading(false);
      }
    };
    fetchAnomalies();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity className="simulating" style={{ marginRight: '10px' }} />
        <span>Parsing database telemetry logs for anomalies...</span>
      </div>
    );
  }

  const filteredAnomalies = anomalies.filter(anom => {
    const matchesSearch = anom.assetId.toLowerCase().includes(search.toLowerCase()) ||
                          anom.parameter.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || anom.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Real-Time Anomaly Investigation Center</h1>
          <p className="page-subtitle">
            Inspect automated telemetry deviations, threshold breaches, and potential structural faults.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
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
            placeholder="Search anomalies by Asset ID or parameter..."
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
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Severity:</span>
          <select
            className="control-select"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="All">All Severities</option>
            <option value="Warning">Warning Only</option>
            <option value="Critical">Critical Only</option>
          </select>
        </div>
      </div>

      {/* Anomalies Table */}
      <div className="content-card" style={{ padding: 0 }}>
        {filteredAnomalies.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No telemetry anomalies found matching current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="anomalies-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Asset ID</th>
                  <th>Parameter</th>
                  <th>Expected Range</th>
                  <th>Actual Value</th>
                  <th>Deviation</th>
                  <th>Severity</th>
                  <th>Possible Cause & Diagnostics</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAnomalies.map(anom => (
                  <tr key={anom._id}>
                    <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                      {new Date(anom.timestamp).toLocaleTimeString()}
                    </td>
                    <td>
                      <strong style={{ color: '#fff' }}>{anom.assetId}</strong>
                    </td>
                    <td>{anom.parameter}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{anom.expectedRange}</td>
                    <td style={{ fontWeight: 'bold', color: '#fff' }}>{anom.actualValue}</td>
                    <td style={{ color: 'var(--accent-red)' }}>+{anom.deviationPct}%</td>
                    <td>
                      <span style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        backgroundColor: anom.severity === 'Critical' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: anom.severity === 'Critical' ? '#f87171' : '#fbbf24'
                      }}>
                        {anom.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '280px' }}>
                      <strong>{anom.possibleCause}</strong>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Investigate: {anom.recommendedInvestigation}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                        {anom.resolved ? (
                          <>
                            <CheckCircle size={14} style={{ color: 'var(--accent-green)' }} />
                            <span style={{ color: 'var(--accent-green)' }}>Resolved</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={14} style={{ color: 'var(--accent-amber)' }} />
                            <span style={{ color: 'var(--accent-amber)' }}>Active</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Anomalies;
