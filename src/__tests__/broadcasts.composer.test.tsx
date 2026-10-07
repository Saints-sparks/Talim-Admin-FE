/** @jest-environment jsdom */
import React from 'react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { act, fireEvent, renderWithProviders, screen, waitFor, within } from '@/test-utils/render';
import { BroadcastComposer } from '@/components/broadcasts/BroadcastComposer';
import { PREVIEW_DEBOUNCE_MS, todayInput } from '@/components/broadcasts/broadcast-model';
import { broadcastService } from '@/app/services/broadcast.service';
import { schoolService } from '@/app/services/school.service';
import { PEOPLE, PREVIEW } from '@/test-utils/v15Fixtures';

const push = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: jest.fn(), back: jest.fn() }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/app/services/broadcast.service', () => ({
  BROADCAST_PAGE_SIZE: 20,
  broadcastService: { preview: jest.fn(), create: jest.fn(), list: jest.fn(), get: jest.fn(), cancel: jest.fn(), searchPeople: jest.fn() },
}));
jest.mock('@/app/services/school.service', () => ({ schoolService: { getAllSchools: jest.fn() } }));

const preview = broadcastService.preview as jest.Mock;
const create = broadcastService.create as jest.Mock;
const searchPeople = broadcastService.searchPeople as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  preview.mockResolvedValue(PREVIEW);
  create.mockResolvedValue({ id: 'b42', status: 'sending', recipientsEstimate: 1234 });
  searchPeople.mockResolvedValue(PEOPLE);
  (schoolService.getAllSchools as jest.Mock).mockResolvedValue({
    data: [
      { _id: 's1', name: 'Greenfield Academy' },
      { _id: 's2', name: 'Hillcrest College' },
    ],
    meta: { total: 2, page: 1, lastPage: 1, limit: 50 },
  });
});

/**
 * Fills in the title and message.
 *
 * @param user - The user-event instance.
 * @returns Resolves once typed.
 */
async function writeMessage(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Title'), 'Scheduled maintenance');
  await user.type(screen.getByLabelText('Message'), 'Talim is down on Saturday night.');
}

