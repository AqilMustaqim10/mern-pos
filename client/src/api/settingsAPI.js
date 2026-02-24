import API from "./axios";

export const fetchSettings = () => API.get("/settings");
export const updateSettings = (data) => API.put("/settings", data);
