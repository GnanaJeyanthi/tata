const { getDbMode } = require('../config/db');
const { memoryStore } = require('../utils/memoryDb');
const Asset = require('../models/Asset');
const Telemetry = require('../models/Telemetry');
const Recommendation = require('../models/Recommendation');
const Anomaly = require('../models/Anomaly');
const Simulation = require('../models/Simulation');

const predictionService = require('../services/predictionService');
const explainabilityService = require('../services/explainabilityService');
const anomalyService = require('../services/anomalyService');
const decisionService = require('../services/decisionService');
const simulationService = require('../services/simulationService');

// Get all assets with real-time predictions computed
const getAssets = async (req, res) => {
  try {
    const isMongo = getDbMode() === 'mongodb';
    let assets = [];
    let telemetries = [];

    if (isMongo) {
      assets = await Asset.find({});
      telemetries = await Telemetry.find({});
    } else {
      assets = await memoryStore.assets.find({});
      telemetries = await memoryStore.telemetries.find({});
    }

    // Combine assets with real-time predictions computed from their latest telemetry
    const results = assets.map(asset => {
      // Find latest telemetry for this asset
      const assetTels = telemetries.filter(t => t.assetId === asset.assetId);
      let latestTel = assetTels.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
      
      // Fallback telemetry if none exists
      if (!latestTel) {
        latestTel = { engineTemp: 40, batterySoh: 100, motorTemp: 50, brakeWear: 10, tireWear: 10, vibration: 1.0, energyConsumption: 10, payload: 100, ambientTemp: 25, voltage: 400, current: 0 };
      }

      // Compute predictions
      const predictions = predictionService.getComponentPredictions(asset.assetId, latestTel);
      
      // Map return object
      return {
        _id: asset._id,
        assetId: asset.assetId,
        model: asset.model,
        type: asset.type,
        status: predictions.status, // Real-time predicted status override
        mileage: asset.mileage,
        operatingHours: asset.operatingHours,
        lastServiced: asset.lastServiced,
        healthScore: predictions.overallHealth, // Real-time health score override
        carbonSavedKg: asset.carbonSavedKg,
        energyEfficiency: asset.energyEfficiency,
        failureProbability: predictions.failureProbability,
        telemetry: latestTel
      };
    });

    return res.status(200).json({ success: true, count: results.length, data: results });
  } catch (error) {
    return res.status(500).json({ success: true, message: error.message });
  }
};

