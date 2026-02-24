import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchPaymentBreakdown } from "../../api/reportAPI";

// Colors for each payment method slice
const COLORS = {
  cash: "#48bb78",
  card: "#4f46e5",
  ewallet: "#f6ad55",
};

const ICONS = {
  cash: "💵",
  card: "💳",
  ewallet: "📱",
};

const PaymentBreakdown = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetchPaymentBreakdown();

      // Format data for Recharts Pie chart
      // Recharts needs: { name, value }
      const formatted = res.data.breakdown.map((item) => ({
        name: item._id, // payment method name
        value: item.count, // number of transactions
        total: item.total, // total revenue
      }));

      setData(formatted);
    } catch (error) {
      console.error("Failed to load payment breakdown");
    } finally {
      setLoading(false);
    }
  };

  // Custom label inside each pie slice
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    // Calculate position of the label
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show label if slice is big enough
    if (percent < 0.08) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="700"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>💳 Payment Methods</h3>

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : data.length === 0 ? (
        <p style={styles.loading}>No transactions yet</p>
      ) : (
        <>
          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                labelLine={false}
                label={renderCustomLabel}
              >
                {/* Each slice gets its color from the COLORS object */}
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[entry.name] || "#cbd5e0"}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} orders`, name]} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend below the chart */}
          <div style={styles.legend}>
            {data.map((item) => (
              <div key={item.name} style={styles.legendItem}>
                <div
                  style={{
                    ...styles.legendDot,
                    backgroundColor: COLORS[item.name] || "#cbd5e0",
                  }}
                />
                <div>
                  <p style={styles.legendName}>
                    {ICONS[item.name]}{" "}
                    {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                  </p>
                  <p style={styles.legendValue}>
                    {item.value} orders · RM {Number(item.total).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
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
    marginBottom: "16px",
  },
  loading: { color: "#a0aec0", textAlign: "center", padding: "20px" },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "8px",
  },
  legendItem: { display: "flex", alignItems: "center", gap: "12px" },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  legendName: { fontSize: "13px", fontWeight: "600", color: "#2d3748" },
  legendValue: { fontSize: "12px", color: "#a0aec0" },
};

export default PaymentBreakdown;
