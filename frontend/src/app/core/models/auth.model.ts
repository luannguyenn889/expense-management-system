export interface UserCreationRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface UserResponse {
  userId: number;
  fullName: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface AuthenticatedUser {
  userId?: number;
  fullName?: string;
  username?: string;
  email?: string;
}

export interface AuthSession {
  accessToken?: string;
  token?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: AuthenticatedUser;
}
