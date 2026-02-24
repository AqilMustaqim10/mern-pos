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
  const [taxForm, setTaxForm] = useState({ taxes: [] });

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

      setStoreForm({
        storeName: s.storeName || "",
        storeAddress: s.storeAddress || "",
        storePhone: s.storePhone || "",
        storeEmail: s.storeEmail || "",
        currency: s.currency || "RM",
        currencySymbol: s.currencySymbol || "RM",
        receiptFooter: s.receiptFooter || "",
      });

      // ← The key fix: always fallback to [] if taxes is missing
      setTaxForm({ taxes: s.taxes || [] });
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
  const addTax = () => {
    const nextOrder = taxForm.taxes.length + 1;
    setTaxForm({
      taxes: [
        ...taxForm.taxes,
        { name: "", rate: 0, enabled: true, order: nextOrder },
      ],
    });
  };

  // Update a specific field of a specific tax
  const updateTax = (index, field, value) => {
    const updated = [...taxForm.taxes];
    updated[index] = { ...updated[index], [field]: value };
    setTaxForm({ taxes: updated });
  };

  // Remove a tax entry
  const removeTax = (index) => {
    const updated = taxForm.taxes.filter((_, i) => i !== index);
    // Re-number orders after deletion
    const renumbered = updated.map((t, i) => ({ ...t, order: i + 1 }));
    setTaxForm({ taxes: renumbered });
  };

  // Save taxes
  const handleSaveTax = async () => {
    setSaving(true);
    try {
      await updateSettings({ taxes: taxForm.taxes });
      refreshSettings();
      toast.success("Tax settings saved!");
    } catch (error) {
      toast.error("Failed to save");
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
          <p style={styles.cardDesc}>
            Compound taxes — each tax applies on top of the previous running
            total. Drag to reorder (lower order number = applied first).
          </p>

          {/* Tax entries list */}
          <div style={{ marginBottom: "20px" }}>
            {taxForm.taxes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "24px",
                  color: "#a0aec0",
                  backgroundColor: "#f7fafc",
                  borderRadius: "8px",
                }}
              >
                No taxes configured. Add one below.
              </div>
            ) : (
              taxForm.taxes
                .sort((a, b) => a.order - b.order) // show in application order
                .map((tax, index) => (
                  <div
                    key={index}
                    style={taxStyles.taxRow}
                    className="anim-slideInRight"
                  >
                    {/* Order number badge */}
                    <div style={taxStyles.orderBadge}>{tax.order}</div>

                    {/* Tax name */}
                    <input
                      value={tax.name}
                      onChange={(e) => updateTax(index, "name", e.target.value)}
                      placeholder="Tax name"
                      style={{ ...taxStyles.taxInput, flex: 2 }}
                    />

                    {/* Rate */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={tax.rate}
                        onChange={(e) =>
                          updateTax(index, "rate", Number(e.target.value))
                        }
                        style={{ ...taxStyles.taxInput, width: "70px" }}
                      />
                      <span style={{ color: "#718096", fontSize: "14px" }}>
                        %
                      </span>
                    </div>

                    {/* Enable/disable toggle */}
                    <button
                      type="button"
                      onClick={() => updateTax(index, "enabled", !tax.enabled)}
                      style={{
                        ...taxStyles.toggleBtn,
                        backgroundColor: tax.enabled ? "#4f46e5" : "#cbd5e0",
                      }}
                    >
                      <div
                        style={{
                          ...taxStyles.toggleThumb,
                          transform: tax.enabled
                            ? "translateX(20px)"
                            : "translateX(2px)",
                        }}
                      />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => removeTax(index)}
                      style={taxStyles.deleteBtn}
                    >
                      ✕
                    </button>
                  </div>
                ))
            )}
          </div>

          {/* Add new tax button */}
          <button type="button" onClick={addTax} style={taxStyles.addTaxBtn}>
            + Add Tax
          </button>

          {/* Compound preview */}
          {taxForm.taxes.filter((t) => t.enabled).length > 0 && (
            <div style={taxStyles.preview}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "8px",
                  color: "#4a5568",
                }}
              >
                Preview on RM 100.00:
              </p>
              {(() => {
                // Calculate compound preview
                let running = 100;
                return taxForm.taxes
                  .filter((t) => t.enabled)
                  .sort((a, b) => a.order - b.order)
                  .map((tax, i) => {
                    const base = running;
                    const amount = base * (tax.rate / 100);
                    running += amount;
                    return (
                      <p
                        key={i}
                        style={{
                          fontSize: "12px",
                          color: "#718096",
                          marginBottom: "2px",
                        }}
                      >
                        {tax.name} {tax.rate}% on RM {base.toFixed(2)} = +RM{" "}
                        {amount.toFixed(2)}
                        &nbsp;→ Running total: RM {running.toFixed(2)}
                      </p>
                    );
                  });
              })()}
              <p
                style={{
                  fontSize: "14px",
                  fontWeight: "800",
                  color: "#4f46e5",
                  marginTop: "8px",
                }}
              >
                Final: RM{" "}
                {(() => {
                  let r = 100;
                  taxForm.taxes
                    .filter((t) => t.enabled)
                    .sort((a, b) => a.order - b.order)
                    .forEach((t) => {
                      r += r * (t.rate / 100);
                    });
                  return r.toFixed(2);
                })()}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleSaveTax}
            disabled={saving}
            style={{ ...styles.saveBtn, marginTop: "16px" }}
          >
            {saving ? "Saving..." : "Save Tax Settings"}
          </button>
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
const taxStyles = {
  taxRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    padding: "10px",
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
  },
  orderBadge: {
    width: "24px",
    height: "24px",
    backgroundColor: "#4f46e5",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    flexShrink: 0,
  },
  taxInput: {
    padding: "8px 10px",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
  },
  toggleBtn: {
    width: "44px",
    height: "24px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.2s",
    padding: 0,
    flexShrink: 0,
  },
  toggleThumb: {
    width: "20px",
    height: "20px",
    backgroundColor: "white",
    borderRadius: "50%",
    position: "absolute",
    top: "2px",
    transition: "transform 0.2s",
    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
  },
  deleteBtn: {
    background: "none",
    border: "none",
    color: "#fc8181",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    padding: "4px",
  },
  addTaxBtn: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#ebf4ff",
    color: "#4f46e5",
    border: "2px dashed #bee3f8",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "14px",
  },
  preview: {
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
    padding: "14px",
    marginTop: "16px",
  },
};

export default SettingsPage;
