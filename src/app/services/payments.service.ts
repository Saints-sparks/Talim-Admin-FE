import { API_ENDPOINTS } from '@/app/lib/api/config';
import { apiRequest } from '@/app/lib/api/client';

export type PaymentEnvironment = 'test' | 'live';
export type PaymentProviderName = 'paystack' | 'opay' | 'stripe';
export type PaymentChannel = 'card' | 'bank_transfer' | 'ussd' | 'wallet' | 'bank' | 'mobile_money';

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
  async getProviders(): Promise<PlatformProviderConfig[]> {
    const res = await apiRequest<{ success: boolean; providers: PlatformProviderConfig[] }>(
      API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDERS,
    );
    return res.providers ?? [];
  },

  async updateProviderConfig(name: PaymentProviderName, payload: UpdateProviderConfigPayload) {
    return apiRequest(API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDER_CONFIG(name), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async enableProvider(name: PaymentProviderName) {
    return apiRequest(API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDER_ENABLE(name), { method: 'PATCH' });
  },

  async disableProvider(name: PaymentProviderName) {
    return apiRequest(API_ENDPOINTS.PAYMENT_PLATFORM_PROVIDER_DISABLE(name), { method: 'PATCH' });
  },
};
