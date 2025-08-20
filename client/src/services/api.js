// client/src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getInterviews = () => api.get("/interviews");
export const createInterview = (data) =>
  api.post("/interviews", data);
export const createZoomMeeting = (interviewId) =>
  api.post(`/zoom/create-meeting`, { interviewId });
export const getZoomSignature = (meetingNumber, role) =>
  api.post("/zoom/signature", { meetingNumber, role });

export default api;
