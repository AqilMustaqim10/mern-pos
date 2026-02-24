import API from "./axios";

// Get dashboard stats (cards)
export const fetchDashboardStats = () => API.get("/reports/dashboard");

// Get sales chart data
// period: 7, 30, or 365
export const fetchSalesChart = (period) =>
  API.get("/reports/sales-chart", { params: { period } });

// Get top selling products
export const fetchTopProducts = (limit = 5) =>
  API.get("/reports/top-products", { params: { limit } });

// Get payment method breakdown
export const fetchPaymentBreakdown = () => API.get("/reports/payment-methods");
