const { Schema, model } = require("mongoose");

const ComplaintSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  photo: [String],
  location_coords: String,
  address: String,
  assigned_to: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  status: {
    type: String,
    enum: ["received", "in_review", "resolved", "Pending"], // Kept 'Pending' if existing data/logic relies on it
    default: "received",
  },
  issue_type: String,
  priority: String,
  landmark: String,
  rejected_by: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = model("Complaint", ComplaintSchema);
