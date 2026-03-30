import apiClient from '../api/axios.js';

export const getAllTransporters = () =>
  apiClient.get('/transporters').then(r => r.data);
