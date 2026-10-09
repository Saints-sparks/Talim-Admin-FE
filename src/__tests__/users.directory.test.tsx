/** @jest-environment jsdom */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, renderWithProviders, screen, within } from '@/test-utils/render';
import { UserDirectory, USER_SEARCH_DEBOUNCE_MS } from '@/components/users/UserDirectory';
import { adminUserService } from '@/app/services/admin-user.service';
import { schoolService } from '@/app/services/school.service';
import { PARENT_ID, USER_HITS } from '@/test-utils/v15Fixtures';

const replace = jest.fn();
let search = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/talimadmindashboard/users',
  useSearchParams: () => search,
}));
jest.mock('@/app/services/admin-user.service', () => ({
  USER_SEARCH_LIMIT: 50,
  adminUserService: { search: jest.fn(), get: jest.fn(), setStatus: jest.fn() },
}));
jest.mock('@/app/services/school.service', () => ({ schoolService: { getAllSchools: jest.fn() } }));

const searchUsers = adminUserService.search as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  search = new URLSearchParams();
  searchUsers.mockResolvedValue(USER_HITS);
  (schoolService.getAllSchools as jest.Mock).mockResolvedValue({
    data: [{ _id: 's1', name: 'Greenfield Academy' }],
    meta: { total: 1, page: 1, lastPage: 1, limit: 50 },
  });
});

describe('User directory', () => {
  it('lists active users with one search, each linking to their page', async () => {
    renderWithProviders(<UserDirectory />);
    const rows = await screen.findAllByTestId('user-row');
    expect(rows).toHaveLength(2);
    expect(within(rows[1]).getByRole('link', { name: /Bola Ade/ })).toHaveAttribute('href', `/talimadmindashboard/users/${PARENT_ID}`);
    expect(within(rows[1]).getByText('Parent')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Deletion scheduled')).toBeInTheDocument();
    expect(within(rows[0]).getByText('School admin')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Active')).toBeInTheDocument();
    expect(searchUsers).toHaveBeenCalledTimes(1);
    expect(searchUsers).toHaveBeenCalledWith({ status: 'active', limit: 50 });
    expect(screen.getByText('2 users found.')).toBeInTheDocument();
  });

  it('reads its filters from the URL', async () => {
    search = new URLSearchParams('q=bola&role=parent&school=s1&status=all');
    renderWithProviders(<UserDirectory />);
    await screen.findAllByTestId('user-row');
    expect(searchUsers).toHaveBeenCalledWith({ q: 'bola', role: 'parent', schoolId: 's1', status: 'all', limit: 50 });
    expect(screen.getByLabelText('Status')).toHaveValue('all');
    expect(screen.getByLabelText('Role')).toHaveValue('parent');
  });

  it('writes a role or status change to the URL', async () => {
    const user = userEvent.setup();
    renderWithProviders(<UserDirectory />);
    await screen.findAllByTestId('user-row');
    await user.selectOptions(screen.getByLabelText('Status'), 'deletion_scheduled');
    expect(replace).toHaveBeenLastCalledWith('/talimadmindashboard/users?status=deletion_scheduled', { scroll: false });
    await user.selectOptions(screen.getByLabelText('Role'), 'teacher');
    expect(replace).toHaveBeenLastCalledWith('/talimadmindashboard/users?role=teacher', { scroll: false });
  });

  it('debounces the search: one URL change once typing stops', async () => {
    jest.useFakeTimers();
    try {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProviders(<UserDirectory />);
      await screen.findAllByTestId('user-row');
      await user.type(screen.getByLabelText('Search'), 'ngozi');
      expect(replace).not.toHaveBeenCalled();
      act(() => {
        jest.advanceTimersByTime(USER_SEARCH_DEBOUNCE_MS);
      });
      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith('/talimadmindashboard/users?q=ngozi', { scroll: false });
    } finally {
      jest.useRealTimers();
    }
  });

  it('offers to clear filters when nothing matches', async () => {
    const user = userEvent.setup();
    search = new URLSearchParams('q=zzz&status=inactive');
    searchUsers.mockResolvedValue([]);
    renderWithProviders(<UserDirectory />);
    expect(await screen.findByText('Nobody matches this search')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(replace).toHaveBeenLastCalledWith('/talimadmindashboard/users', { scroll: false });
  });

  it('shows the failure with Try again', async () => {
    searchUsers.mockRejectedValue(new Error('Network down'));
    renderWithProviders(<UserDirectory />);
    expect(await screen.findByText("We couldn't load users")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
