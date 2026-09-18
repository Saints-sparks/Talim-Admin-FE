import { API_ENDPOINTS } from '@/app/lib/api/config';
import { api } from '@/lib/apiClient';

/**
 *
 */
/** Which set of provider credentials a configuration uses. */
export type PaymentEnvironment = 'test' | 'live';
/**
 *
 */
/** The payment providers the platform can route through. */
export type PaymentProviderName = 'paystack' | 'opay' | 'stripe';
/**
 *
 */
/** A way a payer can settle, as the provider names it. */
export type PaymentChannel = 'card' | 'bank_transfer' | 'ussd' | 'wallet' | 'bank' | 'mobile_money';

/**
 *
 */
/** One provider's platform-wide configuration. */
export interface PlatformProviderConfig {
  providerName: PaymentProviderName;
  isEnabled: boolean;
  isDefault: boolean;
  publicKey: string;
  environment: PaymentEnvironment;
  supportedChannels: PaymentChannel[];
  currency: string;
  merchantId: string;
  platformFeePercent: number;
  updatedAt?: string;
}

/**
 *
 */
/**
 * Body for `PATCH /payments/platform/providers/:name/config`. Only the fields
 * the DTO declares; the API runs `forbidNonWhitelisted`.
 */
export interface UpdateProviderConfigPayload {
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  merchantId?: string;
  environment?: PaymentEnvironment;
  supportedChannels?: PaymentChannel[];
  platformFeePercent?: number;
  isDefault?: boolean;
}

export const paymentsService = {
  /**
   * Every platform payment provider and its configuration.
   *
   * @returns The provider list, empty when none is configured yet.
   * @throws ApiError - On any non-2xx response.
   */
  async getProviders(): Promise<PlatformProviderConfig[]> {
    const res = await api.get<{ success?: boolean; providers?: PlatformProviderConfig[] }>(
      API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDERS,
    );
    return res.providers ?? [];
  },

  /**
   * Updates one provider's credentials and settings.
   *
   * @param name - The provider to change.
   * @param payload - Only the fields the DTO declares.
   * @returns The updated configuration.
   * @throws ApiError - `VALIDATION_FAILED` with per-field details.
   */
  async updateProviderConfig(
    name: PaymentProviderName,
    payload: UpdateProviderConfigPayload,
  ): Promise<PlatformProviderConfig> {
    return api.patch<PlatformProviderConfig>(
      API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDER_CONFIG(name),
      payload,
    );
  },

  /**
   * Turns a provider on for the whole platform.
   *
   * @param name - The provider to enable.
   * @returns The updated configuration.
   * @throws ApiError - `BAD_REQUEST` when the provider has no credentials yet.
   */
  async enableProvider(name: PaymentProviderName): Promise<PlatformProviderConfig> {
    return api.patch<PlatformProviderConfig>(API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDER_ENABLE(name));
  },

  /**
   * Turns a provider off for the whole platform.
   *
   * @param name - The provider to disable.
   * @returns The updated configuration.
   * @throws ApiError - `BAD_REQUEST` when it is the only enabled provider.
   */
  async disableProvider(name: PaymentProviderName): Promise<PlatformProviderConfig> {
    return api.patch<PlatformProviderConfig>(API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDER_DISABLE(name));
  },
};
