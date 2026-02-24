import API from "./axios";

// Get all categories
export const fetchCategories = () => API.get("/categories");

// Get single category
export const fetchCategory = (id) => API.get(`/categories/${id}`);

// Create new category (admin only)
export const createCategory = (data) => API.post("/categories", data);

// Update category (admin only)
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);

// Delete category (admin only)
export const deleteCategory = (id) => API.delete(`/categories/${id}`);
