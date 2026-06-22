const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification");
const auth = require("../middlewares.js");

router.get("/", auth, notificationController.getNotifications);
router.patch("/mark-all-read", auth, notificationController.markAllRead);
router.patch("/:id/read", auth, notificationController.markAsRead);
router.post(
  "/:id/escalate",
  auth,
  notificationController.escalateStaleComplaint,
);

module.exports = router;
