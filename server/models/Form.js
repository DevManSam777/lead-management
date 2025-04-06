// server/models/Form.js
const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['contract', 'proposal', 'invoice', 'agreement', 'other'],
    default: 'other'
  },
  isTemplate: {
    type: Boolean,
    default: false
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  variables: {
    type: [String],
    default: []
  }
});

// Pre-save middleware to update lastModified date
formSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  next();
});

// Helper method to extract variables from content
formSchema.methods.extractVariables = function() {
  // Extract variables with pattern {{variableName}}
  const variableRegex = /\{\{([^}]+)\}\}/g;
  const matches = [...this.content.matchAll(variableRegex)];
  
  // Extract just the variable names
  const variableSet = new Set(matches.map(match => match[1].trim()));
  
  // Convert Set to Array to eliminate duplicates
  this.variables = Array.from(variableSet);
  return this.variables;
};

module.exports = mongoose.model('Form', formSchema);