export const setAuthToken = (token) => {
  localStorage.setItem('agri_token', token);
};

export const getAuthToken = () => {
  return localStorage.getItem('agri_token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('agri_token');
};

export const setUserRole = (role) => {
  localStorage.setItem('agri_role', role);
};

export const getUserRole = () => {
  return localStorage.getItem('agri_role');
};

export const setUserId = (id) => {
  localStorage.setItem('agri_user_id', id);
};

export const getUserId = () => {
  return localStorage.getItem('agri_user_id');
};

export const setUserName = (name) => {
  localStorage.setItem('agri_user_name', name);
};

export const getUserName = () => {
  return localStorage.getItem('agri_user_name');
};

export const setUserStatus = (status) => {
  localStorage.setItem('agri_user_status', status);
};

export const getUserStatus = () => {
  return localStorage.getItem('agri_user_status');
};

export const clearAuth = () => {
  removeAuthToken();
  localStorage.removeItem('agri_role');
  localStorage.removeItem('agri_user_id');
  localStorage.removeItem('agri_user_name');
  localStorage.removeItem('agri_user_status');
  window.location.href = '/login'; // Redirect to login
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};
