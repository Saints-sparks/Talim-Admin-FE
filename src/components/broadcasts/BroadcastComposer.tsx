'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Send } from 'lucide-react';
import { broadcastService } from '@/app/services/broadcast.service';
import { useRecipientPreview } from '@/hooks/useRecipientPreview';
import { getErrorMessage } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { listPrefix, queryKeys } from '@/lib/queryKeys';
import { AttachmentPicker } from '@/components/attachments/AttachmentPicker';
import { ConfirmSheet } from '@/components/tl/ConfirmSheet';
import {
  card,
  cardTitle,
  chip,
  fieldControl,
  fieldHint,
  fieldLabel,
  focusRing,
  ghostButton,
  pagePad,
  pageSubtitle,
  pageTitle,
  primaryButton,
  textLink,
} from '@/components/tl/styles';
import type { Attachment, CreateBroadcastPayload } from '@/types/v15';
import { AudienceBuilder } from './AudienceBuilder';
import { RecipientPreview } from './RecipientPreview';
import {
  BODY_MAX,
  EMPTY_BROADCAST_FORM,
  HISTORY_ROUTE,
  PREVIEW_DEBOUNCE_MS,
  TARGET_LABELS,
  TARGET_PAGES,
  TEMPLATES,
  TITLE_MAX,
  buildAudience,
  buildBroadcastPayload,
  channelsLabel,
  formatCount,
  todayInput,
  validateAudience,
  validateBroadcastForm,
  type BroadcastErrors,
  type BroadcastField,
  type BroadcastForm,
} from './broadcast-model';

/** Form controls, in reading order, for focusing the first problem. */
const FIELD_FOCUS: Record<BroadcastField, string> = {
  title: 'broadcast-title',
  body: 'broadcast-body',
  audience: 'audience-section',
  schedule: 'broadcast-date',
};

/**
 * The browser's time zone name, for the schedule hint.
 *
 * @returns e.g. "Africa/Lagos", or "your time zone".
 */
function browserZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'your time zone';
  } catch {
    return 'your time zone';
  }
}

/**
 * Formats the scheduled moment for the confirm sheet.
 *
 * @param iso - The ISO timestamp.
 * @returns e.g. "Tue 7 Oct 2026, 09:00".
 */