// Detailed asset page diagnostics
const getAssetById = async (req, res) => {
  const { id } = req.params; // assetId (e.g. AT-EV-003)

  try {
    const isMongo = getDbMode() === 'mongodb';
    let asset = null;
    let telemetries = [];
    let recommendations = [];
    let anomalies = [];

    if (isMongo) {
      asset = await Asset.findOne({ assetId: id });
      telemetries = await Telemetry.find({ assetId: id });
      recommendations = await Recommendation.find({ assetId: id });
      anomalies = await Anomaly.find({ assetId: id });
    } else {
      asset = await memoryStore.assets.findOne({ assetId: id });
      telemetries = await memoryStore.telemetries.find({ assetId: id });
      recommendations = await memoryStore.recommendations.find({ assetId: id });
      anomalies = await memoryStore.anomalies.find({ assetId: id });
    }

    if (!asset) {
      return res.status(404).json({ success: false, message: `Asset ${id} not found` });
    }

    // Sort telemetries to get latest
    const sortedTels = telemetries.sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
    const latestTel = sortedTels[sortedTels.length - 1] || { engineTemp: 40, batterySoh: 100, motorTemp: 50, brakeWear: 10, tireWear: 10, vibration: 1.0, energyConsumption: 10, payload: 100, ambientTemp: 25, voltage: 400, current: 0 };

    // 1. Predictions
    const predictions = predictionService.getComponentPredictions(id, latestTel);

    // 2. Explainability: generate explanations for components with Warning/Critical risks
    const explainableExplanations = predictions.components.map(c => {
      return explainabilityService.getPredictionExplanation(c.name, latestTel);
    });

    // 3. Decisions: generate decision intelligence options for Warning/Critical components
    const decisionIntelligence = predictions.components
      .filter(c => c.risk !== 'Healthy')
      .map(c => {
        return decisionService.getDecisionOptions(id, c.name, c.prob, c.name === 'Battery' ? 32000 : c.name === 'Motor' ? 18000 : 8500);
      });

    return res.status(200).json({
      success: true,
      data: {
        asset: {
          ...asset._doc,
          status: predictions.status,
          healthScore: predictions.overallHealth,
        },
        telemetryHistory: sortedTels,
        predictions: predictions.components,
        explainability: explainableExplanations,
        decisions: decisionIntelligence,
        recommendations,
        anomalies
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Run simulation
const runSimulation = async (req, res) => {
  const { assetId } = req.body;

  try {
    const isMongo = getDbMode() === 'mongodb';
    let telemetries = [];

    if (isMongo) {
      telemetries = await Telemetry.find({ assetId });
    } else {
      telemetries = await memoryStore.telemetries.find({ assetId });
    }

    const sortedTels = telemetries.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    const latestTel = sortedTels[0] || { engineTemp: 40, batterySoh: 100, motorTemp: 50, brakeWear: 10, tireWear: 10, vibration: 1.0, energyConsumption: 10, payload: 100, ambientTemp: 25, voltage: 400, current: 0 };

    // Run simulation
    const simResult = simulationService.runWhatIfSimulation(latestTel, req.body);

    // Save simulation record
    if (isMongo) {
      await Simulation.create({
        assetId,
        inputs: simResult.inputs,
        outputs: simResult.outputs
      });
    } else {
      await memoryStore.simulations.create({
        assetId,
        inputs: simResult.inputs,
        outputs: simResult.outputs
      });
    }

    return res.status(200).json({
      success: true,
      data: simResult
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update recommendation status
const updateRecommendation = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Accepted', 'Rejected', 'Scheduled', 'Under Review'

  try {
    const isMongo = getDbMode() === 'mongodb';
    let updated = null;

    if (isMongo) {
      updated = await Recommendation.findByIdAndUpdate(id, { status }, { new: true });
    } else {
      updated = await memoryStore.recommendations.findByIdAndUpdate(id, { status });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    // If accepted, we can mock updating the asset status to Healthy and increasing mileage
    if (status === 'Accepted' || status === 'Scheduled') {
      if (isMongo) {
        await Asset.findOneAndUpdate({ assetId: updated.assetId }, { status: 'Healthy', healthScore: 100 });
      } else {
        await memoryStore.assets.findOneAndUpdate({ assetId: updated.assetId }, { status: 'Healthy', healthScore: 100 });
        
        // Also update corresponding alerts
        const anomalies = await memoryStore.anomalies.find({ assetId: updated.assetId });
        anomalies.forEach(async anom => {
          await memoryStore.anomalies.findByIdAndUpdate(anom._id, { resolved: true, resolvedAt: new Date() });
        });
      }
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all anomalies across fleet
const getAnomalies = async (req, res) => {
  try {
    const isMongo = getDbMode() === 'mongodb';
    let anomalies = [];
    if (isMongo) {
      anomalies = await Anomaly.find({});
    } else {
      anomalies = await memoryStore.anomalies.find({});
    }
    return res.status(200).json({ success: true, count: anomalies.length, data: anomalies });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all recommendations across fleet
const getRecommendations = async (req, res) => {
  try {
    const isMongo = getDbMode() === 'mongodb';
    let recs = [];
    if (isMongo) {
      recs = await Recommendation.find({});
    } else {
      recs = await memoryStore.recommendations.find({});
    }
    return res.status(200).json({ success: true, count: recs.length, data: recs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  runSimulation,
  updateRecommendation,
  getAnomalies,
  getRecommendations
};
