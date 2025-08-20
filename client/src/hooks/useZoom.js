// client/src/hooks/useZoom.js
import { useState } from "react";
import { createZoomMeeting } from "../services/api";

const useZoom = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [meetingConfig, setMeetingConfig] = useState(null);

  const startMeeting = async (interviewId) => {
    setIsInitializing(true);
    try {
      const response = await createZoomMeeting(interviewId);

      // In a real app, you'd get these values from your backend
      const meetingConfig = {
        meetingNumber: response.data.id,
        userName: "Interviewer",
        userEmail: "interviewer@example.com",
        role: 1, // 1 for host, 0 for participant
        passWord: response.data.password || "interview",
      };

      setMeetingConfig(meetingConfig);
      return meetingConfig;
    } catch (error) {
      console.error("Error starting meeting:", error);
      throw error;
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    isInitializing,
    meetingConfig,
    startMeeting,
    clearMeeting: () => setMeetingConfig(null),
  };
};

export default useZoom;
