const axios = require("axios");
const crypto = require("crypto");
const Interview = require("../models/Interview");
const { getZoomAccessToken } = require("../config/zoom");
const sendEmail = require("../utils/sendEmails");

// Generate Zoom signature for client-side SDK
exports.generateSignature = (req, res, next) => {
  try {
    const { meetingNumber, role } = req.body;

    const timestamp = new Date().getTime() - 30000;
    const msg = Buffer.from(
      process.env.ZOOM_API_KEY + meetingNumber + timestamp + role
    ).toString("base64");
    const hash = crypto
      .createHmac("sha256", process.env.ZOOM_API_SECRET)
      .update(msg)
      .digest("base64");
    const signature = Buffer.from(
      `${process.env.ZOOM_API_KEY}.${meetingNumber}.${timestamp}.${role}.${hash}`
    ).toString("base64");

    res.status(200).json({
      success: true,
      data: {
        signature,
        meetingNumber,
        apiKey: process.env.ZOOM_API_KEY,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create a new Zoom meeting
exports.createMeeting = async (req, res, next) => {
  try {
    const { interviewId, topic, start_time, duration, password } = req.body;

    // Get the interview
    const interview = await Interview.findById(interviewId).populate(
      "interviewers",
      "name email"
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    const token = await getZoomAccessToken();

    const meetingPayload = {
      topic:
        topic ||
        `Interview with ${interview.candidateName} for ${interview.position}`,
      type: 2, // Scheduled meeting
      start_time: start_time || interview.interviewDate.toISOString(),
      duration: duration || interview.duration,
      timezone: "UTC",
      password: password || Math.random().toString(36).substring(2, 10), // Generate random password
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: false,
        approval_type: 0,
        audio: "both",
        auto_recording: "none",
      },
    };

    const response = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      meetingPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Update interview with meeting details
    interview.meetingId = response.data.id;
    interview.joinUrl = response.data.join_url;
    interview.startUrl = response.data.start_url;
    await interview.save();

    // Send meeting details via email
    try {
      // Email to candidate
      const candidateMessage = `
        <h2>Zoom Meeting Details</h2>
        <p>Hello ${interview.candidateName},</p>
        <p>Here are the details for your upcoming interview:</p>
        <p><strong>Position:</strong> ${interview.position}</p>
        <p><strong>Date & Time:</strong> ${interview.interviewDate.toLocaleString()}</p>
        <p><strong>Meeting ID:</strong> ${response.data.id}</p>
        <p><strong>Password:</strong> ${response.data.password}</p>
        <p>Click the link below to join the meeting:</p>
        <a href="${response.data.join_url}">Join Meeting</a>
        <p>Please join a few minutes early to ensure everything is working properly.</p>
      `;

      await sendEmail({
        to: interview.candidateEmail,
        subject: `Zoom Meeting Details - Interview for ${interview.position}`,
        html: candidateMessage,
      });

      // Email to interviewers
      for (const interviewer of interview.interviewers) {
        const interviewerMessage = `
          <h2>Zoom Meeting Details</h2>
          <p>Hello ${interviewer.name},</p>
          <p>Here are the details for your upcoming interview with ${
            interview.candidateName
          }:</p>
          <p><strong>Position:</strong> ${interview.position}</p>
          <p><strong>Date & Time:</strong> ${interview.interviewDate.toLocaleString()}</p>
          <p><strong>Meeting ID:</strong> ${response.data.id}</p>
          <p><strong>Password:</strong> ${response.data.password}</p>
          <p>Click the link below to start the meeting (host):</p>
          <a href="${response.data.start_url}">Start Meeting</a>
          <p>Or use this link to join:</p>
          <a href="${response.data.join_url}">Join Meeting</a>
        `;

        await sendEmail({
          to: interviewer.email,
          subject: `Zoom Meeting Details - Interview with ${interview.candidateName}`,
          html: interviewerMessage,
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
      // Continue even if email fails
    }

    res.status(201).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("Zoom API Error:", error.response?.data || error.message);
    next(error);
  }
};
