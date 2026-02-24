import React from "react";

// A reusable card that displays a single statistic
// Used for: Today's Sales, Total Orders, etc.
const StatsCard = ({ title, value, subtitle, icon, color, trend }) => {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      {/* Top row: title and icon */}
      <div style={styles.topRow}>
        <p style={styles.title}>{title}</p>
        <span style={{ ...styles.iconBox, backgroundColor: color + "22" }}>
          {icon}
        </span>
      </div>

      {/* Main value — the big number */}
      <p style={{ ...styles.value, color }}>{value}</p>

      {/* Subtitle — e.g. "This month: RM 1,200" */}
      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}

      {/* Optional trend indicator */}
      {trend && (
        <p
          style={{ ...styles.trend, color: trend >= 0 ? "#48bb78" : "#fc8181" }}
        >
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}% vs yesterday
        </p>
      )}
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "20px 24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    flex: 1,
    minWidth: "200px",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  title: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#718096",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  iconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
  },
  value: {
    fontSize: "28px",
    fontWeight: "800",
    marginBottom: "4px",
  },
  subtitle: {
    fontSize: "12px",
    color: "#a0aec0",
  },
  trend: {
    fontSize: "12px",
    fontWeight: "600",
    marginTop: "6px",
  },
};

export default StatsCard;
