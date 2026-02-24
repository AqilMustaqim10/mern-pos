import React, { useState, useEffect } from "react";
import { fetchTopProducts } from "../../api/reportAPI";

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopProducts();
  }, []);

  const loadTopProducts = async () => {
    try {
      const res = await fetchTopProducts(5);
      setProducts(res.data.topProducts);
    } catch (error) {
      console.error("Failed to load top products");
    } finally {
      setLoading(false);
    }
  };

  // Find the highest quantity to calculate bar widths
  const maxQty = products.length > 0 ? products[0].totalQuantity : 1;

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🏆 Top Selling Products</h3>

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : products.length === 0 ? (
        <p style={styles.loading}>No sales data yet</p>
      ) : (
        <div style={styles.list}>
          {products.map((product, index) => (
            <div key={product._id} style={styles.item}>
              {/* Rank number */}
              <span
                style={{
                  ...styles.rank,
                  backgroundColor:
                    index === 0
                      ? "#ffd700"
                      : index === 1
                        ? "#c0c0c0"
                        : index === 2
                          ? "#cd7f32"
                          : "#e2e8f0",
                  color: index <= 2 ? "white" : "#4a5568",
                }}
              >
                {index + 1}
              </span>

              {/* Product info and bar */}
              <div style={styles.productInfo}>
                <div style={styles.nameRow}>
                  <span style={styles.productName}>{product.name}</span>
                  <span style={styles.productRevenue}>
                    RM {Number(product.totalRevenue).toFixed(2)}
                  </span>
                </div>

                {/* Progress bar showing relative quantity */}
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: `${(product.totalQuantity / maxQty) * 100}%`,
                      backgroundColor: index === 0 ? "#4f46e5" : "#a5b4fc",
                    }}
                  />
                </div>

                <span style={styles.qty}>
                  {product.totalQuantity} units sold
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  },
  title: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "20px",
  },
  loading: { color: "#a0aec0", textAlign: "center", padding: "20px" },
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  item: { display: "flex", alignItems: "center", gap: "14px" },
  rank: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "800",
    flexShrink: 0,
  },
  productInfo: { flex: 1 },
  nameRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  productName: { fontSize: "14px", fontWeight: "600", color: "#2d3748" },
  productRevenue: { fontSize: "13px", fontWeight: "700", color: "#4f46e5" },
  barTrack: {
    height: "6px",
    backgroundColor: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "4px",
  },
  barFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.5s ease",
  },
  qty: { fontSize: "11px", color: "#a0aec0" },
};

export default TopProducts;
