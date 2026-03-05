const express = require("express");
const router = express.Router();

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
  .patch(auth, updateUserProfile)
  .delete(auth, deleteUser);

module.exports = router;
