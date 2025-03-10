import { API_BASE_URL } from '../lib/api/config';

export interface School {
  _id: string;
  name: string;
  email: string;
  physicalAddress: string;
  location: {
    country: string;
    state: string;
  };
  schoolPrefix: string;
  active: boolean;
  logo?: string;
  primaryContacts: Array<{
    name: string;
    phone: string;
    email: string;
    role: string;
  }>;
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

export interface UpdateSchoolData {
  name: string;
  email: string;
  physicalAddress: string;
  location: {
    country: string;
    state: string;
  };
  primaryContacts: Array<{
    name: string;
    phone: string;
    email: string;
    role: string;
  }>;
  active: boolean;
  logo: string;
}

export const schoolService = {
  getAllSchools: async (page: number = 1, limit: number = 10, query?: string): Promise<SchoolsResponse> => {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (query) {
      searchParams.append('query', query);
    }

    const response = await fetch(`${API_BASE_URL}/schools/search?${searchParams.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch schools');
    }

    return response.json();
  },

  getSchool: async (schoolId: string): Promise<School> => {
    const response = await fetch(`${API_BASE_URL}/schools/${schoolId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch school details');
    }

    return response.json();
  },

  updateSchool: async (schoolId: string, data: UpdateSchoolData): Promise<School> => {
    const response = await fetch(`${API_BASE_URL}/schools/update/${schoolId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update school');
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