const Zone = require("../models/zone");

exports.createZone = async (req, res) => {
  try {
    const zone = new Zone(req.body);
    await zone.save();
    res.json({ success: true, zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getZones = async (req, res) => {
  try {
    const zones = await Zone.find().sort({ created_at: -1 });
    res.json({ success: true, zones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });
    res.json({ success: true, zone });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteZone = async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ success: false, message: "Zone not found" });
    res.json({ success: true, message: "Zone deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
