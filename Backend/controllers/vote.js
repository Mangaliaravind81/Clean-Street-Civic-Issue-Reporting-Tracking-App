const Vote = require("../models/vote");
const Complaint = require("../models/complaint");

// Cast a vote (upvote or downvote) on a complaint
exports.castVote = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    const { user_id, vote_type } = req.body; // vote_type should be 'upvote' or 'downvote'

    if (!user_id || !vote_type) {
      return res.status(400).json({ success: false, message: "User ID and vote_type are required" });
    }

    if (!["upvote", "downvote"].includes(vote_type)) {
      return res.status(400).json({ success: false, message: "Invalid vote type" });
    }

    // Check if user already voted
    let existingVote = await Vote.findOne({ user_id, complaint_id });

    if (existingVote) {
      // If same vote, maybe remove it (toggle off), or just return
      if (existingVote.vote_type === vote_type) {
        await Vote.findByIdAndDelete(existingVote._id);
        return res.json({ success: true, message: "Vote removed", action: "removed" });
      } else {
        // Change vote type
        existingVote.vote_type = vote_type;
        await existingVote.save();
        return res.json({ success: true, message: "Vote updated", action: "updated" });
      }
    } else {
      // Create new vote
      const newVote = await Vote.create({ user_id, complaint_id, vote_type });
      return res.status(201).json({ success: true, message: "Vote casted", action: "created", vote: newVote });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get votes for a complaint (could return total upvotes and downvotes)
exports.getVotes = async (req, res) => {
  try {
    const { complaint_id } = req.params;
    
    // Aggregate or count
    const upvotes = await Vote.countDocuments({ complaint_id, vote_type: "upvote" });
    const downvotes = await Vote.countDocuments({ complaint_id, vote_type: "downvote" });

    res.json({ success: true, upvotes, downvotes, total: upvotes - downvotes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
