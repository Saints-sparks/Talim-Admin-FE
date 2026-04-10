'use client';

import { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Filter, Search, Trash2, Eye, Loader2, RefreshCw, AlertTriangle, TicketX,
} from 'lucide-react';
import { toast } from 'sonner';
import { supportService, Complaint, ComplaintStatus } from '@/app/services/support.service';
import { TicketDetail } from './ticket-detail';

// ── helpers ────────────────────────────────────────────────────────────────

const getSchoolName = (c: Complaint): string => {
  if (!c.schoolId) return 'No school';
  if (typeof c.schoolId === 'string') return c.schoolId;
  return c.schoolId.name;
};

const getSchoolEmail = (c: Complaint): string => {
  if (!c.schoolId || typeof c.schoolId === 'string') return '—';
  return c.schoolId.email;
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

const statusColors: Record<ComplaintStatus, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

const ITEMS_PER_PAGE = 10;

// ── component ──────────────────────────────────────────────────────────────

export function TicketsView() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatuses, setSelectedStatuses] = useState<ComplaintStatus[]>([
    'Pending', 'In Progress', 'Resolved',
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [complaintToDelete, setComplaintToDelete] = useState<Complaint | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await supportService.getAllComplaints();
      setComplaints(data);
    } catch {
      setError('Failed to load support tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchComplaints(); }, [fetchComplaints]);

  const toggleStatus = (s: ComplaintStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
    setCurrentPage(1);
  };

  const filtered = complaints.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      getSchoolName(c).toLowerCase().includes(q) ||
      getSchoolEmail(c).toLowerCase().includes(q) ||
      c.subject.toLowerCase().includes(q) ||
      c.ticket.toLowerCase().includes(q);
    return matchesSearch && selectedStatuses.includes(c.status);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleDelete = async () => {
    if (!complaintToDelete) return;
    setIsDeleting(true);
    try {
      await supportService.deleteComplaint(complaintToDelete._id);
      setComplaints((prev) => prev.filter((c) => c._id !== complaintToDelete._id));
      toast.success('Ticket deleted');
    } catch {
      toast.error('Failed to delete ticket. Please try again.');
    } finally {
      setIsDeleting(false);
      setComplaintToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, status: ComplaintStatus) => {
    try {
      const updated = await supportService.updateStatus(id, status);
      setComplaints((prev) => prev.map((c) => (c._id === id ? updated : c)));
      if (selectedComplaint?._id === id) setSelectedComplaint(updated);
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error('Failed to update status.');
    }
  };

  // ── loading / error states ────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        <p className="text-sm text-slate-500">Loading support tickets…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AlertTriangle className="h-10 w-10 text-amber-400" />
        <p className="text-sm text-slate-600">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchComplaints} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  // ── main render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 border-slate-200 text-slate-700">
                <Filter className="h-3.5 w-3.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuLabel className="text-xs">Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['Pending', 'In Progress', 'Resolved'] as ComplaintStatus[]).map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={selectedStatuses.includes(s)}
                  onCheckedChange={() => toggleStatus(s)}
                >
                  {s}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-slate-500 hover:text-slate-700"
            onClick={fetchComplaints}
            disabled={isLoading}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search tickets…"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="h-9 w-64 pl-9 text-sm border-slate-200"
          />
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Tickets</span>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
          {filtered.length}
        </span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 gap-3">
          <TicketX className="h-10 w-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">No tickets found</p>
          <p className="text-xs text-slate-400">
            {searchQuery ? 'Try a different search term.' : 'All tickets match the applied filters.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-dashed bg-slate-50/60">
                <TableHead className="w-10"><Checkbox /></TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">School</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Subject</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Date</TableHead>
                <TableHead className="w-24 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((c) => {
                const schoolName = getSchoolName(c);
                return (
                  <TableRow key={c._id} className="border-b border-dashed hover:bg-slate-50/40">
                    <TableCell><Checkbox /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8 bg-indigo-100 shrink-0">
                          <AvatarFallback className="text-xs text-indigo-700 font-semibold">
                            {getInitials(schoolName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate max-w-[160px]">{schoolName}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[160px]">{getSchoolEmail(c)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="text-sm text-slate-700 truncate max-w-[220px]">{c.subject}</p>
                      <p className="text-xs text-slate-400">#{c.ticket}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-xs font-medium border-0 ${statusColors[c.status]}`}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-slate-500">
                      {new Date(c.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600"
                          onClick={() => setSelectedComplaint(c)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-50 hover:text-red-500"
                          onClick={() => setComplaintToDelete(c)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="border-slate-200 text-slate-600 text-xs"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={currentPage === p ? 'secondary' : 'ghost'}
                className={`h-8 w-8 p-0 text-xs ${currentPage === p ? 'bg-indigo-100 text-indigo-700' : ''}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="border-slate-200 text-slate-600 text-xs"
          >
            Next
          </Button>
        </div>
      )}

      {/* Ticket detail drawer */}
      {selectedComplaint && (
        <TicketDetail
          complaint={selectedComplaint}
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Delete confirmation */}
      <Dialog open={!!complaintToDelete} onOpenChange={(open) => !open && setComplaintToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete ticket</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete ticket{' '}
              <span className="font-medium">#{complaintToDelete?.ticket}</span>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setComplaintToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
