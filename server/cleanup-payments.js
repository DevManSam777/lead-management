// server/cleanup-payments.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Payment = require('./models/Payment');
const Lead = require('./models/Lead');

// Load environment variables
dotenv.config();

async function cleanupOrphanedPayments() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB for cleanup');
    
    // Get all leads to check against
    const leads = await Lead.find({}, '_id');
    const validLeadIds = new Set(leads.map(lead => lead._id.toString()));
    
    console.log(`Found ${leads.length} valid leads in the database`);
    
    // Find all payments
    const payments = await Payment.find({});
    console.log(`Found ${payments.length} total payments in the database`);
    
    // Identify orphaned payments
    const orphanedPayments = payments.filter(payment => !validLeadIds.has(payment.leadId.toString()));
    console.log(`Found ${orphanedPayments.length} orphaned payments (payments referencing non-existent leads)`);
    
    if (orphanedPayments.length === 0) {
      console.log('No orphaned payments found. Nothing to clean up.');
      await mongoose.connection.close();
      return;
    }
    
    // Provide summary of orphaned payments by lead
    const orphanedLeadIds = {};
    orphanedPayments.forEach(payment => {
      const leadId = payment.leadId.toString();
      if (!orphanedLeadIds[leadId]) {
        orphanedLeadIds[leadId] = {
          count: 0,
          total: 0,
          paymentIds: []
        };
      }
      
      orphanedLeadIds[leadId].count++;
      orphanedLeadIds[leadId].total += payment.amount || 0;
      orphanedLeadIds[leadId].paymentIds.push(payment._id.toString());
    });
    
    console.log('\nOrphaned payments by missing lead:');
    for (const [leadId, data] of Object.entries(orphanedLeadIds)) {
      console.log(`Missing lead ${leadId}: ${data.count} payments, total value: ${data.total}`);
    }
    
    // Ask for confirmation before deleting
    console.log('\nWARNING: This will permanently delete all orphaned payments.');
    console.log('To proceed, type "DELETE" and press Enter.');
    console.log('To exit without making changes, press Enter or type anything else.');
    
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('> ', async (answer) => {
      if (answer.trim() === 'DELETE') {
        console.log(`Deleting ${orphanedPayments.length} orphaned payments...`);
        
        // Get the IDs of orphaned payments for deletion
        const orphanedIds = orphanedPayments.map(payment => payment._id);
        
        // Delete orphaned payments
        const result = await Payment.deleteMany({ _id: { $in: orphanedIds } });
        
        console.log(`Deleted ${result.deletedCount} orphaned payments successfully.`);
      } else {
        console.log('Operation cancelled. No payments were deleted.');
      }
      
      readline.close();
      await mongoose.connection.close();
      console.log('Database connection closed');
    });
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    try {
      await mongoose.connection.close();
    } catch (e) {
      // Ignore error on closing
    }
    process.exit(1);
  }
}

// Run the cleanup
cleanupOrphanedPayments();