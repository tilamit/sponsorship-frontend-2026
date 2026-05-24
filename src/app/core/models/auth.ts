import { Role } from './role';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  department?: string | null;
  role: Role;
}

// Matches the backend response — note: no `refreshToken` field
// (the refresh token lives in an httpOnly cookie set by the server).
export interface LoginResponse {
  accessToken: string;
  accessTokenExpiresAt: string;       // ISO 8601 UTC
  refreshTokenExpiresAt: string;      // ISO 8601 UTC
  user: CurrentUser;
}

export interface RefreshResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

// What we put in localStorage — refresh token expiry only, not the token.
export interface StoredAuthState {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
  user: CurrentUser;
}
