import type {
  PaymentChannel,
  PaymentEnvironment,
  PlatformProviderConfig,
  UpdateProviderConfigPayload,
} from '@/app/services/payments.service';

/** The editable fields of one provider's configuration form. */
export interface CardForm {
  publicKey: string;
  secretKey: string;
  webhookSecret: string;
  merchantId: string;
  environment: PaymentEnvironment;
  platformFeePercent: string;
  channels: PaymentChannel[];
}

/**
 * Resets the editable form to the saved configuration. Secrets are always blank:
 * the API never returns them, so an empty field means "leave it as it is".
 *
 * @param config - The saved configuration, if the provider has one.
 * @param defaultChannels - Channels to offer when nothing is saved yet.
 * @returns The form state.
 */
export function formFrom(
  config: PlatformProviderConfig | null,
  defaultChannels: PaymentChannel[],
): CardForm {
  return {
    publicKey: config?.publicKey ?? '',
    secretKey: '',
    webhookSecret: '',
    merchantId: config?.merchantId ?? '',
    environment: config?.environment ?? 'test',
    platformFeePercent: String(config?.platformFeePercent ?? 2),
    channels: config?.supportedChannels ?? defaultChannels,
  };
}

/**
 * Validates the editable fields against what the backend will accept.
 *
 * @param form - The current form values.
 * @returns The first problem found, or `null`.
 */
export function validateProviderForm(form: CardForm): string | null {
  if (!form.publicKey.trim()) return 'A public key is required.';
  // `Number('')` is 0, so an empty box would otherwise silently save a 0% fee.
  const fee = form.platformFeePercent.trim() === '' ? NaN : Number(form.platformFeePercent);
  if (!Number.isFinite(fee) || fee < 0 || fee > 100) {
    return 'The platform fee must be between 0 and 100.';
  }
  if (form.channels.length === 0) return 'Select at least one payment channel.';
  return null;
}

/**
 * Builds the `PATCH .../config` body, omitting blank secrets so an untouched
 * field never overwrites a stored credential with an empty string.
 *
 * @param form - The validated form values.
 * @returns The request body.
 */
export function buildConfigPayload(form: CardForm): UpdateProviderConfigPayload {
  const payload: UpdateProviderConfigPayload = {
    environment: form.environment,
    supportedChannels: form.channels,
    platformFeePercent: Number(form.platformFeePercent),
  };
  if (form.publicKey.trim()) payload.publicKey = form.publicKey.trim();
  if (form.secretKey.trim()) payload.secretKey = form.secretKey.trim();
  if (form.webhookSecret.trim()) payload.webhookSecret = form.webhookSecret.trim();
  if (form.merchantId.trim()) payload.merchantId = form.merchantId.trim();
  return payload;
}

/**
 * Adds a channel to the selection, or removes it if it is already there.
 *
 * @param channels - The channels selected so far.
 * @param channel - The one that was clicked.
 * @returns The next selection.
 */
export function toggleChannel(channels: PaymentChannel[], channel: PaymentChannel): PaymentChannel[] {
  return channels.includes(channel) ? channels.filter((c) => c !== channel) : [...channels, channel];
}

/**
 * The status pill of a provider's card.
 *
 * @param isEnabled - Whether the provider is switched on.
 * @param isConfigured - Whether it has a public key.
 * @returns The pill's text.
 */
export function providerStatusLabel(isEnabled: boolean, isConfigured: boolean): string {
  return isEnabled ? 'Enabled' : isConfigured ? 'Configured' : 'Not configured';
}
