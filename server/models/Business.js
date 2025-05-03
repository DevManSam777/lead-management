const mongoose = require("mongoose");

const businessSchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true,
  },
  typeOfBusiness: {
    type: String,
    trim: true,
  },
  contactName: {
    type: String,
    trim: true,
  },
  businessPhone: {
    type: String,
    trim: true,
  },
  businessPhoneExt: {
    type: String,
    trim: true,
  },
  businessEmail: {
    type: String,
    trim: true,
  },
  hasWebsite: {
    type: Boolean,
    default: false,
  },
  websiteUrl: {
    type: String,
    trim: true,
  },
  address: {
    street: {
      type: String,
      trim: true,
    },
    aptUnit: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
  },
  lastContactedDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: [
      "not-contacted",
      "contacted",
      "follow-up",
      "not-interested",
      "converted",
    ],
    default: "not-contacted",
  },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
  notes: {
    type: String,
    trim: true,
  },
  hitlistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hitlist",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
});

businessSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

module.exports = mongoose.model("Business", businessSchema);
