const Complaint = require("../models/complaint");
const User = require("../models/user");
const AdminLog = require("../models/adminlog");

exports.getAnalytics = async (req, res) => {
  try {
    // Basic metrics
    const totalComplaints = await Complaint.countDocuments();
    const resolvedComplaints = await Complaint.countDocuments({ status: "resolved" });
    const pendingComplaints = await Complaint.countDocuments({ status: "received" });
    const inReviewComplaints = await Complaint.countDocuments({ status: "in_review" });
    const totalUsers = await User.countDocuments();
    const totalVolunteers = await User.countDocuments({ role: "volunteer" });

    // Time-based resolutions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const resolvedToday = await Complaint.countDocuments({ 
      status: "resolved", 
      updated_at: { $gt: startOfDay } 
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const resolvedThisMonth = await Complaint.countDocuments({ 
      status: "resolved", 
      updated_at: { $gt: startOfMonth } 
    });

    // Recent Admin Logs
    const recentLogs = await AdminLog.find()
      .populate("user_id", "name email")
      .sort({ timestamp: -1 })
      .limit(10);

    res.json({
      success: true,
      metrics: {
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        inReviewComplaints,
        totalUsers,
        totalVolunteers,
        resolvedToday,
        resolvedThisMonth,
      },
      categoryDistribution: await Complaint.aggregate([
        { $group: { _id: "$issue_type", count: { $sum: 1 } } }
      ]),
      statusDistribution: await Complaint.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      recentLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.exportComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user_id", "name email")
      .populate("assigned_to", "name email")
      .sort({ created_at: -1 })
      .lean();

    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
