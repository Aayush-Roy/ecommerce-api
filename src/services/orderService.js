// /src/services/orderService.js
import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const orderService = {
  createOrder: async (orderData) => {
    try {
      console.log('🚀 Creating order with data:', {
        endpoint: ENDPOINTS.ORDERS,
        data: orderData,
        items: orderData.items?.length || 0,
        totalAmount: orderData.totalAmount
      });
      
      const response = await api.post(ENDPOINTS.ORDERS, orderData);
      
      console.log('✅ Order created successfully:', {
        status: response.status,
        data: response.data
      });
      
      return response;
    } catch (error) {
      console.error('❌ Order creation failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data
        }
      });
      throw error;
    }
  },

  getMyOrders: async () => {
    try {
      const response = await api.get(ENDPOINTS.ORDERS + '/my-orders');
      return response;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  getOrderById: async (orderId) => {
    try {
      const response = await api.get(`${ENDPOINTS.ORDERS}/${orderId}`);
      return response;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  },

  cancelOrder: async (orderId) => {
    try {
      const response = await api.put(`${ENDPOINTS.ORDERS}/${orderId}/cancel`);
      return response;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
};