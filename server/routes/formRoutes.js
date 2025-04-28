const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// GET /api/forms - Get all forms (with optional filters)
// Can now handle new template/draft filtering
router.get('/', formController.getForms);

// GET /api/forms/search - Search forms
// Updated to support template/draft filter
router.get('/search', formController.searchForms);

// GET /api/forms/:id - Get specific form
router.get('/:id', formController.getFormById);

// POST /api/forms - Create a new form
router.post('/', formController.createForm);

// PUT /api/forms/:id - Update form
router.put('/:id', formController.updateForm);

// DELETE /api/forms/:id - Delete form
router.delete('/:id', formController.deleteForm);

// POST /api/forms/:id/clone - Clone a template
router.post('/:id/clone', formController.cloneTemplate);

// POST /api/forms/:id/generate - Generate form with lead data
router.post('/:id/generate', formController.generateFormWithLeadData);

// GET /api/forms/lead/:leadId - Get Lead's forms
router.get('/lead/:leadId', formController.getFormsByLead);

module.exports = router;

// server/routes/formRoutes.js
// const express = require('express');
// const router = express.Router();
// const formController = require('../controllers/formController');
// const auth = require('../middleware/auth');

// // All routes are protected with auth middleware
// // GET /api/forms - Get all forms (with optional filters)
// router.get('/', auth, formController.getForms);

// // GET /api/forms/search - Search forms
// router.get('/search', auth, formController.searchForms);

// // GET /api/forms/:id - Get specific form
// router.get('/:id', auth, formController.getFormById);

// // POST /api/forms - Create a new form
// router.post('/', auth, formController.createForm);

// // PUT /api/forms/:id - Update form
// router.put('/:id', auth, formController.updateForm);

// // DELETE /api/forms/:id - Delete form
// router.delete('/:id', auth, formController.deleteForm);

// // POST /api/forms/:id/clone - Clone a template
// router.post('/:id/clone', auth, formController.cloneTemplate);

// // POST /api/forms/:id/generate - Generate form with lead data
// router.post('/:id/generate', auth, formController.generateFormWithLeadData);

// // GET /api/forms/lead/:leadId - Get Lead's forms
// router.get('/lead/:leadId', auth, formController.getFormsByLead);

// module.exports = router;