export interface UserCreationRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthenticatedUser {
  userId?: number;
  fullName?: string;
  username?: string;
  email?: string;
}

export interface AuthSession {
  token: string;
  user?: AuthenticatedUser;
}
