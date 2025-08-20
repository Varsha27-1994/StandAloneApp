// models/Token.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 3600, // 1 hour
  },
});

// Generate and hash password reset token
tokenSchema.statics.generateResetToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  return crypto.createHash("sha256").update(resetToken).digest("hex");
};

module.exports = mongoose.model("Token", tokenSchema);
