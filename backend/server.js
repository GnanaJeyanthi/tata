const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const assetRoutes = require('./routes/assetRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite dev server (usually http://localhost:5173)
app.use(cors({
  origin: '*', // For demo compatibility
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Main Router mappings
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/assets', assetRoutes);

// Base route for connectivity test
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date(),
    service: 'AutoTwin Core Engine API'
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Startup wrapper
const startServer = async () => {
  // Connect to DB (with grace fallback to memory DB)
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`>>> AutoTwin Engine: Server listening on PORT ${PORT}`);
  });
};

startServer();
