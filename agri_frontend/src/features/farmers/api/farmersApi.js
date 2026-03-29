import apiClient from '../../../api/axios';

// To support the lack of backend during development, we use mock logic inside the API layer.

const MOCK_FARMERS = [
  { id: 1, name: 'John Doe', phone: '+1234567890', location: 'Farm A, Region X', status: 'ACTIVE' },
  { id: 2, name: 'Siva Kumar', phone: '+9876543210', location: 'Farm B, Tamil Nadu', status: 'ACTIVE' },
  { id: 3, name: 'Jane Smith', phone: '+1122334455', location: 'Farm C, Region Y', status: 'INACTIVE' },
];

export const getFarmers = async (params) => {
  try {
    const res = await apiClient.get('/farmers', { params });
    // Backend returns a List<FarmerDTO>. We map it to pagination format.
    const allItems = res.data || [];
    let filtered = allItems;
    if (params?.search) {
      filtered = filtered.filter(f => f.name && f.name.toLowerCase().includes(params.search.toLowerCase()));
    }
    return {
      items: filtered,
      total: filtered.length,
      page: params?.page || 1,
      pageSize: params?.pageSize || 10
    };
  } catch (error) {
    console.error("Failed to fetch farmers", error);
    throw error;
  }
};

export const createFarmer = async (data) => {
  try {
    const partyRes = await apiClient.post('/parties', {
      name: data.name,
      phone: data.phone,
      address: data.location,
      type: 'FARMER'
    });
    
    const partyId = partyRes.data.partyId;
    
    const res = await apiClient.post('/farmers', {
      partyId: partyId
    });
    return res.data;
  } catch (error) {
    console.error("Failed to create farmer", error);
    throw error;
  }
};

export const updateFarmer = async ({ id, data }) => {
  try {
    const res = await apiClient.put(`/farmers/${id}`, data);
    return res.data;
  } catch (error) {
    console.warn('Mocking farmer update');
    const index = MOCK_FARMERS.findIndex(f => f.id === id);
    if (index > -1) MOCK_FARMERS[index] = { ...MOCK_FARMERS[index], ...data };
    return data;
  }
};

export const deleteFarmer = async (id) => {
  try {
     const res = await apiClient.delete(`/farmers/${id}`);
     return res.data;
  } catch (error) {
    console.warn('Mocking farmer delete');
    const index = MOCK_FARMERS.findIndex(f => f.id === id);
    if (index > -1) MOCK_FARMERS.splice(index, 1);
    return true;
  }
};
