/**
 * CENTRALIZED ENGINEERING CONSTANTS & RELIABILITY CONFIGURATION
 * Contains safe operating thresholds, component weights, physical/degradation coefficients,
 * and cost factors for decision intelligence.
 */

module.exports = {
  // Component weights in calculating the overall vehicle health score
  COMPONENT_HEALTH_WEIGHTS: {
    Battery: 0.35,
    Motor: 0.25,
    Brakes: 0.15,
    Tires: 0.10,
    CoolingSystem: 0.10,
    PowerElectronics: 0.05
  },

  // Safe Operating Thresholds (SOT)
  THRESHOLDS: {
    motorTemp: { warning: 80, critical: 95 }, // °C
    engineTemp: { warning: 80, critical: 92 }, // °C
    vibration: { warning: 4.5, critical: 7.0 }, // mm/s
    brakeWear: { warning: 65, critical: 85 }, // % worn
    tireWear: { warning: 55, critical: 80 }, // % worn
    batterySoh: { warning: 80, critical: 70 }, // % state of health
    voltage: { lowerWarning: 340, upperWarning: 415, upperCritical: 425 } // Volts
  },

  // Degradation Kinetics & Physical Coefficients
  DEGRADATION_COEFFICIENTS: {
    ArrheniusPreExponential: 0.005, // Battery SEI growth rate factor
    ArrheniusActivationEnergy: 0.22, // eV, thermal activation barrier
    vibrationWearCoefficient: 0.15, // Motor fatigue accumulation rate
    payloadFrictionCoefficient: 0.002, // Brake lining friction multiplier per kg
    tireFrictionExponent: 1.15, // Tire tread friction exponent
    coolantThermalConductivity: 0.85 // W/mK coolant efficiency factor
  },

  // Financial Cost Modeler Factors (Tata Technologies competition domain values)
  COST_FACTORS: {
    Battery: { actionCost: 32000, inactionCost: 420000, averageDowntimeHours: 72 },
    Motor: { actionCost: 18000, inactionCost: 145000, averageDowntimeHours: 36 },
    Brakes: { actionCost: 8500, inactionCost: 48000, averageDowntimeHours: 18 },
    Tires: { actionCost: 14000, inactionCost: 45000, averageDowntimeHours: 6 },
    CoolingSystem: { actionCost: 6000, inactionCost: 25000, averageDowntimeHours: 8 },
    PowerElectronics: { actionCost: 12000, inactionCost: 95000, averageDowntimeHours: 12 }
  },

  // ESG Environmental Assumptions (Tata Motors EV baseline benchmarks)
  ESG_FACTORS: {
    electricityGridEmissionsCo2PerKwh: 0.82, // kg CO2 / kWh (India grid average)
    thermalFrictionEfficiencyLossPct: 0.05, // Additional consumption per °C over 75°C
    vibrationEnergyDissipationCoefficient: 0.02 // kWh/100km increase per mm/s vibration
  }
};
