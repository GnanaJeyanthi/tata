const mongoose = require('mongoose');

const DecisionSchema = new mongoose.Schema({
  recommendationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recommendation', required: true },
  assetId: { type: String, required: true },
  issue: { type: String, required: true },
  options: [{
    title: { type: String, required: true },
    cost: { type: Number, required: true },
    downtime: { type: Number, required: true }, // hours
    residualRisk: { type: Number, required: true }, // percentage
    safetyImpact: { type: String, required: true },
    financialExposure: { type: Number, required: true }
  }],
  recommendedOptionIndex: { type: Number, default: 0 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Decision', DecisionSchema);
