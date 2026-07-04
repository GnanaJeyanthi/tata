const mongoose = require('mongoose');

let isConnected = false;
let dbMode = 'mongodb';

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/autotwin';
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000 // Timeout after 3s to trigger fallback quickly
    });
    isConnected = true;
    dbMode = 'mongodb';
    console.log('>>> AutoTwin DB: Connected to MongoDB successfully.');
  } catch (err) {
    isConnected = false;
    dbMode = 'in-memory';
    console.warn('>>> AutoTwin DB: MongoDB connection failed. Falling back to IN-MEMORY database.');
    console.warn(`>>> Connection error: ${err.message}`);
  }
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  getDbMode: () => dbMode
};
