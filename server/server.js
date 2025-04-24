const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const leadRoutes = require("./routes/leadRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const settingRoutes = require("./routes/settingRoutes");
const formRoutes = require("./routes/formRoutes");
const documentRoutes = require("./routes/documentRoutes");
const hitlistRoutes = require("./routes/hitlistRoutes");
const { seedForms } = require('./utils/seeder');

// Load environment variables
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins during development
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  // For PDF and document endpoints, add specific headers
  if (req.path.startsWith("/api/documents/")) {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
  }
  next();
});

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
    documentEndpoints: {
      allDocumentsByLead: `http://localhost:${PORT}/api/documents/lead/:leadId`,
      documentById: `http://localhost:${PORT}/api/documents/:id`,
      uploadDocument: `http://localhost:${PORT}/api/documents/lead/:leadId`,
      deleteDocument: `http://localhost:${PORT}/api/documents/:id`,
    },
    hitlistEndpoints: {
      allHitlists: `http://localhost:${PORT}/api/hitlists`,
      hitlistById: `http://localhost:${PORT}/api/hitlists/:id`,
      createHitlist: `http://localhost:${PORT}/api/hitlists`,
      updateHitlist: `http://localhost:${PORT}/api/hitlists/:id`,
      deleteHitlist: `http://localhost:${PORT}/api/hitlists/:id`,
      businessesByHitlist: `http://localhost:${PORT}/api/hitlists/:hitlistId/businesses`,
      createBusiness: `http://localhost:${PORT}/api/hitlists/:hitlistId/businesses`,
      updateBusiness: `http://localhost:${PORT}/api/hitlists/businesses/:id`,
      deleteBusiness: `http://localhost:${PORT}/api/hitlists/businesses/:id`,
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
            {
              name: "page",
              type: "integer",
              description: "Page number for pagination",
              required: false,
            },
            {
              name: "limit",
              type: "integer",
              description: "Number of leads per page",
              required: false,
            },
            {
              name: "sort",
              type: "string",
              description: "Sort order (e.g., 'createdAt', '-name')",
              required: false,
            },
            {
              name: "status",
              type: "string",
              description: "Filter by lead status",
              required: false,
            },
          ],
          response: "Array of lead objects",
        },
        {
          method: "GET",
          path: "/api/leads/:id",
          description: "Get lead by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the lead",
              required: true,
            },
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
            {
              name: "id",
              type: "string",
              description: "ID of the lead to update",
              required: true,
            },
          ],
          requestBody: "Updated lead object in JSON format",
          response: "Updated lead object",
        },
        {
          method: "DELETE",
          path: "/api/leads/:id",
          description: "Delete a lead",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the lead to delete",
              required: true,
            },
          ],
          response: "Success message or error",
        },
        {
          method: "GET",
          path: "/api/leads/search?query=term",
          description: "Search leads by keyword",
          parameters: [
            {
              name: "query",
              type: "string",
              description: "Search term",
              required: true,
            },
          ],
          response: "Array of matching lead objects",
        },

        // Payment Endpoints
        {
          method: "GET",
          path: "/api/payments",
          description:
            "Get all payments (with optional filters and pagination)",
          parameters: [
            {
              name: "page",
              type: "integer",
              description: "Page number for pagination",
              required: false,
            },
            {
              name: "limit",
              type: "integer",
              description: "Number of payments per page",
              required: false,
            },
            {
              name: "sort",
              type: "string",
              description: "Sort order (e.g., 'createdAt', '-amount')",
              required: false,
            },
            {
              name: "status",
              type: "string",
              description: "Filter by payment status",
              required: false,
            },
          ],
          response: "Array of payment objects",
        },
        {
          method: "GET",
          path: "/api/payments/lead/:leadId",
          description: "Get payments for a specific lead",
          parameters: [
            {
              name: "leadId",
              type: "string",
              description: "ID of the lead",
              required: true,
            },
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
            {
              name: "id",
              type: "string",
              description: "ID of the payment to update",
              required: true,
            },
          ],
          requestBody: "Updated payment object in JSON format",
          response: "Updated payment object",
        },
        {
          method: "DELETE",
          path: "/api/payments/:id",
          description: "Delete a payment",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the payment to delete",
              required: true,
            },
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
            {
              name: "key",
              type: "string",
              description: "Key of the setting",
              required: true,
            },
          ],
          response: "Setting object",
        },
        {
          method: "PUT",
          path: "/api/settings/:key",
          description: "Update a setting",
          parameters: [
            {
              name: "key",
              type: "string",
              description: "Key of the setting to update",
              required: true,
            },
          ],
          requestBody:
            "Updated setting value in JSON format (e.g., { value: 'new value' })",
          response: "Updated setting object",
        },
        // Form Endpoints
        {
          method: "GET",
          path: "/api/forms",
          description: "Get all forms (with optional filters and pagination)",
          parameters: [
            {
              name: "page",
              type: "integer",
              description: "Page number for pagination",
              required: false,
            },
            {
              name: "limit",
              type: "integer",
              description: "Number of forms per page",
              required: false,
            },
            {
              name: "sort",
              type: "string",
              description: "Sort order (e.g., 'createdAt', '-name')",
              required: false,
            },
          ],
          response: "Array of form objects",
        },
        {
          method: "GET",
          path: "/api/forms/:id",
          description: "Get form by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the form",
              required: true,
            },
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
            {
              name: "id",
              type: "string",
              description: "ID of the form to update",
              required: true,
            },
          ],
          requestBody: "Updated form object in JSON format",
          response: "Updated form object",
        },
        {
          method: "DELETE",
          path: "/api/forms/:id",
          description: "Delete a form",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the form to delete",
              required: true,
            },
          ],
          response: "Success message or error",
        },
        {
          method: "GET",
          path: "/api/forms/search?query=term",
          description: "Search forms by keyword",
          parameters: [
            {
              name: "query",
              type: "string",
              description: "Search term",
              required: true,
            },
          ],
          response: "Array of matching form objects",
        },
        {
          method: "POST",
          path: "/api/forms/:id/clone",
          description: "Clone a template form",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the template form to clone",
              required: true,
            },
          ],
          response: "Cloned form object",
        },
        {
          method: "POST",
          path: "/api/forms/:id/generate",
          description: "Generate form with lead data",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the form to generate",
              required: true,
            },
          ],
          requestBody: "Lead data object in JSON format",
          response: "Generated form data object",
        },
        // documents (pdf uploads) endpoints
        {
          method: "GET",
          path: "/api/documents/lead/:leadId",
          description: "Get all documents associated with a specific lead.",
          parameters: [
            {
              name: "leadId",
              type: "string",
              description: "Unique ID of the lead",
              required: true,
            },
          ],
          response: "JSON array of document metadata objects.",
          exampleResponse:
            "[{ _id: '...', lead: ':leadId', filename: '...', uploadDate: '...', size: '...', mimetype: '...', url: '...' }]", // Example placeholder
        },
        {
          method: "GET",
          path: "/api/documents/:id",
          description:
            "Retrieve or download a specific document by its unique ID.",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "Unique ID of the document",
              required: true,
            },
          ],
          response:
            "File content or a redirect to the file's storage location.",
          exampleResponse: "Binary file data (e.g., PDF, image) or a redirect.", 
        },
        {
          method: "POST",
          path: "/api/documents/lead/:leadId",
          description: "Upload a new document for a specific lead.",
          parameters: [
            {
              name: "leadId",
              type: "string",
              description:
                "Unique ID of the lead to associate the document with",
              required: true,
            },
          ],
          requestBody: {
            type: "multipart/form-data", // File uploads typically use multipart/form-data
            description: "Form data containing the file to upload.",
            schema:
              "File data under a specific form field name (e.g., 'document')", // Example field name
          },
          response:
            "JSON object confirming the upload and returning document metadata.",
          exampleResponse:
            "{ message: 'Document uploaded successfully', document: { _id: '...', filename: '...', ... } }", // Example placeholder
        },
        {
          method: "DELETE",
          path: "/api/documents/:id",
          description: "Delete a specific document by its unique ID.",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "Unique ID of the document to delete",
              required: true,
            },
          ],
          response: "JSON success message or error.",
          exampleResponse: "{ message: 'Document deleted successfully' }", // Example placeholder
        },
        // Hitlist Endpoints
        {
          method: "GET",
          path: "/api/hitlists",
          description: "Get all hitlists",
          response: "Array of hitlist objects"
        },
        {
          method: "GET",
          path: "/api/hitlists/:id",
          description: "Get specific hitlist by ID",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the hitlist",
              required: true
            }
          ],
          response: "Hitlist object"
        },
        {
          method: "POST",
          path: "/api/hitlists",
          description: "Create a new hitlist",
          requestBody: "Hitlist object in JSON format",
          response: "Newly created hitlist object"
        },
        {
          method: "PUT",
          path: "/api/hitlists/:id",
          description: "Update a hitlist",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the hitlist to update",
              required: true
            }
          ],
          requestBody: "Updated hitlist object in JSON format",
          response: "Updated hitlist object"
        },
        {
          method: "DELETE",
          path: "/api/hitlists/:id",
          description: "Delete a hitlist",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the hitlist to delete",
              required: true
            }
          ],
          response: "Success message or error"
        },
        {
          method: "GET",
          path: "/api/hitlists/:hitlistId/businesses",
          description: "Get all businesses for a specific hitlist",
          parameters: [
            {
              name: "hitlistId",
              type: "string",
              description: "ID of the hitlist",
              required: true
            }
          ],
          response: "Array of business objects"
        },
        {
          method: "POST",
          path: "/api/hitlists/:hitlistId/businesses",
          description: "Create a new business for a hitlist",
          parameters: [
            {
              name: "hitlistId",
              type: "string",
              description: "ID of the hitlist",
              required: true
            }
          ],
          requestBody: "Business object in JSON format",
          response: "Newly created business object"
        },
        {
          method: "PUT",
          path: "/api/hitlists/businesses/:id",
          description: "Update a business",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the business to update",
              required: true
            }
          ],
          requestBody: "Updated business object in JSON format",
          response: "Updated business object"
        },
        {
          method: "DELETE",
          path: "/api/hitlists/businesses/:id",
          description: "Delete a business",
          parameters: [
            {
              name: "id",
              type: "string",
              description: "ID of the business to delete",
              required: true
            }
          ],
          response: "Success message or error"
        }
      ],
    },
  });
});

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/hitlists", hitlistRoutes);

// Start the server
// app.listen(PORT, () => {
//   console.log(`Freelance Lead Management API is now running on port ${PORT}`);
// });

connectDB().then(async () => {
  // Seed the database with initial forms if needed
  await seedForms();
  
  // Start the server
  app.listen(PORT, () => {
    console.log(`Freelance Lead Management API is now running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection failed:', err);
  process.exit(1);
});