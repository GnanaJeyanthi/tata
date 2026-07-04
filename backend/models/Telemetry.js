const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  assetId: { type: String, required: true, index: true },
  timestamp: { type: Date, default: Date.now, index: true },
  
  // Standard fields
  engineTemp: { type: Number, required: true }, // motorTemp or junctionTemp
  batterySoh: { type: Number, required: true },
  motorTemp: { type: Number, required: true },
  brakeWear: { type: Number, required: true }, // 0 to 100
  tireWear: { type: Number, required: true },  // 0 to 100
  vibration: { type: Number, required: true }, // mm/s
  energyConsumption: { type: Number, required: true }, // kWh/100km or equivalent
  payload: { type: Number, required: true }, // kg
  ambientTemp: { type: Number, required: true },
  voltage: { type: Number, default: 400 },
  current: { type: Number, default: 0 },
  
  // Expanded fields
  batterySoc: { type: Number },
  batteryTemp: { type: Number },
  motorRpm: { type: Number },
  brakeTemp: { type: Number },
  tirePressure: { type: Number },
  coolantTemp: { type: Number },
  speed: { type: Number },
  payloadPct: { type: Number },
  operatingHours: { type: Number },
  chargingType: { type: String }, // e.g. Normal, Fast
  roadCondition: { type: String }, // e.g. Smooth, Rough
  drivingAggressiveness: { type: String }, // e.g. Low, Medium, High

  // Traceability & Provenance
  sourceType: { type: String, enum: ['manual', 'csv_upload', 'json_upload', 'api_ingestion', 'demo_dataset'], default: 'demo_dataset' },
  datasetId: { type: String },
  uploadedBy: { type: String },
  importBatchId: { type: String },
  ingestionTimestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Telemetry', TelemetrySchema);
