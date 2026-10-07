/** @jest-environment jsdom */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { act, renderWithProviders, screen, waitFor, within } from '@/test-utils/render';
import { DeskQueue, SEARCH_DEBOUNCE_MS } from '@/components/support/DeskQueue';
import { supportService } from '@/app/services/support.service';
import { schoolService } from '@/app/services/school.service';
import { ADMIN_USER, DESK_COUNTS, DESK_STAFF, OTHER_ADMIN_ID, ticketPage, ticketSummary } from '@/test-utils/v15Fixtures';

const replace = jest.fn();
let search = new URLSearchParams();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, push: jest.fn(), back: jest.fn() }),
  usePathname: () => '/talimsupport',
  useSearchParams: () => search,
}));
jest.mock('@/app/context/AuthContext', () => ({ useAuthContext: () => ({ user: ADMIN_USER }) }));
jest.mock('@/app/services/support.service', () => ({
  DESK_PAGE_SIZE: 20,
  supportService: {
    listDesk: jest.fn(),
    getDeskCounts: jest.fn(),
    listStaff: jest.fn(),
    getTicket: jest.fn(),
    postMessage: jest.fn(),
    updateTicket: jest.fn(),
  },
}));
jest.mock('@/app/services/school.service', () => ({ schoolService: { getAllSchools: jest.fn() } }));

const listDesk = supportService.listDesk as jest.Mock;
const getDeskCounts = supportService.getDeskCounts as jest.Mock;
const listStaff = supportService.listStaff as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  search = new URLSearchParams();
  listDesk.mockResolvedValue(
    ticketPage([
      ticketSummary(),
      ticketSummary({
        id: 't2',
        reference: 'TS-10002',
        subject: 'Cannot sign in on the app',
        area: 'signing_in',
        priority: 'urgent',
        status: 'in_progress',
        assignee: { id: ADMIN_USER.userId, name: 'Ada Admin' },
        unread: 2,
      }),
    ]),
  );
  getDeskCounts.mockResolvedValue(DESK_COUNTS);
  listStaff.mockResolvedValue(DESK_STAFF);
  (schoolService.getAllSchools as jest.Mock).mockResolvedValue({
    data: [{ _id: 's1', name: 'Greenfield Academy' }],
    meta: { total: 1, page: 1, lastPage: 1, limit: 50 },
  });
});

