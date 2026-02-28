
const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../cloudConfig");
const complaintController = require("../controllers/Complaints");
const Complaint = require("../models/complaint");

const upload = multer({ dest: "temp/" });

/* =========================
   CREATE COMPLAINT
========================= */
router.post("/", upload.array("images", 3), async (req, res) => {
  try {

    const imageUrls = [];

    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      imageUrls.push(result.secure_url);
    }

    req.body.images = imageUrls;

    complaintController.createComplaint(req, res);
  } catch (err) {

    res.status(500).json({ success: false });
  }
});

router.get("/", complaintController.getComplaints);
router.put("/like/:id", complaintController.likeComplaint);
router.put("/unlike/:id", complaintController.unlikeComplaint);
router.post("/comment/:id", complaintController.addComment);
router
  .route("/:id")
  .delete(complaintController.deleteComplaint)
  .put(complaintController.updateComplaint);

module.exports = router;
