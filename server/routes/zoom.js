// routes/zoom.js
const express = require("express");
const {
  generateSignature,
  createMeeting,
} = require("../controllers/zoomController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.post("/signature", protect, generateSignature);
router.post(
  "/create-meeting",
  protect,
  authorize("admin", "interviewer"),
  createMeeting
);
// router.get("/meetings/:meetingId", protect, getMeeting);
// router.delete(
//   "/meetings/:meetingId",
//   protect,
//   authorize("admin", "interviewer"),
//   deleteMeeting
// );
// router.get(
//   "/meetings/:meetingId/participants",
//   protect,
//   getMeetingParticipants
// );

module.exports = router;
