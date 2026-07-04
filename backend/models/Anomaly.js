const mongoose = require('mongoose');

const AnomalySchema = new mongoose.Schema({
  assetId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now },
  parameter: { type: String, required: true },
  expectedRange: { type: String, required: true },
  actualValue: { type: Number, required: true },
  deviationPct: { type: Number, required: true },
  severity: { type: String, enum: ['Warning', 'Critical'], required: true },
  possibleCause: { type: String, required: true },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date }
}, {
  timestamps: true
});

module.exports = mongoose.model('Anomaly', AnomalySchema);
