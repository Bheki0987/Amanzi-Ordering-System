import axios from 'axios';

const API_URL = 'http://localhost:5000/api/password';

// Request password reset
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot`, { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

// Reset password with token
export const resetPassword = async (resetToken, password) => {
  try {
    const response = await axios.put(`${API_URL}/reset/${resetToken}`, { password });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

// Verify reset token
export const verifyResetToken = async (resetToken) => {
  try {
    const response = await axios.get(`${API_URL}/verify/${resetToken}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Invalid or expired token' };
  }
};