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

// Port configuration
const PORT = process.env.PORT || 5000;

// Root route with detailed info
app.get('/', (req, res) => {
  res.json({
    message: `🍕 Congratulations! Freelance Lead Management API is now running on port ${PORT}! 🍕`,
    status: 'Active',
    serverInfo: {
      port: PORT,
      environment: process.env.NODE_ENV || 'development',
      apiVersion: '1.0.0'
    },
    endpoints: {
      allLeads: `http://localhost:${PORT}/api/leads`,
      leadById: `http://localhost:${PORT}/api/leads/<id>`,
      searchLeads: `http://localhost:${PORT}/api/leads/search?query=term`
    },
    documentation: {
      description: 'LEADS REST API',
      endpoints: [
        {
          method: 'GET',
          path: '/api/leads',
          description: 'Get all leads'
        },
        {
          method: 'GET',
          path: '/api/leads/<id>',
          description: 'Get lead by ID'
        },
        {
          method: 'POST',
          path: '/api/leads',
          description: 'Create a new lead'
        },
        {
          method: 'PUT',
          path: '/api/leads/<id>',
          description: 'Update a lead'
        },
        {
          method: 'DELETE',
          path: '/api/leads/<id>',
          description: 'Delete a lead'
        },
        {
          method: 'GET',
          path: '/api/leads/search?query=term',
          description: 'Search leads with query parameter'
        }
      ]
    }
  });
});

// Routes
app.use('/api/leads', leadRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Freelance Lead Management API is now running on port ${PORT}`);
});