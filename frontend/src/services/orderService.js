import API from './api';

export const getOrders = async () => {
  try {
    const response = await API.get('/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error.response?.data?.message || error.message);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await API.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Create a new order
export const createOrder = async (orderData) => {
  try {
    const response = await API.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
};

// Cancel an order
export const cancelOrder = async (orderId) => {
  try {
    const response = await API.put(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling order:', error.response?.data?.message || error.message);
    throw error;
  }
};

// Get customer orders
export const getMyOrders = async () => {
  try {
    const response = await API.get('/orders/my-orders');
    return response.data;
  } catch (error) {
    console.error('Fetch orders error:', error);
    throw error;
  }
};

// Get provider orders
export const getProviderOrders = async () => {
  try {
    const response = await API.get('/orders/provider-orders');
    return response.data;
  } catch (error) {
    console.error('Fetch provider orders error:', error);
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

// Get provider order stats
export const getOrderStats = async () => {
  try {
    const response = await API.get('/orders/stats');
    return response.data;
  } catch (error) {
    console.error('Fetch order stats error:', error);
    throw error;
  }
};