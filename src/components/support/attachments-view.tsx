'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, File, FileText, ImageIcon, Paperclip, Search, Video } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supportService, type Complaint } from '@/app/services/support.service';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateComponents';

const ITEMS_PER_PAGE = 10;

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'webm', 'avi'];
const DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx'];

/** One file attached to a support ticket. Every field comes from the ticket. */
interface TicketAttachment {
  id: string;
  ticket: string;
  subject: string;
  schoolName: string;
  url: string;
  fileName: string;
  extension: string;
  uploadedAt: string;
}

/**
 * The school a ticket belongs to, or a placeholder when the API returned only
 * an id (an unpopulated reference) or none at all.
 *
 * @param complaint - The ticket.
 * @returns A display name.
 */
function schoolNameOf(complaint: Complaint): string {
  if (!complaint.schoolId) return 'No school';
  return typeof complaint.schoolId === 'string' ? complaint.schoolId : complaint.schoolId.name;
}

/**
 * The last path segment of an attachment URL, query string stripped and percent
 * escapes decoded, which is the closest thing to a file name the API gives us.
 *
 * @param url - The attachment URL.
 * @returns A display file name.
 */
function fileNameOf(url: string): string {
  const withoutQuery = url.split(/[?#]/)[0];
  const last = withoutQuery.split('/').filter(Boolean).pop() ?? url;
  try {
    return decodeURIComponent(last);
  } catch {
    return last;
  }
}

/**
 * The lower-cased extension of a file name, or an empty string when it has none.
 *
 * @param fileName - The file name.
 * @returns The extension without its dot.
 */
function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(dot + 1).toLowerCase() : '';
}

/**
 * Flattens the tickets that carry an attachment into one row per file.
 *
 * @param complaints - Every ticket on the platform.
 * @returns The attachment rows, newest first.
 */
function toAttachments(complaints: Complaint[]): TicketAttachment[] {
  return complaints
    .filter((complaint): complaint is Complaint & { attachment: string } =>
      Boolean(complaint.attachment),
    )
    .map((complaint) => {
      const fileName = fileNameOf(complaint.attachment);
      return {
        id: complaint._id,
        ticket: complaint.ticket,
        subject: complaint.subject,
        schoolName: schoolNameOf(complaint),
        url: complaint.attachment,
        fileName,
        extension: extensionOf(fileName),
        uploadedAt: complaint.createdAt,
      };
    })
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

/**
 * An icon for a file, chosen from its extension.
 *
 * @param extension - The lower-cased extension.
 * @returns The icon element.
 */
function fileIcon(extension: string) {
  if (IMAGE_EXTENSIONS.includes(extension)) return <ImageIcon className="h-5 w-5 text-emerald-500" />;
  if (VIDEO_EXTENSIONS.includes(extension)) return <Video className="h-5 w-5 text-purple-500" />;
  if (DOCUMENT_EXTENSIONS.includes(extension)) return <FileText className="h-5 w-5 text-[#003366]" />;
  return <File className="h-5 w-5 text-[#878787]" />;
}

/**
 * Every file attached to a support ticket, read from the tickets themselves.
 *
 * The backend has no attachment collection: a complaint carries at most one
 * `attachment` URL, set by whoever filed it. There is no endpoint for a
 * platform admin to upload, rename or delete one, so this screen reads only.
 *
 * @returns The attachments panel.
 */
export function AttachmentsView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.complaints.list(),
    queryFn: () => supportService.getAllComplaints(),
    staleTime: staleTimes.list,
  });

  const attachments = useMemo(() => toAttachments(data ?? []), [data]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return attachments;
    return attachments.filter(
      (a) =>
        a.fileName.toLowerCase().includes(q) ||
        a.ticket.toLowerCase().includes(q) ||
        a.schoolName.toLowerCase().includes(q),
    );
  }, [attachments, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  if (isLoading) return <LoadingState message="Loading attachments…" />;
  if (error) {
    return <ErrorState error={error} onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#030E18]">Attachments</span>
          <span className="rounded-full bg-[#EAF2FB] px-2.5 py-0.5 text-xs font-semibold text-[#003366]">
            {filtered.length}
          </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#878787]" />
          <Input
            placeholder="Search attachments…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 w-64 border-[#F1F1F1] bg-white pl-9 text-sm focus:border-[#003366]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Paperclip className="h-10 w-10 text-[#D7E6F6]" />}
          title="No attachments"
          message={
            searchQuery
              ? 'No attachment matches that search.'
              : 'Files appear here when a school attaches one to a support ticket.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#F1F1F1] bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#F1F1F1] bg-[#F8F8F8]">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#6F6F6F]">
                    File
                  </TableHead>
                  <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-[#6F6F6F] md:table-cell">
                    Ticket
                  </TableHead>
                  <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-[#6F6F6F] lg:table-cell">
                    School
                  </TableHead>
                  <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-[#6F6F6F] lg:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="w-20 text-xs font-semibold uppercase tracking-wide text-[#6F6F6F]">
                    Open
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((attachment) => (
                  <TableRow
                    key={attachment.id}
                    className="border-b border-[#F8F8F8] transition-colors hover:bg-[#F8F8F8]"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        {fileIcon(attachment.extension)}
                        <div className="min-w-0">
                          <p className="max-w-[240px] truncate text-sm font-medium text-[#030E18]">
                            {attachment.fileName}
                          </p>
                          <p className="max-w-[240px] truncate text-xs text-[#878787]">
                            {attachment.subject}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-xs text-[#6F6F6F] md:table-cell">
                      #{attachment.ticket}
                    </TableCell>
                    <TableCell className="hidden max-w-[180px] truncate text-sm text-[#030E18] lg:table-cell">
                      {attachment.schoolName}
                    </TableCell>
                    <TableCell className="hidden text-xs text-[#6F6F6F] lg:table-cell">
                      {new Date(attachment.uploadedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <a
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${attachment.fileName}`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#6F6F6F] transition-colors hover:bg-[#EAF2FB] hover:text-[#003366]"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="border-[#F1F1F1] text-xs text-[#030E18] hover:border-[#D7E6F6] disabled:opacity-40"
          >
            Previous
          </Button>
          <span className="text-xs font-medium text-[#6F6F6F]">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="border-[#F1F1F1] text-xs text-[#030E18] hover:border-[#D7E6F6] disabled:opacity-40"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
