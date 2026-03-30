import apiClient from '../api/axios.js';

export const createPayment = (data) =>
  apiClient.post('/payments', data).then(r => r.data);

export const getAllPayments = () =>
  apiClient.get('/payments').then(r => r.data);

export const getPaymentById = (id) =>
  apiClient.get(`/payments/${id}`).then(r => r.data);
