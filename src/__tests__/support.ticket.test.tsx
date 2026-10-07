/** @jest-environment jsdom */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { renderWithProviders, screen, waitFor, within } from '@/test-utils/render';
import { TicketView } from '@/components/support/TicketView';
import { supportService } from '@/app/services/support.service';
import { uploadFile } from '@/app/services/upload.service';
import { ApiError } from '@/lib/apiError';
import { ADMIN_USER, DESK_STAFF, OTHER_ADMIN_ID, ticket } from '@/test-utils/v15Fixtures';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
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
jest.mock('@/app/services/upload.service', () => ({
  ...jest.requireActual('@/app/services/upload.service'),
  uploadFile: jest.fn(),
}));

const getTicket = supportService.getTicket as jest.Mock;
const postMessage = supportService.postMessage as jest.Mock;
const updateTicket = supportService.updateTicket as jest.Mock;
const listStaff = supportService.listStaff as jest.Mock;
/**
 * A 409 as the API sends it.
 *
 * @param reasonCode - The route's reason (top-level `code`).
 * @returns The error.
 */
const conflict = (reasonCode: string) => new ApiError('CONFLICT', 'Conflict', 409, [], undefined, reasonCode);

beforeEach(() => {
  jest.clearAllMocks();
  getTicket.mockResolvedValue(ticket());
  postMessage.mockResolvedValue(ticket());
  updateTicket.mockResolvedValue(ticket());
  listStaff.mockResolvedValue(DESK_STAFF);
});

/**
 * Renders the ticket page and waits for the thread.
 *
 * @returns The user-event instance.
 */
async function open() {
  const user = userEvent.setup();
  renderWithProviders(<TicketView id="t1" />);
  await screen.findByRole('list', { name: 'Conversation' });
  return user;
}

describe('Ticket thread', () => {
  it('sets internal notes apart from replies', async () => {
    await open();
    const items = Array.from(screen.getByRole('list', { name: 'Conversation' }).children) as HTMLElement[];
    expect(items).toHaveLength(3);
    expect(items[0]).not.toHaveAttribute('data-internal');
    expect(items[2]).toHaveAttribute('data-internal', 'true');
    expect(within(items[2]).getByText('Internal note')).toBeInTheDocument();
    expect(within(items[2]).getByText('Only Talim staff can see this note.')).toBeInTheDocument();
    expect(within(items[0]).queryByText('Internal note')).toBeNull();
    expect(within(items[0]).getByRole('link', { name: /receipt\.pdf/ })).toHaveAttribute('href', 'https://cdn.test/receipt.pdf');
  });

  it('shows the requester, the school, the child and where they were', async () => {
    getTicket.mockResolvedValue(
      ticket({
        child: { id: 'c1', name: 'Tobi Ade' },
        childId: 'c1',
        context: { path: '/payments/fees', appVersion: '1.5.0', userAgent: 'Mozilla/5.0 (iPhone)' },
      }),
    );
    await open();
    expect(screen.getByRole('heading', { name: 'Card payment failed twice' })).toBeInTheDocument();
    const requester = screen.getByRole('region', { name: 'Requester' });
    expect(within(requester).getByText('Bola Ade')).toBeInTheDocument();
    expect(within(requester).getByText('Parent')).toBeInTheDocument();
    expect(within(requester).getByRole('link', { name: /bola@parent\.test/ })).toHaveAttribute('href', 'mailto:bola@parent.test');
    const school = screen.getByRole('region', { name: 'School' });
    expect(within(school).getByText('Greenfield Academy')).toBeInTheDocument();
    expect(within(school).getByRole('link', { name: 'Open school profile' })).toHaveAttribute('href', '/SchoolProfile/view/s1');
    expect(within(school).getByText('Tobi Ade')).toBeInTheDocument();
    const context = screen.getByRole('region', { name: 'Where they were' });
    expect(within(context).getByText('/payments/fees')).toBeInTheDocument();
    expect(within(context).getByText('1.5.0')).toBeInTheDocument();
  });
});

