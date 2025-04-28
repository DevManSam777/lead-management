const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

// Get all settings
router.get('/', settingController.getAllSettings);

// Get a specific setting
router.get('/:key', settingController.getSetting);

// Update a setting
router.put('/:key', settingController.updateSetting);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const settingController = require('../controllers/settingController');
// const auth = require('../middleware/auth');

// // All routes are protected with auth middleware
// // Get all settings
// router.get('/', auth, settingController.getAllSettings);

// // Get a specific setting
// router.get('/:key', auth, settingController.getSetting);

// // Update a setting
// router.put('/:key', auth, settingController.updateSetting);

// module.exports = router;