/**
 * Centralized Seed Data and In-Memory Fallback DB.
 * Used to seed MongoDB, or run as a mock DB in memory if MongoDB is offline.
 */

const bcrypt = require('bcryptjs');

// Seed Users
const users = [
  {
    username: 'manager',
    email: 'manager@autotwin.com',
    password: 'password123', // Will be hashed below
    role: 'Engineering Manager'
  },
  {
    username: 'engineer',
    email: 'engineer@autotwin.com',
    password: 'password123', // Will be hashed below
    role: 'Engineer'
  }
];

// Seed Assets
const assets = [
  { assetId: 'AT-EV-001', model: 'Tata Nexon EV Max', type: 'Passenger', status: 'Healthy', mileage: 12450, operatingHours: 420, lastServiced: new Date('2026-03-10'), healthScore: 98, carbonSavedKg: 1420, energyEfficiency: 0.14 },
  { assetId: 'AT-EV-002', model: 'Tata Nexon EV Max', type: 'Passenger', status: 'Warning', mileage: 48900, operatingHours: 1650, lastServiced: new Date('2025-11-05'), healthScore: 78, carbonSavedKg: 5800, energyEfficiency: 0.16 },
  { assetId: 'AT-EV-003', model: 'Tata Nexon EV Max', type: 'Passenger', status: 'Critical', mileage: 23100, operatingHours: 850, lastServiced: new Date('2026-01-15'), healthScore: 42, carbonSavedKg: 2600, energyEfficiency: 0.15 },
  { assetId: 'AT-EV-004', model: 'Tata Nexon EV Max', type: 'Passenger', status: 'Critical', mileage: 34200, operatingHours: 1200, lastServiced: new Date('2025-12-20'), healthScore: 35, carbonSavedKg: 3800, energyEfficiency: 0.18 },
  { assetId: 'AT-EV-005', model: 'Jaguar I-PACE', type: 'Premium Passenger', status: 'Warning', mileage: 18200, operatingHours: 680, lastServiced: new Date('2026-02-01'), healthScore: 75, carbonSavedKg: 2100, energyEfficiency: 0.22 },
  { assetId: 'AT-EV-006', model: 'Tata Prima Electric', type: 'Heavy Haulage', status: 'Critical', mileage: 65400, operatingHours: 2450, lastServiced: new Date('2025-09-10'), healthScore: 28, carbonSavedKg: 14500, energyEfficiency: 0.85 },
  { assetId: 'AT-EV-007', model: 'AeroTwin Delivery Drone', type: 'eVTOL Cargo', status: 'Warning', mileage: 4320, operatingHours: 320, lastServiced: new Date('2026-04-12'), healthScore: 80, carbonSavedKg: 420, energyEfficiency: 0.08 },
  { assetId: 'AT-EV-008', model: 'Tata Nexon EV Max', type: 'Passenger', status: 'Warning', mileage: 15400, operatingHours: 540, lastServiced: new Date('2026-02-18'), healthScore: 79, carbonSavedKg: 1800, energyEfficiency: 0.16 },
  { assetId: 'AT-EV-009', model: 'Tata Nexon EV Max', type: 'Passenger', status: 'Healthy', mileage: 8200, operatingHours: 290, lastServiced: new Date('2026-05-01'), healthScore: 100, carbonSavedKg: 950, energyEfficiency: 0.13 },
  { assetId: 'AT-EV-010', model: 'Jaguar I-PACE', type: 'Premium Passenger', status: 'Healthy', mileage: 5400, operatingHours: 200, lastServiced: new Date('2026-05-15'), healthScore: 99, carbonSavedKg: 620, energyEfficiency: 0.21 },
  { assetId: 'AT-EV-011', model: 'AeroTwin Delivery Drone', type: 'eVTOL Cargo', status: 'Healthy', mileage: 1200, operatingHours: 85, lastServiced: new Date('2026-06-01'), healthScore: 100, carbonSavedKg: 110, energyEfficiency: 0.07 },
  { assetId: 'AT-EV-012', model: 'Tata Prima Electric', type: 'Heavy Haulage', status: 'Healthy', mileage: 12500, operatingHours: 480, lastServiced: new Date('2026-04-05'), healthScore: 96, carbonSavedKg: 2800, energyEfficiency: 0.82 }
];

