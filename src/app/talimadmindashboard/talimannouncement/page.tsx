'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useAuthContext } from '@/app/context/AuthContext';
import { schoolService } from '@/app/services/school.service';
import {
  notificationService,
  type NotificationResponse,
  type NotificationDeliveryChannel,
  type RecipientRole,
} from '@/app/services/notification.service';
import { listPrefix, queryKeys, staleTimes } from '@/lib/queryKeys';
import { getErrorMessage } from '@/lib/apiError';
import { logger } from '@/lib/logger';
import { ErrorState } from '@/components/StateComponents';
import { EMPTY_FORM, PAGE_SIZE, TEMPLATES } from './_components/constants';
import {
  buildCreatePayload,
  getDisplayStatus,
  matchesNotificationSearch,
  validateNotificationForm,
} from './_components/helpers';
import type { NotificationFormState, TabKey } from './_components/types';
import { NotificationFilters, NotificationKpis } from './_components/NotificationFilters';
import { NotificationTable } from './_components/NotificationTable';
import { PaginationBar } from './_components/PaginationBar';
import { NotificationDetail } from './_components/NotificationDetail';
import { CreateNotificationModal } from './_components/CreateNotificationModal';

/** How many schools the audience picker loads. */
const SCHOOL_PICKER_LIMIT = 100;

/**
 * The platform notification console: everything Talim has sent, plus the
 * composer.
 *
 * The backend paginates `GET /notifications` but accepts no search, role or
 * status filter (`NotificationQueryDto` takes only `page`, `limit`, `source`,
 * `category`, `type` and `recipientId`), so those three narrow the page in the
 * browser and the counts say so rather than implying a platform-wide total.
 *
 * @returns The notifications page.
 */
