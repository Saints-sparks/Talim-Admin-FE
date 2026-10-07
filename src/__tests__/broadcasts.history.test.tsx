/** @jest-environment jsdom */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { renderWithProviders, screen, waitFor, within } from '@/test-utils/render';
import { BroadcastHistory } from '@/components/broadcasts/BroadcastHistory';
import { BroadcastDetail } from '@/components/broadcasts/BroadcastDetail';
import { broadcastService } from '@/app/services/broadcast.service';
import { ApiError } from '@/lib/apiError';
import { broadcast } from '@/test-utils/v15Fixtures';

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/app/services/broadcast.service', () => ({
  BROADCAST_PAGE_SIZE: 20,
  broadcastService: { preview: jest.fn(), create: jest.fn(), list: jest.fn(), get: jest.fn(), cancel: jest.fn() },
}));

const list = broadcastService.list as jest.Mock;
const get = broadcastService.get as jest.Mock;
const cancel = broadcastService.cancel as jest.Mock;

const scheduled = broadcast({
  id: 'b2',
  title: 'Exam week reminder',
  status: 'scheduled',
  sentAt: null,
  sendAt: '2026-10-10T07:00:00.000Z',
  audience: { roles: ['student'] },
  schools: [],
  stats: { recipients: 5000, delivered: 0, read: 0, pushSent: 0, emailSent: 0, failed: 0 },
});

beforeEach(() => {
  jest.clearAllMocks();
  list.mockResolvedValue({ data: [broadcast(), scheduled], meta: { total: 2, page: 1, lastPage: 1, limit: 20 } });
  cancel.mockResolvedValue({});
});

/**
 * The text of each stat cell in a row, keyed by stat.
 *
 * @param row - The table row.
 * @returns The stats.
 */
function statsOf(row: HTMLElement): Record<string, string> {
  return Object.fromEntries(
    Array.from(row.querySelectorAll<HTMLElement>('[data-stat]')).map((cell) => [cell.dataset.stat, cell.textContent ?? '']),
  );
}

describe('Broadcast history', () => {
  it('lists each broadcast with its status and the six delivery stats', async () => {
    renderWithProviders(<BroadcastHistory />);
    const rows = await screen.findAllByTestId('broadcast-row');
    expect(rows).toHaveLength(2);
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith({ page: 1 });

    expect(within(rows[0]).getByRole('link', { name: /Scheduled maintenance/ })).toHaveAttribute('href', '/talimadmindashboard/talimannouncement/b1');
    expect(within(rows[0]).getByText('Teachers, Parents · 2 schools')).toBeInTheDocument();
    expect(within(rows[0]).getByText('Sent')).toBeInTheDocument();
    expect(statsOf(rows[0])).toEqual({
      recipients: (1200).toLocaleString(),
      delivered: (1180).toLocaleString(),
      read: '640',
      pushSent: '900',
      emailSent: '0',
      failed: '20',
    });
    expect(within(rows[0]).queryByRole('button', { name: /Cancel/ })).toBeNull();

    expect(within(rows[1]).getByText('Scheduled')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Students · all schools')).toBeInTheDocument();
    expect(within(rows[1]).getByRole('button', { name: 'Cancel “Exam week reminder”' })).toBeInTheDocument();
    for (const header of ['Recipients', 'Delivered', 'Read', 'Push sent', 'Email sent', 'Failed']) {
      expect(screen.getByRole('columnheader', { name: header })).toBeInTheDocument();
    }
  });

  it('filters by status on the server', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastHistory />);
    await screen.findAllByTestId('broadcast-row');
    await user.click(screen.getByRole('tab', { name: 'Scheduled' }));
    await waitFor(() => expect(list).toHaveBeenLastCalledWith({ status: 'scheduled', page: 1 }));
  });

  it('cancels a scheduled broadcast after confirming, then reloads', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastHistory />);
    const rows = await screen.findAllByTestId('broadcast-row');
    await user.click(within(rows[1]).getByRole('button', { name: 'Cancel “Exam week reminder”' }));

    const dialog = await screen.findByRole('dialog', { name: 'Cancel this notification?' });
    expect(dialog).toHaveTextContent('“Exam week reminder” will not be sent to its 5,000 recipients.');
    expect(cancel).not.toHaveBeenCalled();
    await user.click(within(dialog).getByRole('button', { name: 'Cancel notification' }));

    await waitFor(() => expect(cancel).toHaveBeenCalledWith('b2'));
    expect(toast.success).toHaveBeenCalledWith('Scheduled notification cancelled');
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('keeps it when the admin backs out of the confirm', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastHistory />);
    const rows = await screen.findAllByTestId('broadcast-row');
    await user.click(within(rows[1]).getByRole('button', { name: /Cancel “/ }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(cancel).not.toHaveBeenCalled();
  });

  it('explains a 409: too late, it has started sending', async () => {
    cancel.mockRejectedValue(new ApiError('CONFLICT', 'Not scheduled', 409));
    const user = userEvent.setup();
    renderWithProviders(<BroadcastHistory />);
    const rows = await screen.findAllByTestId('broadcast-row');
    await user.click(within(rows[1]).getByRole('button', { name: /Cancel “/ }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel notification' }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Too late to cancel', { description: 'It has already started sending.' }),
    );
    await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
  });

  it('says when nothing has been sent', async () => {
    list.mockResolvedValue({ data: [], meta: { total: 0, page: 1, lastPage: 1, limit: 20 } });
    renderWithProviders(<BroadcastHistory />);
    expect(await screen.findByText('Nothing sent yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Send the first notification' })).toHaveAttribute('href', '/talimadmindashboard/talimannouncement/new');
  });
});

describe('Broadcast detail', () => {
  it('shows the stats as tiles with delivery and read rates', async () => {
    get.mockResolvedValue(broadcast());
    renderWithProviders(<BroadcastDetail id="b1" />);
    const tiles = await screen.findByRole('group', { name: 'Delivery stats' });
    expect(tiles).toHaveTextContent(`Recipients${(1200).toLocaleString()}`);
    expect(tiles).toHaveTextContent(`Delivered${(1180).toLocaleString()}98% of recipients`);
    expect(tiles).toHaveTextContent('Read64053% of recipients');
    expect(tiles).toHaveTextContent('Push sent900');
    expect(tiles).toHaveTextContent('Email sent0');
    expect(tiles).toHaveTextContent('Failed20');
    expect(screen.getByText('In-app and push')).toBeInTheDocument();
    expect(screen.getByText('Greenfield Academy, Hillcrest College')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Cancel/ })).toBeNull();
  });

  it('offers Cancel while scheduled', async () => {
    get.mockResolvedValue(scheduled);
    const user = userEvent.setup();
    renderWithProviders(<BroadcastDetail id="b2" />);
    expect(await screen.findByText(/You can cancel it until it starts sending/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cancel “Exam week reminder”' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Cancel notification' }));
    await waitFor(() => expect(cancel).toHaveBeenCalledWith('b2'));
    await waitFor(() => expect(get).toHaveBeenCalledTimes(2));
  });
});
