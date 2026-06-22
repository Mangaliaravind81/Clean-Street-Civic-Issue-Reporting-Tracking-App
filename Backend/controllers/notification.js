const Notification = require("../models/notification");
const Complaint = require("../models/complaint");
const User = require("../models/user");

// Helper for distance (km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user_id: req.user.id })
      .sort({ created_at: -1 })
      .limit(20);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true },
    );
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user_id: req.user.id, is_read: false },
      { is_read: true },
    );
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.escalateStaleComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    if (complaint.assigned_to) {
      return res
        .status(400)
        .json({ success: false, message: "Complaint is already assigned" });
    }

    if (complaint.escalation_level !== "admin") {
      // Notify Admin directly
      const admins = await User.find({ role: "admin" });
      const notifications = admins.map((a) => ({
        user_id: a._id,
        complaint_id: complaint._id,
        message: `ESCALATED: Complaint "${complaint.title}" has been unassigned for over a week. Action required.`,
      }));

      await Notification.insertMany(notifications);
      complaint.escalation_level = "admin";
      await complaint.save();

      return res.json({
        success: true,
        message: "Complaint escalated to administrators.",
      });
    }

    res
      .status(400)
      .json({
        success: false,
        message: "Already escalated to administrators.",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
