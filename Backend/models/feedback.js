const { Schema, model } = require("mongoose");

const FeedbackSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  volunteer_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  complaint_id: {
    type: Schema.Types.ObjectId,
    ref: "Complaint",
  },
  feedback_type: {
    type: String,
    enum: ["volunteer", "app"],
    default: "volunteer"
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  description: {
    type: String,
    required: true,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = model("Feedback", FeedbackSchema);
