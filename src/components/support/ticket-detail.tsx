'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building2, Calendar, FileText, Hash, Loader2, Mail, Ticket, User } from 'lucide-react';
import {
  COMPLAINT_STATUSES,
  type Complaint,
  type ComplaintStatus,
} from '@/app/services/support.service';
import {
  STATUS_STYLES,
  formatTicketDate,
  getInitials,
  getSchoolName,
  getUserName,
} from './ticket-helpers';

interface TicketDetailProps {
  complaint: Complaint;
  isOpen: boolean;
  /** True while a status change is in flight. */
  isSaving: boolean;
  onClose: () => void;
  onStatusChange: (status: ComplaintStatus) => void;
}

/**
 * One labelled fact in the details grid.
 *
 * @param props - The icon, label and content.
 * @param props.icon - Rendered beside the label.
 * @param props.label - The field name.
 * @param props.children - The value.
 * @returns The field element.
 */
function DetailField({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-[#878787]">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * The full record of one support ticket, with the status control.
 *
 * There is deliberately no reply box and no "assign to admin" control. The
 * backend's complaints module exposes create, list, read, update-own-text,
 * update-status and delete, and nothing else: there is no message or thread
 * collection, and although `assignedAdmin` is declared on the Complaint schema
 * no route ever reads or writes it. Rather than a control that silently does
 * nothing, the portal shows the ticket and its status only — see T4.17 in the
 * hardening notes for the endpoints this screen needs.
 *
 * @param props - The ticket and its handlers.
 * @param props.complaint - The ticket to show.
 * @param props.isOpen - Whether the dialog is open.
 * @param props.isSaving - True while a status change is in flight.
 * @param props.onClose - Closes the dialog.
 * @param props.onStatusChange - Called with the new status.
 * @returns The detail dialog.
 */
export function TicketDetail({
  complaint,
  isOpen,
  isSaving,
  onClose,
  onStatusChange,
}: TicketDetailProps) {
  const schoolName = getSchoolName(complaint);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogTitle className="sr-only">Ticket {complaint.ticket}</DialogTitle>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 shrink-0 bg-[#EAF2FB]">
                <AvatarFallback className="text-sm font-semibold text-[#003366]">
                  {getInitials(schoolName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#030E18]">{schoolName}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[#878787]">
                  <Hash className="h-3 w-3" />
                  {complaint.ticket}
                </p>
              </div>
            </div>
            <Badge
              className={`shrink-0 border-0 text-xs font-medium ${STATUS_STYLES[complaint.status]}`}
            >
              {complaint.status}
            </Badge>
          </div>

          <div className="space-y-2 rounded-xl border border-[#F1F1F1] bg-[#F8F8F8] p-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#6F6F6F]">
              <FileText className="h-3.5 w-3.5" />
              Subject
            </div>
            <p className="text-sm font-medium text-[#030E18]">{complaint.subject}</p>
            {complaint.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#6F6F6F]">
                {complaint.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailField icon={User} label="Submitted by">
              <p className="text-sm font-medium text-[#030E18]">{getUserName(complaint)}</p>
              {complaint.userId?.email && (
                <p className="text-xs text-[#878787]">{complaint.userId.email}</p>
              )}
            </DetailField>

            <DetailField icon={Building2} label="School">
              <p className="text-sm font-medium text-[#030E18]">{schoolName}</p>
              {typeof complaint.schoolId === 'object' && complaint.schoolId?.email && (
                <p className="flex items-center gap-1 text-xs text-[#878787]">
                  <Mail className="h-3 w-3" />
                  {complaint.schoolId.email}
                </p>
              )}
            </DetailField>

            <DetailField icon={Calendar} label="Submitted">
              <p className="text-sm font-medium text-[#030E18]">
                {formatTicketDate(complaint.createdAt, 'long')}
              </p>
            </DetailField>

            <DetailField icon={Ticket} label="Last updated">
              <p className="text-sm font-medium text-[#030E18]">
                {formatTicketDate(complaint.updatedAt, 'long')}
              </p>
            </DetailField>
          </div>

          {complaint.attachment && (
            <div className="flex items-center gap-2 rounded-lg border border-[#F1F1F1] p-3">
              <FileText className="h-4 w-4 shrink-0 text-[#878787]" />
              <a
                href={complaint.attachment}
                target="_blank"
                rel="noreferrer"
                className="truncate text-sm text-[#003366] hover:underline"
              >
                View attachment
              </a>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#F1F1F1] pt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#030E18]">Update status:</span>
              <Select
                value={complaint.status}
                onValueChange={(value) => onStatusChange(value as ComplaintStatus)}
                disabled={isSaving}
              >
                <SelectTrigger className="h-8 w-36 border-[#F1F1F1] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPLAINT_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#878787]" />}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-[#F1F1F1] text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
