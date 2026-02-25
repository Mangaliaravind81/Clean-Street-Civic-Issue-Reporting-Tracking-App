const express = require("express");
const router = express.Router();

const { registerUser, loginUser } = require("../controllers/user.js");

// REGISTER
router.route("/register").post(registerUser);

// LOGIN
router.route("/login").post(loginUser);

module.exports = router;
