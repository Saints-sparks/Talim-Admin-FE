import type { SessionUser } from '@/lib/session';

/** Body for `POST /auth/admin-login`. Mirrors `AdminLoginDto`. */
export interface LoginCredentials {
  email: string;
  password: string;
  deviceToken?: string;
  platform?: string;
}

/**
 * The signed-in platform administrator. Re-exported from the session store so
 * there is exactly one user shape in the app.
 */
export type User = SessionUser;

/** Response of `POST /auth/admin-login` and `POST /auth/refresh`. */
export interface AuthResponse {
  access_token: string;
}

/** Response of `POST /auth/introspect`. */
export interface IntrospectResponse {
  active: boolean;
  user: SessionUser | null;
  exp?: number;
  iat?: number;
}
