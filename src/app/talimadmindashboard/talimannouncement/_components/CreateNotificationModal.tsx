'use client';

import React, { useEffect, useRef } from 'react';
import { Loader2, Send, X } from 'lucide-react';
import type {
  NotificationCategory,
  NotificationDeliveryChannel,
  Priority,
  RecipientRole,
} from '@/app/services/notification.service';
import type { School as SchoolRecord } from '@/app/services/school.service';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import {
  CATEGORY_OPTIONS,
  DELIVERY_OPTIONS,
  MESSAGE_MAX_LENGTH,
  ROLE_OPTIONS,
} from './constants';
import type { AudienceMode, NotificationFormState } from './types';
import { SchoolSearchDropdown } from './SchoolSearchDropdown';
import { ModalField, ModalStep } from './primitives';

/**
 * Audience modes offered. "Specific Users" is absent: `POST /notifications`
 * takes a single `recipientId`, there is no platform-wide user picker to feed
 * it, and the option previously did nothing at all.
 */
const AUDIENCE_MODES: Array<{ mode: AudienceMode; label: string; description: string }> = [
  { mode: 'schools', label: 'Schools', description: 'Send to one or more schools' },
  { mode: 'roles', label: 'User Types', description: 'Send to every school, by role' },
];

/**
 * The composer.
 *
 * @param props - The form state and handlers.
 * @param props.form - The current form values.
 * @param props.schools - Schools that can be targeted.
 * @param props.isLoadingSchools - True while the school list is loading.
 * @param props.isSubmitting - True while the notification is being sent.
 * @param props.onClose - Dismisses the modal.
 * @param props.onSubmit - Sends the notification.
 * @param props.setForm - Updates the form state.
 * @param props.toggleRole - Adds or removes a recipient role.
 * @param props.toggleSchool - Adds or removes a target school.
 * @param props.toggleDelivery - Adds or removes a delivery channel.
 * @returns The modal element.
 */
