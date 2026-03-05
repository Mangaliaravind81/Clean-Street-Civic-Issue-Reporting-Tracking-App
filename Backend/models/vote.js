const { Schema, model } = require("mongoose");

const VoteSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  complaint_id: {
    type: Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
  },
  vote_type: {
    type: String,
    enum: ["upvote", "downvote"],
    required: true,
  },
}, { timestamps: true });

// Prevent a user from voting multiple times on the same complaint
VoteSchema.index({ user_id: 1, complaint_id: 1 }, { unique: true });

module.exports = model("Vote", VoteSchema);
