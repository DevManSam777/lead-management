require('dotenv').config({ path: '../.env' }); 

const mongoose = require('mongoose');
const seederLogic = require('../utils/seeder');
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('FATAL ERROR: MONGO_URI is not defined in your .env file!');
  console.error('Expected .env location relative to this script:', '../.env');
  // Since this is the entry point script, we must exit if MONGO_URI is missing
  process.exit(1);
}

/**
 * Main function to run the seeder tasks based on command line flags.
 * Handles database connection and disconnection for the CLI task lifecycle.
 */
async function runSeederTasks() {
    console.log('Executing seeder tasks...');

    // Ensure DB connection for this task
    if (mongoose.connection.readyState !== 1) { // 1 means connected
        try {
          console.log('Connecting to MongoDB...');
          await mongoose.connect(MONGO_URI); 
          console.log('Connected to MongoDB');
      } catch (error) {
          console.error('FATAL ERROR: Failed to connect to MongoDB:', error);
          process.exit(1); // Exit if connection fails
      }
    } else {
        console.log('ℹ️ MongoDB already connected.');
    }

    try {
      // Check for flags passed via command line (e.g., npm run seed:reset --force)
      const forceFlag = process.argv.includes('--force');
      // The `--reset-status` flag is used by the `npm run seed:reset` command in package.json
      const resetStatusFlag = process.argv.includes('--reset-status');

      // Determine which action to perform based on flags
      if (forceFlag) {
        // Handle `npm run seed:force`: Delete all templates, then insert seeds, mark seeded.
        console.log('Detected --force flag. Running force reseed...');
        // Call the function from utils/seeder.js via the imported object
        await seederLogic.forceReseed();

      } else if (resetStatusFlag) {
        // Handle `npm run seed:reset`: Insert missing seeds (keep existing), AND reset status flag.
        console.log('Detected --reset-status flag (from npm run seed:reset).');
        console.log('Action: Performing "insert if not exists" seeding and resetting seeder status...');
        // Call the new function from utils/seeder.js via the imported object
        await seederLogic.seedFormsIfNotExists();
        // Call the flag reset function (renamed performStatusReset) from utils/seeder.js via the imported object
        await seederLogic.performStatusReset();

      } else {
        // Default action when no specific flags are passed (shouldn't happen for npm seed scripts usually)
        // This block would run if you just did `node scripts/seed.js` with no flags.
        console.log('No specific flags detected. No seeder task specified for direct execution.');
        console.log('Available flags: --force, --reset-status');
        // We still need to exit gracefully after printing options
         process.exit(0);
      }

    } catch (error) {
      console.error('❌ Seeder tasks execution error:', error);
      process.exit(1); // Exit on seeder logic error
    } finally {
      // Disconnect when done, since this script initiated the connection
       if (mongoose.connection.readyState === 1) { // Only disconnect if connected
          await mongoose.disconnect();
          console.log('Disconnected from MongoDB');
       }
    }
}

// --- Script Entry Point ---
// Execute the main tasks function ONLY if this script is run directly from the command line.
// This check prevents the tasks from running automatically if this script is required by another file (like server.js).
if (require.main === module) {
    runSeederTasks(); // Start the main process
} else {
    console.log("scripts/seed.js initialized as a module. It should typically be run directly.");
}

// This script does not need to export anything as it's purely a command-line entry point.
// The actual seeder logic functions are exported from ../utils/seeder.js.