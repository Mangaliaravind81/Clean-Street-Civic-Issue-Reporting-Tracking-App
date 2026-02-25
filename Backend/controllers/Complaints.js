// const Complaint = require("../models/complaint");

// exports.createComplaint = async (req, res) => {
//   try {
//     const complaint = await Complaint.create({
//       title: req.body.title,
//       priority: req.body.priority,
//       issueType: req.body.issueType,
//       address: req.body.address,
//       description: req.body.description,

//       latitude: req.body.latitude,
//       longitude: req.body.longitude,

//       images: req.body.images,
//     });

//     res.status(201).json({
//       success: true,
//       complaint,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false });
//   }
// };

//dynaic
const Complaint = require("../models/complaint");

exports.createComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.create({
      title: req.body.title,
      // postedBy: req.body.postedBy || "Anonymous",
      postedBy: req.body.postedBy,
      priority: req.body.priority,
      issueType: req.body.issueType,
      address: req.body.address,
      description: req.body.description,

      latitude: req.body.latitude,
      longitude: req.body.longitude,

      images: req.body.images,
    });

    res.status(201).json({
      success: true,
      complaint,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};
