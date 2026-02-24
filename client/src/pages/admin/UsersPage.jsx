// client/src/pages/admin/UsersPage.jsx

import React, { useState, useEffect } from "react";
import {
  fetchUsers,
  createUser,
  updateUser,
  resetPassword,
  deleteUser,
} from "../../api/userAPI";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

const UsersPage = () => {
  const { user: currentUser } = useAuth(); // currently logged in admin
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetchUsers();
      setUsers(res.data.users);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", password: "", role: "cashier" });
    setShowForm(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "", // don't pre-fill password
      role: user.role,
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Submit Create or Update ───────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error("Password is required for new users");
      return;
    }

    setSubmitting(true);

    try {
      if (editingUser) {
        // When editing, only send password if admin entered one
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
        };
        await updateUser(editingUser._id, updateData);
        toast.success("User updated!");
      } else {
        await createUser(formData);
        toast.success("User created!");
      }

      setShowForm(false);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Toggle Active/Inactive ────────────────────────────────────────────────
  const handleToggleActive = async (user) => {
    // Prevent disabling own account
    if (user._id === currentUser.id) {
      toast.error("You cannot disable your own account");
      return;
    }

    try {
      await updateUser(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? "disabled" : "enabled"}`);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  // ─── Open Reset Password Modal ─────────────────────────────────────────────
  const handleOpenResetPassword = (userId) => {
    setSelectedUserId(userId);
    setNewPassword("");
    setShowPasswordModal(true);
  };

  // ─── Submit Password Reset ─────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await resetPassword(selectedUserId, { newPassword });
      toast.success("Password reset successfully");
      setShowPasswordModal(false);
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading users...</div>;

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>User Management</h1>
          <p style={styles.subtitle}>
            Manage staff accounts and their access levels
          </p>
        </div>
        <button onClick={handleAddNew} style={styles.addBtn}>
          + Add User
        </button>
      </div>

      {/* ── Users Grid ── */}
      <div style={styles.usersGrid}>
        {users.map((user) => (
          <div
            key={user._id}
            style={{
              ...styles.userCard,
              opacity: user.isActive ? 1 : 0.6,
              borderLeft: `4px solid ${user.role === "admin" ? "#4f46e5" : "#48bb78"}`,
            }}
          >
            {/* Avatar circle with initials */}
            <div
              style={{
                ...styles.avatar,
                backgroundColor: user.role === "admin" ? "#ebf4ff" : "#f0fff4",
                color: user.role === "admin" ? "#4f46e5" : "#276749",
              }}
            >
              {/* Get first letter of name */}
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* User info */}
            <div style={styles.userInfo}>
              <div style={styles.nameRow}>
                <h3 style={styles.userName}>{user.name}</h3>
                {/* "You" badge for current user */}
                {user._id === currentUser.id && (
                  <span style={styles.youBadge}>You</span>
                )}
              </div>
              <p style={styles.userEmail}>{user.email}</p>

              {/* Role and status badges */}
              <div style={styles.badgeRow}>
                <span
                  style={{
                    ...styles.roleBadge,
                    backgroundColor:
                      user.role === "admin" ? "#ebf4ff" : "#f0fff4",
                    color: user.role === "admin" ? "#4f46e5" : "#276749",
                  }}
                >
                  {user.role === "admin" ? "👑 Admin" : "🧑‍💼 Cashier"}
                </span>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: user.isActive ? "#f0fff4" : "#fff5f5",
                    color: user.isActive ? "#276749" : "#c53030",
                  }}
                >
                  {user.isActive ? "● Active" : "● Inactive"}
                </span>
              </div>

              <p style={styles.joinDate}>
                Joined {new Date(user.createdAt).toLocaleDateString("en-MY")}
              </p>
            </div>

            {/* Action buttons */}
            <div style={styles.cardActions}>
              <button onClick={() => handleEdit(user)} style={styles.editBtn}>
                Edit
              </button>
              <button
                onClick={() => handleOpenResetPassword(user._id)}
                style={styles.passwordBtn}
              >
                🔑 Reset PW
              </button>
              {/* Don't show disable button for current user */}
              {user._id !== currentUser.id && (
                <button
                  onClick={() => handleToggleActive(user)}
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: user.isActive ? "#fff5f5" : "#f0fff4",
                    color: user.isActive ? "#c53030" : "#276749",
                  }}
                >
                  {user.isActive ? "Disable" : "Enable"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── Add/Edit User Modal ── */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingUser ? "Edit User" : "Create New User"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={styles.field}>
                <label style={styles.label}>Full Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ahmad bin Ali"
                  style={styles.input}
                />
              </div>

              {/* Email */}
              <div style={styles.field}>
                <label style={styles.label}>Email *</label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="ahmad@store.com"
                  style={styles.input}
                />
              </div>

              {/* Password — only required for new users */}
              {!editingUser && (
                <div style={styles.field}>
                  <label style={styles.label}>Password *</label>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    style={styles.input}
                  />
                </div>
              )}

              {/* Role */}
              <div style={styles.field}>
                <label style={styles.label}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="cashier">Cashier — POS access only</option>
                  <option value="admin">Admin — Full access</option>
                </select>
              </div>

              <div style={styles.btnRow}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitBtn}
                >
                  {submitting
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Reset Password Modal ── */}
      {showPasswordModal && (
        <div style={styles.overlay}>
          <div style={{ ...styles.modal, maxWidth: "400px" }}>
            <h2 style={styles.modalTitle}>Reset Password</h2>
            <p
              style={{
                color: "#718096",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              Enter a new password for this user.
            </p>

            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                style={styles.input}
              />
            </div>

            <div style={styles.btnRow}>
              <button onClick={handleResetPassword} style={styles.submitBtn}>
                Reset Password
              </button>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "32px", maxWidth: "1100px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  title: { fontSize: "24px", fontWeight: "700", color: "#1a202c" },
  subtitle: { color: "#718096", fontSize: "14px", marginTop: "4px" },
  addBtn: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  usersGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "16px",
  },
  userCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  avatar: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "800",
    alignSelf: "flex-start",
  },
  userInfo: { flex: 1 },
  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  userName: { fontSize: "16px", fontWeight: "700", color: "#1a202c" },
  youBadge: {
    backgroundColor: "#ebf4ff",
    color: "#4f46e5",
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  userEmail: { color: "#718096", fontSize: "13px", marginBottom: "10px" },
  badgeRow: {
    display: "flex",
    gap: "8px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  roleBadge: {
    padding: "3px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
  },
  statusBadge: {
    padding: "3px 10px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
  },
  joinDate: { fontSize: "11px", color: "#a0aec0" },
  cardActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    paddingTop: "12px",
    borderTop: "1px solid #f0f0f0",
  },
  editBtn: {
    padding: "6px 14px",
    backgroundColor: "#ebf4ff",
    color: "#3182ce",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  passwordBtn: {
    padding: "6px 14px",
    backgroundColor: "#faf5ff",
    color: "#6b46c1",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  toggleBtn: {
    padding: "6px 14px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "13px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "32px",
    width: "100%",
    maxWidth: "480px",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "#1a202c",
  },
  field: { marginBottom: "16px" },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "6px",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  btnRow: { display: "flex", gap: "12px", marginTop: "24px" },
  submitBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  cancelBtn: {
    flex: 1,
    padding: "12px",
    backgroundColor: "#f7fafc",
    color: "#4a5568",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default UsersPage;
