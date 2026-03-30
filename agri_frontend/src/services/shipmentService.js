import apiClient from '../api/axios.js';

// GET /api/shipments
export const getAllShipments = () =>
  apiClient.get('/shipments').then(r => r.data);

// GET /api/shipments/{id}
export const getShipmentById = (id) =>
  apiClient.get(`/shipments/${id}`).then(r => r.data);

// POST /api/shipments  body: { transporterId, fromPartyId, toPartyId }
export const createShipment = (data) =>
  apiClient.post('/shipments', data).then(r => r.data);

// PATCH /api/shipments/{id}/status?status=DELIVERED
export const updateShipmentStatus = (shipmentId, status) =>
  apiClient.patch(`/shipments/${shipmentId}/status?status=${status}`).then(r => r.data);
