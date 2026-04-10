export const AUTH_SESSION_EXPIRED_EVENT = 'auth-session-expired';

export const emitAuthSessionExpired = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));
};

