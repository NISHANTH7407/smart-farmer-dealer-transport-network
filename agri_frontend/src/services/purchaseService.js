import apiClient from '../api/axios.js';

// POST /api/purchases  body: { dealerId, items: [{lotId, quantity, pricePerUnit}] }
export const createPurchase = (data) =>
  apiClient.post('/purchases', data).then(r => r.data);

// GET /api/dealers/{dealerId}/purchases
export const getMyPurchases = (dealerId) =>
  apiClient.get(`/dealers/${dealerId}/purchases`).then(r => r.data);

// GET /api/purchases
export const getAllPurchases = () =>
  apiClient.get('/purchases').then(r => r.data);

// PATCH /api/purchases/{id}/status?status=CONFIRMED
export const updatePurchaseStatus = (purchaseId, status) =>
  apiClient.patch(`/purchases/${purchaseId}/status?status=${status}`).then(r => r.data);
