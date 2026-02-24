import API from "./axios";

// Get all products — supports optional filters
// e.g. fetchProducts({ category: 'id', search: 'nasi' })
export const fetchProducts = (params) => API.get("/products", { params });

// Get single product
export const fetchProduct = (id) => API.get(`/products/${id}`);

// Create new product
// Uses FormData because we're sending an image file
export const createProduct = (formData) =>
  API.post("/products", formData, {
    headers: {
      // Let browser set Content-Type automatically for FormData
      // This ensures the correct boundary is set for multipart/form-data
      "Content-Type": "multipart/form-data",
    },
  });

// Update product
export const updateProduct = (id, formData) =>
  API.put(`/products/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Delete product
export const deleteProduct = (id) => API.delete(`/products/${id}`);
