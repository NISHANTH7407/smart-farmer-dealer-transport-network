import apiClient from '../api/axios.js';

export const loginUser = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data; // { token, user: { id, role, name, username } }
};

export const logoutUser = async () => {
  // Optional backend logout
  return true;
};