export function CreateNotificationModal({
  form,
  schools,
  isLoadingSchools,
  isSubmitting,
  onClose,
  onSubmit,
  setForm,
  toggleRole,
  toggleSchool,
  toggleDelivery,
}: {
  form: NotificationFormState;
  schools: SchoolRecord[];
  isLoadingSchools: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setForm: React.Dispatch<React.SetStateAction<NotificationFormState>>;
  toggleRole: (role: RecipientRole) => void;
  toggleSchool: (id: string) => void;
  toggleDelivery: (channel: NotificationDeliveryChannel) => void;
}) {
  const titleRef = useRef<HTMLInputElement>(null);

  useBodyScrollLock(true);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isSubmitting) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose, isSubmitting]);

  const isScheduling = form.scheduleMode === 'later';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-notification-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
    >
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#E8EDF5] p-5">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EFF5FF] text-[#0B63CE]">
              <Send className="h-6 w-6" />
            </span>
            <div>
              <h2 id="create-notification-title" className="text-xl font-semibold text-[#101828]">
                Create New Notification
              </h2>
              <p className="text-sm text-[#667085]">
                Send a notification to schools or to every school by user type.
              </p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-[#DCE5F2] p-2 text-[#667085] hover:bg-[#F8FBFF] disabled:opacity-60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          <ModalStep number={1} title="Basic Information" />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px_150px]">
            <ModalField label="Title" required htmlFor="notification-title">
              <input
                id="notification-title"
                ref={titleRef}
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter notification title…"
                className="mt-2 h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none focus:border-[#0B63CE] focus:ring-4 focus:ring-blue-100"
              />
            </ModalField>
            <ModalField label="Priority" htmlFor="notification-priority">
              <select
                id="notification-priority"
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
                className="mt-2 h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="high">High</option>
              </select>
            </ModalField>
            <ModalField label="Category" htmlFor="notification-category">
              <select
                id="notification-category"
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value as NotificationCategory }))
                }
                className="mt-2 h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </ModalField>
          </div>

          <ModalField label="Message" required htmlFor="notification-message">
            <div className="mt-2 overflow-hidden rounded-lg border border-[#DCE5F2] focus-within:border-[#0B63CE]">
              <textarea
                id="notification-message"
                value={form.message}
                maxLength={MESSAGE_MAX_LENGTH}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                placeholder="Write your notification message…"
                className="h-44 w-full resize-y p-4 text-sm text-[#344054] outline-none"
              />
              <div className="border-t border-[#E8EDF5] px-3 py-1.5 text-right text-xs text-[#98A2B3]">
                {form.message.length}/{MESSAGE_MAX_LENGTH}
              </div>
            </div>
          </ModalField>

          <ModalStep number={2} title="Audience" />

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-[#344054]">Send To *</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {AUDIENCE_MODES.map(({ mode, label, description }) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={form.audienceMode === mode}
                  onClick={() => setForm((p) => ({ ...p, audienceMode: mode }))}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border p-4 text-left transition',
                    form.audienceMode === mode
                      ? 'border-[#0B63CE] bg-[#F4F8FF] ring-2 ring-blue-100'
                      : 'border-[#DCE5F2] hover:bg-[#F8FBFF]',
                  )}
                >
                  <span
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 rounded-full border-2',
                      form.audienceMode === mode
                        ? 'border-[#0B63CE] bg-[#0B63CE]'
                        : 'border-[#D0D5DD] bg-white',
                    )}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#101828]">{label}</span>
                    <span className="text-xs text-[#667085]">{description}</span>
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-[#344054]">
                Select Schools {form.audienceMode === 'schools' ? '*' : '(all schools)'}
              </p>
              {form.audienceMode === 'schools' ? (
                <SchoolSearchDropdown
                  schools={schools}
                  selected={form.selectedSchools}
                  onToggle={toggleSchool}
                  isLoading={isLoadingSchools}
                />
              ) : (
                <p className="rounded-lg border border-dashed border-[#DCE5F2] px-3 py-3 text-sm text-[#667085]">
                  This notification goes to every school.
                </p>
              )}
            </div>

            <fieldset>
              <legend className="mb-2 text-sm font-medium text-[#344054]">User Types *</legend>
              <div className="space-y-2">
                {ROLE_OPTIONS.map((role) => (
                  <label
                    key={role.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]"
                  >
                    <input
                      type="checkbox"
                      checked={form.recipientRoles.includes(role.value)}
                      onChange={() => toggleRole(role.value)}
                      className="h-4 w-4 accent-[#003366]"
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <ModalStep number={3} title="Delivery Settings" />

          <div className="grid gap-6 md:grid-cols-2">
            <fieldset>
              <legend className="mb-3 text-sm font-medium text-[#344054]">Delivery Method *</legend>
              {DELIVERY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="mb-3 flex items-center gap-2 text-sm text-[#344054]"
                >
                  <input
                    type="checkbox"
                    checked={form.deliveryMethods.includes(option.value)}
                    onChange={() => toggleDelivery(option.value)}
                    className="h-4 w-4 accent-[#003366]"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-medium text-[#344054]">Schedule</legend>
              <label className="mb-2 flex items-center gap-2 text-sm text-[#344054]">
                <input
                  type="radio"
                  name="schedule-mode"
                  checked={!isScheduling}
                  onChange={() => setForm((p) => ({ ...p, scheduleMode: 'now' }))}
                  className="accent-[#003366]"
                />
                Send now
              </label>
              <label className="mb-3 flex items-center gap-2 text-sm text-[#344054]">
                <input
                  type="radio"
                  name="schedule-mode"
                  checked={isScheduling}
                  onChange={() => setForm((p) => ({ ...p, scheduleMode: 'later' }))}
                  className="accent-[#003366]"
                />
                Schedule for later
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  aria-label="Send date"
                  value={form.scheduledDate}
                  disabled={!isScheduling}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none disabled:bg-[#F9FAFB] disabled:text-[#98A2B3]"
                />
                <input
                  type="time"
                  aria-label="Send time"
                  value={form.scheduledTime}
                  disabled={!isScheduling}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledTime: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none disabled:bg-[#F9FAFB] disabled:text-[#98A2B3]"
                />
              </div>
            </fieldset>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[#E8EDF5] p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-[#DCE5F2] px-4 text-sm font-semibold text-[#344054] disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003366] px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isScheduling ? 'Schedule Notification' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
}
