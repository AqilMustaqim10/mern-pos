import React, { useState, useEffect } from "react";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../api/categoryAPI";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  // List of all categories
  const [categories, setCategories] = useState([]);

  // Loading state while fetching
  const [loading, setLoading] = useState(true);

  // Controls whether the add/edit form modal is shown
  const [showForm, setShowForm] = useState(false);

  // The category being edited (null means we're adding new)
  const [editingCategory, setEditingCategory] = useState(null);

  // Form field states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4f46e5");

  // Loading state for form submission
  const [submitting, setSubmitting] = useState(false);

  // ─── Load Categories on Mount ───────────────────────────────────────────────
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const res = await fetchCategories();
      setCategories(res.data.categories);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  // ─── Open Form for Adding ───────────────────────────────────────────────────
  const handleAddNew = () => {
    // Clear form fields
    setEditingCategory(null);
    setName("");
    setDescription("");
    setColor("#4f46e5");
    setShowForm(true);
  };

  // ─── Open Form for Editing ──────────────────────────────────────────────────
  const handleEdit = (category) => {
    // Pre-fill form with existing data
    setEditingCategory(category);
    setName(category.name);
    setDescription(category.description);
    setColor(category.color);
    setShowForm(true);
  };

  // ─── Handle Form Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setSubmitting(true);

    try {
      if (editingCategory) {
        // Update existing category
        await updateCategory(editingCategory._id, { name, description, color });
        toast.success("Category updated!");
      } else {
        // Create new category
        await createCategory({ name, description, color });
        toast.success("Category created!");
      }

      setShowForm(false); // close form
      loadCategories(); // reload the list
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Handle Delete ──────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    // Simple confirmation before deleting
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      loadCategories(); // reload list
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  if (loading) return <div style={styles.center}>Loading categories...</div>;

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>Categories</h1>
        <button onClick={handleAddNew} style={styles.addButton}>
          + Add Category
        </button>
      </div>

      {/* ── Category Table ── */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Color</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Description</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#888",
                  }}
                >
                  No categories yet. Click "Add Category" to create one.
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} style={styles.tableRow}>
                  {/* Color swatch */}
                  <td style={styles.td}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: cat.color,
                      }}
                    />
                  </td>
                  <td style={styles.td}>
                    <strong>{cat.name}</strong>
                  </td>
                  <td style={styles.td}>{cat.description || "—"}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEdit(cat)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Add/Edit Form Modal ── */}
      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2 style={styles.modalTitle}>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={styles.field}>
                <label style={styles.label}>Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Food, Drinks"
                  style={styles.input}
                />
              </div>

              {/* Description */}
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description"
                  style={styles.input}
                />
              </div>

              {/* Color picker */}
              <div style={styles.field}>
                <label style={styles.label}>Color</label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{
                      width: "50px",
                      height: "40px",
                      cursor: "pointer",
                      border: "none",
                    }}
                  />
                  <span style={{ color: "#666" }}>{color}</span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  style={styles.submitBtn}
                >
                  {submitting
                    ? "Saving..."
                    : editingCategory
                      ? "Update"
                      : "Create"}
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
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: { padding: "32px", maxWidth: "900px", margin: "0 auto" },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "24px", fontWeight: "700", color: "#1a202c" },
  addButton: {
    padding: "10px 20px",
    backgroundColor: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tableContainer: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHeader: { backgroundColor: "#f7fafc" },
  th: {
    padding: "14px 16px",
    textAlign: "left",
    fontSize: "13px",
    fontWeight: "600",
    color: "#4a5568",
    borderBottom: "1px solid #e2e8f0",
  },
  tableRow: { borderBottom: "1px solid #e2e8f0" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#2d3748" },
  editBtn: {
    padding: "6px 14px",
    backgroundColor: "#ebf4ff",
    color: "#3182ce",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginRight: "8px",
    fontWeight: "500",
  },
  deleteBtn: {
    padding: "6px 14px",
    backgroundColor: "#fff5f5",
    color: "#e53e3e",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
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

export default CategoriesPage;
