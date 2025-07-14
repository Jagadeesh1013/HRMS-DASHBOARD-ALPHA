import axios from 'axios';
import { GemsTransaction, GpfTransaction } from '../utils/mockData';

// --- STEP 1: CONFIGURE YOUR BACKEND API BASE URL ---
// Replace 'http://localhost:8080/api' with the base URL of your Spring Boot application.
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // <-- IMPORTANT: SET YOUR API BASE URL HERE
  headers: {
    'Content-Type': 'application/json',
  },
});

// You can also add an interceptor to include auth tokens in requests
apiClient.interceptors.request.use(config => {
  // const token = localStorage.getItem('authToken');
  // if (token) {
  //   config.headers.Authorization = `Bearer ${token}`;
  // }
  return config;
});

// --- STEP 2: UPDATE API ENDPOINTS FOR EACH FUNCTION ---

// --- GEMS API ---

export const getGemsStats = async (filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }) => {
  try {
    // Endpoint: /gems/stats
    const response = await apiClient.get('/gems/stats', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching GEMS stats:", error);
    // Return a default zeroed structure on error
    return { JSON_SENT: 0, PDF_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0, DDO_RECEIVED: 0, DDO_REJECTED: 0 };
  }
};

export const getGemsTransactions = async (status: string, filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }): Promise<GemsTransaction[]> => {
  try {
    // Endpoint: /gems/transactions
    const response = await apiClient.get('/gems/transactions', {
      params: { status, ...filters }
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
    // Endpoint: /gpf/stats
    const response = await apiClient.get('/gpf/stats', { params: filters });
    return response.data;
  } catch (error) {
    console.error("Error fetching GPF stats:", error);
    return { JSON_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0 };
  }
};

export const getGpfTransactions = async (status: string, filters: { kgid?: string; fromDate?: string; toDate?: string; }): Promise<GpfTransaction[]> => {
  try {
    // Endpoint: /gpf/transactions
    const response = await apiClient.get('/gpf/transactions', {
      params: { status, ...filters }
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
    // Endpoint: /auth/login
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data && response.data.token) {
      // localStorage.setItem('authToken', response.data.token); // Optional: store JWT
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
    // Endpoint: /auth/signup
    const response = await apiClient.post('/auth/signup', { username, password });
    if (response.data && response.data.token) {
      // localStorage.setItem('authToken', response.data.token); // Optional: store JWT
      return { success: true, user: response.data.user, token: response.data.token };
    }
    return { success: false };
  } catch (error) {
    console.error("Signup failed:", error);
    return { success: false };
  }
};
