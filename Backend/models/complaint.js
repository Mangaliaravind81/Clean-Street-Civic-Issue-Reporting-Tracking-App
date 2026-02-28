const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  title: String,
  priority: String,
  issueType: String,
  address: String,
  description: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  latitude: String,
  longitude: String,

  images: [String],


  status: {
    type: String,
    default: "Pending",
  },


  likes: {
    type: Number,
    default: 0,
  },
  unlikes: {
    type: Number,
    default: 0,
  },

  comments: [
    {
      text: String,
      postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
