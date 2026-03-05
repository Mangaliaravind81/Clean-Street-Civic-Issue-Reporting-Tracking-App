const Comment = require("../models/comments");

// Add a comment to a complaint
exports.addComment = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const { user_id, content } = req.body;

    if (!user_id || !content) {
      return res.status(400).json({ success: false, message: "user_id and content are required" });
    }

    const newComment = await Comment.create({
      user_id,
      complaint_id,
      content
    });

    const populatedComment = await newComment.populate("user_id", "name profile_photo");

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all comments for a specific complaint
exports.getComments = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const comments = await Comment.find({ complaint_id })
      .populate("user_id", "name profile_photo")
      .sort({ timestamp: -1 });

    res.json({ success: true, comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a comment (optional)
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedComment = await Comment.findByIdAndDelete(id);
    
    if (!deletedComment) {
       return res.status(404).json({ success: false, message: "Comment not found" });
    }

    res.json({ success: true, message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
