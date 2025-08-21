const Interview = require("../models/Interview");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmails");

// Get all interviews
exports.getInterviews = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = Interview.find(JSON.parse(queryStr)).populate(
      "interviewers",
      "name email"
    );

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Interview.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const interviews = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: interviews.length,
      pagination,
      data: interviews,
    });
  } catch (error) {
    next(error);
  }
};

// Get single interview
exports.getInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id).populate(
      "interviewers",
      "name email"
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

// Create new interview
exports.createInterview = async (req, res, next) => {
  try {
    // Handle interviewer emails conversion to ObjectIds
    let interviewerIds = [];

    if (req.body.interviewers && Array.isArray(req.body.interviewers)) {
      // Check if the interviewers array contains emails (strings) or ObjectIds
      const firstInterviewer = req.body.interviewers[0];

      if (
        typeof firstInterviewer === "string" &&
        firstInterviewer.includes("@")
      ) {
        // Convert email addresses to User ObjectIds
        const interviewerEmails = req.body.interviewers;
        const users = await User.find({
          email: { $in: interviewerEmails },
        }).select("_id email");

        if (users.length !== interviewerEmails.length) {
          // Find which emails don't exist in the database
          const foundEmails = users.map((user) => user.email);
          const notFoundEmails = interviewerEmails.filter(
            (email) => !foundEmails.includes(email)
          );

          return res.status(400).json({
            success: false,
            message: `The following interviewer emails were not found in the system: ${notFoundEmails.join(
              ", "
            )}. Please make sure all interviewers are registered users.`,
          });
        }

        interviewerIds = users.map((user) => user._id);
      } else {
        // Assume they are already ObjectIds
        interviewerIds = req.body.interviewers;
      }
    } else {
      // Default to current user if no interviewers specified
      interviewerIds = [req.user.id];
    }

    // Create interview data with converted interviewer IDs
    const interviewData = {
      ...req.body,
      interviewers: interviewerIds,
    };

    const interview = await Interview.create(interviewData);

    // Populate interviewers for response
    await interview.populate("interviewers", "name email");

    // Send email notifications
    try {
      // Email to candidate
      const candidateMessage = `
        <h2>Interview Scheduled</h2>
        <p>Hello ${interview.candidateName},</p>
        <p>Your interview for the position of ${
          interview.position
        } has been scheduled.</p>
        <p><strong>Date & Time:</strong> ${interview.interviewDate.toLocaleString()}</p>
        <p><strong>Duration:</strong> ${interview.duration} minutes</p>
        <p>Please be prepared to join the meeting on time.</p>
      `;

      await sendEmail({
        to: interview.candidateEmail,
        subject: `Interview Scheduled - ${interview.position}`,
        html: candidateMessage,
      });

      // Email to interviewers
      for (const interviewer of interview.interviewers) {
        const interviewerMessage = `
          <h2>Interview Scheduled</h2>
          <p>Hello ${interviewer.name},</p>
          <p>You have been scheduled to interview ${
            interview.candidateName
          } for the position of ${interview.position}.</p>
          <p><strong>Date & Time:</strong> ${interview.interviewDate.toLocaleString()}</p>
          <p><strong>Duration:</strong> ${interview.duration} minutes</p>
          <p><strong>Candidate Email:</strong> ${interview.candidateEmail}</p>
        `;

        await sendEmail({
          to: interviewer.email,
          subject: `Interview Scheduled - ${interview.candidateName} for ${interview.position}`,
          html: interviewerMessage,
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

// Update interview
exports.updateInterview = async (req, res, next) => {
  try {
    let interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Handle interviewer emails conversion if updating interviewers
    if (req.body.interviewers && Array.isArray(req.body.interviewers)) {
      const firstInterviewer = req.body.interviewers[0];

      if (
        typeof firstInterviewer === "string" &&
        firstInterviewer.includes("@")
      ) {
        const interviewerEmails = req.body.interviewers;
        const users = await User.find({
          email: { $in: interviewerEmails },
        }).select("_id email");

        if (users.length !== interviewerEmails.length) {
          const foundEmails = users.map((user) => user.email);
          const notFoundEmails = interviewerEmails.filter(
            (email) => !foundEmails.includes(email)
          );

          return res.status(400).json({
            success: false,
            message: `The following interviewer emails were not found: ${notFoundEmails.join(
              ", "
            )}`,
          });
        }

        req.body.interviewers = users.map((user) => user._id);
      }
    }

    interview = await Interview.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("interviewers", "name email");

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};

// Delete interview
exports.deleteInterview = async (req, res, next) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    await Interview.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Submit feedback
exports.submitFeedback = async (req, res, next) => {
  try {
    const { rating, comments } = req.body;

    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Check if user is an interviewer for this interview
    const isInterviewer = interview.interviewers.some(
      (interviewer) => interviewer.toString() === req.user.id
    );

    if (!isInterviewer) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to submit feedback for this interview",
      });
    }

    interview.feedback = {
      rating,
      comments,
      submittedBy: req.user.id,
      submittedAt: new Date(),
    };

    await interview.save();

    res.status(200).json({
      success: true,
      message: "Feedback submitted successfully",
      data: interview,
    });
  } catch (error) {
    next(error);
  }
};
