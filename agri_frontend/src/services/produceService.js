import apiClient from '../api/axios.js';

// POST /api/farmers/{farmerId}/lots  — farmerId set by path, NOT in body
export const createProduceLot = (farmerId, lotData) => {
  const { farmerId: _ignore, ...body } = lotData; // strip farmerId from body
  return apiClient.post(`/farmers/${farmerId}/lots`, body).then(r => r.data);
};

// GET /api/farmers/{farmerId}/lots
export const getMyProduceLots = (farmerId) =>
  apiClient.get(`/farmers/${farmerId}/lots`).then(r => r.data);

// GET /api/lots  — all lots (for dealer browse)
export const getAvailableProduceLots = () =>
  apiClient.get('/lots').then(r => r.data);

export const getLotById = (id) =>
  apiClient.get(`/lots/${id}`).then(r => r.data);
