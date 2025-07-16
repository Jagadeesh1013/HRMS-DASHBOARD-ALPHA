import axios from 'axios';
import { GemsTransaction, GpfTransaction } from '../utils/mockData';
import { cleanFilters } from '../utils/cleanFilters';

// --- STEP 1: CONFIGURE YOUR BACKEND API BASE URL ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api', // <-- IMPORTANT: SET YOUR API BASE URL HERE
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- JWT AUTHENTICATION REQUEST INTERCEPTOR ---
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- NEW: GLOBAL AUTHENTICATION RESPONSE INTERCEPTOR ---
// This will automatically handle 401/403 errors and log the user out.
apiClient.interceptors.response.use(
  response => response, // Pass through successful responses
  error => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.error("Authentication Error:", error.response.status, "Logging out.");
      // Clear user session from storage
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      // Redirect to the login page to re-authenticate
      // We use window.location to navigate outside of React's router context
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    // Return the error to be caught by the original function call
    return Promise.reject(error);
  }
);


// --- GEMS API ---

export const getGemsStats = async (filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }) => {
  const cleanedParams = cleanFilters(filters);
  console.log('[API Request] GET /gems/stats with params:', cleanedParams);
  try {
    const response = await apiClient.get('/gems/stats', { params: cleanedParams });
    console.log('[API Response] GET /gems/stats:', response.data);
    return response.data;
  } catch (error) {
    console.error("[API Error] Failed to fetch GEMS stats:", error);
    return { JSON_SENT: 0, PDF_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0, DDO_RECEIVED: 0, DDO_REJECTED: 0 };
  }
};

export const getGemsTransactions = async (status: string | null, filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }): Promise<GemsTransaction[]> => {
  const params = {
    ...(status && { status }), // Add status only if it's not null
    ...cleanFilters(filters),
  };
  console.log('[API Request] GET /gems/transactions with params:', params);
  try {
    const response = await apiClient.get('/gems/transactions', { params });
    console.log(`[API Response] GET /gems/transactions (Status: ${status || 'ALL'})`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[API Error] Failed to fetch GEMS transactions (Status: ${status || 'ALL'}):`, error);
    return [];
  }
};

// --- GPF API ---

export const getGpfStats = async (filters: { kgid?: string; fromDate?: string; toDate?: string; }) => {
  const cleanedParams = cleanFilters(filters);
  console.log('[API Request] GET /gpf/stats with params:', cleanedParams);
  try {
    const response = await apiClient.get('/gpf/stats', { params: cleanedParams });
    console.log('[API Response] GET /gpf/stats:', response.data);
    return response.data;
  } catch (error) {
    console.error("[API Error] Failed to fetch GPF stats:", error);
    return { JSON_SENT: 0, HRMS_RECEIVED: 0, HRMS_REJECTED: 0 };
  }
};

export const getGpfTransactions = async (status: string | null, filters: { kgid?: string; fromDate?: string; toDate?: string; }): Promise<GpfTransaction[]> => {
  const params = {
    ...(status && { status }), // Add status only if it's not null
    ...cleanFilters(filters),
  };
  console.log('[API Request] GET /gpf/transactions with params:', params);
  try {
    const response = await apiClient.get('/gpf/transactions', { params });
    console.log(`[API Response] GET /gpf/transactions (Status: ${status || 'ALL'})`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[API Error] Failed to fetch GPF transactions (Status: ${status || 'ALL'}):`, error);
    return [];
  }
};

// --- Auth API ---

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string; role: string }, token?: string }> => {
  console.log('[API Request] POST /auth/login for user:', username);
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data && response.data.token) {
      console.log('[API Response] Login successful for user:', username);
      return { success: true, user: response.data.user, token: response.data.token };
    }
    console.warn('[API Response] Login failed, no token received.');
    return { success: false };
  } catch (error) {
    console.error("[API Error] Login failed:", error);
    return { success: false };
  }
};

export const signupUser = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string; role: string }, token?: string }> => {
  console.log('[API Request] POST /auth/signup for user:', username);
  try {
    const response = await apiClient.post('/auth/signup', { username, password });
    if (response.data && response.data.token) {
      console.log('[API Response] Signup successful for user:', username);
      return { success: true, user: response.data.user, token: response.data.token };
    }
    console.warn('[API Response] Signup failed, no token received.');
    return { success: false };
  } catch (error) {
    console.error("[API Error] Signup failed:", error);
    return { success: false };
  }
};
