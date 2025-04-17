const Document = require('../models/Document');
const Lead = require('../models/Lead');

// Get all documents for a lead
exports.getDocumentsByLead = async (req, res) => {
  try {
    const { leadId } = req.params;
    
    // Find documents without loading the file data
    const documents = await Document.find({ leadId })
      .select('-fileData')
      .sort({ uploadedAt: -1 });
    
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.getDocumentById = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Set appropriate headers for PDF with security headers
    res.set({
      'Content-Type': document.fileType,
      'Content-Disposition': `inline; filename="${document.fileName}"`,
      'Content-Length': document.fileData.length,
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';"
    });
    
    // Send the file data
    res.send(document.fileData);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Upload a new document
exports.uploadDocument = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { fileName, fileType, fileSize, fileData } = req.body;
    
    // Verify lead exists
    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    
    // Convert base64 string to buffer
    const buffer = Buffer.from(fileData.split(',')[1], 'base64');
    
    // Create new document
    const document = new Document({
      leadId,
      fileName,
      fileType,
      fileSize,
      fileData: buffer
    });
    
    // Save document
    const savedDocument = await document.save();
    
    // Return document info without file data
    const documentInfo = {
      _id: savedDocument._id,
      leadId: savedDocument.leadId,
      fileName: savedDocument.fileName,
      fileType: savedDocument.fileType,
      fileSize: savedDocument.fileSize,
      uploadedAt: savedDocument.uploadedAt
    };
    
    res.status(201).json(documentInfo);
  } catch (error) {
    console.error('Error uploading document:', error);
    
    // Handle size limit errors
    if (error.name === 'PayloadTooLargeError') {
      return res.status(413).json({ message: 'Document is too large' });
    }
    
    res.status(400).json({ message: error.message });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    await Document.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Document removed' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};