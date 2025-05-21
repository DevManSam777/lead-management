const Form = require("../models/Form");

// Format preferred contact values
function formatPreferredContactValue(value) {
  // If no value is provided, return a nice placeholder
  if (!value) {
    return "No contact preference specified";
  }

  // Map of stored values to display values
  const contactMethods = {
    phone: "Personal Phone",
    businessPhone: "Business Phone",
    email: "Personal Email",
    text: "Text Message",
    businessEmail: "Business Email",
  };

  // Return the mapped value or the original if no mapping exists
  return contactMethods[value] || value;
}

// Format all variable values consistently
function formatVariableValue(variable, value) {
  // Handle null, undefined, or empty string values
  if (value === null || value === undefined || value === "") {
    return `[No ${variable} provided]`;
  }

  // Special case formatting for different variable types
  switch (variable) {
    case "preferredContact":
      return formatPreferredContactValue(value);

    case "serviceDesired":
      // Format service types nicely
      const serviceTypes = {
        "Web Development": "Website Development",
        "App Development": "Application Development",
      };
      return serviceTypes[value] || value;

    case "hasWebsite":
      // Convert yes/no to complete sentences
      return value === "yes"
        ? "Client has an existing website"
        : "Client does not have an existing website";

    case "budget":
    case "estimatedBudget":
      // Format currency values
      if (!isNaN(parseFloat(value))) {
        return parseFloat(value).toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        });
      }
      return value;

    default:
      // Return the value as-is for other variables
      return value;
  }
}

