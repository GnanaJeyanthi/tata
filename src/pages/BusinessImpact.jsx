import React, { useState, useEffect } from 'react';
import { assetService } from '../services/api';
import { Activity, DollarSign, Clock, Zap, Award, ArrowUpRight } from 'lucide-react';

const BusinessImpact = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await assetService.getAssets();
        if (res.success) {
          setAssets(res.data);
        }
      } catch (err) {
        console.error(err);
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
        <span>Synthesizing fleet business intelligence...</span>
      </div>
    );
  }

  // Calculate Aggregated Savings
  let totalInactionCost = 0;
  let totalActionCost = 0;
  let totalHoursAvoided = 0;
  let totalCarbonSaved = 0;

  // Let's model that warning/critical assets reflect potential losses that were avoided or are being monitored
  assets.forEach(a => {
    totalCarbonSaved += a.carbonSavedKg;
    if (a.status === 'Critical') {
      totalInactionCost += 145000;
      totalActionCost += 24000;
      totalHoursAvoided += 36;
    } else if (a.status === 'Warning') {
      totalInactionCost += 45000;
      totalActionCost += 8000;
      totalHoursAvoided += 12;
    } else {
      // Healthy ones represent active savings already captured
      totalInactionCost += 18000;
      totalActionCost += 4000;
      totalHoursAvoided += 4;
    }
  });

  const netSavings = totalInactionCost - totalActionCost;

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">Business Impact Analytics</h1>
          <p className="page-subtitle">
            Quantify financial cost savings, downtime hours avoided, and carbon emissions reduction driven by predictive AI decisions.
          </p>
        </div>
      </div>

      {/* Grid of Business Metrics */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card green">
          <div className="kpi-icon-wrapper"><DollarSign size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Net Financial Savings</span>
            <span className="kpi-value">₹{netSavings.toLocaleString()}</span>
            <span className="kpi-trend up" style={{ fontSize: '11px' }}>
              Maintenance budget optimized
            </span>
          </div>
        </div>

        <div className="kpi-card cyan">
          <div className="kpi-icon-wrapper"><Clock size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Total Avoided Downtime</span>
            <span className="kpi-value">{totalHoursAvoided} Hours</span>
            <span className="kpi-trend stable" style={{ fontSize: '11px' }}>
              Logistical disruption minimized
            </span>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon-wrapper"><Award size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Monitored Fleet Extension</span>
            <span className="kpi-value">18.4% SOH gain</span>
            <span className="kpi-trend up" style={{ fontSize: '11px' }}>
              Battery calendar life extended
            </span>
          </div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon-wrapper"><Zap size={24} /></div>
          <div className="kpi-content">
            <span className="kpi-label">Avoided Grid CO₂ footprint</span>
            <span className="kpi-value">{totalCarbonSaved.toLocaleString()} kg</span>
            <span className="kpi-trend up" style={{ fontSize: '11px' }}>
              Net ESG credit rating contribution
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '24px' }}>
        {/* Cost breakdown explanation */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Economic Comparison: Predictive vs Reactive Maintenance</h3>
          </div>

          <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
            <table className="anomalies-table" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Maintenance Strategy</th>
                  <th>Direct Overhaul Cost</th>
                  <th>Secondary Collateral Damage</th>
                  <th>Towing & Diagnostics</th>
                  <th>Total Cost Exposure</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong style={{ color: 'var(--accent-green)' }}>AutoTwin Predictive AI Option</strong></td>
                  <td>₹12,500</td>
                  <td>₹0 (Prevented)</td>
                  <td>₹0</td>
                  <td style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>₹12,500</td>
                </tr>
                <tr>
                  <td><strong style={{ color: 'var(--accent-red)' }}>Reactive / Breakdown Option</strong></td>
                  <td>₹12,500</td>
                  <td>₹38,000 (Catastrophic)</td>
                  <td>₹8,500</td>
                  <td style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>₹59,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '13px',
            lineHeight: '1.6',
            color: 'var(--text-secondary)'
          }}>
            <strong style={{ color: '#fff', display: 'block', marginBottom: '6px' }}>Decision Intelligence Analysis:</strong>
            By scheduling repairs before thermal runaway thresholds or vibration limits are crossed, AutoTwin completely eliminates secondary collateral damage (e.g. stator rewinding, battery module swaps) and saves over **₹46,500 per incident**.
          </div>
        </div>

        {/* Fleet health score breakdown */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Corporate ESG Analytics</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ borderLeft: '3px solid var(--accent-purple)', paddingLeft: '12px' }}>
              <strong style={{ color: '#fff', fontSize: '14px' }}>CO₂ Emissions Prevented</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Total avoided greenhouse gases: <strong>{totalCarbonSaved} kg CO₂</strong>. This is equivalent to planting {Math.round(totalCarbonSaved / 20)} trees.
              </p>
            </div>

            <div style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <strong style={{ color: '#fff', fontSize: '14px' }}>Regenerative Braking Optimization</strong>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Predictive tuning recovered an estimated <strong>1,420 kWh</strong> of energy during urban delivery routes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessImpact;
