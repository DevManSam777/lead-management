// server/models/Lead.js
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
  phoneExt: {
    type: String,
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
  businessPhoneExt: {
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastContactedAt: {
    type: Date,
  },
  // Add the associatedForms field to track forms related to this lead
  associatedForms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Form'
  }],
  // This field is only used for distinguishing form submissions from dashboard creations
  // It will not be stored but used in controller logic
  isFormSubmission: {
    type: Boolean,
    select: false, // Exclude from query results by default
  }
});

leadSchema.pre('deleteOne', { document: false, query: true }, async function() {
  // Get the document that's about to be deleted
  const leadId = this.getFilter()._id;
  
  // Delete all payments for this lead
  await mongoose.model('Payment').deleteMany({ leadId: leadId });
  console.log(`Automatically deleted payments for lead ${leadId}`);
});

// Make sure we also handle remove() method if it's used anywhere
leadSchema.pre('remove', async function() {
  // Delete all payments for this lead
  await mongoose.model('Payment').deleteMany({ leadId: this._id });
  console.log(`Automatically deleted payments for lead ${this._id}`);
});

module.exports = mongoose.model("Lead", leadSchema);