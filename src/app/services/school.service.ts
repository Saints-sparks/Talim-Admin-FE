import { API_BASE_URL } from '../lib/api/config';

export interface School {
  _id: string;
  name: string;
  email: string;
  physicalAddress: string;
  location: {
    country: string;
    state: string;
    _id: string;
  };
  schoolPrefix: string;
  primaryContacts: Array<{
    name: string;
    phone: string;
    email: string;
    role: string;
    _id: string;
  }>;
  active: boolean;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchoolsResponse {
  data: School[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}

export const schoolService = {
  getAllSchools: async (page: number = 1, limit: number = 10): Promise<SchoolsResponse> => {
    const response = await fetch(`${API_BASE_URL}/schools/all?page=${page}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch schools');
    }

    return response.json();
  },

  updateSchoolStatus: async (schoolId: string, active: boolean): Promise<School> => {
    const response = await fetch(`${API_BASE_URL}/schools/${schoolId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ active }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update school status');
    }

    return response.json();
  }
}; 