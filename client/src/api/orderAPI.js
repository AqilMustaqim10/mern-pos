import API from "./axios";

// Create a new order (checkout)
export const createOrder = (orderData) => API.post("/orders", orderData);

// Get all orders (admin)
export const fetchOrders = (params) => API.get("/orders", { params });

// Get single order
export const fetchOrder = (id) => API.get(`/orders/${id}`);

// Get today's summary
export const fetchTodaySummary = () => API.get("/orders/summary/today");
