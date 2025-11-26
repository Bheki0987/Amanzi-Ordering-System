import API from './api';

// Get my orders (customer)
export const getMyOrders = async () => {
  try {
    const response = await API.get('/orders/my-orders');
    console.log('getMyOrders response:', response.data);
    
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
    console.error('Get my orders error:', error);
    throw error;
  }
};

// Create order
export const createOrder = async (orderData) => {
  try {
    const response = await API.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

// Get all orders (provider/admin)
export const getOrders = async () => {
  try {
    const response = await API.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};

// Get provider orders (orders assigned to logged-in provider)
export const getProviderOrders = async () => {
  try {
    const response = await API.get('/orders');
    console.log('getProviderOrders response:', response.data);
    
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
    console.error('Get provider orders error:', error);
    throw error;
  }
};

// Get single order
export const getOrderById = async (orderId) => {
  try {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Get order by ID error:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await API.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Update order status error:', error);
    throw error;
  }
};

// Delete order
export const deleteOrder = async (orderId) => {
  try {
    const response = await API.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Delete order error:', error);
    throw error;
  }
};

// Get order statistics (for provider dashboard)
export const getOrderStats = async () => {
  try {
    const response = await API.get('/orders/stats');
    console.log('getOrderStats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Get order stats error:', error);
    throw error;
  }
};

export default {
  getMyOrders,
  createOrder,
  getOrders,
  getProviderOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats
};