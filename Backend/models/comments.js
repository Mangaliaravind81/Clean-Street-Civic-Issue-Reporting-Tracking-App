const { Schema, model } = require("mongoose");

const commentSchema = new Schema(
  {
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
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

module.exports = model("Comment", commentSchema);
