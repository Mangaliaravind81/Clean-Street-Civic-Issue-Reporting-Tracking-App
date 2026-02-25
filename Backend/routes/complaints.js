// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const cloudinary = require("../cloudConfig");
// const { createComplaint } = require("../controllers/Complaints");

// const upload = multer({ dest: "temp/" });

// router.post("/", upload.array("images", 3), async (req, res) => {
//   try {
//     const imageUrls = [];

//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload(file.path);
//       imageUrls.push(result.secure_url);
//     }

//     req.body.images = imageUrls;

//     createComplaint(req, res);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ success: false });
//   }
// });

// // fetch complaints (view page)
// router.get("/", async (req, res) => {
//   const Complaint = require("../models/complaint");
//   const complaints = await Complaint.find();
//   res.json(complaints);
// });

// // delete complaint
// router.delete("/:id", async (req, res) => {
//   const Complaint = require("../models/complaint");
//   await Complaint.findByIdAndDelete(req.params.id);
//   res.json({ success: true });
// });

// module.exports = router;

//dynamic
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../cloudConfig");
const { createComplaint } = require("../controllers/Complaints");
const Complaint = require("../models/complaint");

const upload = multer({ dest: "temp/" });

/* =========================
   CREATE COMPLAINT
========================= */
router.post("/", upload.array("images", 3), async (req, res) => {
  try {
    console.log("BODY:", req.body);
    const imageUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      imageUrls.push(result.secure_url);
    }

    req.body.images = imageUrls;

    createComplaint(req, res);
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
});

/* =========================
   FETCH ALL (SORTED)
========================= */
router.get("/", async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   LIKE
========================= */
router.put("/like/:id", async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id);

    if (!c) return res.status(404).json({ success: false });

    c.likes += 1;

    await c.save();

    res.json({ success: true, likes: c.likes });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   UNLIKE (SEPARATE COUNT)
========================= */
router.put("/unlike/:id", async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id);

    if (!c) return res.status(404).json({ success: false });

    c.unlikes += 1;

    await c.save();

    res.json({ success: true, unlikes: c.unlikes });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   ADD COMMENT
========================= */
router.post("/comment/:id", async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id);

    if (!c) return res.status(404).json({ success: false });

    c.comments.push({
      text: req.body.text,
    });

    await c.save();

    res.json({ success: true, comments: c.comments });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

/* =========================
   DELETE
========================= */
router.delete("/:id", async (req, res) => {
  try {
    await Complaint.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

module.exports = router;
