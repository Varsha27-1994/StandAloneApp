// client/src/App.jsx
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import ScheduleInterview from "./components/ScheduleInterview";
import MeetingView from "./components/MeetingView";
import useZoom from "./hooks/useZoom";

function App() {
  const [view, setView] = useState("dashboard");
  const { isInitializing, meetingConfig, startMeeting, clearMeeting } =
    useZoom();

  const handleStartMeeting = async (interviewId) => {
    try {
      await startMeeting(interviewId);
      setView("meeting");
    } catch (error) {
      console.error("Failed to start meeting:", error);
    }
  };

  const handleLeaveMeeting = () => {
    clearMeeting();
    setView("dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-7xl mx-auto py-8 px-4">
        {view === "dashboard" && (
          <Dashboard
            onSchedule={() => setView("schedule")}
            onStartMeeting={handleStartMeeting}
          />
        )}

        {view === "schedule" && (
          <ScheduleInterview
            onSchedule={() => setView("dashboard")}
            onCancel={() => setView("dashboard")}
          />
        )}

        {view === "meeting" && meetingConfig && (
          <MeetingView config={meetingConfig} onLeave={handleLeaveMeeting} />
        )}

        {isInitializing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500 mr-3"></div>
                <span>Initializing meeting...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
