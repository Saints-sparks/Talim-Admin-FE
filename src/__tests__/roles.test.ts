import { PLATFORM_ADMIN_ROLE, isPlatformAdmin, isPublicRoute } from '@/lib/roles';

describe('isPlatformAdmin', () => {
  it('admits only the platform admin role', () => {
    expect(isPlatformAdmin({ role: PLATFORM_ADMIN_ROLE })).toBe(true);
  });

  it.each(['school_admin', 'school_sub_admin', 'teacher', 'student', 'parent'])(
    'refuses a %s, even with a valid Talim session for the same API origin',
    (role) => {
      expect(isPlatformAdmin({ role })).toBe(false);
    },
  );

  it('refuses a signed-out visitor', () => {
    expect(isPlatformAdmin(null)).toBe(false);
    expect(isPlatformAdmin(undefined)).toBe(false);
    expect(isPlatformAdmin({})).toBe(false);
  });

  it('is case-sensitive, matching the backend enum exactly', () => {
    expect(isPlatformAdmin({ role: 'Admin' })).toBe(false);
    expect(isPlatformAdmin({ role: 'ADMIN' })).toBe(false);
  });
});

describe('isPublicRoute', () => {
  it('treats the sign-in screen and its children as public', () => {
    expect(isPublicRoute('/talimadminlogin')).toBe(true);
    expect(isPublicRoute('/talimadminlogin/reset')).toBe(true);
  });

  it.each([
    '/talimadmindashboard',
    '/talimadmindashboard/payments',
    '/talimschool',
    '/talimsupport',
    '/SchoolProfile/abc',
    '/',
  ])('guards %s', (pathname) => {
    expect(isPublicRoute(pathname)).toBe(false);
  });

  it('does not treat a route merely prefixed by a public one as public', () => {
    expect(isPublicRoute('/talimadminloginsomething')).toBe(false);
  });
});
