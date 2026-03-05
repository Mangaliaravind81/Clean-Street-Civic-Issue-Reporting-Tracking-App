const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../cloudConfig");
const complaintController = require("../controllers/complaints");
const voteController = require("../controllers/vote");
const commentController = require("../controllers/comment");
const auth = require("../middlewares.js");

const upload = multer({ dest: "temp/" });

// /complaints
router
  .route("/")
  .get(complaintController.getComplaints)
  .post(upload.array("images", 3), async (req, res) => {
    try {
      const imageUrls = [];
      if (req.files) {
        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path);
          imageUrls.push(result.secure_url);
        }
      }
      req.body.images = imageUrls;
      console.log(req.body);
      complaintController.createComplaint(req, res);
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

router
  .route("/:id")
  .get(complaintController.getComplaintById)
  .patch(auth, (req, res) => {
    if (req.body.status) {
      return complaintController.updateComplaintStatus(req, res);
    }
    if (req.body.volunteer_id) {
      return complaintController.assignComplaint(req, res);
    }
    if (req.body.title || req.body.description || req.body.address || req.body.landmark || req.body.issue_type || req.body.priority) {
      return complaintController.updateComplaint(req, res);
    }
    res
      .status(400)
      .json({ success: false, message: "No valid fields provided for update" });
  })
  .delete(auth, complaintController.deleteComplaint);

router.patch("/:id/reject", auth, complaintController.rejectComplaint);

// Nested resources
// POST /complaints/:id/votes
router.post("/:complaint_id/votes", auth, voteController.castVote);
// GET /complaints/:id/votes
router.get("/:complaint_id/votes", voteController.getVotes);

// POST /complaints/:id/comments
router.post("/:complaint_id/comments", auth, commentController.addComment);
// GET /complaints/:id/comments
router.get("/:complaint_id/comments", commentController.getComments);

module.exports = router;
