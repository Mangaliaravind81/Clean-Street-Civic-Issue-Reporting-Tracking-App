const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("../cloudConfig");

const upload = multer({ dest: "temp/" });

const { 
  getUserProfile, 
  updateUserProfile, 
  getAllUsers, 
  deleteUser, 
  getVolunteers,
  changePassword
} = require("../controllers/user.js");
const auth = require("../middlewares.js");

// /users
router.route("/")
  .get(auth, getAllUsers);

router.post("/change-password", auth, changePassword);
router.get("/volunteers", getVolunteers);

router.route("/:id")
  .get(getUserProfile)
  .patch(auth, upload.single("profile_photo"), async (req, res, next) => {
    try {
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path);
        req.body.profile_photo = result.secure_url;
      }
      next();
    } catch (err) {
      res.status(500).json({ success: false, message: "Image upload failed: " + err.message });
    }
  }, updateUserProfile)
  .delete(auth, deleteUser);

module.exports = router;
