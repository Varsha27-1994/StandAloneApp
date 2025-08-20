// routes/interviews.js
const express = require("express");
const {
  getInterviews,
  getInterview,
  createInterview,
  updateInterview,
  deleteInterview,
  submitFeedback,
} = require("../controllers/interviewController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();


router
  .route("/")
  .get(protect, getInterviews)
  .post(protect, authorize("admin", "interviewer"), createInterview);

router
  .route("/:id")
  .get(protect, getInterview)
  .put(protect, authorize("admin", "interviewer"), updateInterview)
  .delete(protect, authorize("admin"), deleteInterview);

router
  .route("/:id/feedback")
  .post(protect, authorize("admin", "interviewer"), submitFeedback);

module.exports = router;
