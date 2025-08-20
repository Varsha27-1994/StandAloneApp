// client/src/components/MeetingView.jsx
import React, { useEffect, useRef } from "react";
import { getZoomSignature } from "../services/api";

const MeetingView = ({ config, onLeave }) => {
  const meetingContainerRef = useRef(null);
  const clientRef = useRef(null);

  useEffect(() => {
    const initializeZoomMeeting = async () => {
      try {
        // Load Zoom Meeting SDK
        const { ZoomMtg } = window;

        ZoomMtg.setZoomJSLib("https://source.zoom.us/2.9.0/lib", "/av");
        ZoomMtg.preLoadWasm();
        ZoomMtg.prepareWebSDK();

        // Get signature from backend
        const signatureResponse = await getZoomSignature(
          config.meetingNumber,
          config.role
        );
        const { signature, apiKey } = signatureResponse.data;

        // Initialize Zoom
        ZoomMtg.init({
          leaveUrl: window.location.origin,
          success: () => {
            console.log("Zoom initialized successfully");

            // Join meeting
            ZoomMtg.join({
              meetingNumber: config.meetingNumber,
              userName: config.userName,
              signature: signature,
              sdkKey: apiKey,
              userEmail: config.userEmail,
              passWord: config.passWord,
              success: () => {
                console.log("Joined meeting successfully");
              },
              error: (error) => {
                console.error("Error joining meeting:", error);
                alert("Failed to join meeting. Please try again.");
                onLeave();
              },
            });
          },
          error: (error) => {
            console.error("Error initializing Zoom:", error);
            alert("Failed to initialize meeting. Please try again.");
            onLeave();
          },
        });
      } catch (error) {
        console.error("Error initializing meeting:", error);
        alert("Failed to initialize meeting. Please try again.");
        onLeave();
      }
    };

    if (config) {
      initializeZoomMeeting();
    }

    return () => {
      // Cleanup when component unmounts
      if (window.ZoomMtg && clientRef.current) {
        window.ZoomMtg.leave();
      }
    };
  }, [config, onLeave]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Interview in Progress
        </h2>
        <button
          onClick={onLeave}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Leave Meeting
        </button>
      </div>

      <div
        className="w-full h-96 bg-gray-800 rounded-lg"
        ref={meetingContainerRef}
        id="meeting-container"
      >
        {/* Zoom meeting will be rendered here */}
      </div>

      <div className="mt-6 flex justify-center space-x-4">
        <button className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>
        <button className="p-3 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors duration-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button className="p-3 bg-red-500 rounded-full hover:bg-red-600 transition-colors duration-300 text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MeetingView;
