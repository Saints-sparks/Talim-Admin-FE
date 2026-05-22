'use client';

import { useEffect, useState } from 'react';
import {
  Building2, Smartphone, Globe, CreditCard,
  ChevronDown, ChevronUp, Save, Loader2, Eye, EyeOff, AlertCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  paymentsService,
  PlatformProviderConfig,
  PaymentProviderName,
  PaymentEnvironment,
  PaymentChannel,
  UpdateProviderConfigPayload,
} from '@/app/services/payments.service';
import { toast } from 'sonner';
import { ApiError } from '@/app/lib/api/client';

// ─── Provider metadata ─────────────────────────────────────────────────────────

const PROVIDER_META: Record<PaymentProviderName, {
  label: string;
  tagline: string;
  icon: React.ReactNode;
  accent: string;
  channels: PaymentChannel[];
}> = {
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

const ALL_PROVIDERS: PaymentProviderName[] = ['paystack', 'opay', 'stripe'];

const CHANNEL_LABELS: Record<PaymentChannel, string> = {
  card: 'Card',
  bank_transfer: 'Bank Transfer',
  ussd: 'USSD',
  wallet: 'Wallet',
  bank: 'Bank',
  mobile_money: 'Mobile Money',
};

const getErrorMessage = (
  error: unknown,
  fallback: string,
): string => {
  if (error instanceof ApiError) {
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
};

// ─── Toggle switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#003366]/30 disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? 'bg-[#003366]' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Provider card ─────────────────────────────────────────────────────────────

interface ProviderCardProps {
  providerName: PaymentProviderName;
  config: PlatformProviderConfig | null;
  onSave: (name: PaymentProviderName, payload: UpdateProviderConfigPayload) => Promise<void>;
  onToggle: (name: PaymentProviderName, enable: boolean) => Promise<void>;
}

function ProviderCard({ providerName, config, onSave, onToggle }: ProviderCardProps) {
  const meta = PROVIDER_META[providerName];
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);

  const [form, setForm] = useState<{
    publicKey: string;
    secretKey: string;
    webhookSecret: string;
    merchantId: string;
    environment: PaymentEnvironment;
    platformFeePercent: string;
    channels: PaymentChannel[];
  }>({
    publicKey: config?.publicKey ?? '',
    secretKey: '',
    webhookSecret: '',
    merchantId: config?.merchantId ?? '',
    environment: config?.environment ?? 'test',
    platformFeePercent: String(config?.platformFeePercent ?? 2),
    channels: config?.supportedChannels ?? meta.channels,
  });

  useEffect(() => {
    setForm({
      publicKey: config?.publicKey ?? '',
      secretKey: '',
      webhookSecret: '',
      merchantId: config?.merchantId ?? '',
      environment: config?.environment ?? 'test',
      platformFeePercent: String(config?.platformFeePercent ?? 2),
      channels: config?.supportedChannels ?? meta.channels,
    });
  }, [config, meta.channels]);

  const isEnabled = config?.isEnabled ?? false;
  const isConfigured = !!(config?.publicKey);

  const set = (field: keyof typeof form, value: string | PaymentChannel[]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleChannel = (ch: PaymentChannel) =>
    set('channels', form.channels.includes(ch)
      ? form.channels.filter((c) => c !== ch)
      : [...form.channels, ch]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: UpdateProviderConfigPayload = {
        environment: form.environment,
        supportedChannels: form.channels,
        platformFeePercent: parseFloat(form.platformFeePercent) || 0,
      };
      if (form.publicKey.trim()) payload.publicKey = form.publicKey.trim();
      if (form.secretKey.trim()) payload.secretKey = form.secretKey.trim();
      if (form.webhookSecret.trim()) payload.webhookSecret = form.webhookSecret.trim();
      if (form.merchantId.trim()) payload.merchantId = form.merchantId.trim();

      await onSave(providerName, payload);
      setForm((prev) => ({ ...prev, secretKey: '', webhookSecret: '' }));
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      await onToggle(providerName, !isEnabled);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#F1F1F1] bg-white shadow-sm overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.accent}`}>
          {meta.icon ?? <CreditCard className="h-5 w-5 text-gray-500" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#030E18]">{meta.label}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                isEnabled
                  ? 'bg-green-100 text-green-700'
                  : isConfigured
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {isEnabled ? 'Enabled' : isConfigured ? 'Configured' : 'Not configured'}
            </span>
          </div>
          <p className="text-xs text-[#6F6F6F] mt-0.5">{meta.tagline}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Toggle checked={isEnabled} onChange={handleToggle} disabled={toggling || !isConfigured} />
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F1F1F1] text-[#878787] hover:bg-gray-50 transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {!isConfigured && !expanded && (
        <div className="flex items-center gap-2 px-5 pb-4 text-xs text-amber-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          Configure API keys to enable this provider.
        </div>
      )}

      {/* Expandable config form */}
      {expanded && (
        <div className="border-t border-[#F1F1F1] px-5 py-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Public key */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#6F6F6F] mb-1 block">Public Key</label>
              <input
                type="text"
                value={form.publicKey}
                onChange={(e) => set('publicKey', e.target.value)}
                placeholder={`${meta.label} public key`}
                className="w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20"
              />
            </div>

            {/* Secret key */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#6F6F6F] mb-1 block">
                Secret Key <span className="text-[#878787] font-normal">(leave blank to keep existing)</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={form.secretKey}
                  onChange={(e) => set('secretKey', e.target.value)}
                  placeholder="Enter new secret key"
                  className="w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 pr-10 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878787]"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Webhook secret */}
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-[#6F6F6F] mb-1 block">
                Webhook Secret <span className="text-[#878787] font-normal">(leave blank to keep existing)</span>
              </label>
              <div className="relative">
                <input
                  type={showWebhook ? 'text' : 'password'}
                  value={form.webhookSecret}
                  onChange={(e) => set('webhookSecret', e.target.value)}
                  placeholder="Enter new webhook secret"
                  className="w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 pr-10 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowWebhook((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878787]"
                >
                  {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Merchant ID (OPay only) */}
            {providerName === 'opay' && (
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-[#6F6F6F] mb-1 block">Merchant ID</label>
                <input
                  type="text"
                  value={form.merchantId}
                  onChange={(e) => set('merchantId', e.target.value)}
                  placeholder="OPay merchant ID"
                  className="w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20"
                />
              </div>
            )}

            {/* Environment */}
            <div>
              <label className="text-xs font-medium text-[#6F6F6F] mb-1 block">Environment</label>
              <select
                value={form.environment}
                onChange={(e) => set('environment', e.target.value as PaymentEnvironment)}
                className="w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20"
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </div>

            {/* Platform fee */}
            <div>
              <label className="text-xs font-medium text-[#6F6F6F] mb-1 block">Platform Fee (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.platformFeePercent}
                onChange={(e) => set('platformFeePercent', e.target.value)}
                className="w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20"
              />
            </div>
          </div>

          {/* Supported channels */}
          <div>
            <label className="text-xs font-medium text-[#6F6F6F] mb-2 block">Supported Channels</label>
            <div className="flex flex-wrap gap-2">
              {meta.channels.map((ch) => {
                const active = form.channels.includes(ch);
                return (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => toggleChannel(ch)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      active
                        ? 'bg-[#003366] text-white border-[#003366]'
                        : 'bg-white text-[#6F6F6F] border-[#F1F1F1] hover:border-[#003366]'
                    }`}
                  >
                    {CHANNEL_LABELS[ch]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[#003366] px-5 py-2 text-sm font-semibold text-white hover:bg-[#002244] disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? 'Saving…' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PaymentProvidersPage() {
  const [configs, setConfigs] = useState<Record<PaymentProviderName, PlatformProviderConfig | null>>({
    paystack: null,
    opay: null,
    stripe: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchProviders = async () => {
    try {
      const list = await paymentsService.getProviders();
      const map: Record<PaymentProviderName, PlatformProviderConfig | null> = {
        paystack: null,
        opay: null,
        stripe: null,
      };
      list.forEach((p) => {
        map[p.providerName] = p;
      });
      setConfigs(map);
    } catch {
      toast.error('Failed to load payment providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const handleSave = async (name: PaymentProviderName, payload: UpdateProviderConfigPayload) => {
    try {
      await paymentsService.updateProviderConfig(name, payload);
      toast.success(`${PROVIDER_META[name].label} configuration saved`);
      fetchProviders();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          `Failed to save ${PROVIDER_META[name].label} configuration`,
        ),
      );
      throw error;
    }
  };

  const handleToggle = async (name: PaymentProviderName, enable: boolean) => {
    try {
      if (enable) {
        await paymentsService.enableProvider(name);
        toast.success(`${PROVIDER_META[name].label} enabled`);
      } else {
        await paymentsService.disableProvider(name);
        toast.success(`${PROVIDER_META[name].label} disabled`);
      }
      fetchProviders();
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          `Failed to ${enable ? 'enable' : 'disable'} ${PROVIDER_META[name].label}`,
        ),
      );
      throw error;
    }
  };

  const enabledCount = ALL_PROVIDERS.filter((n) => configs[n]?.isEnabled).length;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <PageHeader
        title="Payment Providers"
        subtitle="Configure and enable payment gateways used across all schools"
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        {/* Summary bar */}
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#F1F1F1] bg-white px-5 py-3 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003366]/10">
            <CreditCard className="h-4 w-4 text-[#003366]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#030E18]">
              {enabledCount} of {ALL_PROVIDERS.length} providers enabled
            </p>
            <p className="text-xs text-[#6F6F6F]">
              Enabled providers are available to parents for fee payments
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {ALL_PROVIDERS.map((name) => (
              <ProviderCard
                key={name}
                providerName={name}
                config={configs[name]}
                onSave={handleSave}
                onToggle={handleToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
