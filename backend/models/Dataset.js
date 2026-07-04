const mongoose = require('mongoose');

const DatasetSchema = new mongoose.Schema({
  datasetName: { type: String, required: true },
  sourceOrganization: { type: String },
  sourceURL: { type: String },
  license: { type: String },
  datasetType: { type: String, enum: ['Real', 'Experimental', 'Benchmark', 'Synthetic'], default: 'Synthetic' },
  description: { type: String },
  importedAt: { type: Date, default: Date.now },
  recordCount: { type: Number, default: 0 },
  importedBy: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dataset', DatasetSchema);
