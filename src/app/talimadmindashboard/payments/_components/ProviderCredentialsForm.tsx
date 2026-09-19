'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, Save } from 'lucide-react';
import type { PaymentEnvironment, PaymentProviderName } from '@/app/services/payments.service';
import { CHANNEL_LABELS, type ProviderMeta } from './providerMeta';
import { toggleChannel, type CardForm } from './providerForm';

const INPUT_CLASS =
  'w-full rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] px-3 py-2 text-sm text-[#030E18] focus:border-[#003366] focus:outline-none focus:ring-1 focus:ring-[#003366]/20';
const LABEL_CLASS = 'mb-1 block text-xs font-medium text-[#6F6F6F]';

/** A password-style credential box with a show/hide eye. */
function SecretField({
  id,
  label,
  what,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  /** Lower-case noun for the eye's accessible name, e.g. "secret key". */
  what: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className={LABEL_CLASS}>
        {label} <span className="font-normal text-[#878787]">(leave blank to keep existing)</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type={shown ? 'text' : 'password'}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${INPUT_CLASS} pr-10`}
        />
        <button
          type="button"
          aria-label={`${shown ? 'Hide' : 'Show'} ${what}`}
          onClick={() => setShown((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#878787]"
        >
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

interface ProviderCredentialsFormProps {
  providerName: PaymentProviderName;
  meta: ProviderMeta;
  form: CardForm;
  isSaving: boolean;
  onChange: <K extends keyof CardForm>(field: K, value: CardForm[K]) => void;
  onSave: () => void;
}

/** The credential, environment, fee and channel fields of one provider, with Save. */
export function ProviderCredentialsForm({
  providerName,
  meta,
  form,
  isSaving,
  onChange,
  onSave,
}: ProviderCredentialsFormProps) {
  return (
    <div className="space-y-4 border-t border-[#F1F1F1] px-5 py-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor={`${providerName}-public-key`} className={LABEL_CLASS}>
            Public Key
          </label>
          <input
            id={`${providerName}-public-key`}
            type="text"
            value={form.publicKey}
            onChange={(e) => onChange('publicKey', e.target.value)}
            placeholder={`${meta.label} public key`}
            className={INPUT_CLASS}
          />
        </div>

        <SecretField
          id={`${providerName}-secret-key`}
          label="Secret Key"
          what="secret key"
          placeholder="Enter new secret key"
          value={form.secretKey}
          onChange={(v) => onChange('secretKey', v)}
        />

        <SecretField
          id={`${providerName}-webhook-secret`}
          label="Webhook Secret"
          what="webhook secret"
          placeholder="Enter new webhook secret"
          value={form.webhookSecret}
          onChange={(v) => onChange('webhookSecret', v)}
        />

        {providerName === 'opay' && (
          <div className="sm:col-span-2">
            <label htmlFor="opay-merchant-id" className={LABEL_CLASS}>
              Merchant ID
            </label>
            <input
              id="opay-merchant-id"
              type="text"
              value={form.merchantId}
              onChange={(e) => onChange('merchantId', e.target.value)}
              placeholder="OPay merchant ID"
              className={INPUT_CLASS}
            />
          </div>
        )}

        <div>
          <label htmlFor={`${providerName}-environment`} className={LABEL_CLASS}>
            Environment
          </label>
          <select
            id={`${providerName}-environment`}
            value={form.environment}
            onChange={(e) => onChange('environment', e.target.value as PaymentEnvironment)}
            className={INPUT_CLASS}
          >
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>
        </div>

        <div>
          <label htmlFor={`${providerName}-fee`} className={LABEL_CLASS}>
            Platform Fee (%)
          </label>
          <input
            id={`${providerName}-fee`}
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={form.platformFeePercent}
            onChange={(e) => onChange('platformFeePercent', e.target.value)}
            className={INPUT_CLASS}
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-2 block text-xs font-medium text-[#6F6F6F]">Supported Channels</legend>
        <div className="flex flex-wrap gap-2">
          {meta.channels.map((channel) => {
            const active = form.channels.includes(channel);
            return (
              <button
                key={channel}
                type="button"
                aria-pressed={active}
                onClick={() => onChange('channels', toggleChannel(form.channels, channel))}
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
          onClick={onSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-[#003366] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#002244] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Saving…' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}
