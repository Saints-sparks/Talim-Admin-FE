/**
 * Contract guard for the Talim Admin write paths.
 *
 * The important half of this file runs in `tsc`, not in Jest: every payload
 * below is checked against the backend DTO generated into `src/types/api.d.ts`.
 *
 * - `satisfies` fails when a DTO gains a required field or changes a type/enum.
 * - `@ts-expect-error` lines fail when a DTO becomes looser (an unknown field or a
 *   missing required field is suddenly accepted).
 * - `assertKeys` fails when a DTO gains or drops a field, so the client is
 *   reviewed instead of silently sending too little (sending too much is a 400:
 *   the API runs `forbidNonWhitelisted`).
 *
 * After `npm run types:api`, run `npm run type-check`; an error in this file
 * names the endpoint whose DTO changed.
 */
import type { RequestBody, ResponseBody } from '@/types/apiContract';
import type {
  AdminLoginPayload,
  CreateNotificationPayload,
  CreateSchoolPayload,
  PlatformProviderConfigPayload,
  UpdateComplaintStatusPayload,
  UpdateSchoolStatusPayload,
} from '@/types/apiPayloads';

/** Exact key list of `T`; passing the wrong list is a compile error. */
type ExactKeys<T, K extends readonly (keyof T)[]> = Exclude<keyof T, K[number]> extends never
  ? K
  : { error: 'DTO has fields this test does not list'; missing: Exclude<keyof T, K[number]> };

/** Returns the list unchanged; exists only so `tsc` can compare it with the DTO. */
function assertKeys<T>() {
  return <const K extends readonly (keyof T)[]>(keys: ExactKeys<T, K>): K => keys as K;
}

describe('write payloads follow the backend contract', () => {
  it('school registration', () => {
    const school = {
      name: 'Greenfield Academy',
      email: 'admin@greenfield.test',
      physicalAddress: '1 School Road, Ikeja',
      location: { country: 'Nigeria', state: 'Lagos' },
      schoolPrefix: 'GFA',
      primaryContacts: [
        { name: 'Ada Obi', phone: '+2348000000000', email: 'ada@greenfield.test', role: 'Principal' },
      ],
      active: true,
      logo: 'https://cdn.example.test/logo.png',
    } satisfies CreateSchoolPayload;
    // @ts-expect-error a field the DTO does not declare is a 400
    const extra: CreateSchoolPayload = { ...school, principal: 'Ada' };
    // @ts-expect-error `schoolPrefix` is required when registering
    const noPrefix: CreateSchoolPayload = { ...school, schoolPrefix: undefined };

    assertKeys<CreateSchoolPayload>()([
      'name',
      'email',
      'physicalAddress',
      'location',
      'schoolPrefix',
      'slug',
      'primaryContacts',
      'active',
      'logo',
    ]);
    assertKeys<UpdateSchoolStatusPayload>()(['active']);
    expect(school.location.state).toBe('Lagos');
    expect([extra, noPrefix]).toHaveLength(2);
  });

  it('payment provider configuration', () => {
    const config = {
      publicKey: 'pk_test_123',
      secretKey: 'sk_test_456',
      environment: 'test',
      supportedChannels: ['card', 'bank_transfer'],
      platformFeePercent: 1.5,
      isDefault: true,
    } satisfies PlatformProviderConfigPayload;
    // @ts-expect-error "sandbox" is not an environment the API knows
    const wrongEnvironment: PlatformProviderConfigPayload = { environment: 'sandbox' };

    assertKeys<PlatformProviderConfigPayload>()([
      'isDefault',
      'publicKey',
      'secretKey',
      'webhookSecret',
      'merchantId',
      'environment',
      'supportedChannels',
      'platformFeePercent',
    ]);
    expect(config.supportedChannels).toContain('card');
    expect(wrongEnvironment).toBeDefined();
  });

  it('announcement / notification create', () => {
    const notification = {
      title: 'Term dates',
      message: 'Second term starts on 5 January.',
      recipientRoles: ['school_admin', 'teacher'],
      priority: 'high',
      category: 'announcement',
      deliveryChannels: ['inApp', 'email'],
    } satisfies CreateNotificationPayload;
    // @ts-expect-error `message` is required
    const noMessage: CreateNotificationPayload = { title: 'Only a title' };

    assertKeys<CreateNotificationPayload>()([
      'title',
      'message',
      'attachments',
      'recipientRoles',
      'targetSchools',
      'senderId',
      'priority',
      'type',
      'source',
      'category',
      'metadata',
      'recipientId',
      'scheduledFor',
      'isScheduled',
      'deliveryChannels',
    ]);
    expect(notification.recipientRoles).toHaveLength(2);
    expect(noMessage).toBeDefined();
  });

  it('complaint status', () => {
    const inProgress = { status: 'In Progress' } satisfies UpdateComplaintStatusPayload;
    // @ts-expect-error "Closed" is not a complaint status
    const closed: UpdateComplaintStatusPayload = { status: 'Closed' };

    assertKeys<UpdateComplaintStatusPayload>()(['status']);
    expect(inProgress.status).toBe('In Progress');
    expect(closed).toBeDefined();
  });

  it('admin login', () => {
    const login = {
      email: 'root@talim.test',
      password: 'a-long-passphrase',
      deviceToken: 'talim-admin-web',
      platform: 'admin-web',
    } satisfies AdminLoginPayload;
    // @ts-expect-error `password` is required
    const noPassword: AdminLoginPayload = { email: 'root@talim.test' };

    assertKeys<AdminLoginPayload>()(['email', 'password', 'deviceToken', 'platform']);
    expect(login.platform).toBe('admin-web');
    expect(noPassword).toBeDefined();
  });

  it('the helper types resolve real routes (a wrong path or method would not compile)', () => {
    type Body = RequestBody<'/complaints/{id}/status', 'patch'>;
    type Reply = ResponseBody<'/complaints', 'get'>;
    const body: Body = { status: 'Resolved' };
    const reply: Reply | undefined = undefined;
    // @ts-expect-error PATCH /complaints/{id}/status has no PUT
    const bad: RequestBody<'/complaints/{id}/status', 'put'> | undefined = undefined;
    expect(body.status).toBe('Resolved');
    expect(reply).toBeUndefined();
    expect(bad).toBeUndefined();
  });
});