describe('Broadcast composer', () => {
  it('counts title and message characters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    await writeMessage(user);
    expect(screen.getByText('21 / 120')).toBeInTheDocument();
    expect(screen.getByText('32 / 2,000')).toBeInTheDocument();
  });

  it('validates the audience before counting or sending', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    await writeMessage(user);
    expect(screen.getByText('Choose who should receive it.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Review and send' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one role or person, or send to everyone.');
    expect(screen.getByRole('region', { name: 'Audience' })).toHaveFocus();

    await user.click(screen.getByRole('radio', { name: 'Selected schools' }));
    await user.click(screen.getByRole('checkbox', { name: 'Teachers' }));
    await user.click(screen.getByRole('button', { name: 'Review and send' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Choose at least one school, or switch to All schools.');

    await user.click(screen.getByRole('button', { name: /Which schools/ }));
    await user.click(await screen.findByRole('checkbox', { name: 'Greenfield Academy' }));
    await user.click(screen.getByRole('button', { name: 'Done' }));
    expect(screen.getByRole('button', { name: 'Remove Greenfield Academy' })).toBeInTheDocument();
    await waitFor(() => expect(preview).toHaveBeenLastCalledWith({ schoolIds: ['s1'], roles: ['teacher'] }));
    expect(create).not.toHaveBeenCalled();
  });

  it('debounces the recipient preview: one request once the audience settles', async () => {
    jest.useFakeTimers();
    try {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithProviders(<BroadcastComposer />);
      await user.click(screen.getByRole('checkbox', { name: 'Teachers' }));
      await user.click(screen.getByRole('checkbox', { name: 'Parents' }));
      await user.click(screen.getByRole('checkbox', { name: 'Students' }));
      expect(preview).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(PREVIEW_DEBOUNCE_MS);
      });
      await waitFor(() => expect(preview).toHaveBeenCalledTimes(1));
      expect(preview).toHaveBeenCalledWith({ roles: ['teacher', 'parent', 'student'] });
      await waitFor(() => expect(screen.getByTestId('recipient-count')).toHaveTextContent('1,234'));
      expect(screen.getByText('Greenfield Academy')).toBeInTheDocument();
      expect(screen.getByText('Parents: 1,114')).toBeInTheDocument();

      // Back to an audience already counted: served from the cache, no new request.
      await user.click(screen.getByRole('checkbox', { name: 'Students' }));
      await user.click(screen.getByRole('checkbox', { name: 'Students' }));
      await act(async () => {
        jest.advanceTimersByTime(PREVIEW_DEBOUNCE_MS);
      });
      expect(preview).toHaveBeenCalledTimes(1);
    } finally {
      jest.useRealTimers();
    }
  });

  it('refuses a schedule in the past', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    await writeMessage(user);
    await user.click(screen.getByRole('radio', { name: 'Everyone' }));
    await user.click(screen.getByRole('radio', { name: 'Schedule for later' }));
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2020-01-01' } });
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '09:00' } });
    await user.click(screen.getByRole('button', { name: 'Review and schedule' }));

    expect(screen.getByRole('alert')).toHaveTextContent('That time has passed. Pick a time in the future.');
    expect(screen.getByLabelText('Date')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('Date')).toHaveFocus();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(create).not.toHaveBeenCalled();
  });

  it('confirms with the recipient count, then sends and opens the result', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    await writeMessage(user);
    await user.click(screen.getByRole('checkbox', { name: 'Teachers' }));
    await user.click(screen.getByRole('checkbox', { name: 'Email' }));
    await user.selectOptions(screen.getByLabelText('Button opens (optional)'), 'payments');
    await waitFor(() => expect(screen.getByTestId('recipient-count')).toHaveTextContent('1,234'));

    await user.click(screen.getByRole('button', { name: 'Review and send' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByTestId('confirm-count')).toHaveTextContent('This goes to 1,234 people by in-app, push and email, now.');
    expect(create).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: 'Send to 1,234 people' }));
    await waitFor(() =>
      expect(create).toHaveBeenCalledWith({
        title: 'Scheduled maintenance',
        body: 'Talim is down on Saturday night.',
        target: { page: 'payments' },
        audience: { roles: ['teacher'] },
        channels: { push: true, email: true },
      }),
    );
    expect(toast.success).toHaveBeenCalledWith('Sending to 1,234 people');
    expect(push).toHaveBeenCalledWith('/talimadmindashboard/talimannouncement/b42');
  });

  it('schedules with an ISO time from the browser clock', async () => {
    create.mockResolvedValue({ id: 'b43', status: 'scheduled', recipientsEstimate: 1234 });
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    await writeMessage(user);
    await user.click(screen.getByRole('radio', { name: 'Everyone' }));
    await user.click(screen.getByRole('radio', { name: 'Schedule for later' }));
    const tomorrow = todayInput(new Date(Date.now() + 2 * 86_400_000));
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: tomorrow } });
    fireEvent.change(screen.getByLabelText('Time'), { target: { value: '08:30' } });
    await waitFor(() => expect(preview).toHaveBeenCalledWith({ all: true }));
    await waitFor(() => expect(screen.getByTestId('recipient-count')).toHaveTextContent('1,234'));

    await user.click(screen.getByRole('button', { name: 'Review and schedule' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Schedule for 1,234 people' }));
    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][0]).toMatchObject({ audience: { all: true }, sendAt: new Date(`${tomorrow}T08:30`).toISOString() });
    expect(toast.success).toHaveBeenCalledWith('Scheduled for 1,234 people');
  });

  it('closes the confirm and says why when the API refuses', async () => {
    create.mockRejectedValue(new Error('Title is too long'));
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    await writeMessage(user);
    await user.click(screen.getByRole('radio', { name: 'Everyone' }));
    await user.click(screen.getByRole('button', { name: 'Review and send' }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /Send/ }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('The notification was not sent', { description: 'Title is too long' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(push).not.toHaveBeenCalled();
  });

  it('finds specific people across Talim and sends them as userIds', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    await writeMessage(user);
    await user.type(screen.getByRole('searchbox', { name: 'Specific people' }), 'ngozi');
    await waitFor(() => expect(searchPeople).toHaveBeenCalledWith({ q: 'ngozi' }));
    expect(searchPeople).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('2 people found.')).toBeInTheDocument();
    expect(screen.getByText('School admin · Greenfield Academy · ngozi@greenfield.test')).toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: /Ngozi Okafor/ }));
    expect(screen.getByRole('button', { name: 'Remove Ngozi Okafor' })).toBeInTheDocument();
    // A person alone is an audience.
    await waitFor(() => expect(preview).toHaveBeenLastCalledWith({ userIds: [PEOPLE[0].id] }));

    await user.click(screen.getByRole('checkbox', { name: 'Parents' }));
    await waitFor(() => expect(preview).toHaveBeenLastCalledWith({ roles: ['parent'], userIds: [PEOPLE[0].id] }));
    await waitFor(() => expect(screen.getByTestId('recipient-count')).toHaveTextContent('1,234'));
    await user.click(screen.getByRole('button', { name: 'Review and send' }));
    await user.click(within(await screen.findByRole('dialog')).getByRole('button', { name: 'Send to 1,234 people' }));
    await waitFor(() => expect(create).toHaveBeenCalled());
    expect(create.mock.calls[0][0].audience).toEqual({ roles: ['parent'], userIds: [PEOPLE[0].id] });
  });

  it('removes a chosen person, and searches only from two letters', async () => {
    const user = userEvent.setup();
    renderWithProviders(<BroadcastComposer />);
    const search = screen.getByRole('searchbox', { name: 'Specific people' });
    await user.type(search, 'n');
    expect(await screen.findByText('Type at least 2 letters.')).toBeInTheDocument();
    expect(searchPeople).not.toHaveBeenCalled();
    await user.type(search, 'g');
    await user.click(await screen.findByRole('checkbox', { name: /Ngozi Adeyemi/ }));
    await user.clear(search);
    // The chip keeps the name after the results go.
    await user.click(screen.getByRole('button', { name: 'Remove Ngozi Adeyemi' }));
    expect(screen.queryByRole('list', { name: 'Chosen people' })).toBeNull();
  });
});
