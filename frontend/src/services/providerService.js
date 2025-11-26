import API from './api';

// Get all providers (should use /available for customers)
export const getProviders = async () => {
  try {
    // ✅ CHANGED: Use /available endpoint to get only available providers
    const response = await API.get('/providers/available');
    console.log('Providers API response:', response.data);
    
    // Handle different response formats
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Get providers error:', error);
    return [];
  }
};

// Get available providers
export const getAvailableProviders = async () => {
  try {
    const response = await API.get('/providers/available');
    console.log('Available providers response:', response.data);
    
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Get available providers error:', error);
    return [];
  }
};

// Get provider profile
export const getProviderProfile = async () => {
  try {
    const response = await API.get('/providers/profile');
    return response.data;
  } catch (error) {
    console.error('Get provider profile error:', error);
    throw error;
  }
};

// Update provider profile
export const updateProviderProfile = async (profileData) => {
  try {
    const response = await API.put('/providers/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Update provider profile error:', error);
    throw error;
  }
};

// Update provider availability status
export const updateProviderAvailability = async (status) => {
  try {
    const response = await API.put('/providers/availability', { status });
    return response.data;
  } catch (error) {
    console.error('Update provider availability error:', error);
    throw error;
  }
};

export default {
  getProviders,
  getAvailableProviders,
  getProviderProfile,
  updateProviderProfile,
  updateProviderAvailability
};