const mongoose = require('mongoose');

const SimulationSchema = new mongoose.Schema({
  assetId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  inputs: {
    payloadPct: { type: Number },
    operatingHours: { type: Number },
    ambientTemp: { type: Number },
    drivingAggressiveness: { type: String }, // Low, Medium, High
    chargingPattern: { type: String }, // Normal, Fast Charging
    maintenanceDelayDays: { type: Number }
  },
  outputs: {
    healthScore: { type: Number },
    failureProbability: { type: Number },
    remainingUsefulLife: { type: Number },
    repairCost: { type: Number },
    expectedDowntime: { type: Number },
    energyEfficiencyImpact: { type: Number },
    carbonImpactPct: { type: Number }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Simulation', SimulationSchema);