exports.getForms = async (req, res) => {
  try {
    const category = req.query.category;
    const isTemplate = req.query.isTemplate;

    // Build query object
    const query = {};

    // Add category filter if provided
    if (category) {
      query.category = category;
    }

    // Add template filter if provided
    if (isTemplate !== undefined) {
      // Convert string "true"/"false" to boolean
      query.isTemplate = isTemplate === "true";
    }

    // Exclude forms that are associated with leads (customer forms) from the forms page
    // when viewing drafts, unless we're explicitly looking for them
    if (isTemplate === "false" && !req.query.includeCustomerForms) {
      // Find all leads to get their associated form IDs
      const Lead = require("../models/Lead");
      const leads = await Lead.find({}, "associatedForms");

      // Extract all form IDs associated with leads
      const associatedFormIds = leads.reduce((ids, lead) => {
        if (lead.associatedForms && lead.associatedForms.length > 0) {
          return [...ids, ...lead.associatedForms];
        }
        return ids;
      }, []);

      // Exclude these forms from results if they're not templates
      if (associatedFormIds.length > 0) {
        query._id = { $nin: associatedFormIds };
      }
    }

    // Get forms sorted by creation date (newest first)
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

exports.searchForms = async (req, res) => {
  try {
    const { query } = req.query;
    const isTemplate = req.query.isTemplate;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Build the base query
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    };

    // Add template filter if provided
    if (isTemplate !== undefined) {
      searchQuery.isTemplate = isTemplate === "true";
    }

    // Exclude customer forms when searching drafts
    if (isTemplate === "false" && !req.query.includeCustomerForms) {
      // Find all leads to get their associated form IDs
      const Lead = require("../models/Lead");
      const leads = await Lead.find({}, "associatedForms");

      // Extract all form IDs associated with leads
      const associatedFormIds = leads.reduce((ids, lead) => {
        if (lead.associatedForms && lead.associatedForms.length > 0) {
          return [...ids, ...lead.associatedForms];
        }
        return ids;
      }, []);

      // Exclude these forms from results if they're not templates
      if (associatedFormIds.length > 0) {
        searchQuery._id = { $nin: associatedFormIds };
      }
    }

    const forms = await Form.find(searchQuery).sort({ lastModified: -1 });

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

// exports.generateFormWithLeadData = async (req, res) => {
//   try {
//     const formId = req.params.id;
//     const { leadId, timezone } = req.body;  

//     if (!leadId) {
//       return res.status(400).json({ message: "Lead ID is required" });
//     }

//     // Get the form
//     const form = await Form.findById(formId);
//     if (!form) {
//       return res.status(404).json({ message: "Form not found" });
//     }

//     // Get the lead
//     const Lead = require("../models/Lead");
//     const lead = await Lead.findById(leadId);

//     if (!lead) {
//       return res.status(404).json({ message: "Lead not found" });
//     }
    
//     const fullName = `${lead.firstName} ${lead.lastName}`;
    
//     // Create a new form based on the template with lead data
//     const newForm = new Form({
//       // Keep title for organization in the database
//       title: `${form.title} - ${fullName}`,
//       description: form.description,
//       // Use the original content, preserve all whitespace
//       content: form.content,
//       category: form.category,
//       isTemplate: false,
//       variables: [...form.variables],
//     });

//     // Replace variables in content with lead data, preserve whitespace
//     let populatedContent = form.content;

//     // TIMEZONE FIX: Get timezone information from various sources
//     // Multiple fallback mechanisms to detect the user's timezone without requiring frontend changes
//     let userTimezone;
    
//     // 1. Use any explicitly provided timezone first (keeping compatibility with existing code)
//     if (timezone) {
//       userTimezone = timezone;
//     } 
//     // 2. Check for timezone in headers (might be set by proxies or browser extensions)
//     else if (req.headers['x-timezone']) {
//       userTimezone = req.headers['x-timezone'];
//     }
//     // 3. Check for timezone cookie if set
//     else if (req.cookies && req.cookies.timezone) {
//       userTimezone = req.cookies.timezone;
//     }
//     // 4. Try to guess from Accept-Language header for region
//     else if (req.headers['accept-language']) {
//       const language = req.headers['accept-language'].split(',')[0].trim();
//       // Extract country code if present (like en-US)
//       const countryMatch = language.match(/-([A-Z]{2})/);
//       if (countryMatch && countryMatch[1]) {
//         const country = countryMatch[1];
        
//         // Map common countries to their primary timezone
//         const countryTimezones = {
//           'US': 'America/Los_Angeles',  // Changed to west coast for your location
//           'GB': 'Europe/London',
//           'CA': 'America/Toronto',
//           'AU': 'Australia/Sydney',
//           'IN': 'Asia/Kolkata',
//           'JP': 'Asia/Tokyo',
//           'DE': 'Europe/Berlin',
//           // Add more as needed
//         };
        
//         if (countryTimezones[country]) {
//           userTimezone = countryTimezones[country];
//         }
//       }
//     }
    
//     // 5. Use browser's timezone if available in headers (some modern browsers add this)
//     if (!userTimezone && req.headers['sec-ch-ua-timezone']) {
//       userTimezone = req.headers['sec-ch-ua-timezone'];
//     }
    
//     // 6. Last resort: Default to the US West Coast 
//     if (!userTimezone) {
//       userTimezone = 'America/Los_Angeles';
//     }
    
//     console.log(`Using detected timezone: ${userTimezone} for form generation`);
    
//     // Get current date and use it in the appropriate timezone
//     const now = new Date();
    
//     // Format the current date in the detected timezone 
//     const currentDateFormatted = formatDateInTimezone(now, userTimezone);
    
//     // Replace currentDate variable
//     populatedContent = populatedContent.replace(
//       /\{\{currentDate\}\}/g,
//       currentDateFormatted
//     );

//     // Handle created date in user's timezone
//     if (lead.createdAt) {
//       const createdDate = new Date(lead.createdAt);
//       const createdAtFormatted = formatDateInTimezone(createdDate, userTimezone);
      
//       populatedContent = populatedContent.replace(
//         /\{\{createdAt\}\}/g,
//         createdAtFormatted
//       );
//     }

//     // Handle last contacted date in user's timezone
//     if (lead.lastContactedAt) {
//       const lastContactedDate = new Date(lead.lastContactedAt);
//       const lastContactedFormatted = formatDateInTimezone(lastContactedDate, userTimezone);
      
//       populatedContent = populatedContent.replace(
//         /\{\{lastContactedAt\}\}/g,
//         lastContactedFormatted
//       );
//     }
    
//     // IMPROVED TIMEZONE FUNCTION: Format date correctly in the specified timezone
//     function formatDateInTimezone(date, timezone) {
//       try {
//         // Use Intl.DateTimeFormat for better timezone handling
//         const formatter = new Intl.DateTimeFormat('en-US', {
//           year: 'numeric',
//           month: 'long',
//           day: 'numeric',
//           timeZone: timezone
//         });
        
//         return formatter.format(date);
//       } catch (error) {
//         console.error(`Error formatting date with timezone ${timezone}:`, error);
//         // If the timezone is invalid, fall back to UTC
//         try {
//           const fallbackFormatter = new Intl.DateTimeFormat('en-US', {
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//             timeZone: 'UTC' // Fallback to UTC
//           });
//           return fallbackFormatter.format(date);
//         } catch (fallbackError) {
//           // If everything else fails, use a very basic fallback
//           return date.toDateString();
//         }
//       }
//     }

//     // Handle financial variables specifically with proper formatting
//     // Format the totalBudget (billedAmount) with proper currency formatting
//     if (lead.totalBudget !== undefined) {
//       const totalBudget = lead.totalBudget || 0;
//       populatedContent = populatedContent.replace(
//         /\{\{totalBudget\}\}/g,
//         totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
//       );
//       populatedContent = populatedContent.replace(
//         /\{\{billedAmount\}\}/g,
//         totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
//       );
//     }

//     // Format the paidAmount with proper currency formatting
//     if (lead.paidAmount !== undefined) {
//       const paidAmount = lead.paidAmount || 0;
//       populatedContent = populatedContent.replace(
//         /\{\{paidAmount\}\}/g,
//         paidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
//       );
//     }

//     // Format the remainingBalance with proper currency formatting
//     if (lead.remainingBalance !== undefined) {
//       const remainingBalance = lead.remainingBalance || 0;
//       populatedContent = populatedContent.replace(
//         /\{\{remainingBalance\}\}/g,
//         remainingBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
//       );
//     }

//     // Handle billing address which needs special formatting
//     // IMPORTANT: Preserve line breaks and indentation in the address
//     let fullAddress;
//     if (!lead.billingAddress || 
//         (!lead.billingAddress.street && 
//          !lead.billingAddress.aptUnit && 
//          !lead.billingAddress.city && 
//          !lead.billingAddress.state && 
//          !lead.billingAddress.zipCode && 
//          !lead.billingAddress.country)) {
//       fullAddress = "[No Address Provided]";
//     } else { 
//       // Format with line breaks that preserve markdown formatting
//       fullAddress = 
// `${lead.billingAddress.street || ""}${lead.billingAddress.aptUnit ? " #" + lead.billingAddress.aptUnit : ""}
// ${lead.billingAddress.city || ""}, ${lead.billingAddress.state || ""} ${lead.billingAddress.zipCode || ""}, ${lead.billingAddress.country || ""}`.trim();
//     }

//     populatedContent = populatedContent.replace(
//       /\{\{billingAddress\}\}/g,
//       fullAddress
//     );

//     // Handle fullName
//     populatedContent = populatedContent.replace(
//       /\{\{fullName\}\}/g,
//       fullName
//     );

//     // Handle preferred contact method with special formatting
//     const formattedPreferredContact = formatVariableValue("preferredContact", lead.preferredContact);
//     populatedContent = populatedContent.replace(
//       /\{\{preferredContact\}\}/g,
//       formattedPreferredContact
//     );

//     // Replace all other variables with lead data
//     form.variables.forEach((variable) => {
//       // Skip already processed special variables
//       if (variable === "currentDate" || 
//           variable === "paidAmount" || 
//           variable === "remainingBalance" ||
//           variable === "billedAmount" ||
//           variable === "totalBudget" ||
//           variable === "billingAddress" ||
//           variable === "fullName" ||
//           variable === "preferredContact" ||
//           variable === "createdAt" ||
//           variable === "lastContactedAt") {
//         return;
//       }

//       const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, "g");

//       // Get the value from lead object
//       let value = lead[variable];
      
//       // Format the value with our formatter
//       value = formatVariableValue(variable, value);

//       // This maintains whitespace around variables
//       populatedContent = populatedContent.replace(variablePattern, value);
//     });

//     // Set the populated content
//     newForm.content = populatedContent;

//     // Save the new form
//     const savedForm = await newForm.save();

//     // Associate the form with the lead
//     await Lead.findByIdAndUpdate(leadId, {
//       $addToSet: { associatedForms: savedForm._id },
//     });

//     // Return timezone used for debugging
//     res.json({
//       _id: savedForm._id,
//       title: savedForm.title,
//       description: savedForm.description,
//       content: populatedContent,
//       leadId: leadId,
//       usedTimezone: userTimezone // For debugging
//     });
//   } catch (error) {
//     console.error("Error generating form with lead data:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

exports.generateFormWithLeadData = async (req, res) => {
  try {
    const formId = req.params.id;
    const { leadId, timezone } = req.body;  

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
    
    const fullName = `${lead.firstName} ${lead.lastName}`;
    
    // Create a new form based on the template with lead data
    const newForm = new Form({
      // Keep title for organization in the database
      title: `${form.title} - ${fullName}`,
      description: form.description,
      // Use the original content, preserve all whitespace
      content: form.content,
      category: form.category,
      isTemplate: false,
      variables: [...form.variables],
    });

    // Replace variables in content with lead data, preserve whitespace
    let populatedContent = form.content;

    // TIMEZONE FIX: Use explicitly provided timezone or default to Pacific Time
    let userTimezone;
    
    // 1. Use any explicitly provided timezone first (from client)
    if (timezone) {
      userTimezone = timezone;
      console.log(`Using explicitly provided timezone: ${timezone}`);
    } 
    // 2. Check for timezone in headers (might be set by proxies or browser extensions)
    else if (req.headers['x-timezone']) {
      userTimezone = req.headers['x-timezone'];
      console.log(`Using timezone from x-timezone header: ${userTimezone}`);
    }
    // 3. Check for timezone cookie if set
    else if (req.cookies && req.cookies.timezone) {
      userTimezone = req.cookies.timezone;
      console.log(`Using timezone from cookie: ${userTimezone}`);
    }
    // 4. Default to Pacific Time as the safe fallback
    else {
      userTimezone = 'America/Los_Angeles';
      console.log(`Using default timezone: ${userTimezone}`);
    }
    
    console.log(`Using detected timezone: ${userTimezone} for form generation`);
    
    // Get current date and use it in the appropriate timezone
    const now = new Date();
    
    // Format the current date in the detected timezone 
    const currentDateFormatted = formatDateInTimezone(now, userTimezone);
    
    // Replace currentDate variable
    populatedContent = populatedContent.replace(
      /\{\{currentDate\}\}/g,
      currentDateFormatted
    );

    // Handle created date in user's timezone
    if (lead.createdAt) {
      const createdDate = new Date(lead.createdAt);
      const createdAtFormatted = formatDateInTimezone(createdDate, userTimezone);
      
      populatedContent = populatedContent.replace(
        /\{\{createdAt\}\}/g,
        createdAtFormatted
      );
    }

    // Handle last contacted date in user's timezone
    if (lead.lastContactedAt) {
      const lastContactedDate = new Date(lead.lastContactedAt);
      const lastContactedFormatted = formatDateInTimezone(lastContactedDate, userTimezone);
      
      populatedContent = populatedContent.replace(
        /\{\{lastContactedAt\}\}/g,
        lastContactedFormatted
      );
    }
    
    // IMPROVED TIMEZONE FUNCTION: Format date correctly in the specified timezone
    function formatDateInTimezone(date, timezone) {
      try {
        // Use Intl.DateTimeFormat with explicit options for better control
        const formatter = new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: timezone
        });
        
        // Use this instead of formatter.format() for more explicit control
        const parts = formatter.formatToParts(date);
        let formattedDate = '';
        
        // Build the date manually from parts to avoid any unexpected behavior
        parts.forEach(part => {
          if (part.type === 'month') formattedDate += part.value + ' ';
          if (part.type === 'day') formattedDate += part.value + ', ';
          if (part.type === 'year') formattedDate += part.value;
        });
        
        return formattedDate.trim();
      } catch (error) {
        console.error(`Error formatting date with timezone ${timezone}:`, error);
        // Fallback to a simple date string if formatting fails
        return date.toDateString();
      }
    }

    // Handle financial variables specifically with proper formatting
    // Format the totalBudget (billedAmount) with proper currency formatting
    if (lead.totalBudget !== undefined) {
      const totalBudget = lead.totalBudget || 0;
      populatedContent = populatedContent.replace(
        /\{\{totalBudget\}\}/g,
        totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
      populatedContent = populatedContent.replace(
        /\{\{billedAmount\}\}/g,
        totalBudget.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
    }

    // Format the paidAmount with proper currency formatting
    if (lead.paidAmount !== undefined) {
      const paidAmount = lead.paidAmount || 0;
      populatedContent = populatedContent.replace(
        /\{\{paidAmount\}\}/g,
        paidAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
    }

    // Format the remainingBalance with proper currency formatting
    if (lead.remainingBalance !== undefined) {
      const remainingBalance = lead.remainingBalance || 0;
      populatedContent = populatedContent.replace(
        /\{\{remainingBalance\}\}/g,
        remainingBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      );
    }

    // Handle billing address which needs special formatting
    // IMPORTANT: Preserve line breaks and indentation in the address
    let fullAddress;
    if (!lead.billingAddress || 
        (!lead.billingAddress.street && 
         !lead.billingAddress.aptUnit && 
         !lead.billingAddress.city && 
         !lead.billingAddress.state && 
         !lead.billingAddress.zipCode && 
         !lead.billingAddress.country)) {
      fullAddress = "[No Address Provided]";
    } else { 
      // Format with line breaks that preserve markdown formatting
      fullAddress = 
`${lead.billingAddress.street || ""}${lead.billingAddress.aptUnit ? " #" + lead.billingAddress.aptUnit : ""}
${lead.billingAddress.city || ""}, ${lead.billingAddress.state || ""} ${lead.billingAddress.zipCode || ""}, ${lead.billingAddress.country || ""}`.trim();
    }

    populatedContent = populatedContent.replace(
      /\{\{billingAddress\}\}/g,
      fullAddress
    );

    // Handle fullName
    populatedContent = populatedContent.replace(
      /\{\{fullName\}\}/g,
      fullName
    );

    // Handle preferred contact method with special formatting
    const formattedPreferredContact = formatVariableValue("preferredContact", lead.preferredContact);
    populatedContent = populatedContent.replace(
      /\{\{preferredContact\}\}/g,
      formattedPreferredContact
    );

    // Replace all other variables with lead data
    form.variables.forEach((variable) => {
      // Skip already processed special variables
      if (variable === "currentDate" || 
          variable === "paidAmount" || 
          variable === "remainingBalance" ||
          variable === "billedAmount" ||
          variable === "totalBudget" ||
          variable === "billingAddress" ||
          variable === "fullName" ||
          variable === "preferredContact" ||
          variable === "createdAt" ||
          variable === "lastContactedAt") {
        return;
      }

      const variablePattern = new RegExp(`\\{\\{${variable}\\}\\}`, "g");

      // Get the value from lead object
      let value = lead[variable];
      
      // Format the value with our formatter
      value = formatVariableValue(variable, value);

      // This maintains whitespace around variables
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

    // Return timezone used for debugging
    res.json({
      _id: savedForm._id,
      title: savedForm.title,
      description: savedForm.description,
      content: populatedContent,
      leadId: leadId,
      usedTimezone: userTimezone // For debugging
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