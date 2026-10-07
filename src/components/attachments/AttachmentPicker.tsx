'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { uploadFile, validateAttachmentFile } from '@/app/services/upload.service';
import { getErrorMessage } from '@/lib/apiError';
import { focusRing, rowButton } from '@/components/tl/styles';
import type { TicketAttachment, TicketAttachmentInput } from '@/types/tickets';

/**
 * Most files one message or broadcast carries: a ticket message takes 5
 * (the API answers 400 beyond), a broadcast 10; the console keeps both to 5.
 */
export const MAX_ATTACHMENTS = 5;

/**
 * A file size for an attachment chip ("2.4 MB").
 *
 * @param bytes - The size in bytes.
 * @returns The formatted size, or an empty string for an unusable value.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** One file on its way up. */
interface PendingUpload {
  key: string;
  name: string;
  progress: number;
}

/** Props for {@link AttachmentPicker}. */
export interface AttachmentPickerProps {
  /** Unique id for the hidden file input. */
  id: string;
  /** Files already uploaded, sent with the message. */
  value: TicketAttachmentInput[];
  /** A state setter, so uploads finishing together never drop one another. */
  onChange: React.Dispatch<React.SetStateAction<TicketAttachmentInput[]>>;
  /** Told `true` while any upload is in flight, so the parent can hold Send. */
  onBusyChange?: (busy: boolean) => void;
  max?: number;
  disabled?: boolean;
}

let uploadSeq = 0;

/**
 * Attach files to a ticket reply or a broadcast. Each chosen file is checked
 * against the server's rules, uploaded with this app's existing upload client
 * (`POST /upload/file`, with progress) and becomes `{ url, name, mimeType,
 * size }`. Uploads are aborted if the form unmounts.
 *
 * @param props - See {@link AttachmentPickerProps}.
 * @param props.id - Id of the hidden file input.
 * @param props.value - Uploaded files.
 * @param props.onChange - The state setter for `value`.
 * @param props.onBusyChange - Told when uploads start and stop.
 * @param props.max - Most files allowed.
 * @param props.disabled - Turns the picker off.
 * @returns The picker.
 */
export function AttachmentPicker({ id, value, onChange, onBusyChange, max = MAX_ATTACHMENTS, disabled = false }: AttachmentPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const controllers = useRef(new Set<AbortController>());
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [problems, setProblems] = useState<string[]>([]);

  useEffect(() => {
    onBusyChange?.(pending.length > 0);
  }, [pending.length, onBusyChange]);

  useEffect(() => {
    const active = controllers.current;
    return () => {
      for (const controller of active) controller.abort();
    };
  }, []);

  const room = max - value.length - pending.length;

  const start = (file: File) => {
    const key = `upload-${++uploadSeq}`;
    const controller = new AbortController();
    controllers.current.add(controller);
    setPending((prev) => [...prev, { key, name: file.name, progress: 0 }]);
    uploadFile(
      file,
      (progress) => setPending((prev) => prev.map((p) => (p.key === key ? { ...p, progress } : p))),
      controller.signal,
    )
      .then((url) => {
        onChange((prev) => [
          ...prev,
          { url, name: file.name, mimeType: file.type || 'application/octet-stream', size: file.size },
        ]);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) setProblems((prev) => [...prev, `${file.name}: ${getErrorMessage(err)}`]);
      })
      .finally(() => {
        controllers.current.delete(controller);
        setPending((prev) => prev.filter((p) => p.key !== key));
      });
  };

  const onFiles = (files: FileList | null) => {
    if (!files?.length) return;
    const chosen = Array.from(files);
    const next: string[] = [];
    let slots = room;
    for (const file of chosen) {
      const problem = validateAttachmentFile(file);
      if (problem) {
        next.push(problem);
        continue;
      }
      if (slots <= 0) {
        next.push(`${file.name}: at most ${max} files can be attached.`);
        continue;
      }
      slots -= 1;
      start(file);
    }
    setProblems(next);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          multiple
          aria-label="Attach files"
          className="hidden"
          disabled={disabled || room <= 0}
          onChange={(e) => onFiles(e.target.files)}
        />
        <button
          type="button"
          className={rowButton}
          onClick={() => inputRef.current?.click()}
          disabled={disabled || room <= 0}
          aria-describedby={`${id}-hint`}
        >
          <Paperclip className="h-4 w-4" aria-hidden />
          Attach files
        </button>
        <span id={`${id}-hint`} className="text-xs font-semibold text-tl-faint">
          Up to {max} files: images, PDF, Office documents, audio or video.
        </span>
      </div>

      {value.length > 0 || pending.length > 0 ? (
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Attached files">
          {value.map((file) => (
            <li
              key={file.url}
              className="flex min-h-[44px] max-w-full items-center gap-2 rounded-xl border border-tl-line bg-tl-subtle pl-3 text-sm"
            >
              <Paperclip className="h-4 w-4 shrink-0 text-tl-faint" aria-hidden />
              <span className="min-w-0 truncate font-semibold text-tl-ink">{file.name}</span>
              <span className="shrink-0 text-xs text-tl-muted">{formatBytes(file.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => onChange((prev) => prev.filter((f) => f.url !== file.url))}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-tl-muted hover:bg-tl-bg hover:text-tl-ink ${focusRing}`}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
          {pending.map((upload) => (
            <li
              key={upload.key}
              className="flex min-h-[44px] max-w-full items-center gap-2 rounded-xl border border-dashed border-tl-control px-3 text-sm"
            >
              <span className="min-w-0 truncate font-semibold text-tl-ink">{upload.name}</span>
              <span
                role="progressbar"
                aria-label={`Uploading ${upload.name}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={upload.progress}
                className="h-1.5 w-20 overflow-hidden rounded-full bg-tl-track"
              >
                <span className="block h-full bg-tl-brand-fill" style={{ width: `${upload.progress}%` }} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {problems.length > 0 ? (
        <ul role="alert" className="m-0 list-none p-0 text-xs font-semibold text-tl-danger">
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * A broadcast's files as links: the API stores bare https URLs, so each is
 * named after the last part of its path (size unknown).
 *
 * @param urls - The URLs.
 * @returns The attachments.
 */
export function urlAttachments(urls: readonly string[] | undefined): TicketAttachment[] {
  return (urls ?? []).map((url) => {
    let name = '';
    try {
      name = decodeURIComponent(new URL(url).pathname.split('/').pop() ?? '');
    } catch {
      name = '';
    }
    return { url, name: name || 'Attachment', mimeType: '', size: 0 };
  });
}

/**
 * Read-only links to a message's or a broadcast's files, each opening in a
 * new tab. A size of 0 (unknown) is not shown.
 *
 * @param props - The files.
 * @param props.files - The attachments to list.
 * @returns The list, or nothing when there are no files.
 */
export function AttachmentLinks({ files }: { files: TicketAttachment[] | undefined }) {
  if (!files?.length) return null;
  return (
    <ul className="m-0 mt-2.5 flex list-none flex-wrap gap-2 p-0" aria-label="Attachments">
      {files.map((file) => (
        <li key={file.url} className="max-w-full">
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className={`flex min-h-[44px] max-w-full items-center gap-2 rounded-xl border border-tl-line bg-tl-surface px-3 text-sm font-semibold text-tl-link hover:underline ${focusRing}`}
          >
            <Paperclip className="h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 truncate">{file.name}</span>
            {file.size > 0 ? <span className="shrink-0 text-xs font-medium text-tl-muted">{formatBytes(file.size)}</span> : null}
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
