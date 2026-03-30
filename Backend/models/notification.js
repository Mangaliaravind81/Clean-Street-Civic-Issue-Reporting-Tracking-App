const { Schema, model } = require("mongoose");

const NotificationSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  complaint_id: {
    type: Schema.Types.ObjectId,
    ref: "Complaint",
  },
  message: {
    type: String,
    required: true,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = model("Notification", NotificationSchema);
