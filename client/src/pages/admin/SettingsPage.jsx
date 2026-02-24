// client/src/pages/admin/SettingsPage.jsx

import React, { useState, useEffect } from "react";
import { fetchSettings, updateSettings } from "../../api/settingsAPI";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";
import { changePassword } from "../../api/userAPI";
import toast from "react-hot-toast";

const SettingsPage = () => {
  const { refreshSettings } = useSettings();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Store settings form state
  const [storeForm, setStoreForm] = useState({
    storeName: "",
    storeAddress: "",
    storePhone: "",
    storeEmail: "",
    currency: "RM",
    currencySymbol: "RM",
    receiptFooter: "",
  });

  // Tax settings form state
  const [taxForm, setTaxForm] = useState({
    taxEnabled: false,
    taxRate: 0,
    taxName: "SST",
  });

  // Change password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [changingPassword, setChangingPassword] = useState(false);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await fetchSettings();
      const s = res.data.settings;

      // Populate store form
      setStoreForm({
        storeName: s.storeName || "",
        storeAddress: s.storeAddress || "",
        storePhone: s.storePhone || "",
        storeEmail: s.storeEmail || "",
        currency: s.currency || "RM",
        currencySymbol: s.currencySymbol || "RM",
        receiptFooter: s.receiptFooter || "",
      });

      // Populate tax form
      setTaxForm({
        taxEnabled: s.taxEnabled || false,
        taxRate: s.taxRate || 0,
        taxName: s.taxName || "SST",
      });
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  // ─── Save Store Settings ───────────────────────────────────────────────────
  const handleSaveStore = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(storeForm);
      refreshSettings(); // update the global settings context
      toast.success("Store settings saved!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ─── Save Tax Settings ─────────────────────────────────────────────────────
  const handleSaveTax = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(taxForm);
      refreshSettings();
      toast.success("Tax settings saved!");
    } catch (error) {
      toast.error("Failed to save tax settings");
    } finally {
      setSaving(false);
    }
  };

  // ─── Change Password ───────────────────────────────────────────────────────
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading)
    return <div style={{ padding: "40px" }}>Loading settings...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Settings</h1>

      <div style={styles.grid}>
        {/* ── Store Information ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🏪 Store Information</h2>
          <p style={styles.cardDesc}>
            This info appears on receipts and reports
          </p>

          <form onSubmit={handleSaveStore}>
            <div style={styles.field}>
              <label style={styles.label}>Store Name</label>
              <input
                value={storeForm.storeName}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, storeName: e.target.value })
                }
                placeholder="My Awesome Store"
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Address</label>
              <textarea
                value={storeForm.storeAddress}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, storeAddress: e.target.value })
                }
                placeholder="123 Jalan Mawar, Kota Bharu..."
                style={{ ...styles.input, height: "80px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Phone</label>
                <input
                  value={storeForm.storePhone}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, storePhone: e.target.value })
                  }
                  placeholder="09-123 4567"
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Email</label>
                <input
                  type="email"
                  value={storeForm.storeEmail}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, storeEmail: e.target.value })
                  }
                  placeholder="store@email.com"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Currency Code</label>
                <input
                  value={storeForm.currency}
                  onChange={(e) =>
                    setStoreForm({ ...storeForm, currency: e.target.value })
                  }
                  placeholder="RM"
                  style={styles.input}
                />
              </div>
              <div style={{ ...styles.field, flex: 1 }}>
                <label style={styles.label}>Currency Symbol</label>
                <input
                  value={storeForm.currencySymbol}
                  onChange={(e) =>
                    setStoreForm({
                      ...storeForm,
                      currencySymbol: e.target.value,
                    })
                  }
                  placeholder="RM"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Receipt Footer Message</label>
              <input
                value={storeForm.receiptFooter}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, receiptFooter: e.target.value })
                }
                placeholder="Thank you for your purchase!"
                style={styles.input}
              />
            </div>

            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving..." : "Save Store Settings"}
            </button>
          </form>
        </div>

        {/* ── Tax Configuration ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🧾 Tax Configuration</h2>
          <p style={styles.cardDesc}>Configure tax applied at checkout</p>

          <form onSubmit={handleSaveTax}>
            {/* Tax toggle */}
            <div style={styles.toggleRow}>
              <div>
                <p style={styles.label}>Enable Tax</p>
                <p style={{ fontSize: "12px", color: "#a0aec0" }}>
                  Apply tax to all orders
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setTaxForm({ ...taxForm, taxEnabled: !taxForm.taxEnabled })
                }
                style={{
                  ...styles.toggleSwitch,
                  backgroundColor: taxForm.taxEnabled ? "#4f46e5" : "#cbd5e0",
                }}
              >
                <div
                  style={{
                    ...styles.toggleThumb,
                    transform: taxForm.taxEnabled
                      ? "translateX(24px)"
                      : "translateX(2px)",
                  }}
                />
              </button>
            </div>

            {/* Tax fields — only show if tax is enabled */}
            {taxForm.taxEnabled && (
              <>
                <div style={styles.field}>
                  <label style={styles.label}>Tax Name</label>
                  <input
                    value={taxForm.taxName}
                    onChange={(e) =>
                      setTaxForm({ ...taxForm, taxName: e.target.value })
                    }
                    placeholder="SST, GST, VAT..."
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Tax Rate (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={taxForm.taxRate}
                    onChange={(e) =>
                      setTaxForm({
                        ...taxForm,
                        taxRate: Number(e.target.value),
                      })
                    }
                    style={styles.input}
                  />
                </div>

                {/* Preview */}
                <div style={styles.taxPreview}>
                  <p style={{ fontSize: "13px", color: "#4a5568" }}>
                    Example: RM 100.00 item →
                    <strong style={{ color: "#4f46e5" }}>
                      {" "}
                      RM {(100 + 100 * (taxForm.taxRate / 100)).toFixed(2)}
                    </strong>{" "}
                    (RM {(100 * (taxForm.taxRate / 100)).toFixed(2)}{" "}
                    {taxForm.taxName})
                  </p>
                </div>
              </>
            )}

            <button type="submit" disabled={saving} style={styles.saveBtn}>
              {saving ? "Saving..." : "Save Tax Settings"}
            </button>
          </form>
        </div>

        {/* ── Change Password ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>🔐 Change Password</h2>
          <p style={styles.cardDesc}>Update your own account password</p>

          <form onSubmit={handleChangePassword}>
            <div style={styles.field}>
              <label style={styles.label}>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                placeholder="Enter current password"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                placeholder="Minimum 6 characters"
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                placeholder="Repeat new password"
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              disabled={changingPassword}
              style={styles.saveBtn}
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

        {/* ── Account Info ── */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>👤 Your Account</h2>
          <p style={styles.cardDesc}>Your current account details</p>

          <div style={styles.accountInfo}>
            {/* Avatar */}
            <div style={styles.accountAvatar}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            <div style={styles.accountDetails}>
              <div style={styles.accountRow}>
                <span style={styles.accountLabel}>Name</span>
                <span style={styles.accountValue}>{user?.name}</span>
              </div>
              <div style={styles.accountRow}>
                <span style={styles.accountLabel}>Email</span>
                <span style={styles.accountValue}>{user?.email}</span>
              </div>
              <div style={styles.accountRow}>
                <span style={styles.accountLabel}>Role</span>
                <span
                  style={{
                    ...styles.accountValue,
                    backgroundColor:
                      user?.role === "admin" ? "#ebf4ff" : "#f0fff4",
                    color: user?.role === "admin" ? "#4f46e5" : "#276749",
                    padding: "2px 10px",
                    borderRadius: "10px",
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                >
                  {user?.role === "admin" ? "👑 Admin" : "🧑‍💼 Cashier"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "32px", maxWidth: "1100px", margin: "0 auto" },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(460px, 1fr))",
    gap: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "28px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  cardTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "4px",
  },
  cardDesc: { fontSize: "13px", color: "#a0aec0", marginBottom: "24px" },
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
  saveBtn: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "8px",
    fontSize: "14px",
  },
  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    marginBottom: "16px",
    borderBottom: "1px solid #f0f0f0",
  },
  toggleSwitch: {
    width: "52px",
    height: "28px",
    borderRadius: "14px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.3s",
    padding: 0,
  },
  toggleThumb: {
    width: "22px",
    height: "22px",
    backgroundColor: "white",
    borderRadius: "50%",
    position: "absolute",
    top: "3px",
    transition: "transform 0.3s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },
  taxPreview: {
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
  },
  accountInfo: { display: "flex", gap: "20px", alignItems: "flex-start" },
  accountAvatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#ebf4ff",
    color: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    fontWeight: "800",
    flexShrink: 0,
  },
  accountDetails: { flex: 1 },
  accountRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    marginBottom: "12px",
    borderBottom: "1px solid #f0f0f0",
  },
  accountLabel: { fontSize: "13px", color: "#718096", fontWeight: "600" },
  accountValue: { fontSize: "14px", color: "#2d3748", fontWeight: "600" },
};

export default SettingsPage;
