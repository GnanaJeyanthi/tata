import React, { useState, useEffect } from 'react';
import { assetService } from '../services/api';
import { FileText, Activity, Printer, Download, ChevronDown, ChevronUp } from 'lucide-react';

const Reports = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assetData, setAssetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    health: true,
    predictions: true,
    rootCause: true,
    recommendations: true,
    decisions: true,
    cost: true,
    sustainability: true
  });

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await assetService.getAssets();
        if (res.success && res.data.length > 0) {
          setAssets(res.data);
          setSelectedAssetId(res.data[0].assetId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setReportReady(false);
    try {
      const res = await assetService.getAssetById(selectedAssetId);
      if (res.success) {
        setAssetData(res.data);
        setReportReady(true);
      }
    } catch (err) {
      alert('Failed to generate report data');
    } finally {
      setGenerating(false);
    }
  };

  const toggleSection = (key) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => {
    window.print();
  };

  const SectionHeader = ({ title, sectionKey, icon }) => (
    <div
      onClick={() => toggleSection(sectionKey)}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        cursor: 'pointer',
        padding: '14px 0',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: expandedSections[sectionKey] ? '16px' : '0'
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        {icon}
        {title}
      </h3>
      {expandedSections[sectionKey] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </div>
  );

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity className="simulating" style={{ marginRight: '10px' }} />
        <span>Loading report generator...</span>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Engineering Report Generator</h1>
          <p className="page-subtitle">
            Generate comprehensive, printable engineering diagnostics and recommendations from digital twin data.
          </p>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Select Asset:</label>
          <select
            className="control-select"
            value={selectedAssetId}
            onChange={(e) => { setSelectedAssetId(e.target.value); setReportReady(false); }}
          >
            {assets.map(a => (
              <option key={a.assetId} value={a.assetId}>
                {a.assetId} — {a.model}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary"
            style={{ padding: '10px 20px' }}
          >
            <FileText size={16} />
            <span>{generating ? 'Generating...' : 'Generate Report'}</span>
          </button>
          {reportReady && (
            <button onClick={handlePrint} className="btn" style={{ padding: '10px 16px' }}>
              <Printer size={16} />
              <span>Print Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Report Content */}
      {!reportReady ? (
        <div className="content-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <FileText size={48} style={{ margin: '0 auto 16px auto', opacity: 0.4 }} />
          <h3>No Report Generated</h3>
          <p style={{ fontSize: '13px', maxWidth: '400px', margin: '8px auto 0 auto' }}>
            Select an asset and click "Generate Report" to create a structured engineering analysis document.
          </p>
        </div>
      ) : assetData && (
        <div id="report-content" className="content-card" style={{ padding: '32px' }}>
          {/* Report Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '24px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>
              AutoTwin AI — Engineering Diagnostics Report
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Asset: <strong>{assetData.asset.assetId}</strong> | Model: <strong>{assetData.asset.model}</strong> | Generated: {new Date().toLocaleString()}
            </p>
          </div>

          {/* Section 1: Asset Summary */}
          <SectionHeader title="Asset Summary" sectionKey="summary" icon={<span style={{ color: 'var(--accent-cyan)' }}>§1</span>} />
          {expandedSections.summary && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Asset ID</span>
                <strong style={{ color: '#fff' }}>{assetData.asset.assetId}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Vehicle Model</span>
                <strong style={{ color: '#fff' }}>{assetData.asset.model}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Type</span>
                <strong style={{ color: '#fff' }}>{assetData.asset.type || 'Passenger'}</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Mileage</span>
                <strong style={{ color: '#fff' }}>{assetData.asset.mileage?.toLocaleString()} km</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Operating Hours</span>
                <strong style={{ color: '#fff' }}>{assetData.asset.operatingHours} hrs</strong>
              </div>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Last Serviced</span>
                <strong style={{ color: '#fff' }}>{new Date(assetData.asset.lastServiced).toLocaleDateString()}</strong>
              </div>
            </div>
          )}

          {/* Section 2: Current Health */}
          <SectionHeader title="Current Health Assessment" sectionKey="health" icon={<span style={{ color: 'var(--accent-green)' }}>§2</span>} />
          {expandedSections.health && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  border: `3px solid ${assetData.asset.status === 'Critical' ? 'var(--accent-red)' : assetData.asset.status === 'Warning' ? 'var(--accent-amber)' : 'var(--accent-green)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '22px', fontWeight: 700,
                  color: assetData.asset.status === 'Critical' ? 'var(--accent-red)' : assetData.asset.status === 'Warning' ? 'var(--accent-amber)' : 'var(--accent-green)'
                }}>
                  {assetData.asset.healthScore}%
                </div>
                <div>
                  <strong style={{ fontSize: '18px', color: '#fff' }}>Overall: {assetData.asset.status}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Composite degradation score based on physics-informed component fusion analysis.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Predictions */}
          <SectionHeader title="Component Failure Predictions" sectionKey="predictions" icon={<span style={{ color: 'var(--accent-amber)' }}>§3</span>} />
          {expandedSections.predictions && assetData.predictions && (
            <div style={{ marginBottom: '24px', overflowX: 'auto' }}>
              <table className="anomalies-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Component</th>
                    <th>Health (SOH)</th>
                    <th>Failure Prob (30D)</th>
                    <th>RUL (Months)</th>
                    <th>Risk Level</th>
                    <th>Primary Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {assetData.predictions.map(p => (
                    <tr key={p.name}>
                      <td><strong>{p.name}</strong></td>
                      <td>{typeof p.soh === 'number' ? p.soh.toFixed(1) : p.soh}%</td>
                      <td style={{
                        color: p.prob > 50 ? 'var(--accent-red)' : p.prob > 15 ? 'var(--accent-amber)' : 'var(--accent-green)',
                        fontWeight: 'bold'
                      }}>{p.prob}%</td>
                      <td>{p.rul}</td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold',
                          backgroundColor: p.risk === 'Critical' ? 'rgba(239,68,68,0.15)' : p.risk === 'Warning' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                          color: p.risk === 'Critical' ? '#f87171' : p.risk === 'Warning' ? '#fbbf24' : '#34d399'
                        }}>{p.risk}</span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{p.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Section 4: Root Cause */}
          <SectionHeader title="Root Cause Analysis (XAI)" sectionKey="rootCause" icon={<span style={{ color: 'var(--accent-red)' }}>§4</span>} />
          {expandedSections.rootCause && assetData.explainability && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              {assetData.explainability.filter(e => e.contributingFactors && e.contributingFactors.length > 0).map(exp => (
                <div key={exp.componentName} style={{
                  backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', padding: '16px'
                }}>
                  <strong style={{ color: '#fff', fontSize: '14px' }}>{exp.componentName}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 12px 0' }}>
                    {exp.primaryRootCause}
                  </p>
                  {exp.contributingFactors.map(f => (
                    <div key={f.name} style={{ marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{f.name} ({f.value})</span>
                        <span style={{ color: 'var(--accent-cyan)' }}>+{f.contribution}%</span>
                      </div>
                      <div className="metric-bar-outer" style={{ height: '4px' }}>
                        <div className="metric-bar-inner" style={{ width: `${f.contribution}%`, backgroundColor: 'var(--accent-cyan)' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Section 5: Recommendations */}
          <SectionHeader title="Recommended Engineering Actions" sectionKey="recommendations" icon={<span style={{ color: 'var(--accent-green)' }}>§5</span>} />
          {expandedSections.recommendations && assetData.recommendations && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {assetData.recommendations.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No active recommendations for this asset.</p>
              ) : assetData.recommendations.map(rec => (
                <div key={rec._id} style={{
                  backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  borderRadius: '8px', padding: '16px'
                }}>
                  <strong style={{ color: '#fff' }}>{rec.recommendedAction}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0' }}>
                    Component: {rec.component} | Priority: {rec.priority} | Status: {rec.status}
                  </p>
                  <div style={{ display: 'flex', gap: '24px', fontSize: '12px', marginTop: '8px' }}>
                    <span>Cost of Action: <strong style={{ color: 'var(--accent-green)' }}>₹{rec.costOfAction?.toLocaleString()}</strong></span>
                    <span>Cost of Inaction: <strong style={{ color: 'var(--accent-red)' }}>₹{rec.costOfInaction?.toLocaleString()}</strong></span>
                    <span>Risk Reduction: <strong style={{ color: 'var(--accent-cyan)' }}>{rec.riskReduction}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Section 6: Decision Comparison */}
          <SectionHeader title="Decision Intelligence Comparison" sectionKey="decisions" icon={<span style={{ color: 'var(--accent-purple)' }}>§6</span>} />
          {expandedSections.decisions && assetData.decisions && (
            <div style={{ marginBottom: '24px' }}>
              {assetData.decisions.length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No active decision scenarios for this asset.</p>
              ) : assetData.decisions.map((dec, i) => (
                <div key={i} style={{ marginBottom: '16px' }}>
                  <strong style={{ color: '#fff', fontSize: '14px', display: 'block', marginBottom: '10px' }}>
                    {dec.component} — Maintenance Decision Options
                  </strong>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="anomalies-table" style={{ width: '100%' }}>
                      <thead>
                        <tr>
                          <th>Option</th>
                          <th>Cost</th>
                          <th>Downtime</th>
                          <th>Residual Risk</th>
                          <th>Safety Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dec.options.map((opt, idx) => (
                          <tr key={idx} style={{
                            backgroundColor: idx === dec.recommendedOptionIndex ? 'rgba(0,242,254,0.04)' : 'transparent'
                          }}>
                            <td>
                              <strong>{opt.title}</strong>
                              {idx === dec.recommendedOptionIndex && (
                                <span style={{ display: 'block', fontSize: '9px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                                  RECOMMENDED
                                </span>
                              )}
                            </td>
                            <td>₹{opt.financialExposure?.toLocaleString()}</td>
                            <td>{opt.downtime} hrs</td>
                            <td style={{
                              color: opt.residualRisk > 40 ? 'var(--accent-red)' : opt.residualRisk > 10 ? 'var(--accent-amber)' : 'var(--accent-green)',
                              fontWeight: 'bold'
                            }}>{opt.residualRisk}%</td>
                            <td style={{ fontSize: '12px' }}>{opt.safetyImpact}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Report Footer */}
          <div style={{ borderTop: '2px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', textAlign: 'center' }}>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              AutoTwin AI — Physics-Informed Decision Intelligence for Smart Mobility | Tata Technologies InnoVent 2030
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              This report was generated automatically from digital twin telemetry and predictive analytics engine outputs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
