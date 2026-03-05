const { Schema, model } = require("mongoose");

const AdminLogSchema = new Schema({
  action: {
    type: String,
    required: true,
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

module.exports = model("AdminLog", AdminLogSchema);
