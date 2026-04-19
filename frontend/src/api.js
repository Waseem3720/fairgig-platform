import axios from 'axios';

// Base URLs for all 6 microservices
const AUTH_URL = import.meta.env.VITE_AUTH_URL || 'http://localhost:8001/api/auth';
const EARNINGS_URL = import.meta.env.VITE_EARNINGS_URL || 'http://localhost:8002/api/earnings';
const ANOMALY_URL = import.meta.env.VITE_ANOMALY_URL || 'http://localhost:8003/api/anomaly';
const GRIEVANCE_URL = import.meta.env.VITE_GRIEVANCE_URL || 'http://localhost:8004/api/grievances';
const ANALYTICS_URL = import.meta.env.VITE_ANALYTICS_URL || 'http://localhost:8005/api/analytics';
const CERTIFICATE_URL = import.meta.env.VITE_CERTIFICATE_URL || 'http://localhost:8006/api/certificate';

// Helper to configure tokens
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const api = {
  auth: {
    login: (data) => axios.post(`${AUTH_URL}/login`, data),
    register: (data) => axios.post(`${AUTH_URL}/register`, data),
    me: () => axios.get(`${AUTH_URL}/me`, getAuthHeaders())
  },
  
  earnings: {
    getSummary: () => axios.get(`${EARNINGS_URL}/summary`, getAuthHeaders()),
    getShifts: () => axios.get(`${EARNINGS_URL}/shifts`, getAuthHeaders()),
    createShift: (data) => axios.post(`${EARNINGS_URL}/shifts`, data, getAuthHeaders()),
    getCityMedian: () => axios.get(`${EARNINGS_URL}/city-median`, getAuthHeaders()),
    uploadScreenshot: (shiftId, formData) => axios.post(
      `${EARNINGS_URL}/shifts/${shiftId}/screenshot`,
      formData,
      { ...getAuthHeaders(), headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' } }
    ),
    getPendingVerifications: () => axios.get(`${EARNINGS_URL}/verification/pending`, getAuthHeaders()),
    verifyShift: (id, status, notes) => axios.put(`${EARNINGS_URL}/verification/${id}`, { verification_status: status, verification_notes: notes }, getAuthHeaders())
  },

  anomaly: {
    // Judges call this directly, but we can also use it in frontend
    detect: (data) => axios.post(`${ANOMALY_URL}/detect`, data)
  },

  grievance: {
    list: () => axios.get(`${GRIEVANCE_URL}/`, getAuthHeaders()),
    create: (data) => axios.post(`${GRIEVANCE_URL}/`, data, getAuthHeaders()),
    summary: () => axios.get(`${GRIEVANCE_URL}/stats/summary`, getAuthHeaders())
  },

  analytics: {
    dashboard: () => axios.get(`${ANALYTICS_URL}/dashboard`, getAuthHeaders())
  },

  certificate: {
    generateUrl: () => {
        const token = localStorage.getItem('access_token');
        return `${CERTIFICATE_URL}/generate?token=${token}`; // using query param or just downloading via axios
    },
    download: async () => {
        const res = await axios.get(`${CERTIFICATE_URL}/generate`, {
            ...getAuthHeaders(),
            responseType: 'blob' 
        });
        const url = window.URL.createObjectURL(new Blob([res.data], {type: 'text/html'}));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `FairGig_Income_Certificate_${new Date().getTime()}.html`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }
};
