/**
 * Simulation Service
 * Calculates vehicle degradation, financial, and environmental impacts 
 * based on operational what-if parameters.
 */

const runWhatIfSimulation = (baseTelemetry, inputs) => {
  const {
    payloadPct = 50,
    operatingHours = 8,
    ambientTemp = 25,
    drivingAggressiveness = 'Medium',
    chargingPattern = 'Normal',
    maintenanceDelayDays = 0
  } = inputs;

  // Base values from vehicle profile
  const baseHealth = baseTelemetry.batterySoh;
  
  // Calculate degradation multipliers
  let loadMultiplier = 1.0;
  if (payloadPct > 80) loadMultiplier = 1.4;
  else if (payloadPct > 50) loadMultiplier = 1.15;
  else loadMultiplier = 0.9;

  let hoursMultiplier = operatingHours / 8; // Normalized to 8 hours baseline

  let tempMultiplier = 1.0;
  if (ambientTemp > 40) tempMultiplier = 1.5;
  else if (ambientTemp > 30) tempMultiplier = 1.25;
  else if (ambientTemp < 10) tempMultiplier = 1.15;

  let driveMultiplier = 1.0;
  if (drivingAggressiveness === 'High') driveMultiplier = 1.5;
  else if (drivingAggressiveness === 'Low') driveMultiplier = 0.8;

  let chargeMultiplier = 1.0;
  if (chargingPattern === 'Fast Charging') chargeMultiplier = 1.4;

  let delayMultiplier = 1.0 + (maintenanceDelayDays * 0.08);

  // 1. Calculate simulated failure probability
  let baseProb = 5; // Default safe probability
  let simProb = Math.min(
    99,
    Math.round(
      baseProb * loadMultiplier * hoursMultiplier * tempMultiplier * driveMultiplier * chargeMultiplier * delayMultiplier
    )
  );

  // 2. Calculate simulated remaining useful life (RUL) in months
  const baseRul = 96; // baseline RUL in months
  const wearRate = loadMultiplier * hoursMultiplier * tempMultiplier * driveMultiplier * chargeMultiplier;
  const simRul = Math.max(1, Math.round(baseRul / wearRate));

  // 3. Health Score Impact
  const healthReduction = 2.5 * wearRate;
  const simHealthScore = Math.max(10, Math.round(baseHealth - healthReduction));

  // 4. Maintenance/Repair cost calculations
  const baseRepairCost = 15000;
  const emergencyMarkup = maintenanceDelayDays > 0 ? 1.0 + (maintenanceDelayDays * 0.15) : 1.0;
  const collateralImpact = driveMultiplier > 1.2 ? 1.25 : 1.0;
  const simRepairCost = Math.round(baseRepairCost * emergencyMarkup * collateralImpact);

  // 5. Downtime calculations (days)
  const baseDowntime = 0.5; // standard scheduled downtime
  // If delayed, catastrophic breakdown happens requiring recovery
  const simDowntime = parseFloat(
    (baseDowntime * hoursMultiplier * (1 + (maintenanceDelayDays * 0.25)) * (drivingAggressiveness === 'High' ? 1.5 : 1.0)).toFixed(1)
  );

  // 6. Energy Efficiency Impact
  // Heavy load, high speed, and high ambient temperature degrade efficiency
  const efficiencyLossPct = Math.round(
    (loadMultiplier - 1.0) * 15 + (driveMultiplier - 1.0) * 20 + (tempMultiplier - 1.0) * 10
  );

  // 7. Carbon Impact
  // Wasted electricity = more grid carbon footprint.
  const carbonImpactPct = Math.round(
    (hoursMultiplier - 1.0) * 10 + (loadMultiplier - 1.0) * 25 + efficiencyLossPct
  );

  return {
    inputs: {
      payloadPct,
      operatingHours,
      ambientTemp,
      drivingAggressiveness,
      chargingPattern,
      maintenanceDelayDays
    },
    outputs: {
      healthScore: simHealthScore,
      failureProbability: simProb,
      remainingUsefulLife: simRul,
      repairCost: simRepairCost,
      expectedDowntime: simDowntime,
      energyEfficiencyImpact: efficiencyLossPct,
      carbonImpactPct: carbonImpactPct
    }
  };
};

module.exports = { runWhatIfSimulation };
