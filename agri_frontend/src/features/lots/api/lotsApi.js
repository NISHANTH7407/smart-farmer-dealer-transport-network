import apiClient from '../../../api/axios';

export const getLots = async (params) => {
  try {
    const res = await apiClient.get('/lots', { params });
    const allItems = res.data || [];
    let filtered = allItems;
    if (params?.search) {
      filtered = filtered.filter(f => f.cropType && f.cropType.toLowerCase().includes(params.search.toLowerCase()));
    }
    return {
      items: filtered,
      total: filtered.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    };
  } catch (error) {
    console.error("Failed to fetch lots", error);
    throw error;
  }
};

export const createLot = async (data) => {
  try {
    const res = await apiClient.post('/lots', data);
    return res.data;
  } catch (error) {
    console.error("Failed to create lot", error);
    throw error;
  }
};
