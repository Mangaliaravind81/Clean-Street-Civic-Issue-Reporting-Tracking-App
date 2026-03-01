const Complaint = require("../models/complaint");

exports.createComplaint = async (req, res) => {
  try {
    console.log(req.body);
    const complaint = await Complaint.create({
      title: req.body.title,
      // postedBy: req.body.postedBy || "Anonymous",
      postedBy: req.body.postedBy,
      priority: req.body.priority,
      issueType: req.body.issueType,
      address: req.body.address,
      description: req.body.description,

      latitude: req.body.latitude,
      longitude: req.body.longitude,

      images: req.body.images || [],
      likes: 0,
      unlikes: 0,
      comments: [],
          });

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (err) {

    res.status(500).json({ success: false });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("postedBy", "name email")
      .populate("comments.postedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.likeComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!complaint)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, likes: complaint.likes });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.unlikeComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $inc: { unlikes: 1 } },
      { new: true }
    );

    if (!complaint)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, unlikes: complaint.unlikes });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.addComment = async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id);
    if (!c) return res.status(404).json({ success: false });
    
    c.comments.push({
      text: req.body.text,
      postedBy: req.body.postedBy, // Send user ID from frontend
    });
    await c.save();

    res.json({ success: true, comments: c.comments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.deleteComplaint = async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
};
