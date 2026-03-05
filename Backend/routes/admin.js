const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin");
const auth = require("../middlewares.js");

// Base path will be /admin
router.use(auth);

router.get("/analytics", adminController.getAnalytics);
router.get("/export", adminController.exportComplaints);

module.exports = router;
