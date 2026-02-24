import React, { useState, useEffect } from "react";
import { fetchProducts } from "../../api/productAPI";
import { fetchCategories } from "../../api/categoryAPI";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Get addToCart function from cart context
  const { addToCart } = useCart();

  // Load products and categories when component mounts
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

  // ─── Handle Add to Cart ────────────────────────────────────────────────────
  const handleAddToCart = (product) => {
    // Check if product is out of stock
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    addToCart(product);
    // Small feedback — don't toast every click, it's too noisy for POS
  };

  // ─── Filter Products ───────────────────────────────────────────────────────
  const filteredProducts = products.filter((product) => {
    // Filter by search term
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by category
    const matchesCategory =
      selectedCategory === "all" || product.category?._id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div style={styles.loading}>Loading products...</div>;
  }

  return (
    <div style={styles.container}>
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

      {/* ── Category Filter Tabs ── */}
      <div style={styles.categoryTabs}>
        {/* "All" tab */}
        <button
          onClick={() => setSelectedCategory("all")}
          style={{
            ...styles.categoryTab,
            backgroundColor: selectedCategory === "all" ? "#4f46e5" : "#e2e8f0",
            color: selectedCategory === "all" ? "white" : "#4a5568",
          }}
        >
          All
        </button>

        {/* One tab per category */}
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => setSelectedCategory(cat._id)}
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
          <div style={styles.empty}>No products found</div>
        ) : (
          filteredProducts.map((product) => (
            <div
              key={product._id}
              onClick={() => handleAddToCart(product)}
              style={{
                ...styles.productCard,
                opacity: product.stock <= 0 ? 0.5 : 1,
                cursor: product.stock <= 0 ? "not-allowed" : "pointer",
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
                  // Placeholder if no image
                  <div style={styles.imagePlaceholder}>📦</div>
                )}

                {/* Out of Stock Badge */}
                {product.stock <= 0 && (
                  <div style={styles.outOfStockBadge}>Out of Stock</div>
                )}

                {/* Low Stock Badge */}
                {product.stock > 0 &&
                  product.stock <= product.lowStockAlert && (
                    <div style={styles.lowStockBadge}>Low: {product.stock}</div>
                  )}
              </div>

              {/* Product Info */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "hidden",
  },
  loading: { padding: "40px", textAlign: "center", color: "#718096" },
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
    overflowX: "auto", // scroll if too many categories
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
    transition: "all 0.2s",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "12px",
    padding: "16px",
    overflowY: "auto", // scroll the grid independently
    flex: 1,
  },
  productCard: {
    backgroundColor: "white",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    transition: "transform 0.15s, box-shadow 0.15s",
    userSelect: "none", // prevent text selection on click
  },
  imageContainer: { position: "relative", paddingTop: "100%" }, // 1:1 aspect ratio
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