// Seed Telemetry mapping (realtime base settings for simulation)
const telemetries = [
  { assetId: 'AT-EV-001', engineTemp: 42, batterySoh: 98.2, motorTemp: 52, brakeWear: 12, tireWear: 18, vibration: 1.2, energyConsumption: 18.5, payload: 180, ambientTemp: 28, voltage: 398, current: 40 },
  { assetId: 'AT-EV-002', engineTemp: 56, batterySoh: 76.5, motorTemp: 64, brakeWear: 42, tireWear: 48, vibration: 2.1, energyConsumption: 24.2, payload: 320, ambientTemp: 32, voltage: 375, current: 65 }, // Battery SOH warning
  { assetId: 'AT-EV-003', engineTemp: 58, batterySoh: 92.4, motorTemp: 62, brakeWear: 88, tireWear: 35, vibration: 1.8, energyConsumption: 20.1, payload: 420, ambientTemp: 30, voltage: 392, current: 45 }, // Brake wear critical
  { assetId: 'AT-EV-004', engineTemp: 68, batterySoh: 94.0, motorTemp: 98, brakeWear: 22, tireWear: 28, vibration: 7.8, energyConsumption: 28.5, payload: 150, ambientTemp: 35, voltage: 395, current: 85 }, // Motor Overheat / Vibration critical
  { assetId: 'AT-EV-005', engineTemp: 45, batterySoh: 90.1, motorTemp: 58, brakeWear: 30, tireWear: 82, vibration: 1.5, energyConsumption: 25.8, payload: 240, ambientTemp: 26, voltage: 405, current: 50 }, // Tire wear warning
  { assetId: 'AT-EV-006', engineTemp: 82, batterySoh: 72.0, motorTemp: 92, brakeWear: 86, tireWear: 72, vibration: 8.2, energyConsumption: 88.5, payload: 18500, ambientTemp: 38, voltage: 360, current: 280 }, // Heavy Cargo multi-critical
  { assetId: 'AT-EV-007', engineTemp: 38, batterySoh: 88.5, motorTemp: 78, brakeWear: 5, tireWear: 0, vibration: 4.8, energyConsumption: 15.2, payload: 15, ambientTemp: 22, voltage: 48, current: 120 }, // eVTOL Drone energy warning
  { assetId: 'AT-EV-008', engineTemp: 88, batterySoh: 91.2, motorTemp: 82, brakeWear: 35, tireWear: 42, vibration: 2.2, energyConsumption: 22.4, payload: 280, ambientTemp: 36, voltage: 390, current: 58 }, // Cooling warning
  { assetId: 'AT-EV-009', engineTemp: 40, batterySoh: 100, motorTemp: 48, brakeWear: 8, tireWear: 10, vibration: 0.8, energyConsumption: 16.8, payload: 80, ambientTemp: 25, voltage: 401, current: 30 },
  { assetId: 'AT-EV-010', engineTemp: 44, batterySoh: 99.4, motorTemp: 50, brakeWear: 11, tireWear: 14, vibration: 1.1, energyConsumption: 22.1, payload: 150, ambientTemp: 24, voltage: 408, current: 48 },
  { assetId: 'AT-EV-011', engineTemp: 32, batterySoh: 100, motorTemp: 42, brakeWear: 2, tireWear: 0, vibration: 0.6, energyConsumption: 7.8, payload: 2, ambientTemp: 20, voltage: 50, current: 45 },
  { assetId: 'AT-EV-012', engineTemp: 55, batterySoh: 96.5, motorTemp: 68, brakeWear: 25, tireWear: 29, vibration: 2.2, energyConsumption: 72.4, payload: 8500, ambientTemp: 28, voltage: 385, current: 180 }
];

