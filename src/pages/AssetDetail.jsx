import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { assetService } from '../services/api';
import {
  Activity,
  Battery,
  AlertTriangle,
  Award,
  Clock,
  Settings,
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  Sliders
} from 'lucide-react';

const AssetDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedComponent, setSelectedComponent] = useState('Battery');
  const [mitigationMessage, setMitigationMessage] = useState('');
  const [canLogs, setCanLogs] = useState([]);
  const [isStreaming, setIsStreaming] = useState(true);

  useEffect(() => {
    if (!data || !isStreaming) return;
    
    const interval = setInterval(() => {
      const { telemetryHistory } = data;
      const latest = telemetryHistory[telemetryHistory.length - 1] || {};
      
      // Convert values to hex format
      const hexByte = (val) => Math.min(255, Math.max(0, Math.round(val))).toString(16).toUpperCase().padStart(2, '0');
      
      let canId = '0x1A0';
      let hexData = '00 00 00 00 00';
      let decodeText = '';
      
      const randOffset = () => (Math.random() - 0.5) * 2;
      
      if (selectedComponent === 'Battery') {
        canId = '0x1A0';
        const rawVolt = Math.max(0, latest.voltage || 395) + randOffset() * 1.5;
        const rawCurr = Math.max(0, latest.current || 40) + randOffset() * 3;
        const sohHex = hexByte(latest.batterySoh || 95);
        const voltHex = hexByte(rawVolt / 2);
        const currHex = hexByte(rawCurr);
        hexData = `${sohHex} ${voltHex} ${currHex} 00 00`;
        decodeText = `[Battery SOH: ${(latest.batterySoh || 95).toFixed(1)}% | Volt: ${rawVolt.toFixed(1)}V | Curr: ${rawCurr.toFixed(1)}A]`;
      } else if (selectedComponent === 'Motor') {
        canId = '0x1B2';
        const rawVib = Math.max(0.1, (latest.vibration || 1.2) + randOffset() * 0.08);
        const rawTemp = Math.max(20, (latest.motorTemp || 50) + randOffset() * 0.6);
        const vibHex = hexByte(rawVib * 20);
        const tempHex = hexByte(rawTemp);
        hexData = `${vibHex} ${tempHex} 00 00 00`;
        decodeText = `[Stator Vibration: ${rawVib.toFixed(2)}mm/s | Motor Temp: ${rawTemp.toFixed(1)}°C]`;
      } else if (selectedComponent === 'Brakes') {
        canId = '0x1C4';
        const rawWear = Math.max(0, (latest.brakeWear || 15) + randOffset() * 0.05);
        const wearHex = hexByte(rawWear);
        const payloadHex = hexByte((latest.payload || 150) / 10);
        hexData = `${wearHex} ${payloadHex} 00 00 00`;
        decodeText = `[Brake Lining Wear: ${rawWear.toFixed(1)}% | Active Payload: ${latest.payload || 150}kg]`;
      } else if (selectedComponent === 'Tires') {
        canId = '0x1D0';
        const rawWear = Math.max(0, (latest.tireWear || 15) + randOffset() * 0.05);
        const rawSpeed = Math.max(0, 68 + randOffset() * 2.5); // Simulated vehicle speed
        const wearHex = hexByte(rawWear);
        const speedHex = hexByte(rawSpeed);
        hexData = `${wearHex} ${speedHex} 00 00 00`;
        decodeText = `[Tire Pattern Wear: ${rawWear.toFixed(1)}% | Speed Sensor: ${rawSpeed.toFixed(1)}km/h]`;
      } else if (selectedComponent === 'Cooling System') {
        canId = '0x1E8';
        const rawEngTemp = Math.max(20, (latest.engineTemp || 45) + randOffset() * 0.5);
        const rawAmbTemp = Math.max(-10, (latest.ambientTemp || 25) + randOffset() * 0.2);
        const engHex = hexByte(rawEngTemp);
        const ambHex = hexByte(rawAmbTemp);
        hexData = `${engHex} ${ambHex} 00 00 00`;
        decodeText = `[Engine Core Temp: ${rawEngTemp.toFixed(1)}°C | Ambient Air: ${rawAmbTemp.toFixed(1)}°C]`;
      } else {
        // Power Electronics
        canId = '0x1F2';
        const rawVolt = Math.max(0, latest.voltage || 395) + randOffset() * 1.2;
        const rawCurr = Math.max(0, latest.current || 40) + randOffset() * 4.5;
        const voltHex = hexByte(rawVolt / 2);
        const currHex = hexByte(rawCurr);
        const effHex = hexByte((latest.energyConsumption || 18) * 5);
        hexData = `${voltHex} ${currHex} ${effHex} 00 00`;
        decodeText = `[DC Bus Voltage: ${rawVolt.toFixed(1)}V | Phase Current: ${rawCurr.toFixed(1)}A | Inverter Eff: 96.8%]`;
      }
      
      const timestamp = new Date().toTimeString().split(' ')[0] + '.' + String(Date.now() % 1000).padStart(3, '0');
      const newLog = {
        timestamp,
        canId,
        hexData,
        decodeText
      };
      
      setCanLogs(prev => [newLog, ...prev].slice(0, 8));
    }, 900);
    
    return () => clearInterval(interval);
  }, [data, selectedComponent, isStreaming]);

  const fetchAssetData = async () => {
    try {
      const res = await assetService.getAssetById(id);
      if (res.success) {
        setData(res.data);
      } else {
        setError('Asset not found');
      }
    } catch (err) {
      setError('Error connecting to backend database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetData();
  }, [id]);

  const handleDecision = async (recommendationId, status) => {
    try {
      const res = await assetService.updateRecommendation(recommendationId, status);
      if (res.success) {
        setMitigationMessage(`Action successfully logged: Component maintenance ${status}.`);
        setTimeout(() => setMitigationMessage(''), 4000);
        // Re-fetch data to reflect status change
        fetchAssetData();
      }
    } catch (err) {
      alert('Error updating recommendation');
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity className="simulating" style={{ marginRight: '10px' }} />
        <span>Instantiating digital twin telemetry mesh...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--accent-red)' }}>
        <AlertTriangle style={{ marginRight: '10px' }} />
        <span>{error || 'Data loading error'}</span>
        <br />
        <Link to="/assets" style={{ color: 'var(--accent-cyan)', marginTop: '20px', display: 'inline-block' }}>
          Back to Assets
        </Link>
      </div>
    );
  }

  const { asset, telemetryHistory, predictions, explainability, decisions, recommendations, anomalies } = data;
  const latestTelemetry = telemetryHistory[telemetryHistory.length - 1] || {};

  // Extract selected component predictions & explanations
  const compPrediction = predictions.find(p => p.name === selectedComponent) || {};
  const compExplanation = explainability.find(e => e.componentName === selectedComponent) || {};
  const compDecision = decisions.find(d => d.component === selectedComponent) || null;
  const compRecommendation = recommendations.find(r => r.component === selectedComponent) || null;

  return (
    <div className="page-container">
      {/* Navigation Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link to="/assets" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none' }}>
          <ArrowLeft size={16} />
          <span>Back to Assets</span>
        </Link>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/simulation" className="btn">
            <Sliders size={14} />
            <span>Simulate parameters</span>
          </Link>
        </div>
      </div>

      {/* Asset Summary Row */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
        gap: '24px'
      }}>
        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Twin Identity</span>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: '#fff' }}>{asset.assetId}</h2>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{asset.model} • {asset.type}</span>
        </div>

        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Asset State</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
            <span className={`status-dot ${asset.status.toLowerCase()}`}></span>
            <strong style={{
              fontSize: '18px',
              color: asset.status === 'Critical' ? 'var(--accent-red)' : asset.status === 'Warning' ? 'var(--accent-amber)' : 'var(--accent-green)'
            }}>
              {asset.status}
            </strong>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Based on cell physics</span>
        </div>

        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Overall Health Score</span>
          <h3 style={{
            fontSize: '28px',
            fontWeight: 700,
            margin: '2px 0',
            color: asset.status === 'Critical' ? 'var(--accent-red)' : asset.status === 'Warning' ? 'var(--accent-amber)' : 'var(--accent-green)'
          }}>
            {asset.healthScore}%
          </h3>
          <div className="metric-bar-outer" style={{ height: '4px' }}>
            <div className="metric-bar-inner" style={{
              width: `${asset.healthScore}%`,
              backgroundColor: asset.status === 'Critical' ? 'var(--accent-red)' : asset.status === 'Warning' ? 'var(--accent-amber)' : 'var(--accent-green)'
            }}></div>
          </div>
        </div>

        <div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Operational Mileage</span>
          <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0', color: '#fff' }}>{asset.mileage.toLocaleString()} km</h3>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Hours: {asset.operatingHours} hrs</span>
        </div>
      </div>

      {mitigationMessage && (
        <div style={{
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid var(--accent-green)',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          color: 'var(--accent-green)',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle size={18} />
          <span>{mitigationMessage}</span>
        </div>
      )}

      {/* Main Grid: Twin Diagnostics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Component health picker list */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Components Digital Mesh</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {predictions.map(comp => {
              const isSelected = selectedComponent === comp.name;
              let badgeColor = 'var(--accent-green)';
              if (comp.risk === 'Warning') badgeColor = 'var(--accent-amber)';
              else if (comp.risk === 'Critical') badgeColor = 'var(--accent-red)';

              return (
                <div
                  key={comp.name}
                  onClick={() => setSelectedComponent(comp.name)}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-color)',
                    borderRadius: '8px',
                    padding: '14px 16px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div>
                    <strong style={{ color: isSelected ? '#fff' : 'var(--text-secondary)', fontSize: '14px' }}>{comp.name}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      RUL: {comp.rul} Months
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: badgeColor }}>{comp.soh}%</span>
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: badgeColor
                    }}></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Component Detailed Diagnostics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Subheading of Component */}
          <div className="content-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Component Details: {selectedComponent}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                  Attribution: <strong>{compPrediction.reason}</strong>
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>30D Failure Prob</span>
                <strong style={{
                  fontSize: '22px',
                  color: compPrediction.risk === 'Critical' ? 'var(--accent-red)' : compPrediction.risk === 'Warning' ? 'var(--accent-amber)' : 'var(--accent-green)'
                }}>
                  {compPrediction.prob}%
                </strong>
              </div>
            </div>

            {/* Live Parameter Matrix */}
            <h4 style={{ fontSize: '14px', color: '#fff', margin: '0 0 12px 0' }}>Physical Parameter Telemetry Mapping</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {selectedComponent === 'Battery' && (
                <>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Capacity (SOH)</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.batterySoh}%</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Voltage</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.voltage}V</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Current draw</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.current}A</strong>
                  </div>
                </>
              )}

              {selectedComponent === 'Motor' && (
                <>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Radial Vibration</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.vibration} mm/s</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Motor Temperature</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.motorTemp}°C</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Efficiency Index</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>94.2%</strong>
                  </div>
                </>
              )}

              {selectedComponent === 'Brakes' && (
                <>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Lining Wear</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.brakeWear}%</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Friction Heat Peak</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.engineTemp + 25}°C</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Vehicle Payload</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.payload} kg</strong>
                  </div>
                </>
              )}

              {selectedComponent !== 'Battery' && selectedComponent !== 'Motor' && selectedComponent !== 'Brakes' && (
                <>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Junction Temp</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.engineTemp}°C</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Ambient Temp</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.ambientTemp}°C</strong>
                  </div>
                  <div style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Consumption Efficiency</span>
                    <strong style={{ fontSize: '16px', color: '#fff' }}>{latestTelemetry.energyConsumption} kWh/100km</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Explainable AI Block */}
          {compExplanation && compExplanation.contributingFactors && (
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">
                  <ShieldAlert size={18} style={{ color: 'var(--accent-cyan)' }} />
                  Explainable AI (XAI) Root Cause Attributions
                </h3>
              </div>

              <div style={{ marginBottom: '16px', borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '12px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Primary Root Cause Model</span>
                <p style={{ fontSize: '13px', color: '#fff', marginTop: '4px', lineHeight: '1.5' }}>
                  {compExplanation.primaryRootCause}
                </p>
              </div>

              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Attribution Contribution Coefficients (Confidence: {compExplanation.confidence}%)
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {compExplanation.contributingFactors.map(factor => (
                  <div key={factor.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{factor.name} ({factor.value})</span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>+{factor.contribution}% contribution</strong>
                    </div>
                    <div className="metric-bar-outer" style={{ height: '5px' }}>
                      <div className="metric-bar-inner" style={{
                        width: `${factor.contribution}%`,
                        backgroundColor: 'var(--accent-cyan)'
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Live Edge Telemetry Terminal & Physics-Informed ML Optimizer */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '20px' }}>
            
            {/* Edge CAN Bus Terminal */}
            <div className="content-card" style={{ display: 'flex', flexDirection: 'column', height: '360px', margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: isStreaming ? 'var(--accent-green)' : 'var(--text-muted)',
                    boxShadow: isStreaming ? '0 0 8px var(--accent-green)' : 'none'
                  }}></span>
                  <h4 style={{ fontSize: '14px', color: '#fff', margin: 0 }}>Onboard CAN Bus Edge Decoder</h4>
                </div>
                <button 
                  onClick={() => setIsStreaming(!isStreaming)} 
                  className="btn" 
                  style={{ padding: '4px 8px', fontSize: '10px', height: '22px' }}
                >
                  {isStreaming ? 'Pause Stream' : 'Resume Stream'}
                </button>
              </div>

              {/* Monospace terminal logs */}
              <div style={{
                backgroundColor: '#050a12',
                border: '1px solid #112240',
                borderRadius: '6px',
                padding: '12px',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#39ff14',
                flexGrow: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '6px',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)'
              }}>
                {canLogs.length === 0 ? (
                  <span style={{ color: 'var(--text-muted)' }}>Listening for edge telemetry frames...</span>
                ) : (
                  canLogs.map((log, i) => (
                    <div key={i} style={{ opacity: Math.max(0.3, 1 - i * 0.1) }}>
                      <span style={{ color: '#00f2fe' }}>[{log.timestamp}]</span>{' '}
                      <span style={{ color: '#ffb300' }}>ID:{log.canId}</span>{' '}
                      <span style={{ color: '#fff' }}>DATA: {log.hexData}</span>
                      <div style={{ color: '#8892b0', paddingLeft: '14px', marginTop: '1px' }}>
                        ↳ Decoded: <span style={{ color: '#39ff14' }}>{log.decodeText}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* PINN Physics Loss Optimizer */}
            <div className="content-card" style={{ display: 'flex', flexDirection: 'column', height: '360px', margin: 0 }}>
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '14px', color: '#fff', margin: 0 }}>PINN Physics Constraint Optimizer</h4>
              </div>

              {/* Equation math display */}
              <div style={{ 
                backgroundColor: 'rgba(0, 242, 254, 0.02)', 
                border: '1px solid rgba(0, 242, 254, 0.1)', 
                borderRadius: '6px', 
                padding: '10px', 
                marginBottom: '10px',
                fontSize: '11px'
              }}>
                <span style={{ color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
                  Model Boundary Constraint
                </span>
                {selectedComponent === 'Battery' && (
                  <div style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>
                    Fick's diffusion boundary constraint:<br />
                    ∂C/∂t = D * ∇²C  ⟹  d(SOH)/dn = -k_degrade / √(n + ε)
                  </div>
                )}
                {selectedComponent === 'Motor' && (
                  <div style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>
                    Stator cooling energy balance equation:<br />
                    dT_steady = T_ambient + (I² * R_int) / h_cooling
                  </div>
                )}
                {selectedComponent === 'Brakes' && (
                  <div style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>
                    Friction dissipation kinetics limit:<br />
                    E_k = 0.5 * m * v² ⟹  WearRate ∝ f(Payload, Aggressiveness)
                  </div>
                )}
                {selectedComponent !== 'Battery' && selectedComponent !== 'Motor' && selectedComponent !== 'Brakes' && (
                  <div style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace', fontSize: '11px', marginTop: '4px', lineHeight: '1.4' }}>
                    Newton's law of cooling heat flux:<br />
                    dQ/dt = -h * A * (T_junction - T_ambient)
                  </div>
                )}
              </div>

              {/* Loss Chart SVG */}
              <div style={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <svg viewBox="0 0 400 130" style={{ width: '100%', height: '100%' }}>
                  {/* Grid background */}
                  <line x1="20" y1="10" x2="390" y2="10" stroke="#1f2937" strokeWidth="1" />
                  <line x1="20" y1="40" x2="390" y2="40" stroke="#1f2937" strokeWidth="1" />
                  <line x1="20" y1="70" x2="390" y2="70" stroke="#1f2937" strokeWidth="1" />
                  <line x1="20" y1="100" x2="390" y2="100" stroke="#1f2937" strokeWidth="1" />
                  <line x1="20" y1="110" x2="390" y2="110" stroke="#374151" strokeWidth="1.5" />
                  
                  {/* Data Loss Curve - Green */}
                  <path 
                    d="M 20 20 C 100 40, 180 80, 220 95 T 390 102" 
                    fill="none" 
                    stroke="var(--accent-green)" 
                    strokeWidth="2" 
                  />
                  
                  {/* Physics Loss Curve - Cyan dashed */}
                  <path 
                    d="M 20 15 C 80 15, 140 100, 200 65 T 320 101 T 390 104" 
                    fill="none" 
                    stroke="var(--accent-cyan)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4,3" 
                  />
                  
                  {/* Labels */}
                  <text x="25" y="30" fill="var(--accent-green)" fontSize="9" fontFamily="monospace">L_data (Sensor Error)</text>
                  <text x="25" y="45" fill="var(--accent-cyan)" fontSize="9" fontFamily="monospace">L_physics (PDE Penalty)</text>
                  
                  {/* Convergence Marker */}
                  <circle cx="390" cy="102" r="3" fill="var(--accent-green)" />
                  <circle cx="390" cy="104" r="3" fill="var(--accent-cyan)" />
                  <text x="270" y="122" fill="var(--text-secondary)" fontSize="8" fontFamily="monospace">Epoch: 100/100 (Converged)</text>
                </svg>
              </div>
            </div>

          </div>

          {/* Decision Intelligence Engine Comparison Options */}
          {compDecision && compDecision.options && (
            <div className="content-card">
              <div className="card-header">
                <h3 className="card-title">
                  <TrendingUp size={18} style={{ color: 'var(--accent-green)' }} />
                  Decision Intelligence Options Matrix (Economic & Risk Analysis)
                </h3>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="anomalies-table" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Option Scenario</th>
                      <th>Expected Cost</th>
                      <th>Downtime</th>
                      <th>30D Risk</th>
                      <th>Safety Impact</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compDecision.options.map((opt, index) => {
                      const isRecommended = index === compDecision.recommendedOptionIndex;
                      return (
                        <tr key={opt.title} style={{
                          backgroundColor: isRecommended ? 'rgba(0, 242, 254, 0.04)' : 'transparent',
                          borderLeft: isRecommended ? '3px solid var(--accent-cyan)' : 'none'
                        }}>
                          <td>
                            <strong>{opt.title}</strong>
                            {isRecommended && <span style={{
                              display: 'block',
                              fontSize: '9px',
                              color: 'var(--accent-cyan)',
                              textTransform: 'uppercase',
                              fontWeight: 'bold',
                              marginTop: '2px'
                            }}>AutoTwin Recommended Option</span>}
                          </td>
                          <td style={{ color: '#fff', fontWeight: 600 }}>₹{opt.financialExposure.toLocaleString()}</td>
                          <td>{opt.downtime} hrs</td>
                          <td style={{
                            color: opt.residualRisk > 40 ? 'var(--accent-red)' : opt.residualRisk > 10 ? 'var(--accent-amber)' : 'var(--accent-green)',
                            fontWeight: 'bold'
                          }}>
                            {opt.residualRisk}%
                          </td>
                          <td style={{ fontSize: '12px' }}>{opt.safetyImpact}</td>
                          <td>
                            {compRecommendation ? (
                              <button
                                disabled={compRecommendation.status === 'Accepted' || compRecommendation.status === 'Scheduled'}
                                onClick={() => handleDecision(compRecommendation._id, index === 0 ? 'Accepted' : 'Under Review')}
                                className={index === 0 ? 'btn btn-primary' : 'btn'}
                                style={{ padding: '6px 10px', fontSize: '11px' }}
                              >
                                {compRecommendation.status === 'Accepted' && index === 0 ? 'Scheduled' : 'Execute'}
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
