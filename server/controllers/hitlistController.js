const Hitlist = require('../models/Hitlist');
const Business = require('../models/Business');

// get all hitlists
exports.getHitlists = async (req, res) => {
  try {
    const hitlists = await Hitlist.find().sort({ lastModified: -1 });
    res.json(hitlists);
  } catch (error) {
    console.error('Error fetching hitlists:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// get specific hitlist
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

// create new hitlist
exports.createHitlist = async (req, res) => {
  try {
    const hitlist = new Hitlist({
      ...req.body,
      lastModified: new Date()  // explicitly set lastModified on creation
    });
    const savedHitlist = await hitlist.save();
    res.status(201).json(savedHitlist);
  } catch (error) {
    console.error('Error creating hitlist:', error);
    res.status(400).json({ message: error.message });
  }
};

// update hitlist
exports.updateHitlist = async (req, res) => {
  try {
    // add lastModified to the update data
    const updateData = {
      ...req.body,
      lastModified: new Date() // ensure lastModified is updated
    };
    
    const hitlist = await Hitlist.findByIdAndUpdate(
      req.params.id,
      updateData,
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

// delete hitlist
exports.deleteHitlist = async (req, res) => {
  try {
    const hitlist = await Hitlist.findById(req.params.id);
    if (!hitlist) {
      return res.status(404).json({ message: 'Hitlist not found' });
    }
    
    // delete all businesses associated with this hitlist
    await Business.deleteMany({ hitlistId: req.params.id });
    
    // delete the hitlist
    await Hitlist.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Hitlist and associated businesses deleted' });
  } catch (error) {
    console.error('Error deleting hitlist:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};