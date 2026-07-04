/**
 * Anomaly Service
 * Implements real anomaly calculations:
 * 1. Threshold checks
 * 2. Rate-of-change checks
 * 3. Deviation from rolling baseline
 * 4. Multi-signal correlation rules
 */

const { getDbMode } = require('../config/db');
const Anomaly = require('../models/Anomaly');
const { memoryStore } = require('../utils/memoryDb');

const detectTelemetryAnomalies = async (assetId, latest, history = []) => {
  const anomalies = [];
  const isMongo = getDbMode() === 'mongodb';

  // 1. Threshold Anomaly Checks
  // Vibration
  if (latest.vibration > 4.5) {
    const deviation = Math.round(((latest.vibration - 2.5) / 2.5) * 100);
    anomalies.push({
      assetId,
      parameter: 'Vibration Level',
      expectedRange: '0.5 - 3.0 mm/s',
      actualValue: latest.vibration,
      deviationPct: deviation,
      severity: latest.vibration > 7.0 ? 'Critical' : 'Warning',
      possibleCause: 'Rotational imbalance or bearing fatigue in drive motor.',
      recommendedInvestigation: 'Inspect bearing alignments and balance motor shaft assembly.',
      resolved: false
    });
  }

  // Motor/Engine Temperature
  if (latest.motorTemp > 85 || latest.engineTemp > 85) {
    const tempVal = latest.motorTemp || latest.engineTemp;
    const deviation = Math.round(((tempVal - 70) / 70) * 100);
    anomalies.push({
      assetId,
      parameter: 'Motor Temperature',
      expectedRange: '30°C - 75°C',
      actualValue: tempVal,
      deviationPct: deviation,
      severity: tempVal > 92 ? 'Critical' : 'Warning',
      possibleCause: 'Coolant circulation blockage or stator overload.',
      recommendedInvestigation: 'Perform pressure check on cooling loop and inspect radiators.',
      resolved: false
    });
  }

  // Brakes Pad Wear
  if (latest.brakeWear > 75) {
    const deviation = Math.round(((latest.brakeWear - 50) / 50) * 100);
    anomalies.push({
      assetId,
      parameter: 'Brake Linings Wear',
      expectedRange: '0% - 60% (Wear)',
      actualValue: latest.brakeWear,
      deviationPct: deviation,
      severity: latest.brakeWear > 85 ? 'Critical' : 'Warning',
      possibleCause: 'Heavy mechanical brake friction and pad depletion.',
      recommendedInvestigation: 'Inspect callipers and schedule immediate pad replacement.',
      resolved: false
    });
  }

  // SOH boundary checks
  if (latest.batterySoh < 75) {
    const deviation = Math.round(((100 - latest.batterySoh) / 20) * 100);
    anomalies.push({
      assetId,
      parameter: 'Battery SOH',
      expectedRange: '80% - 100%',
      actualValue: latest.batterySoh,
      deviationPct: deviation,
      severity: latest.batterySoh < 70 ? 'Critical' : 'Warning',
      possibleCause: 'Dendrite growth, calendar aging, or lithium plating.',
      recommendedInvestigation: 'Perform individual cell voltage impedance sweeps.',
      resolved: false
    });
  }

  // 2. Rate-of-Change Checks (Comparing with history)
  if (history && history.length > 0) {
    const prev = history[history.length - 1];
    
    // Battery SOH decline rate
    const sohDecline = prev.batterySoh - latest.batterySoh;
    if (sohDecline > 1.5) {
      anomalies.push({
        assetId,
        parameter: 'Battery Degradation Rate',
        expectedRange: '< 0.5% SOH delta per log',
        actualValue: `Decline of ${sohDecline.toFixed(2)}%`,
        deviationPct: Math.round(sohDecline * 100),
        severity: 'Critical',
        possibleCause: 'Thermal stress or localized cell puncture/short-circuit.',
        recommendedInvestigation: 'Quarantine vehicle pack and execute thermal imaging analysis.',
        resolved: false
      });
    }

    // Motor Temp rise rate
    const tempRise = latest.motorTemp - prev.motorTemp;
    if (tempRise > 15) {
      anomalies.push({
        assetId,
        parameter: 'Motor Thermal Escalation',
        expectedRange: '< 8°C delta per interval',
        actualValue: `Rise of ${tempRise.toFixed(1)}°C`,
        deviationPct: Math.round(tempRise * 5),
        severity: 'Warning',
        possibleCause: 'Rapid increase in load torque or cooling pump failure.',
        recommendedInvestigation: 'Check coolant pump power draw and inverter current caps.',
        resolved: false
      });
    }
  }

  // 3. Deviation from Rolling Baseline
  if (history && history.length >= 3) {
    // Let's compute average vibration over past 3-5 records
    const subset = history.slice(-5);
    const avgVibration = subset.reduce((sum, item) => sum + item.vibration, 0) / subset.length;
    if (latest.vibration > avgVibration * 1.5 && latest.vibration > 3.0) {
      const deviation = Math.round(((latest.vibration - avgVibration) / avgVibration) * 100);
      anomalies.push({
        assetId,
        parameter: 'Vibration Rolling Baseline Deviation',
        expectedRange: `Avg: ${avgVibration.toFixed(2)} mm/s`,
        actualValue: latest.vibration,
        deviationPct: deviation,
        severity: 'Warning',
        possibleCause: 'Sudden mechanical misalignment or loose mounting bolts.',
        recommendedInvestigation: 'Verify powertrain chassis mounting torque specs.',
        resolved: false
      });
    }
  }

  // 4. Multi-signal Correlation Rules
  // High payload + High vibration + High temp
  if (latest.payload > 1000 && latest.vibration > 4.0 && latest.motorTemp > 80) {
    anomalies.push({
      assetId,
      parameter: 'Cargo Load & Thermal Stress Correlation',
      expectedRange: 'Nominal operational envelope',
      actualValue: `Payload: ${latest.payload}kg, Vibr: ${latest.vibration}mm/s, Temp: ${latest.motorTemp}°C`,
      deviationPct: 45,
      severity: 'Warning',
      possibleCause: 'Drive system operating in low-efficiency region under high load stress.',
      recommendedInvestigation: 'Adjust routing optimizer to bypass high gradient segments.',
      resolved: false
    });
  }

  // High current + Low voltage + High motor temp
  if (latest.current > 200 && latest.voltage < 350 && latest.motorTemp > 85) {
    anomalies.push({
      assetId,
      parameter: 'Thermal Runaway & Short Circuit Danger',
      expectedRange: 'Nominal DC current and voltage',
      actualValue: `Current: ${latest.current}A, Voltage: ${latest.voltage}V, Temp: ${latest.motorTemp}°C`,
      deviationPct: 80,
      severity: 'Critical',
      possibleCause: 'High current draw under voltage drop suggesting coil winding short.',
      recommendedInvestigation: 'Perform high-potential electrical insulation tests immediately.',
      resolved: false
    });
  }

  // Save detected anomalies to database
  const savedAnomalies = [];
  for (const anom of anomalies) {
    let saved = null;
    if (isMongo) {
      saved = await Anomaly.create({ ...anom, timestamp: latest.timestamp || new Date() });
    } else {
      saved = { _id: `anom_${Math.random().toString(36).substr(2, 9)}`, ...anom, timestamp: latest.timestamp || new Date() };
      memoryStore.anomalies.create(saved);
    }
    savedAnomalies.push(saved);
  }

  return savedAnomalies;
};

module.exports = { detectTelemetryAnomalies };
