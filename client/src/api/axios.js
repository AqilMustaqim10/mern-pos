// Import axios — the library we use to make HTTP requests to our backend
import axios from "axios";

// Create a custom axios instance with default settings
// This means we don't have to type the full URL every time
const API = axios.create({
  // Base URL of our backend — every request will start with this
  baseURL: "http://localhost:5000/api",
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// This runs BEFORE every request we send
// It automatically adds the JWT token to every request header
API.interceptors.request.use(
  (config) => {
    // Get the token stored in localStorage (we save it after login)
    const token = localStorage.getItem("token");

    if (token) {
      // Add the token to the Authorization header
      // The backend protect middleware looks for this header
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config; // return the modified config to continue the request
  },
  (error) => {
    // If something went wrong setting up the request, reject it
    return Promise.reject(error);
  },
);

export default API;
