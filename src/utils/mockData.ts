import { faker } from '@faker-js/faker';

export interface GemsTransaction {
  TRANSACTION_ID: string;
  GE_NUMBER: string;
  EVENT_ID: string;
  EVENT_NAME: string;
  FILE_ID: string;
  PDF_FILE_NAME: string;
  JSONSENTDATE: string;
  status: 'JSON_SENT' | 'PDF_SENT' | 'HRMS_RECEIVED' | 'HRMS_REJECTED' | 'DDO_RECEIVED' | 'DDO_REJECTED';
}

export interface GpfTransaction {
  TRANSACTION_ID: string;
  GPF_ID: string;
  KGID: string;
  NAME: string;
  DATE_OF_BIRTH: string;
  JOINING_DATE: string;
  POLICY_NO: string;
  POLICY_START_DATE: string;
  JSON_SENT_DATE: string;
  status: 'JSON_SENT' | 'HRMS_RECEIVED' | 'HRMS_REJECTED';
}

const eventNames = [
  'New Employee Registration',
  'Salary Update',
  'Promotion',
  'Transfer',
  'Retirement',
  'Leave Application',
  'Grade Revision',
  'Pension Update',
  'Medical Benefits',
  'House Rent Allowance'
];

// Generate GEMS data with controlled distribution to match the image
export const generateGemsData = (count: number = 612): GemsTransaction[] => {
  // Distribution to match the reference image approximately
  const statusDistribution = {
    JSON_SENT: 234,    // 29%
    PDF_SENT: 198,     // 24%  
    HRMS_RECEIVED: 185, // 23%
    DDO_RECEIVED: 156,  // 19%
    HRMS_REJECTED: 15,  // 2%
    DDO_REJECTED: 23    // 3%
  };

  const transactions: GemsTransaction[] = [];
  let currentCount = 0;

  // Generate transactions based on distribution
  Object.entries(statusDistribution).forEach(([status, targetCount]) => {
    for (let i = 0; i < targetCount; i++) {
      currentCount++;
      transactions.push({
        TRANSACTION_ID: `TXN${currentCount.toString().padStart(6, '0')}`,
        GE_NUMBER: `GE${faker.date.recent().getFullYear()}${faker.string.numeric(4)}`,
        EVENT_ID: `EVT${faker.string.numeric(3)}`,
        EVENT_NAME: faker.helpers.arrayElement(eventNames),
        FILE_ID: `FILE${currentCount.toString().padStart(3, '0')}`,
        PDF_FILE_NAME: `document_${currentCount.toString().padStart(3, '0')}.pdf`,
        JSONSENTDATE: faker.date.between({ 
          from: '2024-01-01', 
          to: '2024-12-31' 
        }).toISOString().split('T')[0],
        status: status as GemsTransaction['status'],
      });
    }
  });

  // Shuffle the array to make it look more realistic
  return faker.helpers.shuffle(transactions);
};

export const generateGpfData = (count: number = 120): GpfTransaction[] => {
  // Distribution for GPF
  const statusDistribution = {
    JSON_SENT: 45,
    HRMS_RECEIVED: 60,
    HRMS_REJECTED: 15
  };

  const transactions: GpfTransaction[] = [];
  let currentCount = 0;

  Object.entries(statusDistribution).forEach(([status, targetCount]) => {
    for (let i = 0; i < targetCount; i++) {
      currentCount++;
      const birthDate = faker.date.between({ from: '1960-01-01', to: '1990-12-31' });
      const joiningDate = faker.date.between({ from: '1985-01-01', to: '2020-12-31' });
      
      transactions.push({
        TRANSACTION_ID: `GPF${currentCount.toString().padStart(6, '0')}`,
        GPF_ID: `GPF${faker.string.numeric(5)}`,
        KGID: `KG${faker.string.numeric(7)}`,
        NAME: faker.person.fullName(),
        DATE_OF_BIRTH: birthDate.toISOString().split('T')[0],
        JOINING_DATE: joiningDate.toISOString().split('T')[0],
        POLICY_NO: `POL${faker.string.numeric(8)}`,
        POLICY_START_DATE: faker.date.between({ 
          from: joiningDate, 
          to: '2024-12-31' 
        }).toISOString().split('T')[0],
        JSON_SENT_DATE: faker.date.between({ 
          from: '2024-01-01', 
          to: '2024-12-31' 
        }).toISOString().split('T')[0],
        status: status as GpfTransaction['status'],
      });
    }
  });

  return faker.helpers.shuffle(transactions);
};

export const getStatusCounts = (data: GemsTransaction[]) => {
  const counts = {
    JSON_SENT: 0,
    PDF_SENT: 0,
    HRMS_RECEIVED: 0,
    HRMS_REJECTED: 0,
    DDO_RECEIVED: 0,
    DDO_REJECTED: 0,
  };

  data.forEach(item => {
    counts[item.status]++;
  });

  return counts;
};

export const getGpfStatusCounts = (data: GpfTransaction[]) => {
  const counts = {
    JSON_SENT: 0,
    HRMS_RECEIVED: 0,
    HRMS_REJECTED: 0,
  };

  data.forEach(item => {
    counts[item.status]++;
  });

  return counts;
};

// Sample credentials for easy testing
export const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'password123'
};

// Alternative credentials
export const DEMO_USERS = [
  { username: 'admin', password: 'password123', role: 'Administrator' },
  { username: 'user', password: 'user123', role: 'User' },
  { username: 'demo', password: 'demo123', role: 'Demo User' },
  { username: 'hrms', password: 'hrms2024', role: 'HRMS Admin' }
];
