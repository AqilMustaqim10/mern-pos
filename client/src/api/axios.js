import axios from "axios";

const API = axios.create({
  // In development: uses localhost:5000
  // In production: uses the VITE_API_URL environment variable
  // import.meta.env is how Vite reads environment variables
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
