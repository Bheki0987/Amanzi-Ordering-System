import API from './api';

export const getProviders = async () => {
  try {
    const response = await API.get('/providers');
    return response.data;
  } catch (error) {
    console.error('Error fetching providers:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getProviderById = async (providerId) => {
  try {
    const response = await API.get(`/providers/${providerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching provider details:', error.response?.data?.message || error.message);
    throw error;
  }
};