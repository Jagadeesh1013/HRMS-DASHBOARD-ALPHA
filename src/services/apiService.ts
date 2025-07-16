import axios from 'axios';
import { GemsTransaction, GpfTransaction } from '../utils/mockData';

// --- STEP 1: CONFIGURE YOUR BACKEND API BASE URL ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // <-- IMPORTANT: SET YOUR API BASE URL HERE
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- JWT AUTHENTICATION INTERCEPTOR ---
// This interceptor automatically adds the JWT token to every request if it exists.
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- UTILITY FOR OPTIONAL FILTERS ---
// This helper function removes any null, undefined, or empty string properties
// from the filter object, so they are not sent to the backend.
const cleanFilters = (filters: object) => {
  const cleaned: { [key: string]: any } = {};
  for (const key in filters) {
    const value = (filters as any)[key];
    if (value !== null && value !== undefined && value !== '') {
      cleaned[key] = value;
    }
  }
  return cleaned;
};


// --- GEMS API ---

export const getGemsStats = async (filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }) => {
  try {
    const response = await apiClient.get('/gems/stats', { params: cleanFilters(filters) });
    return response.data;
  } catch (error) {
    console.error("Error fetching GEMS stats:", error);
    return { JSON_SENT: 0, PDF_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0, DDO_RECEIVED: 0, DDO_REJECTED: 0 };
  }
};

export const getGemsTransactions = async (status: string, filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }): Promise<GemsTransaction[]> => {
  try {
    const response = await apiClient.get('/gems/transactions', {
      params: { status, ...cleanFilters(filters) }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GEMS transactions:", error);
    return [];
  }
};

// --- GPF API ---

export const getGpfStats = async (filters: { kgid?: string; fromDate?: string; toDate?: string; }) => {
  try {
    const response = await apiClient.get('/gpf/stats', { params: cleanFilters(filters) });
    return response.data;
  } catch (error) {
    console.error("Error fetching GPF stats:", error);
    return { JSON_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0 };
  }
};

export const getGpfTransactions = async (status: string, filters: { kgid?: string; fromDate?: string; toDate?: string; }): Promise<GpfTransaction[]> => {
  try {
    const response = await apiClient.get('/gpf/transactions', {
      params: { status, ...cleanFilters(filters) }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching GPF transactions:", error);
    return [];
  }
};

// --- Auth API ---

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string; role: string }, token?: string }> => {
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data && response.data.token) {
      return { success: true, user: response.data.user, token: response.data.token };
    }
    return { success: false };
  } catch (error) {
    console.error("Login failed:", error);
    return { success: false };
  }
};

export const signupUser = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string; role: string }, token?: string }> => {
  try {
    const response = await apiClient.post('/auth/signup', { username, password });
    if (response.data && response.data.token) {
      return { success: true, user: response.data.user, token: response.data.token };
    }
    return { success: false };
  } catch (error) {
    console.error("Signup failed:", error);
    return { success: false };
  }
};
