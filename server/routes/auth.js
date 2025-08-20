// routes/auth.js
const express = require("express");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateDetails,
  updatePassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} = require("../middleware/validation");

const router = express.Router();

router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  register
);
router.post("/login", validateLogin, handleValidationErrors, login);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:token", resetPassword);
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);
router.put("/updatepassword", protect, updatePassword);

module.exports = router;
