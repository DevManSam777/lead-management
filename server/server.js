const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const leadRoutes = require("./routes/leadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingRoutes = require("./routes/settingRoutes");
const formRoutes = require("./routes/formRoutes"); // Add this line

// Load environment variables
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins during development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '5mb' })); // Increased limit for larger form content

// Port configuration
const PORT = process.env.PORT || 5000;

// Root route with detailed info
app.get("/", (req, res) => {
  res.json({
    message: `🍕 Congratulations! Freelance Lead Management API is now running on port ${PORT}! 🍕`,
    status: "Active",
    serverInfo: {
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      apiVersion: "1.0.0",
    },
    endpoints: {
      allLeads: `http://localhost:${PORT}/api/leads`,
      leadById: `http://localhost:${PORT}/api/leads/:id`,
      searchLeads: `http://localhost:${PORT}/api/leads/search?query=term`,
    },
    paymentEndpoints: {
      allPayments: `http://localhost:${PORT}/api/payments`,
      paymentsByLead: `http://localhost:${PORT}/api/payments/lead/:leadId`,
      createPayment: `http://localhost:${PORT}/api/payments`,
      updatePayment: `http://localhost:${PORT}/api/payments/:id`,
      deletePayment: `http://localhost:${PORT}/api/payments/:id`,
    },
    settingsEndpoints: {
      allSettings: `http://localhost:${PORT}/api/settings`,
      settingByKey: `http://localhost:${PORT}/api/settings/:key`,
      updateSetting: `http://localhost:${PORT}/api/settings/:key`,
    },
    formEndpoints: {
      allForms: `http://localhost:${PORT}/api/forms`,
      formById: `http://localhost:${PORT}/api/forms/:id`,
      searchForms: `http://localhost:${PORT}/api/forms/search?query=term`,
      createForm: `http://localhost:${PORT}/api/forms`,
      updateForm: `http://localhost:${PORT}/api/forms/:id`,
      deleteForm: `http://localhost:${PORT}/api/forms/:id`,
      cloneTemplate: `http://localhost:${PORT}/api/forms/:id/clone`,
      generateForm: `http://localhost:${PORT}/api/forms/:id/generate`,
    },
    documentation: {
      description: "LEADS REST API",
      endpoints: [
        // Existing endpoints...
        
        // Form endpoints
        {
          method: "GET",
          path: "/api/forms",
          description: "Get all forms (with optional filters)",
        },
        {
          method: "GET",
          path: "/api/forms/:id",
          description: "Get form by ID",
        },
        {
          method: "POST",
          path: "/api/forms",
          description: "Create a new form",
        },
        {
          method: "PUT",
          path: "/api/forms/:id",
          description: "Update a form",
        },
        {
          method: "DELETE",
          path: "/api/forms/:id",
          description: "Delete a form",
        },
        {
          method: "GET",
          path: "/api/forms/search?query=term",
          description: "Search forms with query parameter",
        },
        {
          method: "POST",
          path: "/api/forms/:id/clone",
          description: "Clone a template form",
        },
        {
          method: "POST",
          path: "/api/forms/:id/generate",
          description: "Generate form with lead data",
        },
      ],
    },
  });
});

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/forms", formRoutes); // Add this line

// Start the server
app.listen(PORT, () => {
  console.log(`Freelance Lead Management API is now running on port ${PORT}`);
});