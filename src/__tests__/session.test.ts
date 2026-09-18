/**
 * @jest-environment jsdom
 */
import { sessionStore, type SessionUser } from '@/lib/session';

const admin: SessionUser = {
  userId: 'u-1',
  email: 'admin@talim.com',
  role: 'admin',
  firstName: 'Ada',
};

describe('sessionStore', () => {
  afterEach(() => sessionStore.clear());

  it('starts empty', () => {
    expect(sessionStore.getUser()).toBeNull();
    expect(sessionStore.getToken()).toBeNull();
  });

  it('holds the access token in memory and never in web storage', () => {
    sessionStore.set(admin, 'tok-1');

    expect(sessionStore.getToken()).toBe('tok-1');
    // The whole point of T4.16: no script-readable copy of the token exists.
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(document.cookie).not.toContain('tok-1');
  });

  it('replaces the token alone on a refresh, keeping the user', () => {
    sessionStore.set(admin, 'tok-1');
    sessionStore.setToken('tok-2');

    expect(sessionStore.getToken()).toBe('tok-2');
    expect(sessionStore.getUser()).toEqual(admin);
  });

  it('leaves the token alone when set() is called without one', () => {
    sessionStore.set(admin, 'tok-1');
    sessionStore.set({ ...admin, firstName: 'Grace' });

    expect(sessionStore.getToken()).toBe('tok-1');
    expect(sessionStore.getUser()?.firstName).toBe('Grace');
  });

  it('merges profile edits without dropping other fields', () => {
    sessionStore.set(admin, 'tok-1');
    sessionStore.patchUser({ lastName: 'Lovelace' });

    expect(sessionStore.getUser()).toEqual({ ...admin, lastName: 'Lovelace' });
  });

  it('ignores a patch when signed out', () => {
    sessionStore.patchUser({ lastName: 'Lovelace' });
    expect(sessionStore.getUser()).toBeNull();
  });

  it('prefers userId over _id when reporting the user id', () => {
    sessionStore.set({ ...admin, _id: 'mongo-id' });
    expect(sessionStore.getUserId()).toBe('u-1');
  });

  it('clears both the user and the token on sign-out', () => {
    sessionStore.set(admin, 'tok-1');
    sessionStore.clear();

    expect(sessionStore.getUser()).toBeNull();
    expect(sessionStore.getToken()).toBeNull();
  });

  it('notifies subscribers on every change until they unsubscribe', () => {
    const listener = jest.fn();
    const unsubscribe = sessionStore.subscribe(listener);

    sessionStore.set(admin, 'tok-1');
    sessionStore.setToken('tok-2');
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    sessionStore.clear();
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
