const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  assetId: { type: String, required: true, unique: true },
  assetName: { type: String },
  manufacturer: { type: String },
  model: { type: String, required: true },
  vehicleCategory: { type: String }, // e.g. Passenger EV, Electric Bus, eVTOL Cargo Vehicle, Delivery Drone, autonomous
  powertrainType: { type: String }, // e.g. BEV, PHEV, FCEV
  manufacturingYear: { type: Number },
  batteryCapacity: { type: Number }, // in kWh
  ratedPayload: { type: Number }, // in kg
  currentPayload: { type: Number }, // in kg
  maintenanceInterval: { type: Number }, // in days
  commissioningDate: { type: Date },
  
  type: { type: String, required: true }, // generic description mapping to backend logic
  status: { type: String, enum: ['Healthy', 'Warning', 'Critical'], default: 'Healthy' },
  mileage: { type: Number, required: true },
  operatingHours: { type: Number, required: true },
  lastServiced: { type: Date, required: true },
  healthScore: { type: Number, min: 0, max: 100, default: 100 },
  carbonSavedKg: { type: Number, default: 0 },
  energyEfficiency: { type: Number, default: 0.15 }, // kWh/km or equivalent
  
  // Traceability & Provenance
  sourceType: { type: String, enum: ['manual', 'csv_upload', 'json_upload', 'api_ingestion', 'demo_dataset'], default: 'demo_dataset' },
  datasetId: { type: String },
  uploadedBy: { type: String },
  importBatchId: { type: String },
  ingestionTimestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', AssetSchema);
