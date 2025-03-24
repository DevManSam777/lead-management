const mongoose = require("mongoose");

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
  businessName: {
    type: String,
  },
  businessPhone: {
    type: String,
  },
  businessEmail: {
    type: String,
  },
  businessServices: {
    type: String,
  },
  preferredContact: {
    type: String,
    enum: ["phone", "businessPhone", "email", "text", "businessEmail"],
  },
  serviceDesired: {
    type: String,
    enum: ["website", "app"],
    default: "website",
  },
  hasWebsite: {
    type: String,
    enum: ["yes", "no"],
  },
  websiteAddress: {
    type: String,
  },
  message: {
    type: String,
  },
  status: {
    type: String,
    default: "new",
    enum: ["new", "contacted", "in-progress", "closed-won", "closed-lost"],
  },
  notes: {
    type: String,
  },
  budget: {
    type: Number,
  },
  budgetCurrency: {
    type: String,
    default: "USD",
  },
  totalBudget: {
    type: Number,
  },
  paidAmount: {
    type: Number,
    default: 0,
  },
  remainingBalance: {
    type: Number,
    default: 0,
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "CAD", "EUR", "GBP", "AUD", "🍕"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastContactedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("Lead", leadSchema);
