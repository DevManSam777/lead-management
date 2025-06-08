const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

// get all documents for a lead
router.get('/lead/:leadId', documentController.getDocumentsByLead);

// get a specific document
router.get('/:id', documentController.getDocumentById);

// upload a document
router.post('/lead/:leadId', documentController.uploadDocument);

// delete a document
router.delete('/:id', documentController.deleteDocument);

module.exports = router;