import type { SessionUser } from '@/lib/session';
import type { Schema } from '@/types/apiContract';
import type { AdminLoginPayload } from '@/types/apiPayloads';

/** Body for `POST /auth/admin-login`, from the generated contract. */
export type LoginCredentials = AdminLoginPayload;

/**
 * The signed-in platform administrator. Re-exported from the session store so
 * there is exactly one user shape in the app.
 */
export type User = SessionUser;

/**
 * Response of `POST /auth/refresh` (`AccessTokenResponseDto`), which
 * `POST /auth/admin-login` also returns; the contract leaves admin-login's own
 * 200 body undocumented.
 */
export type AuthResponse = Schema<'AccessTokenResponseDto'>;

/** Response of `POST /auth/introspect` (`IntrospectResponseDto`), from the generated contract. */
export type IntrospectResponse = Schema<'IntrospectResponseDto'>;
