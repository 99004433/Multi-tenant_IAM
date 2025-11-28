import axios from "axios";
const api = axios.create({ baseURL: "http://localhost:8085/api/organizations", timeout: 15000 });

export default {
  getAll: () => api.get("").then(res => res.data),
  getById: (id) => api.get(`/${id}`).then(res => res.data),
  create: (payload) => api.post("", payload).then(res => res.data),
  update: (id, payload) => api.put(`/${id}`, payload).then(res => res.data),
  remove: (id) => api.delete(`/${id}`).then(res => res.data),
};
