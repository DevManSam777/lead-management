const Form = require('../models/Form');

// Get all forms
exports.getForms = async (req, res) => {
  try {
    const category = req.query.category;
    const isTemplate = req.query.isTemplate === 'true';
    
    // Build query object
    const query = {};
    if (category) query.category = category;
    if (req.query.isTemplate !== undefined) query.isTemplate = isTemplate;
    
    const forms = await Form.find(query).sort({ lastModified: -1 });
    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get form by ID
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new form
exports.createForm = async (req, res) => {
  try {
    // Create new form instance
    const form = new Form(req.body);
    
    // Extract variables before saving
    form.extractVariables();
    
    // Save the form
    const savedForm = await form.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update form
exports.updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Update form properties
    Object.keys(req.body).forEach(key => {
      form[key] = req.body[key];
    });
    
    // Re-extract variables if content was updated
    if (req.body.content) {
      form.extractVariables();
    }

    // Save updated form
    const updatedForm = await form.save();
    res.json(updatedForm);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete form
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    await Form.deleteOne({ _id: req.params.id });
    res.json({ message: 'Form removed' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Search forms
exports.searchForms = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const forms = await Form.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    }).sort({ lastModified: -1 });

    res.json(forms);
  } catch (error) {
    console.error('Error searching forms:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Clone template to new form
exports.cloneTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const template = await Form.findById(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Create new form based on template
    const newForm = new Form({
      title: `${template.title} (Copy)`,
      description: template.description,
      content: template.content,
      category: template.category,
      isTemplate: false, // Set to false as this is now a regular form
      variables: [...template.variables]
    });
    
    const savedForm = await newForm.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error cloning template:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// In server/controllers/formController.js
exports.generateFormWithLeadData = async (req, res) => {
  try {
    const formId = req.params.id;
    const { leadId } = req.body;
    
    if (!leadId) {
      return res.status(400).json({ message: 'Lead ID is required' });
    }
    
    // Get the form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    
    // Get the lead
    const Lead = require('../models/Lead');
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Replace variables in content
    let populatedContent = form.content;
    
    // Add current date as a special variable
    const today = new Date();
    const currentDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Replace currentDate variable
    populatedContent = populatedContent.replace(/\{\{currentDate\}\}/g, currentDate);
    
    // Replace all other variables with lead data
    form.variables.forEach(variable => {
      // Skip currentDate as we've already handled it
      if (variable === 'currentDate') return;
      
      // Create a RegExp to find all occurrences
      const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, 'g');
      
      // Get the value from lead object
      const value = getNestedProperty(lead, variable) || `[${variable} not found]`;
      
      // Replace in content
      populatedContent = populatedContent.replace(variablePattern, value);
    });
    
    res.json({
      title: form.title,
      description: form.description,
      content: populatedContent,
      leadId: leadId,
      formId: formId
    });
  } catch (error) {
    console.error('Error generating form with lead data:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper function to get nested properties
function getNestedProperty(obj, path) {
  // Handle nested paths (e.g., "business.name")
  const properties = path.split('.');
  
  // Start with the object
  let value = obj;
  
  // Traverse the object path
  for (const prop of properties) {
    // If value is undefined or null, stop
    if (value === undefined || value === null) {
      return undefined;
    }
    
    // Get the next level
    value = value[prop];
  }
  
  return value;
}