'use client';

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Ticket, Building2, Mail, User, Calendar, FileText, Hash, Loader2,
} from 'lucide-react';
import { Complaint, ComplaintStatus } from '@/app/services/support.service';

interface TicketDetailProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: ComplaintStatus) => Promise<void>;
}

const statusColors: Record<ComplaintStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

const getSchoolName = (c: Complaint): string => {
  if (!c.schoolId) return 'No school';
  if (typeof c.schoolId === 'string') return c.schoolId;
  return c.schoolId.name;
};

const getInitials = (name: string): string =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

const getUserName = (c: Complaint): string => {
  if (!c.userId) return 'Unknown';
  const { firstName, lastName, email } = c.userId;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  return email;
};

export function TicketDetail({ complaint, isOpen, onClose, onStatusChange }: TicketDetailProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (status: ComplaintStatus) => {
    setIsSaving(true);
    await onStatusChange(complaint._id, status);
    setIsSaving(false);
  };

  const schoolName = getSchoolName(complaint);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Ticket Detail</DialogTitle>

        <div className="space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 bg-indigo-100 shrink-0">
                <AvatarFallback className="text-indigo-700 text-sm font-semibold">
                  {getInitials(schoolName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-900">{schoolName}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <Hash className="h-3 w-3" />{complaint.ticket}
                </p>
              </div>
            </div>
            <Badge className={`shrink-0 text-xs font-medium border-0 ${statusColors[complaint.status]}`}>
              {complaint.status}
            </Badge>
          </div>

          {/* Subject + description */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">
              <FileText className="h-3.5 w-3.5" />
              Subject
            </div>
            <p className="text-sm font-medium text-slate-800">{complaint.subject}</p>
            {complaint.description && (
              <p className="text-sm text-slate-600 leading-relaxed">{complaint.description}</p>
            )}
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                <User className="h-3 w-3" />Submitted by
              </span>
              <p className="text-sm font-medium text-slate-800">{getUserName(complaint)}</p>
              <p className="text-xs text-slate-400">{complaint.userId?.email}</p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                <Building2 className="h-3 w-3" />School
              </span>
              <p className="text-sm font-medium text-slate-800">{schoolName}</p>
              {typeof complaint.schoolId === 'object' && complaint.schoolId?.email && (
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="h-3 w-3" />{complaint.schoolId.email}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                <Calendar className="h-3 w-3" />Submitted
              </span>
              <p className="text-sm font-medium text-slate-800">
                {new Date(complaint.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                <Ticket className="h-3 w-3" />Last updated
              </span>
              <p className="text-sm font-medium text-slate-800">
                {new Date(complaint.updatedAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Attachment */}
          {complaint.attachment && (
            <div className="rounded-lg border border-slate-200 p-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
              <a
                href={complaint.attachment}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-indigo-600 hover:underline truncate"
              >
                View attachment
              </a>
            </div>
          )}

          {/* Status update */}
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Update status:</span>
              <Select
                value={complaint.status}
                onValueChange={(v) => handleStatusChange(v as ComplaintStatus)}
                disabled={isSaving}
              >
                <SelectTrigger className="h-8 w-36 text-xs border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
            </div>
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs border-slate-200">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
