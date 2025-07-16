import axios from 'axios';
import { GemsTransaction, GpfTransaction } from '../utils/mockData';
import { cleanFilters } from '../utils/cleanFilters';

// --- STEP 1: CONFIGURE AXIOS CLIENT ---
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- STEP 2: ATTACH JWT AUTH HEADER ---
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// --- STEP 3: ERROR HANDLER ---
const handleApiError = (context: string, error: unknown, fallback: any) => {
  console.error(`[API Error] ${context}:`, error);
  return fallback;
};

// --- GEMS API ---
export const getGemsStats = async (filters: {
  geNumber?: string;
  eventName?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const cleanedParams = cleanFilters(filters);
  console.log('[API Request] GET /gems/stats with params:', cleanedParams);
  try {
    const response = await apiClient.get('/gems/stats', { params: cleanedParams });
    console.log('[API Response] /gems/stats:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError("Failed to fetch GEMS stats", error, {
      JSON_SENT: 0,
      PDF_SENT: 0,
      HRMS_RECEIVED: 0,
      HRMS_REJECTED: 0,
      DDO_RECEIVED: 0,
      DDO_REJECTED: 0,
    });
  }
};

export const getGemsTransactions = async (
  status: string | null,
  filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string }
): Promise<GemsTransaction[]> => {
  const params = {
    ...(status && { status }),
    ...cleanFilters(filters),
  };
  console.log('[API Request] GET /gems/transactions with params:', params);
  try {
    const response = await apiClient.get('/gems/transactions', { params });
    console.log(`[API Response] /gems/transactions (Status: ${status || 'ALL'}):`, response.data);
    return response.data;
  } catch (error) {
    return handleApiError("Failed to fetch GEMS transactions", error, []);
  }
};

// --- GPF API ---
export const getGpfStats = async (filters: {
  kgid?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  const cleanedParams = cleanFilters(filters);
  console.log('[API Request] GET /gpf/stats with params:', cleanedParams);
  try {
    const response = await apiClient.get('/gpf/stats', { params: cleanedParams });
    console.log('[API Response] /gpf/stats:', response.data);
    return response.data;
  } catch (error) {
    return handleApiError("Failed to fetch GPF stats", error, {
      JSON_SENT: 0,
      HRMS_RECEIVED: 0,
      HRMS_REJECTED: 0,
    });
  }
};

export const getGpfTransactions = async (
  status: string | null,
  filters: { kgid?: string; fromDate?: string; toDate?: string }
): Promise<GpfTransaction[]> => {
  const params = {
    ...(status && { status }),
    ...cleanFilters(filters),
  };
  console.log('[API Request] GET /gpf/transactions with params:', params);
  try {
    const response = await apiClient.get('/gpf/transactions', { params });
    console.log(`[API Response] /gpf/transactions (Status: ${status || 'ALL'}):`, response.data);
    return response.data;
  } catch (error) {
    return handleApiError("Failed to fetch GPF transactions", error, []);
  }
};

// --- AUTH API ---
type AuthResponse = {
  success: boolean;
  user?: { username: string; role: string };
  token?: string;
};

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  console.log('[API Request] POST /auth/login for user:', username);
  try {
    const response = await apiClient.post('/auth/login', { username, password });
    if (response.data?.token) {
      console.log('[API Response] Login successful:', response.data);
      return { success: true, user: response.data.user, token: response.data.token };
    }
    console.warn('[API Warning] Login failed: no token received');
    return { success: false };
  } catch (error) {
    return handleApiError("Login failed", error, { success: false });
  }
};

export const signupUser = async (username: string, password: string): Promise<AuthResponse> => {
  console.log('[API Request] POST /auth/signup for user:', username);
  try {
    const response = await apiClient.post('/auth/signup', { username, password });
    if (response.data?.token) {
      console.log('[API Response] Signup successful:', response.data);
      return { success: true, user: response.data.user, token: response.data.token };
    }
    console.warn('[API Warning] Signup failed: no token received');
    return { success: false };
  } catch (error) {
    return handleApiError("Signup failed", error, { success: false });
  }
};
