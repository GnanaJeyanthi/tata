const mongoose = require('mongoose');
const User = require('./models/User');
const Asset = require('./models/Asset');
const Telemetry = require('./models/Telemetry');
const Recommendation = require('./models/Recommendation');
const { initialAssets, initialTelemetries, initialRecommendations, initialUsers } = require('./utils/memoryDb');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/autotwin';

const seedDB = async () => {
  try {
    console.log('>>> Seeding database starting...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    await User.deleteMany();
    await Asset.deleteMany();
    await Telemetry.deleteMany();
    await Recommendation.deleteMany();
    
    // Hash passwords for seed users
    const salt = await bcrypt.genSalt(10);
    const hashedUsers = await Promise.all(initialUsers.map(async u => {
      const hashedPw = await bcrypt.hash(u.password, salt);
      return { ...u, password: hashedPw };
    }));

    // Insert new data
    await User.insertMany(hashedUsers);
    await Asset.insertMany(initialAssets);
    await Telemetry.insertMany(initialTelemetries);
    await Recommendation.insertMany(initialRecommendations);

    console.log('>>> Seeding DB: SUCCESSFUL. Seed data added to MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error(`>>> Seeding DB: ERROR: ${err.message}`);
    process.exit(1);
  }
};

seedDB();
