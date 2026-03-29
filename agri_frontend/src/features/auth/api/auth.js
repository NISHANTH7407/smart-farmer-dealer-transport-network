import apiClient from '../../../api/axios';

/**
 * Mocking login if backend unavailable but attempting real call first.
 */
export const loginAPI = async ({ email, password }) => {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    // Fallback Mock for testing
    console.warn("Backend unavailable, using mock login response.");
    if (email === 'admin@agri.com' || email === 'farmer@agri.com' || email === 'dealer@agri.com') {
      const role = email.split('@')[0];
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            token: `mock-token-${role}`,
            user: {
              id: 1,
              email,
              role: role.toUpperCase(),
              name: `${role} User`
            }
          });
        }, 1000); // simulate delay
      });
    }
    throw error;
  }
};
