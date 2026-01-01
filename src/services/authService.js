import api from './api';
import { ENDPOINTS } from '../utils/constants';

export const authService = {
  register: (userData) => {
    return api.post(ENDPOINTS.AUTH.REGISTER, userData);
  },

  login: (email, password) => {
    return api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
  },

  getProfile: () => {
    return api.get(ENDPOINTS.AUTH.ME);
  },
};