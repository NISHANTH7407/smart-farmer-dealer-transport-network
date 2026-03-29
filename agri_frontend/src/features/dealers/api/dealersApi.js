import apiClient from '../../../api/axios';

export const getDealers = async (params) => {
  try {
    const res = await apiClient.get('/dealers', { params });
    const allItems = res.data || [];
    let filtered = allItems;
    if (params?.search) {
      filtered = filtered.filter(d => d.name && d.name.toLowerCase().includes(params.search.toLowerCase()));
    }
    return {
      items: filtered,
      total: filtered.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    };
  } catch (error) {
    console.error("Failed to fetch dealers", error);
    throw error;
  }
};

export const createDealer = async (data) => {
  try {
    const partyRes = await apiClient.post('/parties', {
      name: data.name,
      phone: data.phone,
      address: data.location,
      type: 'DEALER'
    });
    const partyId = partyRes.data.partyId;
    const res = await apiClient.post('/dealers', { partyId });
    return res.data;
  } catch (error) {
    console.error("Failed to create dealer", error);
    throw error;
  }
};
