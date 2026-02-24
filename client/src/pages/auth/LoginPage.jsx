import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const LoginPage = () => {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State to show a loading spinner while logging in
  const [isLoading, setIsLoading] = useState(false);

  // Get the login function from our auth context
  const { login } = useAuth();

  // useNavigate lets us redirect to another page programmatically
  const navigate = useNavigate();

  // ─── Handle Form Submit ──────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    // Prevent the default browser form submit (which would reload the page)
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true); // show loading state

    try {
      // Call the login function from AuthContext
      const user = await login(email, password);

      toast.success(`Welcome back, ${user.name}!`);

      // Redirect based on role
      // Admins go to the dashboard, cashiers go to the POS screen
      if (user.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/pos");
      }
    } catch (error) {
      // Show error message from server
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false); // always stop loading
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo / Title */}
        <div style={styles.header}>
          <h1 style={styles.title}>🛒 MERN POS</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Email Field */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="admin@pos.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Password Field */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={
              isLoading ? { ...styles.button, opacity: 0.7 } : styles.button
            }
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Inline Styles ────────────────────────────────────────────────────────────
// We'll move to Tailwind or a CSS file in later phases
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
  },
  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    fontSize: "28px",
    color: "#2d3748",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#718096",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
  },
  input: {
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },
  button: {
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
  },
};

export default LoginPage;