function formatSendAt(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * "Send notification" (v1.5 §2): title and body with character counts, an
 * optional deep link, attachments, the audience builder with a live,
 * debounced recipient count, push and email (in-app is always on), send now
 * or at a browser-local date and time, and a confirm step that states the
 * recipient count.
 *
 * Problems are shown beside their fields and the first one gets focus; the
 * confirm sheet traps focus and returns it to the Send button.
 *
 * @returns The composer page.
 */
export function BroadcastComposer() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<BroadcastForm>(EMPTY_BROADCAST_FORM);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<BroadcastErrors>({});
  const [confirming, setConfirming] = useState<CreateBroadcastPayload | null>(null);
  const onBusyChange = useCallback((busy: boolean) => setUploading(busy), []);
  const formRef = useRef<HTMLFormElement>(null);

  const audience = useMemo(() => buildAudience(form), [form]);
  const audienceProblem = validateAudience(form);
  const preview = useRecipientPreview(audience, audienceProblem === null, PREVIEW_DEBOUNCE_MS);

  const update = (patch: Partial<BroadcastForm>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) {
        if (key === 'title' || key === 'body') delete next[key];
        else if (key === 'date' || key === 'time' || key === 'when') delete next.schedule;
        else delete next.audience;
      }
      return next;
    });
  };

  const create = useMutation({
    mutationFn: (payload: CreateBroadcastPayload) => broadcastService.create(payload),
    onSuccess: async (result) => {
      toast.success(
        result.status === 'scheduled'
          ? `Scheduled for ${formatCount(result.recipientsEstimate)} people`
          : `Sending to ${formatCount(result.recipientsEstimate)} people`,
      );
      setConfirming(null);
      await queryClient.invalidateQueries({ queryKey: listPrefix(queryKeys.broadcasts.list()) });
      router.push(`${HISTORY_ROUTE}/${encodeURIComponent(result.id)}`);
    },
    onError: (err) => {
      logger.error('broadcasts', 'Create failed', err);
      setConfirming(null);
      toast.error('The notification was not sent', { description: getErrorMessage(err) });
    },
  });

  const review = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validateBroadcastForm(form);
    setErrors(found);
    const first = (Object.keys(FIELD_FOCUS) as BroadcastField[]).find((field) => found[field]);
    if (first) {
      formRef.current?.querySelector<HTMLElement>(`#${FIELD_FOCUS[first]}`)?.focus();
      return;
    }
    setConfirming(buildBroadcastPayload(form, attachments));
  };

  const recipients = preview.isCurrent && preview.data ? preview.data.recipients : null;
  const scheduling = form.when === 'later';
  const describe = (field: BroadcastField, hintId?: string) =>
    [hintId, errors[field] ? `${FIELD_FOCUS[field]}-error` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="min-h-screen bg-tl-bg">
      <div className={`${pagePad} flex flex-col gap-[18px] max-lg:pt-16`}>
        <Link href={HISTORY_ROUTE} className={`${textLink} self-start`}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Notifications
        </Link>
        <header>
          <h1 className={pageTitle}>Send notification</h1>
          <p className={pageSubtitle}>Reach anyone on Talim: in the app always, by push and email if you choose.</p>
        </header>

        <form ref={formRef} noValidate onSubmit={review} className="grid items-start gap-[18px] lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-[18px]">
            <section className={`${card} flex flex-col gap-4`} aria-labelledby="message-title">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="message-title" className={cardTitle}>
                  Notification
                </h2>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Start from a template">
                  {TEMPLATES.map((t) => (
                    <button key={t.name} type="button" className={`${chip(false)} min-h-[44px] py-1.5 text-[13px]`} onClick={() => update({ title: t.title, body: t.body })}>
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="broadcast-title" className={fieldLabel}>
                  Title
                </label>
                <input
                  id="broadcast-title"
                  value={form.title}
                  maxLength={TITLE_MAX}
                  aria-invalid={Boolean(errors.title)}
                  aria-describedby={describe('title', 'broadcast-title-count')}
                  onChange={(e) => update({ title: e.target.value })}
                  className={fieldControl}
                />
                <div className="flex justify-between gap-2">
                  {errors.title ? (
                    <span id="broadcast-title-error" className="text-xs font-bold text-tl-danger">
                      {errors.title}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span id="broadcast-title-count" className={fieldHint}>
                    {form.title.length} / {TITLE_MAX}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="broadcast-body" className={fieldLabel}>
                  Message
                </label>
                <textarea
                  id="broadcast-body"
                  value={form.body}
                  rows={7}
                  maxLength={BODY_MAX}
                  aria-invalid={Boolean(errors.body)}
                  aria-describedby={describe('body', 'broadcast-body-count')}
                  onChange={(e) => update({ body: e.target.value })}
                  className={`min-h-[160px] w-full resize-y rounded-[13px] border border-tl-control bg-tl-surface px-3.5 py-3 text-[15px] leading-[1.55] text-tl-ink ${focusRing}`}
                />
                <div className="flex justify-between gap-2">
                  {errors.body ? (
                    <span id="broadcast-body-error" className="text-xs font-bold text-tl-danger">
                      {errors.body}
                    </span>
                  ) : (
                    <span />
                  )}
                  <span id="broadcast-body-count" className={fieldHint}>
                    {form.body.length.toLocaleString()} / {BODY_MAX.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="broadcast-target" className={fieldLabel}>
                  Button opens (optional)
                </label>
                <select
                  id="broadcast-target"
                  className={fieldControl}
                  value={form.target}
                  aria-describedby="broadcast-target-hint"
                  onChange={(e) => update({ target: e.target.value as BroadcastForm['target'] })}
                >
                  <option value="">No button: just the message</option>
                  {TARGET_PAGES.map((page) => (
                    <option key={page} value={page}>
                      {TARGET_LABELS[page]}
                    </option>
                  ))}
                </select>
                <span id="broadcast-target-hint" className={fieldHint}>
                  The page the notification opens in each person&apos;s app.
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className={fieldLabel}>Attachments</span>
                <AttachmentPicker id="broadcast-attachments" value={attachments} onChange={setAttachments} onBusyChange={onBusyChange} disabled={create.isPending} />
              </div>
            </section>

            <section id="audience-section" tabIndex={-1} className={`${card} flex flex-col gap-4 focus:outline-none`} aria-labelledby="audience-title">
              <h2 id="audience-title" className={cardTitle}>
                Audience
              </h2>
              <AudienceBuilder value={form} onChange={update} error={errors.audience} />
            </section>

            <section className={`${card} grid gap-5 md:grid-cols-2`} aria-label="Delivery">
              <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
                <legend className={`${cardTitle} mb-2`}>Channels</legend>
                <label className="flex min-h-[44px] items-center gap-3 text-[15px] font-semibold text-tl-muted">
                  <input type="checkbox" checked disabled className="h-4 w-4" aria-describedby="inapp-hint" />
                  In-app
                  <span id="inapp-hint" className="text-xs font-bold text-tl-faint">
                    always on
                  </span>
                </label>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px] font-semibold text-tl-ink">
                  <input type="checkbox" checked={form.push} onChange={(e) => update({ push: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--tl-brand-fill))]" />
                  Push notification
                </label>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px] font-semibold text-tl-ink">
                  <input type="checkbox" checked={form.email} onChange={(e) => update({ email: e.target.checked })} className="h-4 w-4 accent-[rgb(var(--tl-brand-fill))]" />
                  Email
                </label>
                <p className={`${fieldHint} m-0`}>Each person&apos;s notification settings and quiet hours are respected.</p>
              </fieldset>

              <fieldset className="m-0 flex flex-col gap-2 border-0 p-0" aria-describedby={describe('schedule')}>
                <legend className={`${cardTitle} mb-2`}>When</legend>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px] font-semibold text-tl-ink">
                  <input type="radio" name="when" checked={!scheduling} onChange={() => update({ when: 'now' })} className="h-4 w-4 accent-[rgb(var(--tl-brand-fill))]" />
                  Send now
                </label>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-[15px] font-semibold text-tl-ink">
                  <input type="radio" name="when" checked={scheduling} onChange={() => update({ when: 'later' })} className="h-4 w-4 accent-[rgb(var(--tl-brand-fill))]" />
                  Schedule for later
                </label>
                {scheduling ? (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="broadcast-date" className={fieldLabel}>
                        Date
                      </label>
                      <input
                        id="broadcast-date"
                        type="date"
                        min={todayInput()}
                        value={form.date}
                        aria-invalid={Boolean(errors.schedule)}
                        aria-describedby={describe('schedule', 'broadcast-zone')}
                        onChange={(e) => update({ date: e.target.value })}
                        className={fieldControl}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="broadcast-time" className={fieldLabel}>
                        Time
                      </label>
                      <input
                        id="broadcast-time"
                        type="time"
                        value={form.time}
                        aria-invalid={Boolean(errors.schedule)}
                        aria-describedby={describe('schedule', 'broadcast-zone')}
                        onChange={(e) => update({ time: e.target.value })}
                        className={fieldControl}
                      />
                    </div>
                    <span id="broadcast-zone" className={`${fieldHint} sm:col-span-2`}>
                      In your time zone ({browserZone()}).
                    </span>
                  </div>
                ) : null}
                {errors.schedule ? (
                  <p id="broadcast-date-error" role="alert" className="m-0 text-sm font-bold text-tl-danger">
                    {errors.schedule}
                  </p>
                ) : null}
              </fieldset>
            </section>
          </div>

          <div className="flex flex-col gap-[18px] lg:sticky lg:top-[18px]">
            <RecipientPreview preview={preview} audienceProblem={audienceProblem} />
            <div className={`${card} flex flex-col gap-2.5`}>
              <button type="submit" className={primaryButton} disabled={uploading || create.isPending}>
                <Send className="h-4 w-4" aria-hidden />
                {scheduling ? 'Review and schedule' : 'Review and send'}
              </button>
              {uploading ? <p className={`${fieldHint} m-0`}>Waiting for attachments to finish uploading…</p> : null}
              <Link href={HISTORY_ROUTE} className={ghostButton}>
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>

      <ConfirmSheet
        open={confirming !== null}
        onCancel={() => setConfirming(null)}
        onConfirm={() => confirming && create.mutate(confirming)}
        eyebrowText={scheduling ? 'Schedule notification' : 'Send notification'}
        title={confirming?.title ?? ''}
        busy={create.isPending}
        busyLabel={scheduling ? 'Scheduling…' : 'Sending…'}
        confirmLabel={
          recipients !== null
            ? `${scheduling ? 'Schedule for' : 'Send to'} ${formatCount(recipients)} ${recipients === 1 ? 'person' : 'people'}`
            : scheduling
              ? 'Schedule'
              : 'Send'
        }
        body={
          <>
            <p className="m-0" data-testid="confirm-count">
              {recipients !== null ? (
                <>
                  This goes to <strong className="text-tl-ink">{formatCount(recipients)}</strong> {recipients === 1 ? 'person' : 'people'}
                </>
              ) : (
                <>The recipient count is not available, so the server will work it out when it sends</>
              )}
              {' '}by {channelsLabel(confirming?.channels ?? { push: form.push, email: form.email }).toLowerCase()}
              {confirming?.sendAt ? <>, on {formatSendAt(confirming.sendAt)} ({browserZone()})</> : <>, now</>}.
            </p>
            <p className="m-0 mt-2">It cannot be edited once sent{confirming?.sendAt ? '; you can cancel it until it starts sending' : ''}.</p>
          </>
        }
      />
    </div>
  );
}
