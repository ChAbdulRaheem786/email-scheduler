import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // sends the httpOnly session cookie set by the backend
});

export const GOOGLE_LOGIN_URL = `${API_URL}/api/auth/google`;
