import React, { useState, useEffect } from 'react';
import { assetService } from '../services/api';
import { Sliders, Activity, HelpCircle, FileWarning, DollarSign, Clock, Zap, TrendingDown } from 'lucide-react';

const Simulation = () => {
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState(null);

  // Form Inputs
  const [payloadPct, setPayloadPct] = useState(60);
  const [operatingHours, setOperatingHours] = useState(8);
  const [ambientTemp, setAmbientTemp] = useState(25);
  const [drivingAggressiveness, setDrivingAggressiveness] = useState('Medium');
  const [chargingPattern, setChargingPattern] = useState('Normal');
  const [maintenanceDelayDays, setMaintenanceDelayDays] = useState(0);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await assetService.getAssets();
        if (res.success && res.data.length > 0) {
          setAssets(res.data);
          setSelectedAssetId(res.data[0].assetId);
        }
      } catch (err) {
        console.error('Error fetching assets', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    try {
      const res = await assetService.runSimulation({
        assetId: selectedAssetId,
        payloadPct,
        operatingHours,
        ambientTemp,
        drivingAggressiveness,
        chargingPattern,
        maintenanceDelayDays
      });

      if (res.success) {
        setResult(res.data);
      }
    } catch (err) {
      alert('Simulation failed to connect');
    } finally {
      setSimulating(false);
    }
  };

  // Find baseline stats for selected asset
  const activeAsset = assets.find(a => a.assetId === selectedAssetId);

  return (
    <div className="page-container">
      <div className="page-header-row">
        <div>
          <h1 className="page-title">What-If Simulation Lab</h1>
          <p className="page-subtitle">
            Perform physical-model stress testing. Predict health degradation, downtime, and financial exposure based on operation variables.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Simulation Control Form */}
        <form onSubmit={handleSimulate} className="content-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="card-header" style={{ paddingBottom: '8px' }}>
            <h3 className="card-title">Stress Simulation Parameters</h3>
          </div>

          {/* Asset Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Monitored Asset</label>
            <select
              className="control-select"
              value={selectedAssetId}
              onChange={(e) => { setSelectedAssetId(e.target.value); setResult(null); }}
              required
            >
              {assets.map(a => (
                <option key={a.assetId} value={a.assetId}>
                  {a.assetId} ({a.model})
                </option>
              ))}
            </select>
          </div>

          {/* Payload Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Cargo Payload Weight</span>
              <strong style={{ color: '#fff' }}>{payloadPct}% capacity</strong>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              value={payloadPct}
              onChange={(e) => setPayloadPct(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Daily hours Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Daily Operating Hours</span>
              <strong style={{ color: '#fff' }}>{operatingHours} Hours/Day</strong>
            </div>
            <input
              type="range"
              min="2"
              max="24"
              value={operatingHours}
              onChange={(e) => setOperatingHours(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Ambient Temp Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Ambient Operations Temp</span>
              <strong style={{ color: '#fff' }}>{ambientTemp}°C</strong>
            </div>
            <input
              type="range"
              min="-10"
              max="55"
              value={ambientTemp}
              onChange={(e) => setAmbientTemp(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
            />
          </div>

          {/* Driving Aggressiveness select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Driving Aggressiveness</label>
            <select
              className="control-select"
              value={drivingAggressiveness}
              onChange={(e) => setDrivingAggressiveness(e.target.value)}
            >
              <option value="Low">Low Stress (Eco-Driving)</option>
              <option value="Medium">Medium Stress (Balanced)</option>
              <option value="High">High Stress (Aggressive acceleration/braking)</option>
            </select>
          </div>

          {/* Charging Pattern select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Battery Charging Pattern</label>
            <select
              className="control-select"
              value={chargingPattern}
              onChange={(e) => setChargingPattern(e.target.value)}
            >
              <option value="Normal">Normal AC Charging (Overnight slow charging)</option>
              <option value="Fast Charging">Recurrent DC Fast Charging (&gt;50kW peak)</option>
            </select>
          </div>

          {/* Maintenance Delay Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Maintenance Delay</span>
              <strong style={{ color: 'var(--accent-amber)' }}>{maintenanceDelayDays} Days</strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={maintenanceDelayDays}
              onChange={(e) => setMaintenanceDelayDays(Number(e.target.value))}
              style={{ accentColor: 'var(--accent-amber)', cursor: 'pointer' }}
            />
          </div>

          <button
            type="submit"
            disabled={simulating}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', justifyContent: 'center', marginTop: '10px' }}
          >
            {simulating ? 'Executing Physics Engine Solver...' : 'Run Simulation'}
          </button>
        </form>

        {/* Results Screen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {!result ? (
            <div className="content-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ margin: '0 auto 16px auto', color: 'var(--text-muted)' }} />
              <h3>Awaiting Simulation Input</h3>
              <p style={{ fontSize: '13px', maxWidth: '400px', margin: '8px auto 0 auto' }}>
                Modify stress parameters in the panel on the left and click 'Run Simulation' to load physics-informed ML predictions.
              </p>
            </div>
          ) : (
            <>
              {/* Baseline vs Simulated comparison */}
              <div className="content-card">
                <div className="card-header">
                  <h3 className="card-title">Physics Twin Stress Comparison</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Baseline panel */}
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                      Baseline Scenario
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Failure Probability</span>
                        <strong style={{ color: '#fff' }}>{activeAsset?.failureProbability || 5}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Asset Health Score</span>
                        <strong style={{ color: '#fff' }}>{activeAsset?.healthScore || 100}%</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Overhaul Repair Cost</span>
                        <strong style={{ color: '#fff' }}>₹15,000</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Expected Downtime</span>
                        <strong style={{ color: '#fff' }}>0.5 Days</strong>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Panel */}
                  <div style={{ border: '1px solid var(--accent-cyan)', borderRadius: '8px', padding: '16px', backgroundColor: 'rgba(0, 242, 254, 0.02)' }}>
                    <h4 style={{ color: 'var(--accent-cyan)', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                      Simulated Stress Scenario
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Failure Probability</span>
                        <strong style={{ color: result.outputs.failureProbability > 40 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                          {result.outputs.failureProbability}%
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Asset Health Score</span>
                        <strong style={{ color: result.outputs.healthScore < 80 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                          {result.outputs.healthScore}%
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Overhaul Repair Cost</span>
                        <strong style={{ color: result.outputs.repairCost > 15000 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                          ₹{result.outputs.repairCost.toLocaleString()}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Expected Downtime</span>
                        <strong style={{ color: result.outputs.expectedDowntime > 1 ? 'var(--accent-red)' : 'var(--accent-cyan)' }}>
                          {result.outputs.expectedDowntime} Days
                        </strong>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Economic & Environmental Impact Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Cost & Downtime Impact */}
                <div className="content-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <DollarSign size={20} style={{ color: 'var(--accent-red)' }} />
                    <h4 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Financial Cost Exposure</h4>
                  </div>
                  <strong style={{ fontSize: '20px', color: 'var(--accent-red)' }}>
                    +₹{(result.outputs.repairCost - 15000).toLocaleString()}
                  </strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Accumulated financial liability from deferred scheduling and secondary components stress.
                  </p>
                </div>

                {/* Sustainability carbon impact */}
                <div className="content-card" style={{ margin: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <TrendingDown size={20} style={{ color: 'var(--accent-purple)' }} />
                    <h4 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Carbon Footprint Shift</h4>
                  </div>
                  <strong style={{ fontSize: '20px', color: result.outputs.carbonImpactPct >= 0 ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                    {result.outputs.carbonImpactPct >= 0 ? `+${result.outputs.carbonImpactPct}%` : `${result.outputs.carbonImpactPct}%`}
                  </strong>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Grid recharge emissions change due to thermal and motor friction efficiency degradation.
                  </p>
                </div>
              </div>

              {/* Recommendation card */}
              <div className="content-card" style={{
                background: 'linear-gradient(135deg, #1e1e12 0%, #0d0d08 100%)',
                border: '1px solid var(--accent-amber)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FileWarning size={20} style={{ color: 'var(--accent-amber)' }} />
                  <h4 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Decision Intelligence Recommendation</h4>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {maintenanceDelayDays > 7 ? (
                    <strong style={{ color: 'var(--accent-red)' }}>
                      CRITICAL: Delayed maintenance triggers cascading failures. Postponing maintenance for {maintenanceDelayDays} days is heavily discouraged.
                    </strong>
                  ) : (
                    <span>
                      Operating with current parameters is acceptable, but monitor battery charging speed to prolong Cathode cycle life.
                    </span>
                  )}
                </p>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default Simulation;
