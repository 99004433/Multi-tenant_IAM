import axios from 'axios';

const API_BASE_URL = 'http://localhost:8082/api/groups'; // Backend URL

export const getGroups = () => axios.get(API_BASE_URL);
export const getGroupById = (id) => axios.get(`${API_BASE_URL}/getGroupById/${id}`);
export const createGroup = (group) => axios.post(`${API_BASE_URL}/create`, group);
export const updateGroup = (id, group) => axios.put(`${API_BASE_URL}/updatedGroup/${id}`, group);
export const deleteGroup = (id) => axios.delete(`${API_BASE_URL}/deleteById/${id}`);
