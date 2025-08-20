// client/src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import InterviewCard from "./InterviewCard";
import { getInterviews } from "../services/api";

const Dashboard = ({ onSchedule, onStartMeeting }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await getInterviews();
      setInterviews(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (filter === "all") return true;
    return interview.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Scheduled Interviews
        </h1>
        <button
          onClick={onSchedule}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Schedule New Interview
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-2">
          {["all", "scheduled", "in-progress", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  filter === status
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status.replace("-", " ")}
              </button>
            )
          )}
        </div>
      </div>

      {filteredInterviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No interviews scheduled
          </h3>
          <p className="mt-1 text-gray-500">
            Get started by scheduling a new interview.
          </p>
          <div className="mt-6">
            <button
              onClick={onSchedule}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Schedule Interview
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInterviews.map((interview) => (
            <InterviewCard
              key={interview._id}
              interview={interview}
              onStartMeeting={onStartMeeting}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
