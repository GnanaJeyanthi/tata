const mongoose = require('mongoose');

const RecommendationSchema = new mongoose.Schema({
  assetId: { type: String, required: true, index: true },
  component: { type: String, required: true },
  problem: { type: String, required: true },
  evidence: { type: String, required: true },
  predictedConsequence: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  costOfAction: { type: Number, required: true },
  costOfInaction: { type: Number, required: true },
  riskReduction: { type: Number, required: true },
  downtimeAvoidedHours: { type: Number, required: true },
  priority: { type: String, enum: ['Immediate Action', 'Schedule Maintenance', 'Monitor Closely', 'Efficiency Improvement', 'Sustainability Opportunity'], required: true },
  status: { type: String, enum: ['Pending', 'Accepted', 'Rejected', 'Scheduled', 'Under Review'], default: 'Pending' },
  priorityScore: { type: Number, required: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recommendation', RecommendationSchema);
