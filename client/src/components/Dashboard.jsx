import React, { useState, useEffect } from "react";
import InterviewCard from "./InterviewCard";
import { getInterviews } from "../services/api";

const Dashboard = ({ onSchedule, onStartMeeting }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInterviews();

      console.log("API Response:", response); // Debug log

      // Handle your specific API response structure
      let interviewsData = [];

      if (response && response.data && Array.isArray(response.data.data)) {
        // If response is nested: { data: { data: [...] } }
        interviewsData = response.data.data;
      } else if (response && Array.isArray(response.data)) {
        // If response is: { data: [...] }
        interviewsData = response.data;
      } else if (response && Array.isArray(response)) {
        // If response is directly an array
        interviewsData = response;
      } else {
        console.warn("Unexpected API response structure:", response);
        interviewsData = [];
      }

      setInterviews(interviewsData);
    } catch (error) {
      console.error("Error fetching interviews:", error);
      setError("Failed to fetch interviews");
      setInterviews([]); // Ensure interviews is always an array
    } finally {
      setLoading(false);
    }
  };

  // Ensure interviews is always an array before filtering
  const filteredInterviews = Array.isArray(interviews)
    ? interviews.filter((interview) => {
        if (filter === "all") return true;
        return interview.status === filter;
      })
    : [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={fetchInterviews}
                className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
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
        <div className="flex flex-wrap gap-2">
          {["all", "scheduled", "in-progress", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === status
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {status === "all"
                  ? "All"
                  : status.charAt(0).toUpperCase() +
                    status.slice(1).replace("-", " ")}
              </button>
            )
          )}
        </div>

        {/* Debug info - remove this in production */}
        <div className="mt-2 text-sm text-gray-500">
          Total interviews: {interviews.length} | Filtered:{" "}
          {filteredInterviews.length} | Current filter: {filter}
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z"
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
