// server/controllers/paymentController.js
const Payment = require('../models/Payment');
const Lead = require('../models/Lead');

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    // Sort by paymentDate in descending order (newest first)
    const payments = await Payment.find({}).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get payments for a specific lead
exports.getPaymentsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    if (!leadId) {
      return res.status(400).json({ message: 'Lead ID is required' });
    }
    
    // Strict query by leadId, sort newest first
    const payments = await Payment.find({ leadId: leadId.toString() }).sort({ paymentDate: -1 });
    console.log(`Found ${payments.length} payments for lead ${leadId}`);
    
    res.json(payments);
  } catch (error) {
    console.error(`Error fetching payments for lead ${req.params.leadId}:`, error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    // Make sure we have a payment date that's at noon to avoid timezone issues
    let paymentData = req.body;
    
    // Convert paymentDate string to a Date object if it's not already
    if (typeof paymentData.paymentDate === 'string') {
      const dateObj = new Date(paymentData.paymentDate);
      dateObj.setHours(12, 0, 0, 0); // Set to noon to prevent timezone issues
      paymentData.paymentDate = dateObj;
    }
    
    const payment = new Payment(paymentData);
    const createdPayment = await payment.save();
    
    // Update lead's paid amount and payment status
    await updateLeadPaymentInfo(payment.leadId);
    
    res.status(201).json(createdPayment);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Make sure we have a payment date that's at noon to avoid timezone issues
    let paymentData = req.body;
    
    // Convert paymentDate string to a Date object if it's not already
    if (typeof paymentData.paymentDate === 'string') {
      const dateObj = new Date(paymentData.paymentDate);
      dateObj.setHours(12, 0, 0, 0); // Set to noon to prevent timezone issues
      paymentData.paymentDate = dateObj;
    }
    
    // Update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      paymentData,
      { new: true }
    );
    
    // Update lead's paid amount and payment status
    await updateLeadPaymentInfo(payment.leadId);
    
    res.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const leadId = payment.leadId;
    
    // Delete payment
    await Payment.deleteOne({ _id: req.params.id });
    
    // Update lead's paid amount and payment status
    await updateLeadPaymentInfo(leadId);
    
    res.json({ message: 'Payment removed' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Helper function to update lead payment info
async function updateLeadPaymentInfo(leadId) {
  try {
    // Get all payments for the lead
    const payments = await Payment.find({ leadId });
    
    // Calculate total paid amount
    const paidAmount = payments.reduce((total, payment) => total + payment.amount, 0);
    
    // Get the lead
    const lead = await Lead.findById(leadId);
    
    if (!lead) {
      throw new Error('Lead not found');
    }
    
    // Calculate remaining balance
    const totalBudget = lead.totalBudget || 0;
    const remainingBalance = totalBudget - paidAmount;
    
    // Update lead with payment-related fields
    await Lead.findByIdAndUpdate(leadId, { 
      paidAmount,
      remainingBalance
    });
    
    return { paidAmount, remainingBalance };
  } catch (error) {
    console.error('Error updating lead payment info:', error);
    throw error;
  }
}