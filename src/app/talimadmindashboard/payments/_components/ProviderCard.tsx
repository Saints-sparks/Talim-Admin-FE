'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Eye, EyeOff, Loader2, Save } from 'lucide-react';
import type {
  PaymentChannel,
  PaymentEnvironment,
  PaymentProviderName,
  PlatformProviderConfig,
  UpdateProviderConfigPayload,
} from '@/app/services/payments.service';
import { CHANNEL_LABELS, FALLBACK_ICON, PROVIDER_META } from './providerMeta';

const INPUT_CLASS =
  'w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20';

interface CardForm {
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
function formFrom(
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
 * The on/off switch for a provider.
 *
 * @param props - The switch state and handler.
 * @param props.checked - Whether the provider is enabled.
 * @param props.onChange - Toggles it.
 * @param props.disabled - Disables the control.
 * @param props.label - Accessible name.
 * @returns The switch element.
 */
export function Toggle({
  checked,
  onChange,
  disabled,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
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

interface ProviderCardProps {
  providerName: PaymentProviderName;
  config: PlatformProviderConfig | null;
  isSaving: boolean;
  isToggling: boolean;
  onSave: (name: PaymentProviderName, payload: UpdateProviderConfigPayload) => void;
  onToggle: (name: PaymentProviderName, enable: boolean) => void;
  onInvalid: (message: string) => void;
}

/**
 * One provider's status row and its expandable credential form.
 *
 * @param props - The provider, its configuration and handlers.
 * @param props.providerName - Which provider this card is for.
 * @param props.config - Its saved configuration, or `null` when unconfigured.
 * @param props.isSaving - True while this card's save is in flight.
 * @param props.isToggling - True while this card's enable/disable is in flight.
 * @param props.onSave - Persists the configuration.
 * @param props.onToggle - Enables or disables the provider.
 * @param props.onInvalid - Reports a client-side validation problem.
 * @returns The card element.
 */
export function ProviderCard({
  providerName,
  config,
  isSaving,
  isToggling,
  onSave,
  onToggle,
  onInvalid,
}: ProviderCardProps) {
  const meta = PROVIDER_META[providerName];
  const [expanded, setExpanded] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [showWebhook, setShowWebhook] = useState(false);
  const [form, setForm] = useState<CardForm>(() => formFrom(config, meta.channels));

  // Re-sync when the saved configuration changes underneath (after a save, or
  // a refetch), but never while the user is editing an open form.
  useEffect(() => {
    if (!expanded) setForm(formFrom(config, meta.channels));
  }, [config, meta.channels, expanded]);

  const isEnabled = config?.isEnabled ?? false;
  const isConfigured = Boolean(config?.publicKey);

  const set = <K extends keyof CardForm>(field: K, value: CardForm[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => {
    const problem = validateProviderForm(form);
    if (problem) {
      onInvalid(problem);
      return;
    }
    onSave(providerName, buildConfigPayload(form));
    setForm((prev) => ({ ...prev, secretKey: '', webhookSecret: '' }));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-[#F1F1F1] bg-white shadow-sm">
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${meta.accent}`}
        >
          {meta.icon ?? FALLBACK_ICON}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
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
          <p className="mt-0.5 text-xs text-[#6F6F6F]">{meta.tagline}</p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {isToggling && <Loader2 className="h-4 w-4 animate-spin text-[#878787]" />}
          <Toggle
            label={`${isEnabled ? 'Disable' : 'Enable'} ${meta.label}`}
            checked={isEnabled}
            onChange={() => onToggle(providerName, !isEnabled)}
            disabled={isToggling || !isConfigured}
          />
          <button
            type="button"
            aria-expanded={expanded}
            aria-label={`${expanded ? 'Hide' : 'Show'} ${meta.label} configuration`}
            onClick={() => setExpanded((open) => !open)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F1F1F1] text-[#878787] transition-colors hover:bg-gray-50"
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

      {expanded && (
        <div className="space-y-4 border-t border-[#F1F1F1] px-5 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor={`${providerName}-public-key`}
                className="mb-1 block text-xs font-medium text-[#6F6F6F]"
              >
                Public Key
              </label>
              <input
                id={`${providerName}-public-key`}
                type="text"
                value={form.publicKey}
                onChange={(e) => set('publicKey', e.target.value)}
                placeholder={`${meta.label} public key`}
                className={INPUT_CLASS}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={`${providerName}-secret-key`}
                className="mb-1 block text-xs font-medium text-[#6F6F6F]"
              >
                Secret Key{' '}
                <span className="font-normal text-[#878787]">(leave blank to keep existing)</span>
              </label>
              <div className="relative">
                <input
                  id={`${providerName}-secret-key`}
                  type={showSecret ? 'text' : 'password'}
                  autoComplete="off"
                  value={form.secretKey}
                  onChange={(e) => set('secretKey', e.target.value)}
                  placeholder="Enter new secret key"
                  className={`${INPUT_CLASS} pr-10`}
                />
                <button
                  type="button"
                  aria-label={showSecret ? 'Hide secret key' : 'Show secret key'}
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878787]"
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor={`${providerName}-webhook-secret`}
                className="mb-1 block text-xs font-medium text-[#6F6F6F]"
              >
                Webhook Secret{' '}
                <span className="font-normal text-[#878787]">(leave blank to keep existing)</span>
              </label>
              <div className="relative">
                <input
                  id={`${providerName}-webhook-secret`}
                  type={showWebhook ? 'text' : 'password'}
                  autoComplete="off"
                  value={form.webhookSecret}
                  onChange={(e) => set('webhookSecret', e.target.value)}
                  placeholder="Enter new webhook secret"
                  className={`${INPUT_CLASS} pr-10`}
                />
                <button
                  type="button"
                  aria-label={showWebhook ? 'Hide webhook secret' : 'Show webhook secret'}
                  onClick={() => setShowWebhook((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878787]"
                >
                  {showWebhook ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {providerName === 'opay' && (
              <div className="sm:col-span-2">
                <label
                  htmlFor="opay-merchant-id"
                  className="mb-1 block text-xs font-medium text-[#6F6F6F]"
                >
                  Merchant ID
                </label>
                <input
                  id="opay-merchant-id"
                  type="text"
                  value={form.merchantId}
                  onChange={(e) => set('merchantId', e.target.value)}
                  placeholder="OPay merchant ID"
                  className={INPUT_CLASS}
                />
              </div>
            )}

            <div>
              <label
                htmlFor={`${providerName}-environment`}
                className="mb-1 block text-xs font-medium text-[#6F6F6F]"
              >
                Environment
              </label>
              <select
                id={`${providerName}-environment`}
                value={form.environment}
                onChange={(e) => set('environment', e.target.value as PaymentEnvironment)}
                className={INPUT_CLASS}
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </div>

            <div>
              <label
                htmlFor={`${providerName}-fee`}
                className="mb-1 block text-xs font-medium text-[#6F6F6F]"
              >
                Platform Fee (%)
              </label>
              <input
                id={`${providerName}-fee`}
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={form.platformFeePercent}
                onChange={(e) => set('platformFeePercent', e.target.value)}
                className={INPUT_CLASS}
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 block text-xs font-medium text-[#6F6F6F]">
              Supported Channels
            </legend>
            <div className="flex flex-wrap gap-2">
              {meta.channels.map((channel) => {
                const active = form.channels.includes(channel);
                return (
                  <button
                    key={channel}
                    type="button"
                    aria-pressed={active}
                    onClick={() =>
                      set(
                        'channels',
                        active
                          ? form.channels.filter((c) => c !== channel)
                          : [...form.channels, channel],
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      active
                        ? 'border-[#003366] bg-[#003366] text-white'
                        : 'border-[#F1F1F1] bg-white text-[#6F6F6F] hover:border-[#003366]'
                    }`}
                  >
                    {CHANNEL_LABELS[channel]}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#003366] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#002244] disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Saving…' : 'Save Configuration'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
