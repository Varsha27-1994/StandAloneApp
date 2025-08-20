import React from "react";

const InterviewCard = ({ interview, onStartMeeting }) => {
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      scheduled: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}
      >
        {status.replace("-", " ")}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold text-gray-800">
          {interview.candidateName}
        </h2>
        {getStatusBadge(interview.status)}
      </div>

      <p className="text-gray-600 mb-2">
        <span className="font-medium">Position:</span> {interview.position}
      </p>

      <p className="text-gray-600 mb-2">
        <span className="font-medium">Email:</span> {interview.candidateEmail}
      </p>

      <p className="text-gray-500 mb-4">
        <span className="font-medium">When:</span>{" "}
        {formatDate(interview.interviewDate)}
      </p>

      <div className="flex space-x-2">
        <button
          onClick={() => onStartMeeting(interview._id, interview.meetingId)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
          disabled={interview.status !== "scheduled"}
        >
          Start Interview
        </button>

        <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors duration-300">
          Details
        </button>
      </div>
    </div>
  );
};

export default InterviewCard;
