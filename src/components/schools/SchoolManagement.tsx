'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Filter, MoreVertical, Plus, School as SchoolIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { School, schoolService } from '@/app/services/school.service';
import { useDebounce } from '@/hooks/use-debounce';
import { queryKeys, staleTimes } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateComponents';

const PAGE_SIZE = 10;

/**
 * The school register: search, activate/suspend, edit and delete every school
 * on the platform.
 *
 * @returns The school management console.
 */
export function SchoolManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null);
  const [schoolToToggle, setSchoolToToggle] = useState<School | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 400);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  const params = { page: currentPage, limit: PAGE_SIZE, query: debouncedSearch || undefined };

  const { data, isLoading, error, refetch, isPlaceholderData } = useQuery({
    queryKey: queryKeys.schools.list(params),
    queryFn: () => schoolService.getAllSchools(currentPage, PAGE_SIZE, debouncedSearch),
    staleTime: staleTimes.list,
    placeholderData: (previous) => previous,
  });

  const schools = data?.data ?? [];
  const totalPages = data?.meta?.lastPage ?? 1;
  const totalSchools = data?.meta?.total ?? 0;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.schools.all });

  const toggleMutation = useMutation({
    mutationFn: ({ school, active }: { school: School; active: boolean }) =>
      schoolService.updateSchoolStatus(school._id, active),
    onSuccess: async (_result, { school, active }) => {
      toast.success(`"${school.name}" ${active ? 'activated' : 'deactivated'}`);
      await invalidate();
    },
    onError: (err) => {
      logger.error('schools', 'Status change failed', err);
      toast.error('The status could not be changed', { description: getErrorMessage(err) });
    },
    onSettled: () => setSchoolToToggle(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (school: School) => schoolService.deleteSchool(school._id),
    onSuccess: async (result, school) => {
      toast.success(`"${school.name}" deleted`, {
        description: result.summary.message,
        duration: 6000,
      });
      await invalidate();
    },
    onError: (err) => {
      logger.error('schools', 'Delete failed', err);
      toast.error('The school could not be deleted', { description: getErrorMessage(err) });
    },
    onSettled: () => setSchoolToDelete(null),
  });

  const isBusy = toggleMutation.isPending || deleteMutation.isPending;

  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-[#030E18]">Schools</h1>
        <Button
          className="bg-[#003366] hover:bg-[#002244]"
          onClick={() => router.push('/talimregister')}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add a school
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col items-start justify-between gap-4 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#878787]" />
            <span className="text-sm text-[#6F6F6F]">
              {isLoading ? 'Loading…' : `${totalSchools.toLocaleString()} schools`}
            </span>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#878787]" />
            <Input
              placeholder="Search schools…"
              aria-label="Search schools"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 sm:w-[300px]"
            />
          </div>
        </div>

        {error ? (
          <ErrorState error={error} onRetry={() => void refetch()} />
        ) : isLoading ? (
          <LoadingState message="Loading schools…" />
        ) : schools.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={<SchoolIcon className="h-12 w-12 text-[#878787]" />}
              title="No schools found"
              message={
                searchTerm
                  ? 'No school matches your search.'
                  : 'Get started by adding your first school to the platform.'
              }
              actionText={searchTerm ? undefined : 'Add a school'}
              onAction={searchTerm ? undefined : () => router.push('/talimregister')}
            />
          </div>
        ) : (
          <>
            <div
              className={`relative overflow-x-auto transition-opacity ${
                isPlaceholderData ? 'opacity-60' : ''
              }`}
            >
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F8F8F8]">
                    <TableHead>Prefix</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Primary Contact</TableHead>
                    <TableHead className="hidden lg:table-cell">Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow
                      key={school._id}
                      className="cursor-pointer text-[#030E18] hover:bg-[#F8F8F8]"
                      onClick={() => router.push(`/SchoolProfile/view/${school._id}`)}
                    >
                      <TableCell className="font-medium">{school.schoolPrefix}</TableCell>
                      <TableCell>{school.name}</TableCell>
                      <TableCell className="hidden md:table-cell">{school.email}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {school.primaryContacts[0]?.name ?? '—'}
                        {school.primaryContacts[0]?.role && (
                          <div className="text-xs text-[#878787]">
                            {school.primaryContacts[0].role}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {school.location.state}, {school.location.country}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            school.active
                              ? 'border-0 bg-emerald-50 text-emerald-700'
                              : 'border-0 bg-red-50 text-red-700'
                          }
                        >
                          {school.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 p-0"
                              disabled={isBusy}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions for {school.name}</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => router.push(`/SchoolProfile/${school._id}`)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSchoolToToggle(school)}
                              className={school.active ? 'text-red-600' : 'text-emerald-600'}
                            >
                              {school.active ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setSchoolToDelete(school)}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t p-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-[#6F6F6F]">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(schoolToDelete)}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) setSchoolToDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-lg rounded-lg bg-white p-6 shadow-lg">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-lg font-semibold text-[#030E18]">
              Delete &quot;{schoolToDelete?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-[#6F6F6F]">
                <p>This will permanently remove the school. Here is what happens:</p>
                <ul className="list-none space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-red-500">✕</span>
                    <span>
                      <strong>School admin account deleted</strong> — their email becomes available
                      for re-registration
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-amber-500">⚠</span>
                    <span>
                      <strong>Teachers, parents &amp; students deactivated</strong> — accounts
                      suspended, all data preserved
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-emerald-600">✓</span>
                    <span>
                      <strong>Student records kept</strong> — grades, attendance &amp; history are
                      safe
                    </span>
                  </li>
                </ul>
                <p className="font-medium text-red-600">
                  This action cannot be undone from the UI.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-3 pt-2">
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (schoolToDelete) deleteMutation.mutate(schoolToDelete);
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Yes, delete school'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(schoolToToggle)}
        onOpenChange={(open) => {
          if (!open && !toggleMutation.isPending) setSchoolToToggle(null);
        }}
      >
        <AlertDialogContent className="max-w-md rounded-lg bg-white p-6 shadow-lg">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-lg font-semibold text-[#030E18]">
              {schoolToToggle?.active ? 'Deactivate school' : 'Activate school'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#6F6F6F]">
              {schoolToToggle?.active
                ? `Suspend "${schoolToToggle?.name}"? Its users will not be able to sign in.`
                : `Activate "${schoolToToggle?.name}"? Its users will be able to sign in again.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex justify-end space-x-3">
            <AlertDialogCancel disabled={toggleMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                if (schoolToToggle) {
                  toggleMutation.mutate({
                    school: schoolToToggle,
                    active: !schoolToToggle.active,
                  });
                }
              }}
              disabled={toggleMutation.isPending}
              className={
                schoolToToggle?.active
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }
            >
              {toggleMutation.isPending
                ? 'Saving…'
                : schoolToToggle?.active
                  ? 'Deactivate'
                  : 'Activate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
