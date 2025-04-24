const mongoose = require('mongoose');
const Form = require('../models/Form');
const formSeeds = require('../data/formSeeds');

async function seedForms() {
  try {
    console.log('Checking for existing form templates...');
    
    // Check if we already have templates
    const existingCount = await Form.countDocuments({ isTemplate: true });
    
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} form templates. Skipping seed.`);
      return false;
    }
    
    // Clear existing forms first (optional, only if you want to reset)
    // await Form.deleteMany({ isTemplate: true });
    
    // Insert our seed data
    console.log('Seeding form templates...');
    
    // Process seeds to ensure variables are extracted
    const processedSeeds = formSeeds.map(seed => {
      const form = new Form(seed);
      form.extractVariables();
      return form;
    });
    
    // Insert all seeds
    await Form.insertMany(processedSeeds);
    
    console.log(`Successfully seeded ${formSeeds.length} form templates`);
    return true;
  } catch (error) {
    console.error('Error seeding forms:', error);
    return false;
  }
}

async function forceReseed() {
    try {
      console.log('Force reseeding form templates...');
      
      // Delete existing template forms
      const deleteResult = await Form.deleteMany({ isTemplate: true });
      console.log(`Deleted ${deleteResult.deletedCount} existing form templates`);
      
      // Process seeds to ensure variables are extracted
      const processedSeeds = formSeeds.map(seed => {
        const form = new Form(seed);
        form.extractVariables();
        return form;
      });
      
      // Insert all seeds
      await Form.insertMany(processedSeeds);
      
      console.log(`Successfully reseeded ${formSeeds.length} form templates`);
      return true;
    } catch (error) {
      console.error('Error force reseeding forms:', error);
      return false;
    }
  }
  
  // Make it available for export
  module.exports = {
    seedForms,
    forceReseed
  };