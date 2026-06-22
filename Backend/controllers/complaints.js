const Complaint = require("../models/complaint");
const AdminLog = require("../models/adminlog");
const User = require("../models/user");
const Notification = require("../models/notification");

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
        message:
          "You must be logged in to submit a complaint. Please logout and login again.",
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

    // Identify nearby volunteers and notify them
    if (location_coords) {
      try {
        const [cLat, cLng] = location_coords.split(",").map(Number);
        const volunteers = await User.find({ role: "volunteer" });

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

        const nearbyVolunteers = volunteers.filter((v) => {
          if (!v.location_coords) return false;
          const [vLat, vLng] = v.location_coords.split(",").map(Number);
          return calculateDistance(cLat, cLng, vLat, vLng) <= 20;
        });

        if (nearbyVolunteers.length > 0) {
          const notifications = nearbyVolunteers.map((v) => ({
            user_id: v._id,
            complaint_id: complaint._id,
            message: `New issue reported nearby: "${complaint.title}". Please accept it if you are available.`,
          }));
          await Notification.insertMany(notifications);
        }
      } catch (err) {
        console.error("Error notifying nearby volunteers:", err);
      }
    }

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (err) {
    console.error("Complaint creation error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Failed to save complaint to database",
    });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user_id", "name email profile_photo")
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email")
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
      .populate("assigned_by", "name email")
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
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    // Permission Check: Admin or Assigned Volunteer
    const isAdmin = req.user.role === "admin";
    const isAssignedVolunteer =
      complaint.assigned_to && complaint.assigned_to.toString() === req.user.id;

    if (!isAdmin && !isAssignedVolunteer) {
      return res.status(403).json({
        success: false,
        message:
          "Forbidden: Only the assigned volunteer or an admin can update the status.",
      });
    }

    const normalizedStatus =
      status.toLowerCase() === "pending" ? "received" : status.toLowerCase();

    complaint.status = normalizedStatus;
    await complaint.save();

    if (req.user) {
      await AdminLog.create({
        action: `Updated status for "${complaint.title}" to ${status.toUpperCase()}`,
        user_id: req.user.id,
      });

      // Notify the user (owner)
      if (complaint.user_id.toString() !== req.user.id) {
        await Notification.create({
          user_id: complaint.user_id,
          complaint_id: complaint._id,
          message: `Your complaint "${complaint.title}" status has been updated to ${status.toUpperCase()}.`,
        });
      }

      // Notify the volunteer (if admin performed the update)
      if (
        req.user.role === "admin" &&
        complaint.assigned_to &&
        complaint.assigned_to.toString() !== req.user.id
      ) {
        await Notification.create({
          user_id: complaint.assigned_to,
          complaint_id: complaint._id,
          message: `The status of assignment "${complaint.title}" has been updated to ${status.toUpperCase()} by Admin.`,
        });
      }
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { title, description, address, landmark, issue_type, priority } =
      req.body;

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
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });
    }

    // Restriction: Volunteers cannot re-assign if already taken by someone else
    if (
      complaint.assigned_to &&
      req.user.role !== "admin" &&
      complaint.assigned_to.toString() !== volunteer_id
    ) {
      return res.status(403).json({
        success: false,
        message: "This task is already accepted by another volunteer.",
      });
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        assigned_to: volunteer_id,
        assigned_by: req.user.id,
        status: "in_review",
      },
      { new: true },
    )
      .populate("assigned_to", "name email")
      .populate("assigned_by", "name email");

    if (!updatedComplaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    if (req.user) {
      await AdminLog.create({
        action: `Assigned "${updatedComplaint.title}" to ${updatedComplaint.assigned_to?.name || "Volunteer"}`,
        user_id: req.user.id,
      });

      // Notify the user (owner)
      if (updatedComplaint.user_id.toString() !== req.user.id) {
        let message = `Your complaint "${updatedComplaint.title}" is now IN REVIEW.`;
        if (req.user.role === "admin") {
          message = `Admin has assigned volunteer ${updatedComplaint.assigned_to.name} to your complaint "${updatedComplaint.title}".`;
        } else {
          message = `Volunteer ${updatedComplaint.assigned_to.name} has been assigned to your complaint "${updatedComplaint.title}".`;
        }
        await Notification.create({
          user_id: updatedComplaint.user_id,
          complaint_id: updatedComplaint._id,
          message: message,
        });
      }

      // Notify the volunteer (unless they assigned it to themselves)
      if (volunteer_id !== req.user.id) {
        await Notification.create({
          user_id: volunteer_id,
          complaint_id: updatedComplaint._id,
          message: `You have been assigned to handle issue: "${updatedComplaint.title}".`,
        });
      }
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
      { new: true },
    ).populate("rejected_by", "name");

    if (!complaint)
      return res
        .status(404)
        .json({ success: false, message: "Complaint not found" });

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.escalateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
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
          message: "Only the reporter can escalate this complaint.",
        });
    }

    if (complaint.status === "resolved") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot escalate a resolved complaint.",
        });
    }

    if (complaint.escalation_level === "admin") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Complaint is already escalated to admin.",
        });
    }

    complaint.escalation_level = "admin";
    await complaint.save();

    const admins = await User.find({ role: "admin" });
    if (admins.length > 0) {
      const notifications = admins.map((a) => ({
        user_id: a._id,
        complaint_id: complaint._id,
        message: `Complaint "${complaint.title}" has been escalated to admin by the user due to inaction.`,
      }));
      await Notification.insertMany(notifications);
    }

    res.json({
      success: true,
      message: "Complaint escalated to admin successfully.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
