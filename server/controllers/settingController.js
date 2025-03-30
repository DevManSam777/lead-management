const Setting = require('../models/Setting');

// Default settings configuration
const DEFAULT_SETTINGS = {
  theme: 'light', // Default theme is light
  dateFormat: 'MM/DD/YYYY' // Default date format
};

// Function to initialize default settings
async function initializeDefaultSettings() {
  try {
    // Check if each default setting exists, if not create it
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
      const exists = await Setting.findOne({ key, scope: 'global' });
      if (!exists) {
        await Setting.create({
          key,
          value,
          scope: 'global'
        });
        console.log(`Initialized default setting: ${key} = ${value}`);
      }
    }
  } catch (error) {
    console.error('Error initializing default settings:', error);
  }
}

// Initialize default settings when controller is loaded
initializeDefaultSettings();

// Get a setting by key
exports.getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    // For now we're only handling global settings
    const setting = await Setting.findOne({ key, scope: 'global' });
    
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }
    
    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    console.error('Error fetching setting:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create or update a setting
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: 'Setting value is required' });
    }
    
    // Find and update, or create if it doesn't exist (upsert)
    const setting = await Setting.findOneAndUpdate(
      { key, scope: 'global' },
      { value, updatedAt: Date.now() },
      { new: true, upsert: true }
    );
    
    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all settings (useful for initialization)
exports.getAllSettings = async (req, res) => {
  try {
    // For now we're only handling global settings
    const settings = await Setting.find({ scope: 'global' });
    
    // Transform to key-value format
    const settingsObject = settings.reduce((obj, setting) => {
      obj[setting.key] = setting.value;
      return obj;
    }, {});
    
    res.json(settingsObject);
  } catch (error) {
    console.error('Error fetching all settings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};