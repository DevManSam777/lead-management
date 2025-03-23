const Lead = require('../models/Lead');

// Get all leads
exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find({}).sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get lead by ID
exports.getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    res.json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new lead
exports.createLead = async (req, res) => {
  try {
    const lead = new Lead(req.body);
    const createdLead = await lead.save();
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
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // If updating status to 'contacted', update lastContactedAt
    if (req.body.status === 'contacted' && lead.status !== 'contacted') {
      req.body.lastContactedAt = Date.now();
    }
    
    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
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
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Changed from lead.remove() to deleteOne()
    await Lead.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Lead removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Search leads
exports.searchLeads = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const leads = await Lead.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { businessName: { $regex: query, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
    
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};