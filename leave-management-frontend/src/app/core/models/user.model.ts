export interface User {
  id?: string;
  username: string;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  enabled?: boolean;
  roles?: string[];
  profilePictureUrl?: string;
  resetPasswordToken?: string;
  resetPasswordExpiry?: number;
  employeeId?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roles?: string[];
}

export interface JwtResponse {
  token: string;
  refreshToken: string;
  id: string;
  username: string;
  email: string;
  roles: string[];
}
