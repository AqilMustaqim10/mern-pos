import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

// ─── Create Context ───────────────────────────────────────────────────────────
// Context is like a global storage box that any component can read from
const AuthContext = createContext();

// ─── Auth Provider ────────────────────────────────────────────────────────────
// This component wraps our entire app and provides auth state to everyone
export const AuthProvider = ({ children }) => {
  // State: the currently logged in user (null if not logged in)
  const [user, setUser] = useState(null);

  // State: whether we're currently loading (checking if user is logged in)
  const [loading, setLoading] = useState(true);

  // ─── Check if User is Already Logged In ────────────────────────────────────
  // When the app first loads, check if there's a token in localStorage
  // If yes, fetch the user's info and restore their session
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Ask backend who this token belongs to
          const res = await API.get("/auth/me");
          setUser(res.data.user); // save user in state
        } catch (error) {
          // Token is invalid or expired — remove it
          localStorage.removeItem("token");
          setUser(null);
        }
      }

      // Done checking — stop the loading spinner
      setLoading(false);
    };

    loadUser();
  }, []); // empty array = runs only once when component mounts

  // ─── Login Function ─────────────────────────────────────────────────────────
  const login = async (email, password) => {
    // Send login request to backend
    const res = await API.post("/auth/login", { email, password });

    // Save the token to localStorage so it persists on page refresh
    localStorage.setItem("token", res.data.token);

    // Save user to state so the whole app knows someone is logged in
    setUser(res.data.user);

    return res.data.user; // return user so the login page can redirect based on role
  };

  // ─── Logout Function ────────────────────────────────────────────────────────
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem("token");

    // Clear user from state — this will redirect to login (we'll set that up)
    setUser(null);
  };

  // ─── Register Function ──────────────────────────────────────────────────────
  const register = async (name, email, password, role) => {
    const res = await API.post("/auth/register", {
      name,
      email,
      password,
      role,
    });
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    return res.data.user;
  };

  // Provide all auth values and functions to any component that needs them
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────
// Instead of importing useContext(AuthContext) everywhere,
// we export this shortcut hook: useAuth()
export const useAuth = () => {
  return useContext(AuthContext);
};
