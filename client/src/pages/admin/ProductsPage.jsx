import React, { useState, useEffect } from "react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/productAPI";
import { fetchCategories } from "../../api/categoryAPI";
import toast from "react-hot-toast";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    stock: "",
    lowStockAlert: "10",
    category: "",
    barcode: "",
  });

  // Image file selected by user
  const [imageFile, setImageFile] = useState(null);

  // Preview URL for selected image
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load products and categories at the same time using Promise.all
      const [productsRes, categoriesRes] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // ─── Handle form field changes ──────────────────────────────────────────────
  const handleChange = (e) => {
    // Update only the changed field, keep the rest the same
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ─── Handle image file selection ────────────────────────────────────────────
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // get the first selected file

    if (file) {
      setImageFile(file);
      // Create a local URL to preview the image before uploading
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ─── Open form for adding ────────────────────────────────────────────────────
  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      costPrice: "",
      stock: "",
      lowStockAlert: "10",
      category: "",
      barcode: "",
    });
    setImageFile(null);
    setImagePreview("");
    setShowForm(true);
  };

  // ─── Open form for editing ───────────────────────────────────────────────────
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      stock: product.stock,
      lowStockAlert: product.lowStockAlert,
      category: product.category?._id || "",
      barcode: product.barcode,
    });
    setImageFile(null);
    setImagePreview(product.image || ""); // show existing image
    setShowForm(true);
  };

  // ─── Handle form submit ──────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Name, price and category are required");
      return;
    }

    setSubmitting(true);

    try {
      // Use FormData to send both text fields and image file together
      const data = new FormData();

      // Append all text fields to FormData
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Append image file if one was selected
      if (imageFile) {
        data.append("image", imageFile);
      }

      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
        toast.success("Product updated!");
      } else {
        await createProduct(data);
        toast.success("Product created!");
      }

      setShowForm(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Handle delete ───────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      loadData();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  // Filter products by search term
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return <div style={{ padding: "40px" }}>Loading products...</div>;

  return (
    <div style={styles.container}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <h1 style={styles.title}>Products</h1>
        <button onClick={handleAddNew} style={styles.addButton}>
          + Add Product
        </button>
      </div>

      {/* ── Search Bar ── */}
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />

      {/* ── Products Table ── */}
      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>Image</th>
              <th style={styles.th}>Name</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  style={{
                    textAlign: "center",
                    padding: "40px",
                    color: "#888",
                  }}
                >
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} style={styles.tableRow}>
                  <td style={styles.td}>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          backgroundColor: "#e2e8f0",
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "20px",
                        }}
                      >
                        📦
                      </div>
                    )}
                  </td>
                  <td style={styles.td}>
                    <strong>{product.name}</strong>
                    {product.stock <= product.lowStockAlert && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "11px",
                          backgroundColor: "#fff5f5",
                          color: "#e53e3e",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Low Stock
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    <span
                      style={{
                        backgroundColor: product.category?.color + "22",
                        color: product.category?.color,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        fontSize: "13px",
                        fontWeight: "600",
                      }}
                    >
                      {product.category?.name}
                    </span>
                  </td>
                  <td style={styles.td}>
                    RM {Number(product.price).toFixed(2)}
                  </td>
                  <td style={styles.td}>{product.stock}</td>
                  <td style={styles.td}>
                    <button
                      onClick={() => handleEdit(product)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
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
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Image Upload */}
              <div style={styles.field}>
                <label style={styles.label}>Product Image</label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      marginBottom: "8px",
                    }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>

              {/* Name */}
              <div style={styles.field}>
                <label style={styles.label}>Name *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Product name"
                  style={styles.input}
                />
              </div>

              {/* Description */}
              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <input
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Optional"
                  style={styles.input}
                />
              </div>

              {/* Price and Cost — side by side */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Price (RM) *</label>
                  <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Cost Price (RM)</label>
                  <input
                    name="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Stock and Low Stock Alert — side by side */}
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Stock *</label>
                  <input
                    name="stock"
                    type="number"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    style={styles.input}
                  />
                </div>
                <div style={{ ...styles.field, flex: 1 }}>
                  <label style={styles.label}>Low Stock Alert</label>
                  <input
                    name="lowStockAlert"
                    type="number"
                    value={formData.lowStockAlert}
                    onChange={handleChange}
                    placeholder="10"
                    style={styles.input}
                  />
                </div>
              </div>

              {/* Category */}
              <div style={styles.field}>
                <label style={styles.label}>Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  style={styles.input}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Barcode */}
              <div style={styles.field}>
                <label style={styles.label}>Barcode (optional)</label>
                <input
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Scan or type barcode"
                  style={styles.input}
                />
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
                    : editingProduct
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

const styles = {
  container: { padding: "32px", maxWidth: "1100px", margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
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
  searchInput: {
    width: "100%",
    padding: "12px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "20px",
    boxSizing: "border-box",
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
    maxWidth: "560px",
    maxHeight: "90vh",
    overflowY: "auto",
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

export default ProductsPage;
