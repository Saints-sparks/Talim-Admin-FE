import type {
  NotificationCategory,
  NotificationDeliveryChannel,
  Priority,
  RecipientRole,
} from '@/app/services/notification.service';

/** Which tab of the notification list is showing. */
export type TabKey = 'all' | 'sent' | 'scheduled';

/** How the create form picks who receives a notification. */
export type AudienceMode = 'schools' | 'roles';

/** The status the list and detail view show, derived from the record. */
export type DisplayStatus = 'sent' | 'pending' | 'failed' | 'scheduled';

/** Every field of the create-notification form. */
export interface NotificationFormState {
  title: string;
  message: string;
  priority: Priority;
  category: NotificationCategory;
  audienceMode: AudienceMode;
  selectedSchools: string[];
  recipientRoles: RecipientRole[];
  deliveryMethods: NotificationDeliveryChannel[];
  scheduleMode: 'now' | 'later';
  scheduledDate: string;
  scheduledTime: string;
}
