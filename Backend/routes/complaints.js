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
    const imageUrls = [];

    // Prevent crash if no images uploaded
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path);
        imageUrls.push(result.secure_url);
      }
    }

    req.body.images = imageUrls;

    createComplaint(req, res);

  } catch (err) {
    console.error("Create Complaint Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
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
    console.error("Fetch All Error:", err);
    res.status(500).json({ success: false });
  }
});


/* =========================
   GET SINGLE COMPLAINT
========================= */
router.get("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json(complaint);

  } catch (err) {
    console.error("Fetch Single Error:", err);
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
    console.error("Like Error:", err);
    res.status(500).json({ success: false });
  }
});


/* =========================
   UNLIKE
========================= */
router.put("/unlike/:id", async (req, res) => {
  try {
    const c = await Complaint.findById(req.params.id);

    if (!c) return res.status(404).json({ success: false });

    c.unlikes += 1;
    await c.save();

    res.json({ success: true, unlikes: c.unlikes });

  } catch (err) {
    console.error("Unlike Error:", err);
    res.status(500).json({ success: false });
  }
});


/* =========================
   ADD COMMENT
========================= */
router.post("/comment/:id", async (req, res) => {
  try {
    const { text } = req.body;

    // Prevent empty comments
    if (!text || text.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Comment cannot be empty",
      });
    }

    const c = await Complaint.findById(req.params.id);

    if (!c) return res.status(404).json({ success: false });

    c.comments.push({
      text: text.trim(),
    });

    await c.save();

    res.json({
      success: true,
      comments: c.comments,
    });

  } catch (err) {
    console.error("Comment Error:", err);
    res.status(500).json({ success: false });
  }
});


/* =========================
   DELETE COMPLAINT
========================= */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Complaint.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true });

  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;