describe('Replying', () => {
  it('sends a reply and clears the draft', async () => {
    const user = await open();
    const box = screen.getByLabelText('Reply to the requester');
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeDisabled();
    await user.type(box, '  We have refunded the charge.  ');
    expect(screen.getByText('32 / 5,000')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Send reply' }));

    await waitFor(() => expect(postMessage).toHaveBeenCalledWith('t1', { body: 'We have refunded the charge.', internal: false }));
    await waitFor(() => expect(box).toHaveValue(''));
    expect(toast.success).toHaveBeenCalledWith('Reply sent');
    expect(getTicket).toHaveBeenCalledTimes(2);
  });

  it('adds an internal note through the toggle', async () => {
    const user = await open();
    await user.click(screen.getByRole('button', { name: 'Internal note' }));
    expect(screen.getByRole('button', { name: 'Internal note' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText(/The requester is not notified/)).toBeInTheDocument();
    await user.type(screen.getByLabelText('Internal note'), 'Escalate to finance');
    await user.click(screen.getByRole('button', { name: 'Add internal note' }));
    await waitFor(() => expect(postMessage).toHaveBeenCalledWith('t1', { body: 'Escalate to finance', internal: true }));
    expect(toast.success).toHaveBeenCalledWith('Internal note added');
  });

  it('uploads attachments first and sends them with the reply', async () => {
    (uploadFile as jest.Mock).mockResolvedValue('https://cdn.test/refund.pdf');
    const user = await open();
    const file = new File(['%PDF'], 'refund.pdf', { type: 'application/pdf' });
    await user.upload(screen.getByLabelText('Attach files'), file);
    expect(await screen.findByRole('button', { name: 'Remove refund.pdf' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Reply to the requester'), 'Refund receipt attached.');
    await user.click(screen.getByRole('button', { name: 'Send reply' }));
    await waitFor(() =>
      expect(postMessage).toHaveBeenCalledWith('t1', {
        body: 'Refund receipt attached.',
        attachments: [{ url: 'https://cdn.test/refund.pdf', name: 'refund.pdf', mimeType: 'application/pdf', size: 4 }],
        internal: false,
      }),
    );
  });

  it('rejects a file type the server would refuse, without uploading', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderWithProviders(<TicketView id="t1" />);
    await screen.findByRole('list', { name: 'Conversation' });
    await user.upload(screen.getByLabelText('Attach files'), new File(['x'], 'tool.exe'));
    expect(await screen.findByText('tool.exe: that file type is not supported.')).toBeInTheDocument();
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it('explains a 409 TICKET_CLOSED, keeps the draft and reloads the ticket', async () => {
    postMessage.mockRejectedValueOnce(conflict('TICKET_CLOSED'));
    const user = await open();
    await user.type(screen.getByLabelText('Reply to the requester'), 'Any update?');
    await user.click(screen.getByRole('button', { name: 'Send reply' }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Not sent', {
        description: 'This ticket is closed, so it can no longer take replies or notes.',
      }),
    );
    expect(screen.getByLabelText('Reply to the requester')).toHaveValue('Any update?');
    await waitFor(() => expect(getTicket).toHaveBeenCalledTimes(2));
  });

  it('replaces the reply box on a closed ticket', async () => {
    getTicket.mockResolvedValue(ticket({ status: 'closed', closedAt: '2026-10-06T00:00:00.000Z' }));
    await open();
    expect(screen.getByText('This ticket is closed, so it can no longer take replies or notes.')).toBeInTheDocument();
    expect(screen.queryByLabelText('Reply to the requester')).toBeNull();
  });
});

describe('Status, priority and assignee', () => {
  it('saves a status change on its own and says so', async () => {
    const user = await open();
    await user.selectOptions(screen.getByLabelText('Status'), 'resolved');
    await waitFor(() => expect(updateTicket).toHaveBeenCalledWith('t1', { status: 'resolved' }));
    expect(toast.success).toHaveBeenCalledWith('Status changed to Resolved');
  });

  it('saves a priority change', async () => {
    const user = await open();
    await user.selectOptions(screen.getByLabelText('Priority'), 'urgent');
    await waitFor(() => expect(updateTicket).toHaveBeenCalledWith('t1', { priority: 'urgent' }));
    expect(toast.success).toHaveBeenCalledWith('Priority set to Urgent');
  });

  it('assigns to me, and unassigns', async () => {
    getTicket
      .mockResolvedValueOnce(ticket())
      .mockResolvedValue(ticket({ assignee: { id: ADMIN_USER.userId, name: 'Ada Admin' } }));
    const user = await open();
    await user.click(screen.getByRole('button', { name: 'Assign to me' }));
    await waitFor(() => expect(updateTicket).toHaveBeenCalledWith('t1', { assigneeId: ADMIN_USER.userId }));
    expect(toast.success).toHaveBeenCalledWith('Assigned to you');

    await waitFor(() => expect(screen.getByLabelText('Assignee')).toHaveValue(ADMIN_USER.userId));
    await user.selectOptions(screen.getByLabelText('Assignee'), '');
    await waitFor(() => expect(updateTicket).toHaveBeenLastCalledWith('t1', { assigneeId: null }));
  });

  it('offers the desk staff as assignees and assigns to another admin', async () => {
    const user = await open();
    const select = screen.getByLabelText('Assignee');
    expect(await within(select).findByRole('option', { name: 'Tunde Bello' })).toBeInTheDocument();
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['Unassigned', 'Me (Ada Admin)', 'Tunde Bello']);
    expect(listStaff).toHaveBeenCalledTimes(1);
    await user.selectOptions(select, OTHER_ADMIN_ID);
    await waitFor(() => expect(updateTicket).toHaveBeenCalledWith('t1', { assigneeId: OTHER_ADMIN_ID }));
    expect(toast.success).toHaveBeenCalledWith('Assigned to Tunde Bello');
  });

  it('explains an INVALID_TRANSITION and rolls the status back', async () => {
    getTicket.mockResolvedValue(ticket({ status: 'resolved', resolvedAt: '2026-09-01T00:00:00.000Z' }));
    updateTicket.mockRejectedValueOnce(conflict('INVALID_TRANSITION'));
    const user = await open();
    expect(screen.getByLabelText('Status')).toHaveValue('resolved');
    await user.selectOptions(screen.getByLabelText('Status'), 'waiting_on_user');
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Not changed', {
        description: 'A ticket cannot go from Resolved to Waiting on user.',
      }),
    );
    await waitFor(() => expect(screen.getByLabelText('Status')).toHaveValue('resolved'));
  });

  it('makes a school-desk ticket Talim only observes read-only', async () => {
    getTicket.mockResolvedValue(ticket({ desk: 'school', access: 'observer', reference: 'TCKT-7K2QD9XA' }));
    await open();
    expect(screen.getByText(/Talim can read it; replies and changes open once the school escalates it/)).toBeInTheDocument();
    expect(screen.queryByRole('form')).toBeNull();
    expect(screen.queryByLabelText('Reply to the requester')).toBeNull();
    expect(screen.getByLabelText('Status')).toBeDisabled();
    expect(screen.getByLabelText('Priority')).toBeDisabled();
    expect(screen.getByLabelText('Assignee')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Assign to me' })).toBeNull();
  });

  it('says when the ticket does not exist', async () => {
    getTicket.mockRejectedValue(new ApiError('NOT_FOUND', 'Ticket not found', 404));
    renderWithProviders(<TicketView id="nope" />);
    expect(await screen.findByText('We couldn’t find that ticket')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull();
  });
});
