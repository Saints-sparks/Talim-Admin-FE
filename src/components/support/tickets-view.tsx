'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Eye, Filter, Loader2, RefreshCw, Search, TicketX, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  COMPLAINT_STATUSES,
  supportService,
  type Complaint,
  type ComplaintStatus,
} from '@/app/services/support.service';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateComponents';
import { TicketDetail } from './ticket-detail';
import {
  STATUS_STYLES,
  formatTicketDate,
  getInitials,
  getSchoolEmail,
  getSchoolName,
  matchesSearch,
} from './ticket-helpers';

const ITEMS_PER_PAGE = 10;

/**
 * The platform support queue: every complaint filed by any school, with status
 * changes and deletion.
 *
 * `GET /complaints` is the only listing the backend exposes for a platform
 * admin and it is unpaginated, so filtering, search and paging happen here.
 *
 * @returns The tickets panel.
 */
export function TicketsView() {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<ComplaintStatus[]>([
    ...COMPLAINT_STATUSES,
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);

  const {
    data: complaints,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.complaints.list(),
    queryFn: () => supportService.getAllComplaints(),
    staleTime: staleTimes.list,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ComplaintStatus }) =>
      supportService.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.setQueryData<Complaint[]>(queryKeys.complaints.list(), (prev) =>
        prev?.map((c) => (c._id === updated._id ? updated : c)),
      );
      toast.success(`Ticket moved to “${updated.status}”`);
    },
    onError: (err) => {
      logger.error('support', 'Status update failed', err);
      toast.error('The status could not be changed', { description: getErrorMessage(err) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => supportService.deleteComplaint(id),
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Complaint[]>(queryKeys.complaints.list(), (prev) =>
        prev?.filter((c) => c._id !== id),
      );
      if (selectedId === id) setSelectedId(null);
      toast.success('Ticket deleted');
    },
    onError: (err) => {
      logger.error('support', 'Ticket deletion failed', err);
      toast.error('The ticket could not be deleted', { description: getErrorMessage(err) });
    },
    onSettled: () => setComplaintToDelete(null),
  });

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return (complaints ?? []).filter(
      (c) => matchesSearch(c, q) && selectedStatuses.includes(c.status),
    );
  }, [complaints, searchQuery, selectedStatuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Read from the cache, so the drawer shows the row's latest status without a
  // second copy of the ticket going stale behind it.
  const selectedComplaint = complaints?.find((c) => c._id === selectedId) ?? null;

  const toggleStatus = (status: ComplaintStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
    setCurrentPage(1);
  };

  if (isLoading) return <LoadingState message="Loading support tickets…" />;
  if (error) return <ErrorState error={error} onRetry={() => void refetch()} />;

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-[#F1F1F1] text-xs text-[#030E18] hover:border-[#D7E6F6]"
              >
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel className="text-xs text-[#6F6F6F]">Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {COMPLAINT_STATUSES.map((status) => (
                <DropdownMenuCheckboxItem
                  key={status}
                  checked={selectedStatuses.includes(status)}
                  onCheckedChange={() => toggleStatus(status)}
                >
                  {status}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-[#6F6F6F] hover:text-[#030E18]"
            onClick={() => void refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#878787]" />
          <Input
            placeholder="Search tickets…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9 w-64 border-[#F1F1F1] bg-white pl-9 text-sm focus:border-[#003366]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-[#030E18]">Tickets</span>
        <span className="rounded-full bg-[#EAF2FB] px-2.5 py-0.5 text-xs font-semibold text-[#003366]">
          {filtered.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<TicketX className="h-10 w-10 text-[#D7E6F6]" />}
          title="No tickets found"
          message={
            searchQuery
              ? 'No ticket matches that search.'
              : 'No ticket matches the applied filters.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#F1F1F1] bg-white">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-[#F1F1F1] bg-[#F8F8F8]">
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#6F6F6F]">
                    School
                  </TableHead>
                  <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-[#6F6F6F] md:table-cell">
                    Subject
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wide text-[#6F6F6F]">
                    Status
                  </TableHead>
                  <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-[#6F6F6F] lg:table-cell">
                    Date
                  </TableHead>
                  <TableHead className="w-24 text-xs font-semibold uppercase tracking-wide text-[#6F6F6F]">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((complaint) => {
                  const schoolName = getSchoolName(complaint);
                  const isDeleting =
                    deleteMutation.isPending && deleteMutation.variables === complaint._id;

                  return (
                    <TableRow
                      key={complaint._id}
                      className="border-b border-[#F8F8F8] transition-colors hover:bg-[#F8F8F8]"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-[#EAF2FB] text-xs font-bold text-[#003366]">
                              {getInitials(schoolName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="max-w-[160px] truncate text-sm font-semibold text-[#030E18]">
                              {schoolName}
                            </p>
                            <p className="max-w-[160px] truncate text-xs text-[#878787]">
                              {getSchoolEmail(complaint)}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <p className="max-w-[220px] truncate text-sm text-[#030E18]">
                          {complaint.subject}
                        </p>
                        <p className="text-xs text-[#878787]">#{complaint.ticket}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`border-0 text-xs font-medium ${STATUS_STYLES[complaint.status]}`}
                        >
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-xs text-[#6F6F6F] lg:table-cell">
                        {formatTicketDate(complaint.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`View ticket ${complaint.ticket}`}
                            className="h-8 w-8 text-[#6F6F6F] hover:bg-[#EAF2FB] hover:text-[#003366]"
                            onClick={() => setSelectedId(complaint._id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Delete ticket ${complaint.ticket}`}
                            className="h-8 w-8 text-[#6F6F6F] hover:bg-red-50 hover:text-red-500"
                            onClick={() => setComplaintToDelete(complaint)}
                            disabled={isDeleting}
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
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

      {selectedComplaint && (
        <TicketDetail
          complaint={selectedComplaint}
          isOpen
          isSaving={statusMutation.isPending}
          onClose={() => setSelectedId(null)}
          onStatusChange={(status) =>
            statusMutation.mutate({ id: selectedComplaint._id, status })
          }
        />
      )}

      <Dialog
        open={Boolean(complaintToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setComplaintToDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ticket</DialogTitle>
            <DialogDescription>
              Delete ticket <span className="font-medium">#{complaintToDelete?.ticket}</span>? This
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setComplaintToDelete(null)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => complaintToDelete && deleteMutation.mutate(complaintToDelete._id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