// Seed Recommendations
const recommendations = [
  {
    _id: '000000000000000000000001',
    assetId: 'AT-EV-003',
    component: 'Brakes',
    problem: 'Friction pad lining worn to 88%',
    evidence: 'Brake calliper sensor reporting pad thickness under 2.5mm. Recurrent friction overheating peaks (>130°C).',
    predictedConsequence: 'Linings completely depleted in 12-14 days. Friction surface scores brake rotor, causing complete braking efficiency loss.',
    recommendedAction: 'Schedule immediate calliper inspection and brake pad replacement.',
    costOfAction: 8500,
    costOfInaction: 48000,
    riskReduction: 92,
    downtimeAvoidedHours: 18,
    priority: 'Immediate Action',
    status: 'Pending',
    priorityScore: 94
  },
  {
    _id: '000000000000000000000002',
    assetId: 'AT-EV-004',
    component: 'Motor',
    problem: 'Excessive radial bearing vibration (7.8mm/s) & stator temperature spikes (98°C)',
    evidence: 'Telemetry accelerometers showing high-amplitude friction harmonics. Core thermal sensor exceeding safety margins.',
    predictedConsequence: 'Stator coil insulation degradation leads to permanent inter-turn short circuit and motor lockup within 18 days.',
    recommendedAction: 'Limit peak motor torque operation and schedule drive motor bearing repair.',
    costOfAction: 18000,
    costOfInaction: 145000,
    riskReduction: 88,
    downtimeAvoidedHours: 36,
    priority: 'Immediate Action',
    status: 'Pending',
    priorityScore: 89
  },
  {
    _id: '000000000000000000000003',
    assetId: 'AT-EV-006',
    component: 'Battery',
    problem: 'Capacity fade acceleration and internal short risk',
    evidence: 'Cell SOH at 72.0%. Internal cell mismatch voltage exceeds 70mV under heavy cargo load cycles.',
    predictedConsequence: 'Risk of cell thermal runaway event. Overall pack shutdown due to BMS cell-balance mismatch.',
    recommendedAction: 'Initiate active cell balancing and adjust thermal system to pre-cool pack during fast charging.',
    costOfAction: 32000,
    costOfInaction: 420000,
    riskReduction: 85,
    downtimeAvoidedHours: 72,
    priority: 'Immediate Action',
    status: 'Pending',
    priorityScore: 92
  },
  {
    _id: '000000000000000000000004',
    assetId: 'AT-EV-008',
    component: 'Cooling System',
    problem: 'Thermal blockage and coolant temperature rise (88°C)',
    evidence: 'Telemetry engine temp at 88°C with high coolant flow rate pressure drop (1.8 bar delta).',
    predictedConsequence: 'Coolant overheating causes thermal throttling on drive systems, leading to a 30% reduction in vehicle power capacity.',
    recommendedAction: 'Flush coolant pipelines and check flow control valve assembly.',
    costOfAction: 6000,
    costOfInaction: 25000,
    riskReduction: 75,
    downtimeAvoidedHours: 8,
    priority: 'Schedule Maintenance',
    status: 'Pending',
    priorityScore: 78
  },
  {
    _id: '000000000000000000000005',
    assetId: 'AT-EV-005',
    component: 'Tires',
    problem: 'Tire tread wear exceeds 82%',
    evidence: 'Wear indicators on outer tires report 1.8mm depth remaining. Elevated rolling friction.',
    predictedConsequence: 'Hydroplaning danger on wet surfaces and increased blowout risk during high-speed highway cruising.',
    recommendedAction: 'Replace all 4 outer tires and perform wheel alignment checks.',
    costOfAction: 14000,
    costOfInaction: 45000,
    riskReduction: 90,
    downtimeAvoidedHours: 6,
    priority: 'Schedule Maintenance',
    status: 'Pending',
    priorityScore: 74
  }
];

// Initialize In-Memory Stores
let inMemUsers = users.map(u => ({ ...u }));
let inMemAssets = assets.map(a => ({ ...a }));
let inMemTelemetries = telemetries.map(t => ({ ...t }));
let inMemRecommendations = recommendations.map(r => ({ ...r }));
let inMemAnomalies = [];
let inMemDecisions = [];
let inMemSimulations = [];

