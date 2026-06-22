const Feedback = require("../models/feedback");
const Complaint = require("../models/complaint");

exports.createFeedback = async (req, res) => {
  try {
    const { complaint_id, volunteer_id, rating, description, feedback_type } =
      req.body;

    if (feedback_type === "app") {
      const feedback = await Feedback.create({
        user_id: req.user.id,
        feedback_type: "app",
        rating,
        description,
      });
      return res.status(201).json({ success: true, feedback });
    }

    const complaint = await Complaint.findById(complaint_id);
    if (!complaint) {
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    if (complaint.user_id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Only the reporter can give feedback for this complaint.",
        });
    }

    const existingFeedback = await Feedback.findOne({
      complaint_id,
      user_id: req.user.id,
    });
    if (existingFeedback) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Feedback already submitted for this complaint.",
        });
    }

    const feedback = await Feedback.create({
      user_id: req.user.id,
      volunteer_id,
      complaint_id,
      rating,
      description,
    });

    res.status(201).json({ success: true, feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getVolunteerFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ volunteer_id: req.user.id })
      .populate("user_id", "name profile_photo email")
      .populate(
        "complaint_id",
        "title description status photo location_coords address priority created_at user_id assigned_to",
      )
      .sort({ created_at: -1 });

    res.json({ success: true, feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAppFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      user_id: req.user.id,
      feedback_type: "app",
    }).sort({ created_at: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getUserFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      user_id: req.user.id,
      volunteer_id: { $exists: true },
    })
      .populate("volunteer_id", "name email")
      .populate("complaint_id", "title status issue_type")
      .sort({ created_at: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllAppFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ feedback_type: "app" })
      .populate("user_id", "name email")
      .sort({ created_at: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllVolunteerFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ volunteer_id: { $exists: true } })
      .populate("user_id", "name email")
      .populate("volunteer_id", "name")
      .populate(
        "complaint_id",
        "title description status photo location_coords address priority",
      )
      .sort({ created_at: -1 });
    res.json({ success: true, feedbacks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
