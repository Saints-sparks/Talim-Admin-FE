export const API_BASE_URL = 'https://talim-be-dev.onrender.com';

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REFRESH_TOKEN: `${API_BASE_URL}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  INTROSPECT: `${API_BASE_URL}/auth/introspect`,

  SCHOOLS_SEARCH: `${API_BASE_URL}/schools/search`,
  SCHOOL_CREATE: `${API_BASE_URL}/schools/create`,
  SCHOOL_BY_ID: (schoolId: string) => `${API_BASE_URL}/schools/${schoolId}`,
  SCHOOL_UPDATE: (schoolId: string) =>
    `${API_BASE_URL}/schools/update/${schoolId}`,
  SCHOOL_STATUS: (schoolId: string) =>
    `${API_BASE_URL}/schools/${schoolId}/status`,

  NOTIFICATIONS: `${API_BASE_URL}/notifications`,

  PROFILE_UPDATE: `${API_BASE_URL}/auth/profile/update/`,
  PROFILE_AVATAR: `${API_BASE_URL}/auth/profile/avatar`,
  PROFILE_BY_ID: (userId: string) => `${API_BASE_URL}/auth/profile/${userId}`,
} as const;
