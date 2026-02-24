import React from "react";
import { useCountUp } from "../../hooks/useAnimation";

const StatsCard = ({ title, value, subtitle, icon, color, trend }) => {
  // Parse numeric value for count-up animation
  // If value is "RM 1200.00", extract 1200.00
  // If value is just a number like 42, use it directly
  const numericValue = parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
  const prefix = String(value).startsWith("RM") ? "RM " : "";
  const isDecimal = String(value).includes(".");

  // Animate the number counting up on load
  const animatedNum = useCountUp(numericValue, 500);

  // Format the animated number
  const displayValue = prefix
    ? `${prefix}${animatedNum.toFixed(isDecimal ? 2 : 0)}`
    : Math.round(animatedNum).toString();

  return (
    <div
      className="stats-card anim-slideInUp"
      style={{ ...styles.card, borderTop: `4px solid ${color}` }}
    >
      <div style={styles.topRow}>
        <p style={styles.title}>{title}</p>
        <span style={{ ...styles.iconBox, backgroundColor: color + "22" }}>
          {icon}
        </span>
      </div>

      {/* Animated count-up number */}
      <p style={{ ...styles.value, color }} className="anim-countUp">
        {displayValue}
      </p>

      {subtitle && <p style={styles.subtitle}>{subtitle}</p>}

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
  value: { fontSize: "28px", fontWeight: "800", marginBottom: "4px" },
  subtitle: { fontSize: "12px", color: "#a0aec0" },
  trend: { fontSize: "12px", fontWeight: "600", marginTop: "6px" },
};

export default StatsCard;