// Helper to encrypt password for mock users on startup
const hashPasswords = async () => {
  const salt = await bcrypt.genSalt(10);
  for (let u of inMemUsers) {
    u.password = await bcrypt.hash(u.password, salt);
  }
};
hashPasswords();

// Create default anomaly list on startup
const generateInitialAnomalies = () => {
  const anomalyService = require('../services/anomalyService');
  inMemTelemetries.forEach(telemetry => {
    const list = anomalyService.detectTelemetryAnomalies(telemetry.assetId, telemetry);
    list.forEach(a => {
      inMemAnomalies.push({
        _id: `anom_${Math.random().toString(36).substr(2, 9)}`,
        resolved: false,
        timestamp: new Date(),
        ...a
      });
    });
  });
};
// Defer generation slightly to ensure services are loaded
setTimeout(generateInitialAnomalies, 500);

// In-memory Database Functions
const memoryStore = {
  // Users
  users: {
    find: async () => inMemUsers,
    findOne: async (query) => {
      if (query.username) return inMemUsers.find(u => u.username === query.username);
      if (query.email) return inMemUsers.find(u => u.email === query.email);
      return null;
    },
    create: async (user) => {
      const newUser = { _id: `usr_${Date.now()}`, ...user };
      inMemUsers.push(newUser);
      return newUser;
    }
  },
  
  // Assets
  assets: {
    find: async () => inMemAssets,
    findOne: async (query) => inMemAssets.find(a => a.assetId === query.assetId),
    findOneAndUpdate: async (query, update) => {
      const idx = inMemAssets.findIndex(a => a.assetId === query.assetId);
      if (idx !== -1) {
        inMemAssets[idx] = { ...inMemAssets[idx], ...update };
        return inMemAssets[idx];
      }
      return null;
    }
  },

  // Telemetry
  telemetries: {
    find: async (query) => {
      if (query && query.assetId) {
        return inMemTelemetries.filter(t => t.assetId === query.assetId);
      }
      return inMemTelemetries;
    },
    create: async (telemetry) => {
      const newT = { _id: `tel_${Date.now()}`, timestamp: new Date(), ...telemetry };
      inMemTelemetries.push(newT);
      return newT;
    }
  },

  // Recommendations
  recommendations: {
    find: async () => inMemRecommendations,
    findById: async (id) => inMemRecommendations.find(r => r._id === id || r._id.toString() === id),
    findByIdAndUpdate: async (id, update) => {
      const idx = inMemRecommendations.findIndex(r => r._id === id || r._id.toString() === id);
      if (idx !== -1) {
        inMemRecommendations[idx] = { ...inMemRecommendations[idx], ...update };
        return inMemRecommendations[idx];
      }
      return null;
    }
  },

  // Anomalies
  anomalies: {
    find: async (query) => {
      let filtered = [...inMemAnomalies];
      if (query && query.resolved !== undefined) {
        filtered = filtered.filter(a => a.resolved === query.resolved);
      }
      if (query && query.assetId) {
        filtered = filtered.filter(a => a.assetId === query.assetId);
      }
      return filtered;
    },
    findByIdAndUpdate: async (id, update) => {
      const idx = inMemAnomalies.findIndex(a => a._id === id || a._id.toString() === id);
      if (idx !== -1) {
        inMemAnomalies[idx] = { ...inMemAnomalies[idx], ...update };
        return inMemAnomalies[idx];
      }
      return null;
    }
  },

  // Simulations
  simulations: {
    find: async () => inMemSimulations,
    create: async (sim) => {
      const newSim = { _id: `sim_${Date.now()}`, timestamp: new Date(), ...sim };
      inMemSimulations.push(newSim);
      return newSim;
    }
  }
};

module.exports = {
  memoryStore,
  initialAssets: assets,
  initialTelemetries: telemetries,
  initialRecommendations: recommendations,
  initialUsers: users
};
