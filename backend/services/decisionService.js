/**
 * Decision Intelligence Service
 * Computes economic cost exposures for prompt vs. deferred maintenance options,
 * reading base parameters from engineering constants.
 */

const { COST_FACTORS } = require('../config/engineeringConstants');

const getDecisionOptions = (assetId, component, currentProbability) => {
  // Normalize component name to match config keys (e.g. "Cooling System" -> "CoolingSystem")
  const key = component.replace(/\s+/g, '');
  const factor = COST_FACTORS[key] || { actionCost: 15000, inactionCost: 80000, averageDowntimeHours: 24 };

  const baseRepairCost = factor.actionCost;
  const catastrophicCost = factor.inactionCost;
  const baselineDowntime = Math.round(factor.averageDowntimeHours * 0.1) || 2; // e.g. scheduled service takes 10% of reactive breakdown time

  // Option A: Service Immediately
  const optionA = {
    title: 'Service Immediately (Scheduled)',
    cost: baseRepairCost,
    downtime: baselineDowntime, // hours
    residualRisk: 2, // %
    safetyImpact: 'Positive (Hazards mitigated)',
    financialExposure: baseRepairCost
  };

  // Option B: Continue Operation (7 Days delay)
  const probB = Math.min(95, Math.round(currentProbability * 1.4 + 8));
  const downtimeB = Math.round(factor.averageDowntimeHours * 0.35); // longer due to scheduling congestion
  const financialExposureB = Math.round(
    (baseRepairCost + catastrophicCost * 0.3) * (probB / 100) + baseRepairCost * (1 - probB / 100)
  );
  
  const optionB = {
    title: 'Postpone Maintenance by 7 Days',
    cost: baseRepairCost + Math.round(catastrophicCost * 0.05),
    downtime: downtimeB,
    residualRisk: probB,
    safetyImpact: 'Cautionary (Elevated failure probability)',
    financialExposure: financialExposureB
  };

  // Option C: Postpone Maintenance by 14 Days (Severe)
  const probC = Math.min(99, Math.round(currentProbability * 2.0 + 15));
  const downtimeC = factor.averageDowntimeHours; // Full catastrophic replacement downtime
  const financialExposureC = Math.round(
    (baseRepairCost + catastrophicCost) * (probC / 100) + baseRepairCost * (1 - probC / 100)
  );

  const optionC = {
    title: 'Postpone Maintenance by 14 Days',
    cost: baseRepairCost + Math.round(catastrophicCost * 0.15),
    downtime: downtimeC,
    residualRisk: probC,
    safetyImpact: 'Critical (High risk of catastrophic collateral damage)',
    financialExposure: financialExposureC
  };

  return {
    assetId,
    component,
    options: [optionA, optionB, optionC],
    recommendedOptionIndex: currentProbability > 20 ? 0 : 1
  };
};

module.exports = { getDecisionOptions };
