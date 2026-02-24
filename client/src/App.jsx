// client/src/App.jsx

import React from "react";

// BrowserRouter provides URL-based navigation
// Routes is the container for all route definitions
// Route defines a single path-to-component mapping
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Toast notifications provider — wraps entire app
import { Toaster } from "react-hot-toast";

// Our global auth state provider
import { AuthProvider } from "./context/AuthContext";

// The protected route wrapper
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import LoginPage from "./pages/auth/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";

function App() {
  return (
    // AuthProvider wraps everything so all components can access auth state
    <AuthProvider>
      {/* Router enables navigation between pages */}
      <Router>
        {/* Toaster renders toast notification popups */}
        <Toaster position="top-right" />

        {/* Routes — only the matching route renders */}
        <Routes>
          {/* Public route — anyone can visit /login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected route — only logged in admins can visit /dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Protected route — admins and cashiers can visit /pos */}
          <Route
            path="/pos"
            element={
              <ProtectedRoute allowedRoles={["admin", "cashier"]}>
                <POSPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all — redirect unknown URLs to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
