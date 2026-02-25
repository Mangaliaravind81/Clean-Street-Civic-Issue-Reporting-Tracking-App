// const mongoose = require("mongoose");

// const ComplaintSchema = new mongoose.Schema({
//   title: String,
//   priority: String,
//   issueType: String,
//   address: String,
//   description: String,

//   latitude: String,
//   longitude: String,

//   images: [String],

//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Complaint", ComplaintSchema);

//stores the data dynamically
const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  title: String,
  priority: String,
  issueType: String,
  address: String,
  description: String,
  postedBy: String, //new
  latitude: String,
  longitude: String,

  images: [String],

  // ✅ ADDED
  status: {
    type: String,
    default: "Pending",
  },

  // ✅ ADDED
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
