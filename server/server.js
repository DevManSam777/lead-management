const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const leadRoutes = require("./routes/leadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingRoutes = require("./routes/settingRoutes");
const formRoutes = require("./routes/formRoutes");

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
        // Lead Endpoints
        {
          method: "GET",
          path: "/api/leads",
          description: "Get all leads (with optional filters and pagination)",
          parameters: [
            { name: "page", type: "integer", description: "Page number for pagination", required: false },
            { name: "limit", type: "integer", description: "Number of leads per page", required: false },
            { name: "sort", type: "string", description: "Sort order (e.g., 'createdAt', '-name')", required: false },
            { name: "status", type: "string", description: "Filter by lead status", required: false },
            // Add other potential query parameters for filtering
          ],
          response: "Array of lead objects",
        },
        {
          method: "GET",
          path: "/api/leads/:id",
          description: "Get lead by ID",
          parameters: [
            { name: "id", type: "string", description: "ID of the lead", required: true },
          ],
          response: "Lead object",
        },
        {
          method: "POST",
          path: "/api/leads",
          description: "Create a new lead",
          requestBody: "Lead object in JSON format",
          response: "Newly created lead object",
        },
        {
          method: "PUT",
          path: "/api/leads/:id",
          description: "Update a lead",
          parameters: [
            { name: "id", type: "string", description: "ID of the lead to update", required: true },
          ],
          requestBody: "Updated lead object in JSON format",
          response: "Updated lead object",
        },
        {
          method: "DELETE",
          path: "/api/leads/:id",
          description: "Delete a lead",
          parameters: [
            { name: "id", type: "string", description: "ID of the lead to delete", required: true },
          ],
          response: "Success message or error",
        },
        {
          method: "GET",
          path: "/api/leads/search?query=term",
          description: "Search leads by keyword",
          parameters: [
            { name: "query", type: "string", description: "Search term", required: true },
          ],
          response: "Array of matching lead objects",
        },

        // Payment Endpoints
        {
          method: "GET",
          path: "/api/payments",
          description: "Get all payments (with optional filters and pagination)",
          parameters: [
            { name: "page", type: "integer", description: "Page number for pagination", required: false },
            { name: "limit", type: "integer", description: "Number of payments per page", required: false },
            { name: "sort", type: "string", description: "Sort order (e.g., 'createdAt', '-amount')", required: false },
            { name: "status", type: "string", description: "Filter by payment status", required: false },
            // Add other potential query parameters for filtering
          ],
          response: "Array of payment objects",
        },
        {
          method: "GET",
          path: "/api/payments/lead/:leadId",
          description: "Get payments for a specific lead",
          parameters: [
            { name: "leadId", type: "string", description: "ID of the lead", required: true },
          ],
          response: "Array of payment objects for the lead",
        },
        {
          method: "POST",
          path: "/api/payments",
          description: "Create a new payment",
          requestBody: "Payment object in JSON format",
          response: "Newly created payment object",
        },
        {
          method: "PUT",
          path: "/api/payments/:id",
          description: "Update a payment",
          parameters: [
            { name: "id", type: "string", description: "ID of the payment to update", required: true },
          ],
          requestBody: "Updated payment object in JSON format",
          response: "Updated payment object",
        },
        {
          method: "DELETE",
          path: "/api/payments/:id",
          description: "Delete a payment",
          parameters: [
            { name: "id", type: "string", description: "ID of the payment to delete", required: true },
          ],
          response: "Success message or error",
        },

        // Settings Endpoints
        {
          method: "GET",
          path: "/api/settings",
          description: "Get all settings",
          response: "Array of setting objects",
        },
        {
          method: "GET",
          path: "/api/settings/:key",
          description: "Get setting by key",
          parameters: [
            { name: "key", type: "string", description: "Key of the setting", required: true },
          ],
          response: "Setting object",
        },
        {
          method: "PUT",
          path: "/api/settings/:key",
          description: "Update a setting",
          parameters: [
            { name: "key", type: "string", description: "Key of the setting to update", required: true },
          ],
          requestBody: "Updated setting value in JSON format (e.g., { value: 'new value' })",
          response: "Updated setting object",
        },

        // Form Endpoints
        {
          method: "GET",
          path: "/api/forms",
          description: "Get all forms (with optional filters and pagination)",
          parameters: [
            { name: "page", type: "integer", description: "Page number for pagination", required: false },
            { name: "limit", type: "integer", description: "Number of forms per page", required: false },
            { name: "sort", type: "string", description: "Sort order (e.g., 'createdAt', '-name')", required: false },
            // Add other potential query parameters for filtering
          ],
          response: "Array of form objects",
        },
        {
          method: "GET",
          path: "/api/forms/:id",
          description: "Get form by ID",
          parameters: [
            { name: "id", type: "string", description: "ID of the form", required: true },
          ],
          response: "Form object",
        },
        {
          method: "POST",
          path: "/api/forms",
          description: "Create a new form",
          requestBody: "Form object in JSON format",
          response: "Newly created form object",
        },
        {
          method: "PUT",
          path: "/api/forms/:id",
          description: "Update a form",
          parameters: [
            { name: "id", type: "string", description: "ID of the form to update", required: true },
          ],
          requestBody: "Updated form object in JSON format",
          response: "Updated form object",
        },
        {
          method: "DELETE",
          path: "/api/forms/:id",
          description: "Delete a form",
          parameters: [
            { name: "id", type: "string", description: "ID of the form to delete", required: true },
          ],
          response: "Success message or error",
        },
        {
          method: "GET",
          path: "/api/forms/search?query=term",
          description: "Search forms by keyword",
          parameters: [
            { name: "query", type: "string", description: "Search term", required: true },
          ],
          response: "Array of matching form objects",
        },
        {
          method: "POST",
          path: "/api/forms/:id/clone",
          description: "Clone a template form",
          parameters: [
            { name: "id", type: "string", description: "ID of the template form to clone", required: true },
          ],
          response: "Cloned form object",
        },
        {
          method: "POST",
          path: "/api/forms/:id/generate",
          description: "Generate form with lead data",
          parameters: [
            { name: "id", type: "string", description: "ID of the form to generate", required: true },
          ],
          requestBody: "Lead data object in JSON format",
          response: "Generated form data object",
        },
      ],
    },
  });
});

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/forms", formRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Freelance Lead Management API is now running on port ${PORT}`);
});