const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// Get all documents for a lead
router.get('/lead/:leadId', documentController.getDocumentsByLead);

// Get a specific document
router.get('/:id', documentController.getDocumentById);

// Upload a document
router.post('/lead/:leadId', documentController.uploadDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;

// server/routes/documentRoutes.js
// const express = require('express');
// const router = express.Router();
// const documentController = require('../controllers/documentController');
// const auth = require('../middleware/auth');

// // All routes are protected with auth middleware
// // Get all documents for a lead
// router.get('/lead/:leadId', auth, documentController.getDocumentsByLead);

// // Get a specific document
// router.get('/:id', auth, documentController.getDocumentById);

// // Upload a document
// router.post('/lead/:leadId', auth, documentController.uploadDocument);

// // Delete a document
// router.delete('/:id', auth, documentController.deleteDocument);

// module.exports = router;