const express = require('express');
const router = express.Router();
const hitlistController = require('../controllers/hitlistController');
const businessController = require('../controllers/businessController');

// Hitlist routes
router.get('/', hitlistController.getHitlists);
router.get('/:id', hitlistController.getHitlistById);
router.post('/', hitlistController.createHitlist);
router.put('/:id', hitlistController.updateHitlist);
router.delete('/:id', hitlistController.deleteHitlist);

// Business routes (nested under hitlists)
router.get('/:hitlistId/businesses', businessController.getBusinessesByHitlist);
router.post('/:hitlistId/businesses', businessController.createBusiness);
router.put('/businesses/:id', businessController.updateBusiness);
router.delete('/businesses/:id', businessController.deleteBusiness);

module.exports = router;

// server/routes/hitlistRoutes.js
// const express = require('express');
// const router = express.Router();
// const hitlistController = require('../controllers/hitlistController');
// const businessController = require('../controllers/businessController');
// const auth = require('../middleware/auth');

// // All routes are protected with auth middleware
// // Hitlist routes
// router.get('/', auth, hitlistController.getHitlists);
// router.get('/:id', auth, hitlistController.getHitlistById);
// router.post('/', auth, hitlistController.createHitlist);
// router.put('/:id', auth, hitlistController.updateHitlist);
// router.delete('/:id', auth, hitlistController.deleteHitlist);

// // Business routes (nested under hitlists)
// router.get('/:hitlistId/businesses', auth, businessController.getBusinessesByHitlist);
// router.post('/:hitlistId/businesses', auth, businessController.createBusiness);
// router.put('/businesses/:id', auth, businessController.updateBusiness);
// router.delete('/businesses/:id', auth, businessController.deleteBusiness);

// module.exports = router;