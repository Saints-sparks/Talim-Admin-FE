'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/ui/page-header';
import {
  paymentsService,
  type PaymentProviderName,
  type PlatformProviderConfig,
  type UpdateProviderConfigPayload,
} from '@/app/services/payments.service';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { ErrorState } from '@/components/StateComponents';
import { ProviderCard } from './_components/ProviderCard';
import { ALL_PROVIDERS, PROVIDER_META } from './_components/providerMeta';

type ConfigMap = Record<PaymentProviderName, PlatformProviderConfig | null>;

const EMPTY_MAP: ConfigMap = { paystack: null, opay: null, stripe: null };

/**
 * Platform payment gateways: credentials, channels and the on/off switch that
 * decides which providers parents see at checkout.
 *
 * @returns The payment providers page.
 */
export default function PaymentProvidersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.payments.providers(),
    queryFn: () => paymentsService.getProviders(),
    staleTime: staleTimes.reference,
  });

  const configs = useMemo<ConfigMap>(() => {
    const map: ConfigMap = { ...EMPTY_MAP };
    for (const provider of data ?? []) map[provider.providerName] = provider;
    return map;
  }, [data]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.payments.providers() });

  const saveMutation = useMutation({
    mutationFn: ({
      name,
      payload,
    }: {
      name: PaymentProviderName;
      payload: UpdateProviderConfigPayload;
    }) => paymentsService.updateProviderConfig(name, payload),
    onSuccess: async (_result, { name }) => {
      toast.success(`${PROVIDER_META[name].label} configuration saved`);
      await invalidate();
    },
    onError: (err, { name }) => {
      logger.error('payments', `Saving ${name} configuration failed`, err);
      toast.error(`${PROVIDER_META[name].label} could not be saved`, {
        description: getErrorMessage(err),
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ name, enable }: { name: PaymentProviderName; enable: boolean }) =>
      enable ? paymentsService.enableProvider(name) : paymentsService.disableProvider(name),
    onSuccess: async (_result, { name, enable }) => {
      toast.success(`${PROVIDER_META[name].label} ${enable ? 'enabled' : 'disabled'}`);
      await invalidate();
    },
    onError: (err, { name, enable }) => {
      logger.error('payments', `Toggling ${name} failed`, err);
      toast.error(`${PROVIDER_META[name].label} could not be ${enable ? 'enabled' : 'disabled'}`, {
        description: getErrorMessage(err),
      });
    },
  });

  const enabledCount = ALL_PROVIDERS.filter((name) => configs[name]?.isEnabled).length;

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <PageHeader
        title="Payment Providers"
        subtitle="Configure and enable payment gateways used across all schools"
      />

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#F1F1F1] bg-white px-5 py-3 shadow-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#003366]/10">
            <CreditCard className="h-4 w-4 text-[#003366]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#030E18]">
              {isLoading
                ? 'Loading providers…'
                : `${enabledCount} of ${ALL_PROVIDERS.length} providers enabled`}
            </p>
            <p className="text-xs text-[#6F6F6F]">
              Enabled providers are available to parents for fee payments
            </p>
          </div>
        </div>

        {error ? (
          <ErrorState
            error={error}
            title="Payment providers could not be loaded"
            onRetry={() => void refetch()}
          />
        ) : isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Loading providers">
            {ALL_PROVIDERS.map((name) => (
              <div key={name} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {ALL_PROVIDERS.map((name) => (
              <ProviderCard
                key={name}
                providerName={name}
                config={configs[name]}
                isSaving={saveMutation.isPending && saveMutation.variables?.name === name}
                isToggling={toggleMutation.isPending && toggleMutation.variables?.name === name}
                onSave={(providerName, payload) =>
                  saveMutation.mutate({ name: providerName, payload })
                }
                onToggle={(providerName, enable) =>
                  toggleMutation.mutate({ name: providerName, enable })
                }
                onInvalid={(message) => toast.error(message)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
