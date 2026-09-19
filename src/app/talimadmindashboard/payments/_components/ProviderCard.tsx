'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type {
  PaymentProviderName,
  PlatformProviderConfig,
  UpdateProviderConfigPayload,
} from '@/app/services/payments.service';
import { FALLBACK_ICON, PROVIDER_META } from './providerMeta';
import {
  buildConfigPayload,
  formFrom,
  providerStatusLabel,
  validateProviderForm,
  type CardForm,
} from './providerForm';
import { ProviderCredentialsForm } from './ProviderCredentialsForm';
import { Toggle } from './Toggle';

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
              {providerStatusLabel(isEnabled, isConfigured)}
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
        <ProviderCredentialsForm
          providerName={providerName}
          meta={meta}
          form={form}
          isSaving={isSaving}
          onChange={set}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
