const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const leadRoutes = require("./routes/leadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

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
    documentation: {
      description: "LEADS REST API",
      endpoints: [
        {
          method: "GET",
          path: "/api/leads",
          description: "Get all leads",
        },
        {
          method: "GET",
          path: "/api/leads/:id",
          description: "Get lead by ID",
        },
        {
          method: "POST",
          path: "/api/leads",
          description: "Create a new lead",
        },
        {
          method: "PUT",
          path: "/api/leads/:id",
          description: "Update a lead",
        },
        {
          method: "DELETE",
          path: "/api/leads/:id",
          description: "Delete a lead",
        },
        {
          method: "GET",
          path: "/api/leads/search?query=term",
          description: "Search leads with query parameter",
        },
        {
          method: "GET",
          path: "/api/payments",
          description: "Get all payments",
        },
        {
          method: "GET",
          path: "/api/payments/lead/:leadId",
          description: "Get payments for a specific lead",
        },
        {
          method: "POST",
          path: "/api/payments",
          description: "Create a new payment",
        },
        {
          method: "PUT",
          path: "/api/payments/:id",
          description: "Update a payment",
        },
        {
          method: "DELETE",
          path: "/api/payments/:id",
          description: "Delete a payment",
        },
      ],
    },
  });
});

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/payments", paymentRoutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Freelance Lead Management API is now running on port ${PORT}`);
});
