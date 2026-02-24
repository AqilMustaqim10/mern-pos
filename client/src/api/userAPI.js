import API from "./axios";

export const fetchUsers = () => API.get("/users");
export const fetchUser = (id) => API.get(`/users/${id}`);
export const createUser = (data) => API.post("/users", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const resetPassword = (id, data) =>
  API.put(`/users/${id}/reset-password`, data);
export const changePassword = (data) => API.put("/users/change-password", data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
