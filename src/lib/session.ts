/**
 * In-memory session store — the one place non-React code (services, the API
 * client) reads the signed-in platform administrator and their access token
 * from.
 *
 * The access token lives **only here**, in module memory. It is never written
 * to a cookie, `localStorage` or `sessionStorage`, so no script running on the
 * page (and no XSS payload) can read it back. Durability across reloads comes
 * from the `refreshToken` httpOnly cookie the backend sets on
 * `POST /auth/admin-login`: `AuthContext` calls `POST /auth/refresh` on mount
 * to mint a new access token into this store.
 *
 * `AuthContext` is the only writer; everything else reads.
 */

/** The signed-in platform administrator, as non-React code sees them. */
export interface SessionUser {
  _id?: string;
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  userAvatar?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type Listener = () => void;

let currentUser: SessionUser | null = null;
let currentToken: string | null = null;
const listeners = new Set<Listener>();

function notify(): void {
  for (const listener of listeners) listener();
}

export const sessionStore = {
  /**
   * The signed-in administrator, or `null` when signed out.
   *
   * @returns The current user.
   */
  getUser(): SessionUser | null {
    return currentUser;
  },

  /**
   * The access token requests are currently sent with.
   *
   * @returns The bearer token, or `null` when signed out.
   */
  getToken(): string | null {
    return currentToken;
  },

  /**
   * The signed-in administrator's id, or `null`.
   *
   * @returns The user id.
   */
  getUserId(): string | null {
    return currentUser?.userId ?? currentUser?._id ?? null;
  },

  /**
   * Replaces the user and, when given, the token. Called by `AuthContext`.
   *
   * @param user - The signed-in user, or `null` to clear.
   * @param token - The access token; omit to leave the current one alone.
   */
  set(user: SessionUser | null, token?: string | null): void {
    currentUser = user;
    if (token !== undefined) currentToken = token;
    notify();
  },

  /**
   * Updates the access token only, after a refresh.
   *
   * @param token - The new token, or `null`.
   */
  setToken(token: string | null): void {
    currentToken = token;
    notify();
  },

  /**
   * Merges fields into the current user, for profile edits.
   *
   * @param partial - The fields that changed.
   */
  patchUser(partial: Partial<SessionUser>): void {
    if (!currentUser) return;
    currentUser = { ...currentUser, ...partial };
    notify();
  },

  /** Clears the user and token on sign-out. */
  clear(): void {
    currentUser = null;
    currentToken = null;
    notify();
  },

  /**
   * Subscribes to session changes.
   *
   * @param listener - Called after every change.
   * @returns An unsubscribe function.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
