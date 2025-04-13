const Lead = require("../models/Lead");
const { sendLeadNotificationEmail, sendLeadConfirmationEmail } = require('../utils/emailNotification');

// Get all leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createLead = async (req, res) => {
  try {
    // Create a copy of the request body to modify
    const trimmedData = {};
    
    // Trim whitespace from string fields
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        trimmedData[key] = value.trim();
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects like billingAddress
        if (key === 'billingAddress') {
          trimmedData[key] = {};
          for (const [addrKey, addrValue] of Object.entries(value)) {
            if (typeof addrValue === 'string') {
              trimmedData[key][addrKey] = addrValue.trim();
            } else {
              trimmedData[key][addrKey] = addrValue;
            }
          }
        } else {
          trimmedData[key] = value;
        }
      } else {
        trimmedData[key] = value;
      }
    }

    // Create the lead in the database using the trimmed data
    const lead = new Lead(trimmedData);
    const createdLead = await lead.save();

    // Check if this is from the public form submission
    const isFormSubmission = trimmedData.isFormSubmission === true || 
      (req.headers.referer && req.headers.referer.includes('/form.html'));
    
    // Remove the flag from the response if it exists
    if (createdLead.isFormSubmission) {
      createdLead.isFormSubmission = undefined;
    }

    // Attempt to send email notification only for form submissions
    if (isFormSubmission) {
      // Send admin notification
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('Sending admin notification email');
        sendLeadNotificationEmail(createdLead)
          .catch(error => console.error('Background admin email notification failed:', error));
      }

      // Send confirmation email to the lead (optional)
      if (createdLead.email) {
        console.log('Sending lead confirmation email');
        sendLeadConfirmationEmail(createdLead)
          .catch(error => console.error('Background lead confirmation email failed:', error));
      }
    }

    res.status(201).json(createdLead);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Update lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (req.body.$pull) {
      // Handle removing items from arrays
      if (req.body.$pull.associatedForms) {
        await Lead.findByIdAndUpdate(req.params.id, {
          $pull: { associatedForms: req.body.$pull.associatedForms }
        });
        
        // Remove the $pull operation from the regular update
        delete req.body.$pull;
      }
    }


if (req.body.status === "contacted" && lead.status !== "contacted") {
  req.body.lastContactedAt = Date.now();
}

// If total budget is being updated, calculate remaining balance
if (req.body.totalBudget !== undefined) {
  const totalBudget = parseFloat(req.body.totalBudget);
  const paidAmount = lead.paidAmount || 0;
  req.body.remainingBalance = Math.max(0, totalBudget - paidAmount);
}

const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
  new: true,
});

res.json(updatedLead);
} catch (error) {
console.error(error);
res.status(400).json({ message: error.message });
}
};

// Delete lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Changed from lead.remove() to deleteOne()
    await Lead.deleteOne({ _id: req.params.id });

    res.json({ message: "Lead removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Search leads
exports.searchLeads = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const leads = await Lead.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { businessName: { $regex: query, $options: "i" } },
      ],
    }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};