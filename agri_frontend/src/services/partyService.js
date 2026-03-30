import apiClient from '../api/axios.js';

export const getAllParties = () =>
  apiClient.get('/parties').then(r => r.data);