describe('Support desk queue', () => {
  it('lists the Talim desk with one list, one counts and one staff call', async () => {
    renderWithProviders(<DeskQueue />);
    const rows = await screen.findAllByTestId('desk-row');
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByRole('link', { name: /Card payment failed twice/ })).toHaveAttribute('href', '/talimsupport/t1');
    expect(within(rows[0]).getByText('Greenfield Academy')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Unassigned')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Ada Admin')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Urgent')).toBeInTheDocument();
    // The requester's messages the desk has not read.
    expect(within(rows[0]).queryByTestId('unread-badge')).toBeNull();
    expect(within(rows[1]).getByTestId('unread-badge')).toHaveTextContent('2 new messages from the requester');

    expect(listDesk).toHaveBeenCalledTimes(1);
    expect(listDesk).toHaveBeenCalledWith({ status: ['open'], page: 1 });
    expect(getDeskCounts).toHaveBeenCalledTimes(1);
    expect(getDeskCounts).toHaveBeenCalledWith(undefined);
    await waitFor(() => expect(listStaff).toHaveBeenCalledTimes(1));
  });

  it('shows the counts on every status tab, and the total on All', async () => {
    renderWithProviders(<DeskQueue />);
    const open = await screen.findByRole('tab', { name: /Open/ });
    await waitFor(() => expect(within(open).getByText('7')).toBeInTheDocument());
    expect(open).toHaveAttribute('aria-selected', 'true');
    expect(within(screen.getByRole('tab', { name: /Resolved/ })).getByText('11')).toBeInTheDocument();
    expect(within(screen.getByRole('tab', { name: /Closed/ })).getByText('40')).toBeInTheDocument();
    expect(within(screen.getByRole('tab', { name: /All/ })).getByText('63')).toBeInTheDocument();
    expect(screen.getByText('4 unassigned')).toBeInTheDocument();
    expect(screen.getByText('2 mine')).toBeInTheDocument();
  });

  it('moves between tabs and filters through the URL, back to page 1', async () => {
    const user = userEvent.setup();
    search = new URLSearchParams('page=3');
    renderWithProviders(<DeskQueue />);
    await screen.findAllByTestId('desk-row');

    await user.click(screen.getByRole('tab', { name: /In progress/ }));
    expect(replace).toHaveBeenLastCalledWith('/talimsupport?status=in_progress', { scroll: false });

    await user.selectOptions(screen.getByLabelText('Area'), 'fees');
    expect(replace).toHaveBeenLastCalledWith('/talimsupport?area=fees', { scroll: false });

    await user.selectOptions(screen.getByLabelText('Priority'), 'urgent');
    expect(replace).toHaveBeenLastCalledWith('/talimsupport?priority=urgent', { scroll: false });

    await user.selectOptions(screen.getByLabelText('Assignee'), 'unassigned');
    expect(replace).toHaveBeenLastCalledWith('/talimsupport?assignee=unassigned', { scroll: false });

    // The rest of the desk's staff, from the staff list.
    await user.selectOptions(screen.getByLabelText('Assignee'), await screen.findByRole('option', { name: 'Tunde Bello' }));
    expect(replace).toHaveBeenLastCalledWith(`/talimsupport?assignee=${OTHER_ADMIN_ID}`, { scroll: false });

    await user.click(screen.getByRole('button', { name: /School/ }));
    await user.click(await screen.findByRole('radio', { name: 'Greenfield Academy' }));
    expect(replace).toHaveBeenLastCalledWith('/talimsupport?school=s1', { scroll: false });
  });

  it('sends the filters in the URL to the API, "Assigned to me" as `me`', async () => {
    search = new URLSearchParams('status=all&area=payments&priority=high&assignee=me&school=s1&q=card&page=2');
    renderWithProviders(<DeskQueue />);
    await screen.findAllByTestId('desk-row');
    expect(listDesk).toHaveBeenCalledWith({
      area: 'payments',
      priority: 'high',
      assigneeId: 'me',
      schoolId: 's1',
      q: 'card',
      page: 2,
    });
    expect(screen.getByLabelText('Search')).toHaveValue('card');
  });

  it('debounces the search: one URL change once typing stops', async () => {
    jest.useFakeTimers();
    try {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProviders(<DeskQueue />);
      await screen.findAllByTestId('desk-row');
      replace.mockClear();

      await user.type(screen.getByLabelText('Search'), 'refund');
      expect(replace).not.toHaveBeenCalled();
      act(() => {
        jest.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
      });
      expect(replace).toHaveBeenCalledTimes(1);
      expect(replace).toHaveBeenCalledWith('/talimsupport?q=refund', { scroll: false });
    } finally {
      jest.useRealTimers();
    }
  });

  it('adds every school desk, read-only, under ?scope=all', async () => {
    search = new URLSearchParams('scope=all');
    listDesk.mockResolvedValue(
      ticketPage([
        ticketSummary({
          id: 't9',
          desk: 'school',
          access: 'observer',
          reference: 'TCKT-7K2QD9XA',
          subject: 'Bus was late',
          school: { id: 's2', name: 'Hillcrest College' },
        }),
      ]),
    );
    renderWithProviders(<DeskQueue />);
    const [row] = await screen.findAllByTestId('desk-row');
    expect(within(row).getByText('School desk · read-only')).toBeInTheDocument();
    expect(screen.getByText(/School-desk tickets are read-only here/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'All schools' })).toHaveAttribute('aria-pressed', 'true');
    expect(listDesk).toHaveBeenCalledWith({ status: ['open'], page: 1, scope: 'all' });
    expect(getDeskCounts).toHaveBeenCalledWith('all');

    await userEvent.setup().click(screen.getByRole('button', { name: 'Talim desk' }));
    expect(replace).toHaveBeenLastCalledWith('/talimsupport', { scroll: false });
  });

  it('says when nothing matches and offers to clear the filters', async () => {
    search = new URLSearchParams('area=transport');
    listDesk.mockResolvedValue(ticketPage([]));
    renderWithProviders(<DeskQueue />);
    expect(await screen.findByText('No ticket matches these filters')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(replace).toHaveBeenLastCalledWith('/talimsupport', { scroll: false });
  });

  it('shows a retryable error when the desk cannot load', async () => {
    listDesk.mockRejectedValueOnce(new Error('Desk down'));
    renderWithProviders(<DeskQueue />);
    expect(await screen.findByText("We couldn't load the support desk")).toBeInTheDocument();
    listDesk.mockResolvedValueOnce(ticketPage([ticketSummary()]));
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findAllByTestId('desk-row')).toHaveLength(1);
  });
});
