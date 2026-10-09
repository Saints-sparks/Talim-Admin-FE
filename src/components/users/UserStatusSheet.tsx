'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { adminUserService } from '@/app/services/admin-user.service';
import { listPrefix, queryKeys } from '@/lib/queryKeys';
import { ConfirmSheet } from '@/components/tl/ConfirmSheet';
import { Banner } from '@/components/tl/States';
import { fieldHint, fieldLabel, fieldTextarea } from '@/components/tl/styles';
import type { AdminUserDetail } from '@/types/adminUsers';
import { STATUS_REASON_MAX_LENGTH, statusErrorMessage, userDisplayName } from './user-model';

/** Props for {@link UserStatusSheet}. */
export interface UserStatusSheetProps {
  user: AdminUserDetail;
  open: boolean;
  onClose: () => void;
}

/**
 * The confirm for deactivating or reactivating an account
 * (`PATCH /admin/users/:id/status`), with an optional reason for the
 * activity log. A refusal (`SELF`, `ADMIN_ACCOUNT`, `ACCOUNT_DELETED`) is
 * explained inside the sheet, which stays open; success updates the page and
 * the directory and closes it.
 *
 * @param props - See {@link UserStatusSheetProps}.
 * @param props.user - The user as last loaded; `isActive` decides the direction.
 * @param props.open - Whether it is open.
 * @param props.onClose - Closes it.
 * @returns The sheet.
 */
export function UserStatusSheet({ user, open, onClose }: UserStatusSheetProps) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState('');
  const deactivating = user.isActive;
  const name = userDisplayName(user);

  const change = useMutation({
    mutationFn: () => adminUserService.setStatus(user.id, { isActive: !deactivating, ...(reason.trim() ? { reason: reason.trim() } : {}) }),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKeys.users.detail(user.id), updated);
      void queryClient.invalidateQueries({ queryKey: listPrefix(queryKeys.users.search()) });
      toast.success(deactivating ? `${name} is deactivated` : `${name} is active again`);
      setReason('');
      onClose();
    },
    // The account may have changed under us (deleted, say): show it as it is now.
    onError: () => void queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(user.id) }),
  });

  const cancel = () => {
    change.reset();
    onClose();
  };

  return (
    <ConfirmSheet
      open={open}
      onCancel={cancel}
      onConfirm={() => change.mutate()}
      eyebrowText="Account access"
      title={deactivating ? `Deactivate ${name}?` : `Reactivate ${name}?`}
      body={
        deactivating
          ? 'They are signed out of every Talim app at once and can’t sign in until a Talim admin reactivates them. Their school records stay as they are.'
          : 'They can sign in again with their existing password.'
      }
      confirmLabel={deactivating ? 'Deactivate' : 'Reactivate'}
      busyLabel={deactivating ? 'Deactivating…' : 'Reactivating…'}
      busy={change.isPending}
      danger={deactivating}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="status-reason" className={fieldLabel}>
          Reason (optional)
        </label>
        <textarea
          id="status-reason"
          value={reason}
          rows={3}
          maxLength={STATUS_REASON_MAX_LENGTH}
          aria-describedby="status-reason-hint"
          placeholder={deactivating ? 'Why is this account being deactivated?' : 'Why is this account being reactivated?'}
          disabled={change.isPending}
          onChange={(e) => setReason(e.target.value)}
          className={fieldTextarea}
        />
        <span id="status-reason-hint" className={fieldHint}>
          Kept in the activity log. {reason.length} / {STATUS_REASON_MAX_LENGTH}
        </span>
      </div>
      {change.isError ? (
        <Banner tone="danger">{statusErrorMessage(change.error, deactivating)}</Banner>
      ) : null}
    </ConfirmSheet>
  );
}
