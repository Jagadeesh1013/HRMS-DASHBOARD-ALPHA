import {
  generateGemsData,
  generateGpfData,
  getStatusCounts,
  getGpfStatusCounts,
  DEMO_USERS,
  GemsTransaction,
  GpfTransaction,
} from '../utils/mockData';

// Simulate API latency
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- GEMS API ---

export const getGemsStats = async (filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }) => {
  await sleep(500); // Simulate network delay
  
  // In a real app, filters would be sent to the backend
  const allData = generateGemsData(611); // Assuming we get all data and filter client-side for mock
  const filteredData = allData.filter(item => {
      const matchesGeNumber = !filters.geNumber || item.GE_NUMBER.toLowerCase().includes(filters.geNumber.toLowerCase());
      const matchesEventName = !filters.eventName || item.EVENT_NAME.toLowerCase().includes(filters.eventName.toLowerCase());
      const matchesFromDate = !filters.fromDate || item.JSONSENTDATE >= filters.fromDate;
      const matchesToDate = !filters.toDate || item.JSONSENTDATE <= filters.toDate;
      return matchesGeNumber && matchesEventName && matchesFromDate && matchesToDate;
  });

  return getStatusCounts(filteredData);
};

export const getGemsTransactions = async (status: string, filters: { geNumber?: string; eventName?: string; fromDate?: string; toDate?: string; }): Promise<GemsTransaction[]> => {
    await sleep(700);
    
    // In a real app, status and filters would be query params
    const allData = generateGemsData(611);
    const filteredData = allData.filter(item => {
        const matchesStatus = item.status === status;
        const matchesGeNumber = !filters.geNumber || item.GE_NUMBER.toLowerCase().includes(filters.geNumber.toLowerCase());
        const matchesEventName = !filters.eventName || item.EVENT_NAME.toLowerCase().includes(filters.eventName.toLowerCase());
        const matchesFromDate = !filters.fromDate || item.JSONSENTDATE >= filters.fromDate;
        const matchesToDate = !filters.toDate || item.JSONSENTDATE <= filters.toDate;
        return matchesStatus && matchesGeNumber && matchesEventName && matchesFromDate && matchesToDate;
    });

    return filteredData;
};


// --- GPF API ---

export const getGpfStats = async (filters: { kgid?: string; fromDate?: string; toDate?: string; }) => {
  await sleep(500);
  
  const allData = generateGpfData(120);
  const filteredData = allData.filter(item => {
      const matchesKgid = !filters.kgid || item.KGID.toLowerCase().includes(filters.kgid.toLowerCase());
      const matchesFromDate = !filters.fromDate || item.JSON_SENT_DATE >= filters.fromDate;
      const matchesToDate = !filters.toDate || item.JSON_SENT_DATE <= filters.toDate;
      return matchesKgid && matchesFromDate && matchesToDate;
  });

  return getGpfStatusCounts(filteredData);
};

export const getGpfTransactions = async (status: string, filters: { kgid?: string; fromDate?: string; toDate?: string; }): Promise<GpfTransaction[]> => {
    await sleep(700);

    const allData = generateGpfData(120);
    const filteredData = allData.filter(item => {
        const matchesStatus = item.status === status;
        const matchesKgid = !filters.kgid || item.KGID.toLowerCase().includes(filters.kgid.toLowerCase());
        const matchesFromDate = !filters.fromDate || item.JSON_SENT_DATE >= filters.fromDate;
        const matchesToDate = !filters.toDate || item.JSON_SENT_DATE <= filters.toDate;
        return matchesStatus && matchesKgid && matchesFromDate && matchesToDate;
    });

    return filteredData;
};


// --- Auth API ---

export const loginUser = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string; role: string } }> => {
  await sleep(800);
  
  const validUser = DEMO_USERS.find(
    u => u.username === username && u.password === password
  );

  if (validUser) {
    return { success: true, user: { username: validUser.username, role: validUser.role } };
  }
  
  // Fallback for demo purposes
  if (username && password) {
    return { success: true, user: { username, role: 'User' } };
  }

  return { success: false };
};

export const signupUser = async (username: string, password: string): Promise<{ success: boolean; user?: { username: string; role: string } }> => {
  await sleep(800);
  
  if (username && password && password.length >= 6) {
    return { success: true, user: { username, role: 'New User' } };
  }
  
  return { success: false };
};
