const User = require("../models/User");
const Token = require("../models/Token");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmails");
const { generateToken } = require("../utils/generateToken");

// Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "interviewer",
    });

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account has been deactivated",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email",
      });
    }

    // Generate reset token
    const resetToken = Token.generateResetToken();

    // Save hashed token to database
    await Token.create({
      userId: user._id,
      token: resetToken,
    });

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Email message
    const message = `
      <h2>Hello ${user.name}</h2>
      <p>You requested a password reset for your Interview Portal account.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: "Password Reset Request - Interview Portal",
        html: message,
      });

      res.status(200).json({
        success: true,
        message: "Password reset email sent successfully",
      });
    } catch (error) {
      // Remove token if email fails
      await Token.findOneAndDelete({ userId: user._id, token: resetToken });

      return res.status(500).json({
        success: false,
        message: "Email could not be sent. Please try again later.",
      });
    }
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find token in database
    const userToken = await Token.findOne({
      token: hashedToken,
      createdAt: { $gt: Date.now() - 3600000 }, // Check if token is not expired
    });

    if (!userToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Find user and update password
    const user = await User.findById(userToken.userId);
    user.password = password;
    await user.save();

    // Delete the token
    await Token.findByIdAndDelete(userToken._id);

    // Send confirmation email
    const message = `
      <h2>Password Updated Successfully</h2>
      <p>Your password has been updated successfully for your Interview Portal account.</p>
      <p>If you did not make this change, please contact support immediately.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: "Password Updated - Interview Portal",
      html: message,
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update user details
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// Update password
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    if (
      !(await user.correctPassword(req.body.currentPassword, user.password))
    ) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
