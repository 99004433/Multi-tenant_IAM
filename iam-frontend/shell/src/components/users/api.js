import axios from "axios";

const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:8085/api";

export const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  withCredentials: false,
});

// Optional JWT attach
export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

// USERS
export const fetchUsersPaged = (params, signal) =>
  api.get("/users", { params, signal });
export const fetchUsersByOrgPaged = (params, signal) =>
  api.get("/users/searchByOrganization", { params, signal });
export const searchUsersByEmail = (q, signal) =>
  api.get("/users/searchByEmail", { params: { q }, signal });
export const saveUser = (payload) => api.post("/users/save", payload);
export const updateUser = (id, payload) =>
  api.put(`/users/updateUser/${id}`, payload);
export const deleteUserById = (id) => api.delete(`/users/deleteById/${id}`);

// REF DATA
export const fetchOrganizations = (params, signal) =>
  api.get("/organizations", { params, signal });
export const fetchGroups = (params, signal) =>
  api.get("/groups", { params, signal });
export const fetchRoles = (params, signal) =>
  api.get("/roles", { params, signal });
