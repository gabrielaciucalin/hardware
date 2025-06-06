// config.js
const API_BASE_BACKEND_AUTH = 'https://hardware-backend-1045498097455.europe-central2.run.app/api';
const API_BASE_HARDWARE = 'http://192.168.56.1:5000/api/hardware';

export const ENDPOINTS = {
  LOGIN: `${API_BASE_BACKEND_AUTH}/login`,
  REGISTER: `${API_BASE_BACKEND_AUTH}/register`,
  HARDWARE_DETAILS: `${API_BASE_HARDWARE}/details`,
};