export default function TalimNotificationsPage() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<NotificationFormState>(EMPTY_FORM);

  const listParams = { page: currentPage, limit: PAGE_SIZE };

  const listQuery = useQuery({
    queryKey: queryKeys.notifications.list(listParams),
    queryFn: () => notificationService.getAllNotifications(listParams),
    staleTime: staleTimes.list,
    placeholderData: (previous) => previous,
  });

  const statsQuery = useQuery({
    queryKey: queryKeys.notifications.stats(),
    queryFn: () => notificationService.getNotificationStats(),
    staleTime: staleTimes.live,
  });

  // Loaded in parallel with the list; only the composer and the school filter
  // need it, so a failure here never blocks the page.
  const schoolsQuery = useQuery({
    queryKey: queryKeys.schools.list({ limit: SCHOOL_PICKER_LIMIT }),
    queryFn: () => schoolService.getAllSchools(1, SCHOOL_PICKER_LIMIT),
    staleTime: staleTimes.reference,
  });

  const notifications = useMemo(() => listQuery.data?.data ?? [], [listQuery.data]);
  const schools = schoolsQuery.data?.data ?? [];
  const totalPages = listQuery.data?.meta?.lastPage ?? 1;
  const serverTotal = statsQuery.data?.total ?? listQuery.data?.meta?.total ?? 0;

  const invalidateNotifications = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });

  const createMutation = useMutation({
    mutationFn: (payload: NotificationFormState) => {
      const senderId = user?.userId ?? user?._id ?? '';
      return notificationService.createNotification(buildCreatePayload(payload, senderId));
    },
    onSuccess: async (created) => {
      toast.success(created.scheduledFor ? 'Notification scheduled' : 'Notification sent');
      setForm(EMPTY_FORM);
      setIsCreateOpen(false);
      setCurrentPage(1);
      await invalidateNotifications();
    },
    onError: (err) => {
      logger.error('notifications', 'Create failed', err);
      toast.error('The notification could not be sent', { description: getErrorMessage(err) });
    },
  });

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return notifications.filter((notification) => {
      const status = getDisplayStatus(notification);
      const tabMatch =
        activeTab === 'all' ||
        (activeTab === 'sent' && status === 'sent') ||
        (activeTab === 'scheduled' && status === 'scheduled');
      const schoolMatch =
        schoolFilter === 'all' ||
        (notification.targetSchools ?? []).some((school) => school._id === schoolFilter);
      const roleMatch =
        roleFilter === 'all' ||
        (notification.recipientRoles ?? []).includes(roleFilter as RecipientRole);
      return tabMatch && schoolMatch && roleMatch && matchesNotificationSearch(notification, query);
    });
  }, [notifications, activeTab, schoolFilter, roleFilter, searchQuery]);

  const selected = notifications.find((n) => n._id === selectedId) ?? null;
  const selectedIndex = selected ? filtered.findIndex((n) => n._id === selected._id) : -1;

  const applyTemplate = (template: (typeof TEMPLATES)[number]) => {
    setForm((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      category: template.category,
    }));
    setIsCreateOpen(true);
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  const submit = () => {
    const senderId = user?.userId ?? user?._id;
    if (!senderId) {
      toast.error('Your session could not be identified. Sign in again.');
      return;
    }
    const problem = validateNotificationForm(form);
    if (problem) {
      toast.error(problem);
      return;
    }
    createMutation.mutate(form);
  };

  const openDetail = (notification: NotificationResponse) => setSelectedId(notification._id);

  if (selected) {
    return (
      <NotificationDetail
        notification={selected}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex >= 0 && selectedIndex < filtered.length - 1}
        onClose={() => setSelectedId(null)}
        onPrev={() => setSelectedId(filtered[selectedIndex - 1]?._id ?? null)}
        onNext={() => setSelectedId(filtered[selectedIndex + 1]?._id ?? null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4 text-[#101828] sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#101828]">Notifications</h1>
            <p className="mt-0.5 text-sm text-[#667085]">
              Send and manage platform-wide notifications to schools and users.
            </p>
          </div>
          <Button
            className="h-10 rounded-lg bg-[#003366] text-white hover:bg-[#00264D]"
            onClick={() => {
              setForm(EMPTY_FORM);
              setIsCreateOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New Notification
          </Button>
        </header>

        <NotificationKpis stats={statsQuery.data} isLoading={statsQuery.isLoading} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="min-w-0 rounded-xl border border-[#E5EAF2] bg-white shadow-sm">
            <NotificationFilters
              activeTab={activeTab}
              onTabChange={setActiveTab}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              schoolFilter={schoolFilter}
              onSchoolChange={setSchoolFilter}
              roleFilter={roleFilter}
              onRoleChange={setRoleFilter}
              schools={schools}
            />

            {listQuery.error ? (
              <ErrorState error={listQuery.error} onRetry={() => void listQuery.refetch()} />
            ) : (
              <NotificationTable
                notifications={filtered}
                isLoading={listQuery.isLoading}
                onView={openDetail}
              />
            )}

            <div className="flex flex-col gap-3 border-t border-[#E8EDF5] px-4 py-4 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filtered.length} of {notifications.length} on this page ·{' '}
                {serverTotal.toLocaleString()} in total
              </span>
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={(page) => {
                  setCurrentPage(page);
                  queryClient.invalidateQueries({
                    queryKey: listPrefix(queryKeys.notifications.list()),
                    refetchType: 'none',
                  });
                }}
              />
            </div>
          </section>

          <aside>
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-[#101828]">Quick Templates</h2>
              <p className="mt-1 text-xs text-[#667085]">
                Start the composer from a prefilled message.
              </p>
              <div className="mt-4 space-y-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.title}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#E8EDF5] bg-white p-3 text-left transition hover:border-[#BFD7FF] hover:bg-[#F8FBFF]"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-[#101828]">
                        {template.title}
                      </span>
                      <span className="line-clamp-1 text-xs text-[#667085]">
                        {template.message}
                      </span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF5FF] text-[#0B63CE]">
                      <Send className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isCreateOpen && (
        <CreateNotificationModal
          form={form}
          schools={schools}
          isLoadingSchools={schoolsQuery.isLoading}
          isSubmitting={createMutation.isPending}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={submit}
          setForm={setForm}
          toggleRole={(role: RecipientRole) =>
            setForm((p) => ({ ...p, recipientRoles: toggle(p.recipientRoles, role) }))
          }
          toggleSchool={(id: string) =>
            setForm((p) => ({ ...p, selectedSchools: toggle(p.selectedSchools, id) }))
          }
          toggleDelivery={(channel: NotificationDeliveryChannel) =>
            setForm((p) => ({ ...p, deliveryMethods: toggle(p.deliveryMethods, channel) }))
          }
        />
      )}
    </div>
  );
}
