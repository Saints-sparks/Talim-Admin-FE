/** @jest-environment jsdom */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { renderWithProviders, screen, waitFor, within } from '@/test-utils/render';
import { UserDetail } from '@/components/users/UserDetail';
import { adminUserService } from '@/app/services/admin-user.service';
import { ApiError } from '@/lib/apiError';
import { ADMIN_USER, PARENT_ID, adminUserDetail } from '@/test-utils/v15Fixtures';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/app/context/AuthContext', () => ({ useAuthContext: () => ({ user: ADMIN_USER }) }));
jest.mock('@/app/services/admin-user.service', () => ({
  USER_SEARCH_LIMIT: 50,
  adminUserService: { search: jest.fn(), get: jest.fn(), setStatus: jest.fn() },
}));

const getUser = adminUserService.get as jest.Mock;
const setStatus = adminUserService.setStatus as jest.Mock;

/**
 * A refusal as the API sends it.
 *
 * @param status - The HTTP status.
 * @param reasonCode - The route's reason (top-level `code`).
 * @returns The error.
 */
const refusal = (status: number, reasonCode: string) => new ApiError(status === 403 ? 'FORBIDDEN' : 'CONFLICT', 'No', status, [], undefined, reasonCode);

beforeEach(() => {
  jest.clearAllMocks();
  getUser.mockResolvedValue(adminUserDetail());
});

describe('User detail', () => {
  it('shows identity, school, children and recent tickets linking into the desk', async () => {
    renderWithProviders(<UserDetail id={PARENT_ID} />);
    expect(await screen.findByRole('heading', { level: 1, name: 'Bola Ade' })).toBeInTheDocument();
    expect(getUser).toHaveBeenCalledWith(PARENT_ID);
    expect(screen.getByTestId('user-status')).toHaveTextContent('Active');
    expect(screen.getByRole('link', { name: /bola@parent.test/ })).toHaveAttribute('href', 'mailto:bola@parent.test');
    expect(screen.getByRole('link', { name: 'Greenfield Academy' })).toHaveAttribute('href', '/SchoolProfile/view/s1');

    const children = screen.getByRole('region', { name: 'Children' });
    expect(within(children).getByText('Tobi Ade')).toBeInTheDocument();
    expect(within(children).getByText('JSS 2A · Greenfield Academy')).toBeInTheDocument();

    const tickets = within(screen.getByRole('list', { name: 'Recent tickets' })).getAllByRole('link');
    expect(tickets).toHaveLength(2);
    expect(tickets[0]).toHaveAttribute('href', '/talimsupport/t1');
    expect(tickets[1]).toHaveAttribute('href', '/talimsupport/t9');
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/talimadmindashboard/users');
  });

  it('shows a student’s class and no children card', async () => {
    getUser.mockResolvedValue(adminUserDetail({ role: 'student', className: 'SS 1B', children: undefined }));
    renderWithProviders(<UserDetail id={PARENT_ID} />);
    expect(await screen.findByText('SS 1B')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Children' })).toBeNull();
  });

  it('shows a scheduled deletion with its date', async () => {
    getUser.mockResolvedValue(
      adminUserDetail({
        status: 'deletion_scheduled',
        deletion: { requestedAt: '2026-10-01T10:00:00.000Z', scheduledFor: '2026-10-31T10:00:00.000Z' },
      }),
    );
    renderWithProviders(<UserDetail id={PARENT_ID} />);
    expect(await screen.findByTestId('user-status')).toHaveTextContent('Deletion scheduled');
    expect(screen.getByRole('status')).toHaveTextContent(/erased on 31 Oct 2026.*unless they sign in/);
  });

  it('shows a deleted account and offers no reactivation', async () => {
    getUser.mockResolvedValue(adminUserDetail({ status: 'deleted', isActive: false, deletion: null }));
    renderWithProviders(<UserDetail id={PARENT_ID} />);
    expect(await screen.findByTestId('user-status')).toHaveTextContent('Deleted');
    expect(screen.getByRole('status')).toHaveTextContent(/This account has been deleted.*de-identified/);
    expect(screen.queryByRole('button', { name: /Reactivate/ })).toBeNull();
  });

  it('locks the switch on your own account', async () => {
    getUser.mockResolvedValue(adminUserDetail({ id: ADMIN_USER.userId, role: 'admin', children: undefined }));
    renderWithProviders(<UserDetail id={ADMIN_USER.userId} />);
    expect(await screen.findByText(/This is your own account/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Deactivate/ })).toBeNull();
  });

  it('deactivates behind a confirm, sending the reason', async () => {
    const user = userEvent.setup();
    setStatus.mockResolvedValue(adminUserDetail({ isActive: false, status: 'inactive' }));
    renderWithProviders(<UserDetail id={PARENT_ID} />);
    await user.click(await screen.findByRole('button', { name: 'Deactivate account' }));
    const sheet = screen.getByRole('dialog', { name: 'Deactivate Bola Ade?' });
    expect(setStatus).not.toHaveBeenCalled();
    await user.type(within(sheet).getByLabelText('Reason (optional)'), 'Left the school');
    await user.click(within(sheet).getByRole('button', { name: 'Deactivate' }));
    await waitFor(() => expect(setStatus).toHaveBeenCalledWith(PARENT_ID, { isActive: false, reason: 'Left the school' }));
    expect(await screen.findByTestId('user-status')).toHaveTextContent('Deactivated');
    expect(screen.getByRole('button', { name: 'Reactivate account' })).toBeInTheDocument();
    expect(toast.success).toHaveBeenCalledWith('Bola Ade is deactivated');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('reactivates without a reason', async () => {
    const user = userEvent.setup();
    getUser.mockResolvedValue(adminUserDetail({ isActive: false, status: 'inactive' }));
    setStatus.mockResolvedValue(adminUserDetail());
    renderWithProviders(<UserDetail id={PARENT_ID} />);
    await user.click(await screen.findByRole('button', { name: 'Reactivate account' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Reactivate' }));
    await waitFor(() => expect(setStatus).toHaveBeenCalledWith(PARENT_ID, { isActive: true }));
  });

  it.each([
    [409, 'SELF', /can’t deactivate your own account/],
    [403, 'ADMIN_ACCOUNT', /Talim staff accounts/],
    [409, 'ACCOUNT_DELETED', /has been deleted/],
  ])('explains a %i %s refusal inside the sheet', async (status, code, message) => {
    const user = userEvent.setup();
    setStatus.mockRejectedValue(refusal(status, code));
    renderWithProviders(<UserDetail id={PARENT_ID} />);
    await user.click(await screen.findByRole('button', { name: 'Deactivate account' }));
    const sheet = screen.getByRole('dialog');
    await user.click(within(sheet).getByRole('button', { name: 'Deactivate' }));
    expect(await within(sheet).findByRole('alert')).toHaveTextContent(message);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('says when the user does not exist', async () => {
    getUser.mockRejectedValue(new ApiError('NOT_FOUND', 'User not found', 404));
    renderWithProviders(<UserDetail id="nope" />);
    expect(await screen.findByText('We couldn’t find that user')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});
