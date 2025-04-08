const Form = require("../models/Form");

// Get all forms
exports.getForms = async (req, res) => {
  try {
    const category = req.query.category;
    const isTemplate = req.query.isTemplate === "true";

    // Build query object
    const query = {};
    if (category) query.category = category;
    if (req.query.isTemplate !== undefined) query.isTemplate = isTemplate;

    const forms = await Form.find(query).sort({ lastModified: -1 });
    res.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get form by ID
exports.getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    res.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// In server/controllers/formController.js
exports.getFormsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;

    // Find the lead
    const Lead = require("../models/Lead");
    const lead = await Lead.findById(leadId).populate("associatedForms");

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead.associatedForms || []);
  } catch (error) {
    console.error("Error fetching forms for lead:", error);
    res.status(500).json({ message: "Server Error" });
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
    console.error("Error creating form:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update form
exports.updateForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Update form properties
    Object.keys(req.body).forEach((key) => {
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
    console.error("Error updating form:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete form
exports.deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    await Form.deleteOne({ _id: req.params.id });
    res.json({ message: "Form removed" });
  } catch (error) {
    console.error("Error deleting form:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Search forms
exports.searchForms = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const forms = await Form.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    }).sort({ lastModified: -1 });

    res.json(forms);
  } catch (error) {
    console.error("Error searching forms:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Clone template to new form
exports.cloneTemplate = async (req, res) => {
  try {
    const templateId = req.params.id;
    const template = await Form.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Create new form based on template
    const newForm = new Form({
      title: `${template.title} (Copy)`,
      description: template.description,
      content: template.content,
      category: template.category,
      isTemplate: false, // Set to false as this is now a regular form
      variables: [...template.variables],
    });

    const savedForm = await newForm.save();
    res.status(201).json(savedForm);
  } catch (error) {
    console.error("Error cloning template:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// In server/controllers/formController.js
exports.generateFormWithLeadData = async (req, res) => {
  try {
    const formId = req.params.id;
    const { leadId } = req.body;

    if (!leadId) {
      return res.status(400).json({ message: "Lead ID is required" });
    }

    // Get the form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Get the lead
    const Lead = require("../models/Lead");
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Create a new form based on the template with lead data
    const newForm = new Form({
      // Keep title for organization in the database
      title: `${form.title} - ${lead.firstName} ${lead.lastName}`,
      description: form.description,
      // Just use the original content without adding the title
      content: form.content,
      category: form.category,
      isTemplate: false,
      variables: [...form.variables],
    });

    // Replace variables in content with lead data
    let populatedContent = form.content;

    // Add current date as a special variable
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to prevent timezone issues
    const currentDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Replace currentDate variable
    populatedContent = populatedContent.replace(
      /\{\{currentDate\}\}/g,
      currentDate
    );

    // Replace all other variables with lead data
    form.variables.forEach((variable) => {
      if (variable === "currentDate") return;

      const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, "g");

      // Get the value from lead object (handle nested properties)
      let value = lead[variable] || "";

      // Special handling for empty values
      if (value === "" || value === undefined || value === null) {
        value = `[${variable} not available]`;
      }

      // Replace in content
      populatedContent = populatedContent.replace(variablePattern, value);
    });

    // Set the populated content
    newForm.content = populatedContent;

    // Save the new form
    const savedForm = await newForm.save();

    // Associate the form with the lead
    await Lead.findByIdAndUpdate(leadId, {
      $addToSet: { associatedForms: savedForm._id },
    });

    res.json({
      _id: savedForm._id,
      title: savedForm.title,
      description: savedForm.description,
      content: populatedContent,
      leadId: leadId,
    });
  } catch (error) {
    console.error("Error generating form with lead data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Helper function to get nested properties
function getNestedProperty(obj, path) {
  // Handle nested paths (e.g., "business.name")
  const properties = path.split(".");

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
