const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const auth = require('../middleware/auth');

// Get all documents for a lead
router.get('/lead/:leadId', documentController.getDocumentsByLead);

// Get a specific document
router.get('/:id', auth, documentController.getDocumentById);

// Upload a document
router.post('/lead/:leadId', documentController.uploadDocument);

// Delete a document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;