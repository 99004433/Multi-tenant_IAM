
import axios from 'axios';

export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  (typeof process !== 'undefined' && process.env?.REACT_APP_API_BASE_URL) ||
  'http://localhost:8085/api';

export const api = axios.create({ baseURL: API_BASE, timeout: 15000 });

export const fetchDashboard = async () => {
  const p1 = api.get('/users/getAllUsers').then(r => r.data).catch(() => []);
  const p2 = api.get('/organizations').then(r => r.data).catch(() => []);
  const p3 = api.get('/groups').then(r => r.data).catch(() => []);
  const p4 = api.get('/roles').then(r => r.data).catch(() => []);
  const [users, organizations, groups, roles] = await Promise.all([p1, p2, p3, p4]);
  return { users, organizations, groups, roles };
};
