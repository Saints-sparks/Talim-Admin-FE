import { Building2, CreditCard, Globe, Smartphone } from 'lucide-react';
import type { PaymentChannel, PaymentProviderName } from '@/app/services/payments.service';

/** Presentation and capability metadata per provider. */
export interface ProviderMeta {
  label: string;
  tagline: string;
  icon: React.ReactNode;
  accent: string;
  /** The channels this provider can offer; the saved set is a subset of these. */
  channels: PaymentChannel[];
}

/** Every provider the platform can route through, in display order. */
export const ALL_PROVIDERS: PaymentProviderName[] = ['paystack', 'opay', 'stripe'];

/** Metadata keyed by provider name. */
export const PROVIDER_META: Record<PaymentProviderName, ProviderMeta> = {
  paystack: {
    label: 'Paystack',
    tagline: 'Cards, Bank Transfer, USSD',
    icon: <Building2 className="h-5 w-5 text-green-600" />,
    accent: 'border-green-200 bg-green-50',
    channels: ['card', 'bank_transfer', 'ussd', 'bank'],
  },
  opay: {
    label: 'OPay',
    tagline: 'Wallet, Bank Transfer, Card',
    icon: <Smartphone className="h-5 w-5 text-blue-600" />,
    accent: 'border-blue-200 bg-blue-50',
    channels: ['wallet', 'bank_transfer', 'card'],
  },
  stripe: {
    label: 'Stripe',
    tagline: 'Visa, Mastercard, Amex',
    icon: <Globe className="h-5 w-5 text-purple-600" />,
    accent: 'border-purple-200 bg-purple-50',
    channels: ['card'],
  },
};

/** Human labels for each payment channel. */
export const CHANNEL_LABELS: Record<PaymentChannel, string> = {
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  ussd: 'USSD',
  wallet: 'Wallet',
  bank: 'Bank',
  mobile_money: 'Mobile Money',
};

/** Fallback icon for a provider the metadata does not cover. */
export const FALLBACK_ICON = <CreditCard className="h-5 w-5 text-gray-500" />;
