import {
  buildConfigPayload,
  formFrom,
  providerStatusLabel,
  toggleChannel,
  validateProviderForm,
} from '@/app/talimadmindashboard/payments/_components/providerForm';
import { ALL_PROVIDERS, PROVIDER_META } from '@/app/talimadmindashboard/payments/_components/providerMeta';

type Form = Parameters<typeof validateProviderForm>[0];

/** A valid form, so each test only varies the field it is about. */
function form(overrides: Partial<Form> = {}): Form {
  return {
    publicKey: 'pk_test_123',
    secretKey: '',
    webhookSecret: '',
    merchantId: '',
    environment: 'test',
    platformFeePercent: '2.5',
    channels: ['card'],
    ...overrides,
  };
}

describe('validateProviderForm', () => {
  it('accepts a complete form', () => {
    expect(validateProviderForm(form())).toBeNull();
  });

  it('requires a public key', () => {
    expect(validateProviderForm(form({ publicKey: '   ' }))).toBe('A public key is required.');
  });

  it('keeps the platform fee within 0–100', () => {
    expect(validateProviderForm(form({ platformFeePercent: '0' }))).toBeNull();
    expect(validateProviderForm(form({ platformFeePercent: '100' }))).toBeNull();
    expect(validateProviderForm(form({ platformFeePercent: '-1' }))).not.toBeNull();
    expect(validateProviderForm(form({ platformFeePercent: '101' }))).not.toBeNull();
    expect(validateProviderForm(form({ platformFeePercent: 'abc' }))).not.toBeNull();
    // An empty box used to become 0 via `parseFloat('') || 0`; it is now rejected.
    expect(validateProviderForm(form({ platformFeePercent: '' }))).not.toBeNull();
  });

  it('requires at least one channel', () => {
    expect(validateProviderForm(form({ channels: [] }))).toBe(
      'Select at least one payment channel.',
    );
  });
});

describe('buildConfigPayload', () => {
  it('omits blank secrets so an untouched field never wipes a stored credential', () => {
    const payload = buildConfigPayload(form());
    expect(payload).not.toHaveProperty('secretKey');
    expect(payload).not.toHaveProperty('webhookSecret');
    expect(payload).not.toHaveProperty('merchantId');
  });

  it('includes and trims secrets that were typed', () => {
    const payload = buildConfigPayload(
      form({ secretKey: '  sk_live_9  ', webhookSecret: ' whsec ', merchantId: ' m1 ' }),
    );
    expect(payload.secretKey).toBe('sk_live_9');
    expect(payload.webhookSecret).toBe('whsec');
    expect(payload.merchantId).toBe('m1');
  });

  it('sends the fee as a number, not the raw input string', () => {
    expect(buildConfigPayload(form({ platformFeePercent: '3.5' })).platformFeePercent).toBe(3.5);
  });

  it('carries the environment and channels through', () => {
    const payload = buildConfigPayload(form({ environment: 'live', channels: ['card', 'ussd'] }));
    expect(payload.environment).toBe('live');
    expect(payload.supportedChannels).toEqual(['card', 'ussd']);
  });
});

describe('provider metadata', () => {
  it('describes every provider the page lists', () => {
    for (const name of ALL_PROVIDERS) {
      expect(PROVIDER_META[name]).toBeDefined();
      expect(PROVIDER_META[name].channels.length).toBeGreaterThan(0);
    }
  });
});

describe('formFrom', () => {
  it('starts blank with the provider\'s channels when nothing is saved', () => {
    expect(formFrom(null, ['card', 'ussd'])).toEqual({
      publicKey: '',
      secretKey: '',
      webhookSecret: '',
      merchantId: '',
      environment: 'test',
      platformFeePercent: '2',
      channels: ['card', 'ussd'],
    });
  });

  it('loads the saved settings but never a secret', () => {
    const saved = {
      providerName: 'opay',
      isEnabled: true,
      isDefault: false,
      publicKey: 'pk_live',
      environment: 'live',
      supportedChannels: ['wallet'],
      currency: 'NGN',
      merchantId: 'm9',
      platformFeePercent: 1.5,
    } as const;
    const loaded = formFrom({ ...saved, supportedChannels: [...saved.supportedChannels] }, ['card']);
    expect(loaded).toMatchObject({
      publicKey: 'pk_live',
      merchantId: 'm9',
      environment: 'live',
      platformFeePercent: '1.5',
      channels: ['wallet'],
      secretKey: '',
      webhookSecret: '',
    });
  });
});

describe('toggleChannel', () => {
  it('adds a channel that is off and removes one that is on', () => {
    expect(toggleChannel(['card'], 'ussd')).toEqual(['card', 'ussd']);
    expect(toggleChannel(['card', 'ussd'], 'card')).toEqual(['ussd']);
    expect(toggleChannel(['card'], 'card')).toEqual([]);
  });
});

describe('providerStatusLabel', () => {
  it('reads Enabled, Configured or Not configured', () => {
    expect(providerStatusLabel(true, true)).toBe('Enabled');
    expect(providerStatusLabel(false, true)).toBe('Configured');
    expect(providerStatusLabel(false, false)).toBe('Not configured');
  });
});
