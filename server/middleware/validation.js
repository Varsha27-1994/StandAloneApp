// middleware/validation.js
const { body, validationResult } = require("express-validator");

// Check for validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

// User registration validation
exports.validateRegistration = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

// User login validation
exports.validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

// Interview validation
exports.validateInterview = [
  body("candidateName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Candidate name is required"),
  body("candidateEmail")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid candidate email"),
  body("position").trim().notEmpty().withMessage("Position is required"),
  body("interviewDate").isISO8601().withMessage("Please provide a valid date"),
  body("duration")
    .isInt({ min: 15, max: 240 })
    .withMessage("Duration must be between 15 and 240 minutes"),
];
