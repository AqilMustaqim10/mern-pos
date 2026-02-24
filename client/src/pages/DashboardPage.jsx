import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { fetchDashboardStats } from "../api/reportAPI";
import StatsCard from "../components/dashboard/StatsCard";
import SalesChart from "../components/dashboard/SalesChart";
import TopProducts from "../components/dashboard/TopProducts";
import PaymentBreakdown from "../components/dashboard/PaymentBreakdown";
import toast from "react-hot-toast";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetchDashboardStats();
      setStats(res.data);
    } catch (error) {
      toast.error("Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* ── Welcome Header ── */}
      <div style={styles.welcomeRow}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back, {user?.name}! Here's what's happening today.
          </p>
        </div>
        {/* Live clock */}
        <div style={styles.dateBox}>
          <p style={styles.dateText}>
            {new Date().toLocaleDateString("en-MY", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* ── Stats Cards Row ── */}
      {loading ? (
        <div style={styles.loading}>Loading stats...</div>
      ) : (
        <div style={styles.statsRow}>
          <StatsCard
            title="Today's Sales"
            value={`RM ${stats?.today.sales.toFixed(2) || "0.00"}`}
            subtitle={`This month: RM ${stats?.month.sales.toFixed(2) || "0.00"}`}
            icon="💰"
            color="#4f46e5"
          />
          <StatsCard
            title="Today's Orders"
            value={stats?.today.transactions || 0}
            subtitle={`This month: ${stats?.month.transactions || 0} orders`}
            icon="🧾"
            color="#48bb78"
          />
          <StatsCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            subtitle={`${stats?.lowStockProducts || 0} low stock items`}
            icon="📦"
            color="#f6ad55"
          />
          <StatsCard
            title="Total Staff"
            value={stats?.totalUsers || 0}
            subtitle="Active accounts"
            icon="👤"
            color="#fc8181"
          />
        </div>
      )}

      {/* ── Charts Row ── */}
      {/* Sales chart takes 2/3 width, payment breakdown takes 1/3 */}
      <div style={styles.chartsRow}>
        <div style={styles.chartMain}>
          <SalesChart />
        </div>
        <div style={styles.chartSide}>
          <PaymentBreakdown />
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div style={styles.bottomRow}>
        <div style={styles.topProductsBox}>
          <TopProducts />
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <h3 style={styles.qaTitle}>Quick Actions</h3>
          <div style={styles.qaList}>
            {[
              { icon: "🛒", label: "Open POS", link: "/pos", color: "#4f46e5" },
              {
                icon: "📦",
                label: "Add Product",
                link: "/admin/products",
                color: "#48bb78",
              },
              {
                icon: "🏷️",
                label: "Add Category",
                link: "/admin/categories",
                color: "#f6ad55",
              },
              {
                icon: "🧾",
                label: "View Orders",
                link: "/admin/orders",
                color: "#fc8181",
              },
              {
                icon: "👥",
                label: "Manage Users",
                link: "/admin/users",
                color: "#9f7aea",
              },
            ].map((action) => (
              <a key={action.label} href={action.link} style={styles.qaItem}>
                <span
                  style={{
                    ...styles.qaIcon,
                    backgroundColor: action.color + "22",
                    color: action.color,
                  }}
                >
                  {action.icon}
                </span>
                <span style={styles.qaLabel}>{action.label}</span>
                <span style={styles.qaArrow}>→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "32px", maxWidth: "1400px", margin: "0 auto" },
  welcomeRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "28px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#1a202c",
    marginBottom: "4px",
  },
  subtitle: { color: "#718096", fontSize: "14px" },
  dateBox: { textAlign: "right" },
  dateText: {
    fontSize: "13px",
    color: "#718096",
    backgroundColor: "white",
    padding: "8px 14px",
    borderRadius: "8px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  },
  loading: { textAlign: "center", padding: "40px", color: "#a0aec0" },
  statsRow: {
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  chartsRow: { display: "flex", gap: "16px", marginBottom: "24px" },
  chartMain: { flex: 2 },
  chartSide: { flex: 1, minWidth: "280px" },
  bottomRow: { display: "flex", gap: "16px" },
  topProductsBox: { flex: 2 },
  quickActions: {
    flex: 1,
    minWidth: "240px",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    height: "fit-content",
  },
  qaTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1a202c",
    marginBottom: "16px",
  },
  qaList: { display: "flex", flexDirection: "column", gap: "8px" },
  qaItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#2d3748",
    transition: "background 0.2s",
    backgroundColor: "#f7fafc",
  },
  qaIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    flexShrink: 0,
  },
  qaLabel: { flex: 1, fontSize: "14px", fontWeight: "600" },
  qaArrow: { color: "#a0aec0", fontSize: "16px" },
};

export default DashboardPage;
