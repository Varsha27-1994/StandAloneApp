import React, { useState } from "react";
import { createInterview } from "../services/api";

const ScheduleInterview = ({ onSchedule, onCancel }) => {
  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    position: "",
    interviewDate: "",
    interviewTime: "",
    duration: 60,
    interviewers: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Combine date and time
      const dateTime = `${formData.interviewDate}T${formData.interviewTime}`;

      const interviewData = {
        candidateName: formData.candidateName,
        candidateEmail: formData.candidateEmail,
        position: formData.position,
        interviewDate: new Date(dateTime).toISOString(),
        duration: parseInt(formData.duration),
        interviewers: formData.interviewers.split(",").map((i) => i.trim()),
      };

      await createInterview(interviewData);
      onSchedule();
    } catch (error) {
      console.error("Error scheduling interview:", error);
      alert("Failed to schedule interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate minimum datetime for input (current time + 1 hour)
  const now = new Date();
  now.setHours(now.getHours() + 1);
  const minDate = now.toISOString().split("T")[0];
  const minTime = now.toTimeString().substring(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Schedule New Interview
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="candidateName">
              Candidate Name *
            </label>
            <input
              type="text"
              id="candidateName"
              name="candidateName"
              value={formData.candidateName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label
              className="block text-gray-700 mb-2"
              htmlFor="candidateEmail"
            >
              Candidate Email *
            </label>
            <input
              type="email"
              id="candidateEmail"
              name="candidateEmail"
              value={formData.candidateEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="position">
              Position *
            </label>
            <input
              type="text"
              id="position"
              name="position"
              value={formData.position}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="duration">
              Duration (minutes) *
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="30">30 minutes</option>
              <option value="60">60 minutes</option>
              <option value="90">90 minutes</option>
              <option value="120">120 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="interviewDate">
              Date *
            </label>
            <input
              type="date"
              id="interviewDate"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              min={minDate}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2" htmlFor="interviewTime">
              Time *
            </label>
            <input
              type="time"
              id="interviewTime"
              name="interviewTime"
              value={formData.interviewTime}
              onChange={handleChange}
              min={formData.interviewDate === minDate ? minTime : undefined}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2" htmlFor="interviewers">
              Interviewers (comma separated emails) *
            </label>
            <input
              type="text"
              id="interviewers"
              name="interviewers"
              value={formData.interviewers}
              onChange={handleChange}
              placeholder="interviewer1@example.com, interviewer2@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition-colors duration-300"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300 flex items-center"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Scheduling...
              </>
            ) : (
              "Schedule Interview"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleInterview;
