const Hitlist = require('../models/Hitlist');
const Business = require('../models/Business');

// Get all hitlists
exports.getHitlists = async (req, res) => {
  try {
    const hitlists = await Hitlist.find().sort({ lastModified: -1 });
    res.json(hitlists);
  } catch (error) {
    console.error('Error fetching hitlists:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get specific hitlist
exports.getHitlistById = async (req, res) => {
  try {
    const hitlist = await Hitlist.findById(req.params.id).populate('businesses');
    if (!hitlist) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }
    res.json(hitlist);
  } catch (error) {
    console.error('Error fetching hitlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create new hitlist
exports.createHitlist = async (req, res) => {
  try {
    const hitlist = new Hitlist(req.body);
    const savedHitlist = await hitlist.save();
    res.status(201).json(savedHitlist);
  } catch (error) {
    console.error('Error creating hitlist:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update hitlist
exports.updateHitlist = async (req, res) => {
  try {
    const hitlist = await Hitlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!hitlist) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }
    res.json(hitlist);
  } catch (error) {
    console.error('Error updating hitlist:', error);
    res.status(400).json({ message: error.message });
  }
};

// Delete hitlist
exports.deleteHitlist = async (req, res) => {
  try {
    const hitlist = await Hitlist.findById(req.params.id);
    if (!hitlist) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }
    
    // Delete all businesses associated with this hitlist
    await Business.deleteMany({ hitlistId: req.params.id });
    
    // Delete the hitlist
    await Hitlist.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Hitlist and associated businesses deleted' });
  } catch (error) {
    console.error('Error deleting hitlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};