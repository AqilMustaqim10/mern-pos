import React, { useState, useEffect } from "react";
import {
  AreaChart, // the chart type we'll use
  Area, // the shaded area under the line
  XAxis, // horizontal axis
  YAxis, // vertical axis
  CartesianGrid, // the background grid lines
  Tooltip, // popup when hovering over data points
  ResponsiveContainer, // makes chart resize with its container
} from "recharts";
import { fetchSalesChart } from "../../api/reportAPI";
import toast from "react-hot-toast";

const SalesChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Currently selected period: 7, 30, or 365 days
  const [period, setPeriod] = useState(7);

  // Load chart data whenever period changes
  useEffect(() => {
    loadChartData();
  }, [period]);

  const loadChartData = async () => {
    setLoading(true);
    try {
      const res = await fetchSalesChart(period);
      setChartData(res.data.chartData);
    } catch (error) {
      toast.error("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip shown when hovering over chart
  const CustomTooltip = ({ active, payload, label }) => {
    // active means the cursor is over a data point
    if (active && payload && payload.length) {
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipDate}>{label}</p>
          <p style={{ color: "#4f46e5", fontWeight: "700" }}>
            RM {Number(payload[0]?.value || 0).toFixed(2)}
          </p>
          <p style={{ color: "#718096", fontSize: "12px" }}>
            {payload[1]?.value || 0} orders
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={styles.card}>
      {/* Card Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>Sales Overview</h3>

        {/* Period selector buttons */}
        <div style={styles.periodBtns}>
          {[
            { label: "7 Days", value: 7 },
            { label: "30 Days", value: 30 },
            { label: "12 Months", value: 365 },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => setPeriod(btn.value)}
              style={{
                ...styles.periodBtn,
                backgroundColor: period === btn.value ? "#4f46e5" : "#e2e8f0",
                color: period === btn.value ? "white" : "#4a5568",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div style={styles.loadingBox}>Loading chart...</div>
      ) : chartData.length === 0 ? (
        <div style={styles.loadingBox}>No sales data yet</div>
      ) : (
        // ResponsiveContainer makes the chart fit its parent div
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            {/* Background grid */}
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

            {/* X axis — dates */}
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#a0aec0" }}
              axisLine={false}
              tickLine={false}
            />

            {/* Y axis — amounts */}
            <YAxis
              tick={{ fontSize: 11, fill: "#a0aec0" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(val) => `RM${val}`}
            />

            {/* Hover tooltip */}
            <Tooltip content={<CustomTooltip />} />

            {/* Sales area — the filled chart */}
            <defs>
              {/* Gradient fill for the area under the line */}
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone" // smooth curved line
              dataKey="sales"
              stroke="#4f46e5" // line color
              strokeWidth={2}
              fill="url(#salesGradient)" // gradient fill
            />

            {/* Transactions area (hidden but used in tooltip) */}
            <Area
              type="monotone"
              dataKey="transactions"
              stroke="#48bb78"
              strokeWidth={0} // hidden line, just for tooltip data
              fill="transparent"
            />
          </AreaChart>
        </ResponsiveContainer>
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
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "16px", fontWeight: "700", color: "#1a202c" },
  periodBtns: { display: "flex", gap: "6px" },
  periodBtn: {
    padding: "6px 12px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  },
  loadingBox: {
    height: "280px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#a0aec0",
  },
  tooltip: {
    backgroundColor: "white",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    padding: "10px 14px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  tooltipDate: { fontSize: "12px", color: "#718096", marginBottom: "4px" },
};

export default SalesChart;
