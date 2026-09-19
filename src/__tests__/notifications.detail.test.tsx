/** @jest-environment jsdom */
import userEvent from '@testing-library/user-event';
import { render, screen, within } from '@testing-library/react';
import type { NotificationResponse } from '@/app/services/notification.service';
import { NotificationDetail } from '@/app/talimadmindashboard/talimannouncement/_components/NotificationDetail';
import {
  channelEntries,
  count,
  countWithRate,
  roleSlices,
  senderLabel,
  targetedLabel,
  timelineSteps,
  userTypesLabel,
} from '@/app/talimadmindashboard/talimannouncement/_components/detailModel';

/** A notification with the fields the detail view reads. */
function notification(overrides: Partial<NotificationResponse> = {}): NotificationResponse {
  return {
    _id: 'n1',
    title: 'Scheduled maintenance',
    message: 'Talim will be unavailable on Saturday.',
    attachments: [],
    recipientRoles: ['teacher'],
    targetSchools: [],
    status: 'pending',
    priority: 'medium',
    readBy: [],
    createdAt: '2026-05-30T09:00:00.000Z',
    updatedAt: '2026-05-30T09:00:00.000Z',
    ...overrides,
  };
}

const stats = {
  totalRecipients: 200,
  deliveredCount: 150,
  failedCount: 10,
  pendingCount: 40,
  deliveredRate: 75,
  byRole: { teacher: 120, parent: 80 },
  byChannel: { inApp: 200, email: 180 },
  sentAt: '2026-05-30T09:05:00.000Z',
  deliveredAt: '2026-05-30T09:30:00.000Z',
};

describe('detail model', () => {
  it('formats counts and shows a dash for a missing one', () => {
    expect(count(1234)).toBe((1234).toLocaleString());
    expect(count(0)).toBe('0');
    expect(count(undefined)).toBe('—');
  });

  it('adds the share of the total, capped at 100 and skipped without a total', () => {
    expect(countWithRate(50, 200)).toBe(`50 · 25%`);
    expect(countWithRate(300, 200)).toBe(`300 · 100%`);
    expect(countWithRate(50, undefined)).toBe('50');
    expect(countWithRate(50, 0)).toBe('50');
    expect(countWithRate(undefined, 200)).toBe('—');
  });

  it('slices only the roles it was sent to that the backend reported', () => {
    const slices = roleSlices(notification({ recipientRoles: ['teacher', 'parent', 'student'], deliveryStats: stats }));
    expect(slices.map((s) => [s.label, s.value])).toEqual([
      ['Teachers', 120],
      ['Parents', 80],
    ]);
    expect(roleSlices(notification())).toEqual([]);
  });

  it('lists only the channels the backend reports counts for', () => {
    const entries = channelEntries(
      notification({ deliveryChannels: ['inApp', 'email', 'webPush'], deliveryStats: stats }),
    );
    expect(entries.map((e) => [e.channel, e.value])).toEqual([
      ['inApp', 200],
      ['email', 180],
    ]);
    expect(channelEntries(notification({ deliveryChannels: ['push'] }))[0].value).toBeUndefined();
  });

  it('keeps only the timeline stages that have a timestamp, and invents none', () => {
    expect(timelineSteps(notification()).map((s) => s.stage)).toEqual(['Created']);
    expect(
      timelineSteps(notification({ scheduledFor: '2026-06-01T08:00:00.000Z', deliveryStats: stats })).map((s) => s.stage),
    ).toEqual(['Created', 'Scheduled', 'Sent', 'Delivered']);
    expect(
      timelineSteps(notification({ deliveryStats: { ...stats, scheduledAt: '2026-05-31T00:00:00.000Z' } }))[1],
    ).toEqual({ stage: 'Scheduled', ts: '2026-05-31T00:00:00.000Z' });
  });

  it('words the audience lines and the sender', () => {
    expect(targetedLabel(notification())).toBe('All Schools');
    expect(targetedLabel(notification({ targetSchools: [{ _id: 's', name: 'Sunrise' }, { _id: 't', name: 'Hillcrest' }] }))).toBe(
      'Sunrise, Hillcrest',
    );
    expect(userTypesLabel(notification({ recipientRoles: [] }))).toBe('All Users');
    expect(userTypesLabel(notification({ recipientRoles: ['teacher', 'parent'] }))).toBe('Teachers, Parents');
    expect(senderLabel(notification())).toBe('Talim Admin');
    expect(senderLabel(notification({ senderName: 'Ada', senderEmail: 'ada@talim.test' }))).toBe('Ada (ada@talim.test)');
  });
});

describe('NotificationDetail', () => {
  function setup(n: NotificationResponse, extra: Partial<React.ComponentProps<typeof NotificationDetail>> = {}) {
    const props = {
      notification: n,
      hasPrev: true,
      hasNext: false,
      onClose: jest.fn(),
      onPrev: jest.fn(),
      onNext: jest.fn(),
      ...extra,
    };
    render(<NotificationDetail {...props} />);
    return props;
  }

  it('says statistics are missing rather than inventing them', () => {
    setup(notification());
    expect(screen.getByText('Delivery statistics have not been reported for this notification yet.')).toBeInTheDocument();
    expect(screen.queryByText('By User Type')).toBeNull();
    expect(screen.queryByText('By Channel')).toBeNull();
    expect(screen.getByText('No attachments')).toBeInTheDocument();
    expect(screen.getByText('Not recorded')).toBeInTheDocument();
  });

  it('shows reported statistics, breakdowns and the timeline', () => {
    setup(
      notification({
        recipientRoles: ['teacher', 'parent'],
        deliveryChannels: ['inApp', 'email'],
        deliveryStats: stats,
        attachments: ['https://cdn.test/files/notice.pdf'],
      }),
    );
    expect(screen.getByText('Total Recipients').nextElementSibling).toHaveTextContent('200');
    expect(screen.getByText('150 · 75%')).toBeInTheDocument();
    expect(screen.getByText('10 · 5%')).toBeInTheDocument();
    expect(screen.getByText('By User Type')).toBeInTheDocument();
    expect(screen.getByText('Teachers')).toBeInTheDocument();
    expect(screen.getByText('By Channel')).toBeInTheDocument();
    expect(screen.getByText('Delivery Timeline')).toBeInTheDocument();
    expect(screen.getByText('notice.pdf')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open attachment' })).toHaveAttribute('href', 'https://cdn.test/files/notice.pdf');
  });

  it('wires navigation, and disables Previous/Next at the ends', async () => {
    const props = setup(notification(), { hasPrev: true, hasNext: false });
    await userEvent.click(screen.getByRole('button', { name: 'Previous notification' }));
    expect(props.onPrev).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Next notification' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    await userEvent.click(screen.getByRole('button', { name: /Back to Notifications/ }));
    expect(props.onClose).toHaveBeenCalledTimes(2);
  });

  it("offers no Resend or Duplicate, because the API has no such routes", () => {
    setup(notification());
    expect(screen.queryByRole('button', { name: /Resend/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Duplicate/ })).not.toBeInTheDocument();
  });

  it('labels a sent notification Delivered', () => {
    setup(notification({ status: 'sent' }));
    const heading = screen.getByRole('heading', { name: 'Scheduled maintenance' });
    expect(within(heading.parentElement as HTMLElement).getByText('Delivered')).toBeInTheDocument();
  });
});
