const Business = require("../models/Business");
const Hitlist = require("../models/Hitlist");

// Get all businesses for a hitlist
exports.getBusinessesByHitlist = async (req, res) => {
  try {
    const businesses = await Business.find({
      hitlistId: req.params.hitlistId,
    }).sort({ lastModified: -1 });
    res.json(businesses);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create business
exports.createBusiness = async (req, res) => {
  try {
    const business = new Business({
      ...req.body,
      hitlistId: req.params.hitlistId,
    });

    const savedBusiness = await business.save();

    // Add business reference to hitlist and update the lastModified field
    await Hitlist.findByIdAndUpdate(req.params.hitlistId, {
      $push: { businesses: savedBusiness._id },
      $set: { lastModified: new Date() },
    });

    res.status(201).json(savedBusiness);
  } catch (error) {
    console.error("Error creating business:", error);
    res.status(400).json({ message: error.message });
  }
};

// Update business
exports.updateBusiness = async (req, res) => {
  try {
    const business = await Business.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Update the lastModified field of the hitlist
    await Hitlist.findByIdAndUpdate(business.hitlistId, {
      $set: { lastModified: new Date() },
    });

    res.json(business);
  } catch (error) {
    console.error("Error updating business:", error);
    res.status(400).json({ message: error.message });
  }
};

// Delete business
exports.deleteBusiness = async (req, res) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    // Remove business reference from hitlist
    await Hitlist.findByIdAndUpdate(business.hitlistId, {
      $pull: { businesses: req.params.id },
    });

    // Update the lastModified field of the hitlist
    await Hitlist.findByIdAndUpdate(business.hitlistId, {
      $set: { lastModified: new Date() },
    });

    // Delete the business
    await Business.deleteOne({ _id: req.params.id });

    res.json({ message: "Business deleted" });
  } catch (error) {
    console.error("Error deleting business:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
