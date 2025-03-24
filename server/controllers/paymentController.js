// server/controllers/paymentController.js
const Payment = require('../models/Payment');
const Lead = require('../models/Lead');

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({}).sort({ dueDate: 1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get payments for a specific lead
exports.getPaymentsByLead = async (req, res) => {
  try {
    const payments = await Payment.find({ leadId: req.params.leadId }).sort({ dueDate: 1 });
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const createdPayment = await payment.save();
    
    // Update lead's paid amount and payment status
    await updateLeadPaymentInfo(payment.leadId);
    
    res.status(201).json(createdPayment);
  } catch (error) {
    console.error(error);
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
    
    // Update payment
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    // Update lead's paid amount and payment status
    await updateLeadPaymentInfo(payment.leadId);
    
    res.json(updatedPayment);
  } catch (error) {
    console.error(error);
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
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

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
    const remainingBalance = Math.max(0, totalBudget - paidAmount);
    
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

// Update all payment statuses based on due dates
exports.updatePaymentStatuses = async (req, res) => {
  try {
    const now = new Date();
    
    // Find scheduled payments that are past due
    const latePayments = await Payment.find({
      status: 'scheduled',
      dueDate: { $lt: now }
    });
    
    // Update them to 'late'
    for (const payment of latePayments) {
      payment.status = 'late';
      await payment.save();
      
      // Update corresponding lead
      await updateLeadPaymentInfo(payment.leadId);
    }
    
    res.json({ 
      message: `${latePayments.length} payments updated to 'late' status` 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};