// Replace the entire file with this animated version

import React, { useState, useEffect } from "react";
import { fetchProducts } from "../../api/productAPI";
import { fetchCategories } from "../../api/categoryAPI";
import { useCart } from "../../context/CartContext";
import { useStaggered, useClickFeedback } from "../../hooks/useAnimation";
import toast from "react-hot-toast";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Track which card was just clicked for pop animation
  const [clickedId, setClickedId] = useState(null);

  const { addToCart } = useCart();
  const { getStaggerStyle } = useStaggered(0, 30);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
      ]);
      setProducts(productsRes.data.products);
      setCategories(categoriesRes.data.categories);
    } catch (error) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }

    // Trigger scale pop animation on the clicked card
    setClickedId(product._id);
    setTimeout(() => setClickedId(null), 200); // reset after animation

    addToCart(product);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || product.category?._id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Loading skeleton — shows while data loads
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.searchRow}>
          <div className="skeleton" style={{ height: "40px", width: "100%" }} />
        </div>
        <div style={styles.grid}>
          {/* Show 8 skeleton cards while loading */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={styles.productCard}>
              <div className="skeleton" style={{ paddingTop: "100%" }} />
              <div style={{ padding: "10px 12px" }}>
                <div
                  className="skeleton"
                  style={{ height: "14px", marginBottom: "6px" }}
                />
                <div
                  className="skeleton"
                  style={{ height: "14px", width: "60%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container} className="page-enter">
      {/* ── Search Bar ── */}
      <div style={styles.searchRow}>
        <input
          type="text"
          placeholder="🔍 Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* ── Category Tabs ── */}
      <div style={styles.categoryTabs}>
        <button
          onClick={() => setSelectedCategory("all")}
          className="btn-press"
          style={{
            ...styles.categoryTab,
            backgroundColor: selectedCategory === "all" ? "#4f46e5" : "#e2e8f0",
            color: selectedCategory === "all" ? "white" : "#4a5568",
          }}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
            className="btn-press"
            style={{
              ...styles.categoryTab,
              backgroundColor:
                selectedCategory === cat._id ? cat.color : "#e2e8f0",
              color: selectedCategory === cat._id ? "white" : "#4a5568",
            }}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Product Grid ── */}
      <div style={styles.grid}>
        {filteredProducts.length === 0 ? (
          <div style={styles.empty} className="anim-fadeIn">
            No products found
          </div>
        ) : (
          filteredProducts.map((product, index) => (
            <div
              key={product._id}
              onClick={() => handleAddToCart(product)}
              // Apply stagger animation to each card
              // Plus scale pop when clicked
              className={`product-card ${clickedId === product._id ? "anim-scalePop" : ""}`}
              style={{
                ...styles.productCard,
                opacity: product.stock <= 0 ? 0.5 : 1,
                cursor: product.stock <= 0 ? "not-allowed" : "pointer",
                // Stagger each card's entrance
                animation: `slideInRight 0.15s ease-out ${index * 25}ms both`,
              }}
            >
              {/* Product Image */}
              <div style={styles.imageContainer}>
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    style={styles.productImage}
                  />
                ) : (
                  <div style={styles.imagePlaceholder}>📦</div>
                )}

                {product.stock <= 0 && (
                  <div style={styles.outOfStockBadge}>Out of Stock</div>
                )}

                {/* Pulsing low stock badge */}
                {product.stock > 0 &&
                  product.stock <= product.lowStockAlert && (
                    <div
                      style={styles.lowStockBadge}
                      className="low-stock-badge"
                    >
                      Low: {product.stock}
                    </div>
                  )}
              </div>

              <div style={styles.productInfo}>
                <p style={styles.productName}>{product.name}</p>
                <p style={styles.productPrice}>
                  RM {Number(product.price).toFixed(2)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Styles are the same as before — keeping them here for completeness
const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  searchRow: { padding: "12px 16px", borderBottom: "1px solid #e2e8f0" },
  searchInput: {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
    backgroundColor: "#f7fafc",
  },
  categoryTabs: {
    display: "flex",
    gap: "8px",
    padding: "12px 16px",
    overflowX: "auto",
    borderBottom: "1px solid #e2e8f0",
    flexShrink: 0,
  },
  categoryTab: {
    padding: "6px 16px",
    border: "none",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px",
    padding: "16px",
    overflowY: "auto",
    flex: 1,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    userSelect: "none",
  },
  imageContainer: { position: "relative", paddingTop: "100%" },
  productImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  imagePlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "36px",
    backgroundColor: "#f7fafc",
  },
  outOfStockBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "rgba(229,62,62,0.9)",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  lowStockBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    backgroundColor: "rgba(237,137,54,0.9)",
    color: "white",
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 6px",
    borderRadius: "4px",
  },
  productInfo: { padding: "10px 12px" },
  productName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: "4px",
    lineHeight: "1.3",
  },
  productPrice: { fontSize: "14px", fontWeight: "700", color: "#4f46e5" },
  empty: {
    gridColumn: "1/-1",
    textAlign: "center",
    padding: "60px",
    color: "#a0aec0",
    fontSize: "16px",
  },
};

export default ProductGrid;
