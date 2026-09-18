import type {
  NotificationCategory,
  NotificationDeliveryChannel,
  NotificationSource,
  RecipientRole,
} from '@/app/services/notification.service';
import type { DisplayStatus, NotificationFormState, TabKey } from './types';

/** The form a freshly opened create modal starts from. */
export const EMPTY_FORM: NotificationFormState = {
  title: '',
  message: '',
  priority: 'medium',
  category: 'other',
  audienceMode: 'schools',
  selectedSchools: [],
  recipientRoles: ['teacher'],
  deliveryMethods: ['inApp', 'email', 'push'],
  scheduleMode: 'now',
  scheduledDate: '',
  scheduledTime: '',
};

/**
 * Tabs over the list. There is no "Drafts" tab: the backend has no draft state
 * — a notification is pending, sent, failed or scheduled — so the tab could
 * only ever have been empty.
 */
export const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'All Notifications' },
  { key: 'sent', label: 'Sent' },
  { key: 'scheduled', label: 'Scheduled' },
];

/**
 * Audience roles, using the backend's own `UserRole` values. `admin` is the
 * platform administrator; a school's administrator is `school_admin`, which is
 * what "School Admins" has to send.
 */
export const ROLE_OPTIONS: Array<{ value: RecipientRole; label: string }> = [
  { value: 'school_admin', label: 'School Admins' },
  { value: 'teacher', label: 'Teachers' },
  { value: 'student', label: 'Students' },
  { value: 'parent', label: 'Parents' },
];

/** Categories, mirroring `NotificationCategory`. */
export const CATEGORY_OPTIONS: Array<{ value: NotificationCategory; label: string }> = [
  { value: 'other', label: 'General' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'academics', label: 'Academics' },
  { value: 'attendance', label: 'Attendance' },
  { value: 'grading', label: 'Grading' },
  { value: 'resources', label: 'Resources' },
  { value: 'account', label: 'Account' },
];

/** Delivery channels, mirroring `NotificationDeliveryChannel`. */
export const DELIVERY_OPTIONS: Array<{ value: NotificationDeliveryChannel; label: string }> = [
  { value: 'inApp', label: 'In-App Notification' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push Notification' },
];

/** Prefilled messages the side panel offers. */
export const TEMPLATES = [
  {
    title: 'Maintenance Alert',
    category: 'other' as NotificationCategory,
    message:
      'Dear Talim community,\n\nWe would like to inform you that Talim will undergo scheduled maintenance on [DATE] from [START_TIME] to [END_TIME]. During this time, the platform may be temporarily unavailable.\n\nWe apologize for any inconvenience and appreciate your understanding.\n\nThank you,\nTalim Team',
  },
  {
    title: 'New Feature Announcement',
    category: 'announcement' as NotificationCategory,
    message:
      'We are excited to announce new improvements to Talim. Please explore the latest updates in your dashboard.',
  },
  {
    title: 'Subscription Reminder',
    category: 'account' as NotificationCategory,
    message:
      'This is a reminder about your upcoming Talim subscription renewal. Please contact support for assistance.',
  },
  {
    title: 'Policy Update',
    category: 'account' as NotificationCategory,
    message: 'Talim policies have been updated. Please review the latest platform guidelines.',
  },
  {
    title: 'General Announcement',
    category: 'announcement' as NotificationCategory,
    message: 'Please take note of this important update from Talim.',
  },
] as const;

/** Badge classes per notification source. */
export const SOURCE_STYLES: Record<NotificationSource, string> = {
  talim: 'bg-blue-50 text-blue-700 ring-blue-100',
  school: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  system: 'bg-violet-50 text-violet-700 ring-violet-100',
};

/** Badge classes per derived status. */
export const STATUS_STYLES: Record<DisplayStatus, string> = {
  sent: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  pending: 'bg-slate-50 text-slate-600 ring-slate-200',
  failed: 'bg-red-50 text-red-700 ring-red-100',
  scheduled: 'bg-amber-50 text-amber-700 ring-amber-100',
};

/** Donut-slice colours per audience role. */
export const ROLE_COLORS: Record<string, string> = {
  admin: '#3B82F6',
  school_admin: '#3B82F6',
  school_sub_admin: '#60A5FA',
  teacher: '#10B981',
  student: '#F59E0B',
  parent: '#8B5CF6',
};

/** How many notifications one page of the list holds. */
export const PAGE_SIZE = 20;

/** Longest message the composer accepts. */
export const MESSAGE_MAX_LENGTH = 2000;
