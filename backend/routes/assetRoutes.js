const express = require('express');
const {
  getAssets,
  getAssetById,
  runSimulation,
  updateRecommendation,
  getAnomalies,
  getRecommendations
} = require('../controllers/assetController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getAssets);
router.get('/anomalies/all', protect, getAnomalies);
router.get('/recommendations/all', protect, getRecommendations);
router.get('/:id', protect, getAssetById);
router.post('/simulate', protect, runSimulation);
router.put('/recommendations/:id', protect, updateRecommendation);

module.exports = router;
