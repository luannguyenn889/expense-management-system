export interface UserCreationRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  userId?: number;
  fullName: string;
  email: string;
}

export interface AuthenticatedUser {
  userId?: number;
  fullName?: string;
  email?: string;
}

export interface AuthSession {
  token: string;
  user?: AuthenticatedUser;
}
