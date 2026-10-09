import { ApiError } from '@/lib/apiError';
import {
  DEFAULT_USER_FILTERS,
  parseUserFilters,
  statusErrorMessage,
  statusLock,
  toUserQuery,
  userDisplayName,
  userFiltersToSearch,
  userHref,
} from '@/components/users/user-model';

describe('user directory filters', () => {
  it('opens on active users of any role and school', () => {
    expect(parseUserFilters(new URLSearchParams())).toEqual(DEFAULT_USER_FILTERS);
    expect(userFiltersToSearch(DEFAULT_USER_FILTERS)).toBe('');
  });

  it('round-trips every filter through the URL and drops unknown values', () => {
    const filters = parseUserFilters(new URLSearchParams('q=bola&role=parent&school=s1&status=all'));
    expect(filters).toEqual({ q: 'bola', role: 'parent', schoolId: 's1', status: 'all' });
    expect(userFiltersToSearch(filters)).toBe('?q=bola&role=parent&school=s1&status=all');
    expect(parseUserFilters(new URLSearchParams('role=wizard&status=gone'))).toEqual(DEFAULT_USER_FILTERS);
  });

  it('always sends the status, and only the filters that are set', () => {
    expect(toUserQuery(DEFAULT_USER_FILTERS, 50)).toEqual({ status: 'active', limit: 50 });
    expect(toUserQuery({ q: '  ada ', role: 'teacher', schoolId: 's2', status: 'inactive' }, 50)).toEqual({
      q: 'ada',
      role: 'teacher',
      schoolId: 's2',
      status: 'inactive',
      limit: 50,
    });
  });

  it('links a user to their page', () => {
    expect(userHref('u 1')).toBe('/talimadmindashboard/users/u%201');
  });
});

describe('user display and status', () => {
  it('names a user, falling back to the email', () => {
    expect(userDisplayName({ firstName: 'Bola', lastName: 'Ade', email: 'b@x.test' })).toBe('Bola Ade');
    expect(userDisplayName({ firstName: '', lastName: '', email: 'b@x.test' })).toBe('b@x.test');
    expect(userDisplayName({ firstName: '', lastName: '', email: null })).toBe('Unnamed user');
  });

  it('locks the switch for deleted accounts, your own and Talim staff', () => {
    expect(statusLock({ id: 'u1', role: 'parent', status: 'active' }, 'me')).toBeNull();
    expect(statusLock({ id: 'u1', role: 'parent', status: 'deleted' }, 'me')).toMatch(/deleted/);
    expect(statusLock({ id: 'me', role: 'admin', status: 'active' }, 'me')).toMatch(/your own account/);
    expect(statusLock({ id: 'u2', role: 'admin', status: 'active' }, 'me')).toMatch(/Talim staff/);
  });

  it('explains SELF, ADMIN_ACCOUNT and ACCOUNT_DELETED, and passes other messages through', () => {
    const error = (status: number, reasonCode?: string) => new ApiError('CONFLICT', 'Server says no.', status, [], undefined, reasonCode);
    expect(statusErrorMessage(error(409, 'SELF'), true)).toMatch(/can’t deactivate your own account/);
    expect(statusErrorMessage(error(409, 'SELF'), false)).toMatch(/can’t reactivate your own account/);
    expect(statusErrorMessage(error(403, 'ADMIN_ACCOUNT'), true)).toMatch(/Talim staff accounts/);
    expect(statusErrorMessage(error(409, 'ACCOUNT_DELETED'), false)).toMatch(/has been deleted/);
    expect(statusErrorMessage(error(500), true)).toBe('Server says no.');
    expect(statusErrorMessage(new Error('boom'), true)).toBe('boom');
  });
});
