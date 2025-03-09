export interface LoginCredentials {
  email: string;
  password: string;
  deviceToken: string;
  platform: string;
}

export interface User {
  _id: string;
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  isActive: boolean;
  isEmailVerified: boolean;
  schoolId: {
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
    active: boolean;
    logo: string;
    createdAt: string;
    updatedAt: string;
  };
  isTwoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  devices: Array<{
    deviceToken: string;
    platform: string;
    _id: string;
    id: string;
  }>;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: User;
}

export interface AuthError {
  message: string;
  status: number;
} 