const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/feedback");
const auth = require("../middlewares");

router.post("/", auth, feedbackController.createFeedback);
router.get("/volunteer", auth, feedbackController.getVolunteerFeedbacks);
router.get("/app", auth, feedbackController.getAppFeedbacks);
router.get("/user", auth, feedbackController.getUserFeedbacks);
router.get("/admin/app", auth, feedbackController.getAllAppFeedbacks);
router.get(
  "/admin/volunteer",
  auth,
  feedbackController.getAllVolunteerFeedbacks,
);

module.exports = router;
