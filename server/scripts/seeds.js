require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const { seedForms, forceReseed } = require('../utils/seeder');

// Get the MongoDB URI from environment
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('Please define MONGO_URI in your .env file');
  process.exit(1);
}

async function runSeeder() {
  try {
    // Connect to the database
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check for --force flag
    const forceFlag = process.argv.includes('--force');
    
    if (forceFlag) {
      await forceReseed();
    } else {
      await seedForms();
    }
    
    // Disconnect when done
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Seeder error:', error);
    process.exit(1);
  }
}

// Run the seeder
runSeeder();