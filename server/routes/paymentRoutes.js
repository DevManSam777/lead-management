// server/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getPayments);
router.get('/lead/:leadId', paymentController.getPaymentsByLead);
router.post('/', paymentController.createPayment);
router.put('/:id', paymentController.updatePayment);
router.delete('/:id', paymentController.deletePayment);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const paymentController = require('../controllers/paymentController');
// const auth = require('../middleware/auth');

// // All routes are protected with auth middleware
// router.get('/', auth, paymentController.getPayments);
// router.get('/lead/:leadId', auth, paymentController.getPaymentsByLead);
// router.post('/', auth, paymentController.createPayment);
// router.put('/:id', auth, paymentController.updatePayment);
// router.delete('/:id', auth, paymentController.deletePayment);

// module.exports = router;