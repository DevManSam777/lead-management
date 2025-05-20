exports.generateFormWithLeadData = async (req, res) => {
  try {
    const formId = req.params.id;
    const { leadId, timezone } = req.body;  // Get timezone from request if available

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

    // Determine user timezone - fallback to America/New_York if not provided
    const userTimezone = timezone || "America/New_York";
    
    // Format the current date in user's timezone
    const now = new Date();
    // Format date to show in user's timezone
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
    
    // Helper function to format date in user's timezone
    function formatDateInTimezone(date, timezone) {
      // Format without timezone information since we're manually adjusting for timezone
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone
      });
      
      return formatter.format(date);
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