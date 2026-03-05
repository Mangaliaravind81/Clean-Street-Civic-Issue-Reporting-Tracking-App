const Complaint = require("../models/complaint");
const AdminLog = require("../models/adminlog");
const User = require("../models/user");

exports.createComplaint = async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      location_coords,
      address,
      issue_type,
      priority,
      landmark,
    } = req.body;

    console.log("Creating complaint for user:", user_id);
    
    // Validate user_id - common source of CastErrors if null/empty
    if (!user_id || user_id === "null" || user_id === "undefined") {
      console.error("Submission failed: Missing or invalid user_id");
      return res.status(400).json({ 
        success: false, 
        message: "You must be logged in to submit a complaint. Please logout and login again." 
      });
    }

    // Support image upload from routes
    let photo = req.body.photo || [];
    if (req.body.images && req.body.images.length > 0) {
      photo = req.body.images;
    }
    
    const complaint = await Complaint.create({
      user_id,
      title,
      description,
      photo,
      location_coords,
      address,
      issue_type,
      priority,
      landmark,
      status: "received",
    });

    console.log("Complaint created successfully:", complaint._id);

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (err) {
    console.error("Complaint creation error:", err);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to save complaint to database" 
    });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user_id", "name email profile_photo")
      .populate("assigned_to", "name email")
      .populate("rejected_by", "name")
      .sort({ created_at: -1 })
      .lean();

    const Vote = require("../models/vote");
    const Comment = require("../models/comments");

    const complaintsWithStats = await Promise.all(
      complaints.map(async (c) => {
        const upvotes = await Vote.countDocuments({
          complaint_id: c._id,
          vote_type: "upvote",
        });
        const downvotes = await Vote.countDocuments({
          complaint_id: c._id,
          vote_type: "downvote",
        });
        const comments = await Comment.find({ complaint_id: c._id })
          .populate("user_id", "name profile_photo")
          .sort({ timestamp: -1 })
          .lean();

        return {
          ...c,
          upvotes,
          downvotes,
          comments,
        };
      }),
    );

    res.json({ success: true, complaints: complaintsWithStats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("user_id", "name email profile_photo")
      .populate("assigned_to", "name email")
      .populate("rejected_by", "name");
    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    res.json({ success: true, complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Note: Like/Unlike and AddComment are moved to separate controllers (Vote, Comment) in Module C.
// But we keep basic Update/Delete here for Module A.

exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    // Permission Check: Admin or Owner
    const isAdmin = req.user.role === "admin";
    const isOwner = complaint.user_id.toString() === req.user.id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You can only delete your own reports.",
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    if (isAdmin || req.user.role === "volunteer") {
      await AdminLog.create({
        action: `Deleted report: ${complaint.title}`,
        user_id: req.user.id,
      });
    }

    res.json({ success: true, message: "Complaint deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["received", "in_review", "resolved", "pending"];

    if (!status || !validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status value: ${status}. Supported: ${validStatuses.join(", ")}`,
      });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
       return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Permission Check: Admin or Assigned Volunteer
    const isAdmin = req.user.role === "admin";
    const isAssignedVolunteer = complaint.assigned_to && complaint.assigned_to.toString() === req.user.id;

    if (!isAdmin && !isAssignedVolunteer) {
       return res.status(403).json({ 
         success: false, 
         message: "Forbidden: Only the assigned volunteer or an admin can update the status." 
       });
    }

    const normalizedStatus = status.toLowerCase() === "pending" ? "received" : status.toLowerCase();

    complaint.status = normalizedStatus;
    await complaint.save();

    if (req.user) {
      await AdminLog.create({
        action: `Updated status for "${complaint.title}" to ${status.toUpperCase()}`,
        user_id: req.user.id,
      });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      landmark,
      issue_type,
      priority,
    } = req.body;

    // Security: In a real app, verify that the user is the owner or an admin
    // For now, we assume auth middleware has verified the user exists

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        address,
        landmark,
        issue_type,
        priority,
      },
      { new: true },
    );

    if (!updatedComplaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    res.json({ success: true, complaint: updatedComplaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { volunteer_id } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
       return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    // Restriction: Volunteers cannot re-assign if already taken by someone else
    if (complaint.assigned_to && req.user.role !== "admin" && complaint.assigned_to.toString() !== volunteer_id) {
       return res.status(403).json({ 
         success: false, 
         message: "This task is already accepted by another volunteer." 
       });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { assigned_to: volunteer_id, status: "in_review" },
      { new: true },
    ).populate("assigned_to", "name email");

    if (!updatedComplaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    if (req.user) {
      await AdminLog.create({
        action: `Assigned "${updatedComplaint.title}" to ${updatedComplaint.assigned_to?.name || "Volunteer"}`,
        user_id: req.user.id,
      });
    }

    res.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { rejected_by: req.user.id } },
      { new: true }
    ).populate("rejected_by", "name");

    if (!complaint)
      return res.status(404).json({ success: false, message: "Complaint not found" });

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
