// server/index.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const leadRoutes = require('./routes/leadRoutes');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/leads', leadRoutes);

// Port configuration
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

// server/models/Lead.js
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  textNumber: {
    type: String,
  },
  preferredContact: {
    type: String,
    required: true,
    enum: ['phone', 'businessPhone', 'email', 'text'],
  },
  businessName: {
    type: String,
  },
  businessPhone: {
    type: String,
  },
  businessServices: {
    type: String,
  },
  serviceDesired: {
    type: String,
    required: true,
    enum: ['website', 'app'],
  },
  hasWebsite: {
    type: String,
    enum: ['yes', 'no'],
  },
  websiteAddress: {
    type: String,
  },
  status: {
    type: String,
    default: 'new',
    enum: ['new', 'contacted', 'in-progress', 'closed-won', 'closed-lost'],
  },
  notes: {
    type: String,
  },
  budget: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastContactedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('Lead', leadSchema);

// server/controllers/leadController.js
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
    
    await lead.remove();
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

// server/routes/leadRoutes.js
const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

router.get('/', leadController.getLeads);
router.get('/search', leadController.searchLeads);
router.get('/:id', leadController.getLeadById);
router.post('/', leadController.createLead);
router.put('/:id', leadController.updateLead);
router.delete('/:id', leadController.deleteLead);

module.exports = router;