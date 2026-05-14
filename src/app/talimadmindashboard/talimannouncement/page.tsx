"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Eye,
  FileText,
  Filter,
  Loader2,
  Mail,
  MoreVertical,
  Paperclip,
  Plus,
  Radio,
  RefreshCw,
  School,
  Search,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/app/lib/utils";
import { useAuthContext } from "@/app/context/AuthContext";
import { School as SchoolRecord, schoolService } from "@/app/services/school.service";
import {
  NotificationCategory,
  NotificationResponse,
  NotificationStats,
  NotificationSource,
  Priority,
  RecipientRole,
  notificationService,
} from "@/app/services/notification.service";

type TabKey = "all" | "sent" | "scheduled" | "drafts";
type AudienceMode = "schools" | "roles" | "users";
type DeliveryMethod = "inApp" | "email" | "push";
type DisplayStatus = NotificationResponse["status"] | "scheduled" | "draft";

interface NotificationFormState {
  title: string;
  message: string;
  priority: Priority;
  category: NotificationCategory;
  audienceMode: AudienceMode;
  selectedSchools: string[];
  recipientRoles: RecipientRole[];
  deliveryMethods: DeliveryMethod[];
  scheduleMode: "now" | "later";
  scheduledDate: string;
  scheduledTime: string;
  attachmentName: string;
}

const emptyForm: NotificationFormState = {
  title: "",
  message: "",
  priority: "medium",
  category: "other",
  audienceMode: "schools",
  selectedSchools: [],
  recipientRoles: ["teacher"],
  deliveryMethods: ["inApp", "email", "push"],
  scheduleMode: "now",
  scheduledDate: "",
  scheduledTime: "",
  attachmentName: "",
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All Notifications" },
  { key: "sent", label: "Sent" },
  { key: "scheduled", label: "Scheduled" },
  { key: "drafts", label: "Drafts" },
];

const categories: Array<{ key: NotificationCategory; label: string }> = [
  { key: "other", label: "General" },
  { key: "announcement", label: "Announcement" },
  { key: "academics", label: "Academics" },
  { key: "attendance", label: "Attendance" },
  { key: "grading", label: "Grading" },
  { key: "resources", label: "Resources" },
  { key: "account", label: "Account" },
];

const roles: Array<{ key: RecipientRole; label: string }> = [
  { key: "admin", label: "School Admins" },
  { key: "teacher", label: "Teachers" },
  { key: "student", label: "Students" },
  { key: "parent", label: "Parents" },
];

const templates = [
  {
    title: "Maintenance Alert",
    category: "other" as NotificationCategory,
    message:
      "Dear Talim community,\n\nWe would like to inform you that Talim will undergo scheduled maintenance. During this time, the platform may be temporarily unavailable.\n\nThank you for your understanding.",
  },
  {
    title: "New Feature Announcement",
    category: "announcement" as NotificationCategory,
    message:
      "A new Talim feature is now available. Please review the update and share it with the relevant school teams.",
  },
  {
    title: "Subscription Reminder",
    category: "account" as NotificationCategory,
    message:
      "This is a reminder about an upcoming subscription renewal. Please review your school account status.",
  },
  {
    title: "Policy Update",
    category: "other" as NotificationCategory,
    message:
      "Talim has updated a platform policy. Please review the latest changes and notify affected users.",
  },
  {
    title: "General Announcement",
    category: "announcement" as NotificationCategory,
    message: "Talim has a new platform-wide announcement for selected schools and users.",
  },
];

const sourceStyles: Record<NotificationSource, string> = {
  talim: "bg-[#EAF2FB] text-[#003366] border-[#BFD7F3]",
  school: "bg-emerald-50 text-emerald-700 border-emerald-200",
  system: "bg-slate-50 text-slate-700 border-slate-200",
};

const statusStyles: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-700",
  pending: "bg-blue-50 text-blue-700",
  failed: "bg-red-50 text-red-700",
  scheduled: "bg-orange-50 text-orange-700",
  draft: "bg-sky-50 text-sky-700",
};

const getUserId = (user: any) => user?.userId || user?._id || user?.id || "";

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getStatus = (notification: NotificationResponse): DisplayStatus => {
  if (notification.isScheduled || notification.scheduledFor) return "scheduled";
  return notification.status || "pending";
};

const getSourceLabel = (source?: NotificationSource) => {
  if (source === "school") return "School";
  if (source === "talim") return "Talim";
  return "System";
};

const getAudienceLabel = (notification: NotificationResponse) => {
  const schools = notification.targetSchools?.length || 0;
  const roles = notification.recipientRoles?.length || 0;

  if (schools && roles) return `${schools} Schools, ${roles} User Types`;
  if (schools) return `${schools} Schools`;
  if (roles) return `${roles} User Types`;
  return "Global";
};

export default function TalimNotificationsPage() {
  const { user } = useAuthContext();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | NotificationSource>("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [notificationStats, setNotificationStats] =
    useState<NotificationStats | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponse | null>(null);
  const [form, setForm] = useState<NotificationFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNotifications = async (page = currentPage) => {
    try {
      setIsRefreshing(true);
      setLoadError(null);
      const response = await notificationService.getAllNotifications({
        page,
        limit: 20,
        source: sourceFilter === "all" ? undefined : sourceFilter,
      });

      const data = Array.isArray(response.data) ? response.data : [];
      setNotifications(data);
      setTotalPages(response.meta?.lastPage || 1);
      setTotalCount(response.meta?.total || data.length);
    } catch (error: any) {
      const message = error.message || "Failed to fetch notifications";
      setLoadError(message);
      setNotifications([]);
      setTotalPages(1);
      setTotalCount(0);
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchNotificationStats = async () => {
    try {
      const stats = await notificationService.getNotificationStats({
        source: sourceFilter === "all" ? undefined : sourceFilter,
      });
      setNotificationStats(stats);
      setTotalCount(stats.total);
    } catch (error: any) {
      setNotificationStats(null);
      toast.error(error.message || "Failed to fetch notification KPIs");
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await schoolService.getAllSchools(1, 100);
      setSchools(response.data);
    } catch {
      toast.error("Failed to fetch schools");
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchNotifications(currentPage);
    fetchNotificationStats();
  }, [currentPage, sourceFilter]);

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return notifications.filter((notification) => {
      const status = getStatus(notification);
      const tabMatch =
        activeTab === "all"
          ? true
          : activeTab === "sent"
            ? status === "sent"
            : activeTab === "scheduled"
              ? status === "scheduled"
              : status === "draft";
      const statusMatch = statusFilter === "all" ? true : status === statusFilter;
      const searchMatch = query
        ? [
            notification.title,
            notification.message,
            notification.senderName,
            notification.sourceLabel,
            notification.category,
          ]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      return tabMatch && statusMatch && searchMatch;
    });
  }, [activeTab, notifications, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const fallbackSent = notifications.filter((item) => getStatus(item) === "sent").length;
    const fallbackScheduled = notifications.filter((item) => getStatus(item) === "scheduled").length;
    const fallbackFailed = notifications.filter((item) => getStatus(item) === "failed").length;

    return [
      { label: "Total Sent", value: notificationStats?.total ?? totalCount, icon: Send, tone: "blue" },
      { label: "Delivered", value: notificationStats?.delivered ?? fallbackSent, icon: CheckCircle2, tone: "green" },
      { label: "Scheduled", value: notificationStats?.scheduled ?? fallbackScheduled, icon: Clock3, tone: "orange" },
      { label: "Needs Review", value: notificationStats?.failed ?? fallbackFailed, icon: BellRing, tone: "purple" },
    ];
  }, [notificationStats, notifications, totalCount]);

  const applyTemplate = (template: (typeof templates)[number]) => {
    setForm((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      category: template.category,
    }));
    setIsCreateOpen(true);
  };

  const toggleRole = (role: RecipientRole) => {
    setForm((prev) => ({
      ...prev,
      recipientRoles: prev.recipientRoles.includes(role)
        ? prev.recipientRoles.filter((item) => item !== role)
        : [...prev.recipientRoles, role],
    }));
  };

  const toggleSchool = (schoolId: string) => {
    setForm((prev) => ({
      ...prev,
      selectedSchools: prev.selectedSchools.includes(schoolId)
        ? prev.selectedSchools.filter((item) => item !== schoolId)
        : [...prev.selectedSchools, schoolId],
    }));
  };

  const toggleDelivery = (method: DeliveryMethod) => {
    setForm((prev) => ({
      ...prev,
      deliveryMethods: prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter((item) => item !== method)
        : [...prev.deliveryMethods, method],
    }));
  };

  const submitNotification = async () => {
    const senderId = getUserId(user);

    if (!senderId) {
      toast.error("Unable to identify the logged-in Talim admin");
      return;
    }

    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    if (form.audienceMode === "schools" && !form.selectedSchools.length) {
      toast.error("Select at least one school");
      return;
    }

    if (!form.recipientRoles.length) {
      toast.error("Select at least one user type");
      return;
    }

    try {
      setIsSubmitting(true);
      const scheduledFor =
        form.scheduleMode === "later" && form.scheduledDate && form.scheduledTime
          ? new Date(`${form.scheduledDate}T${form.scheduledTime}`).toISOString()
          : undefined;

      await notificationService.createNotification({
        title: form.title.trim(),
        message: form.message.trim(),
        senderId,
        priority: form.priority,
        recipientRoles: form.recipientRoles,
        targetSchools: form.audienceMode === "schools" ? form.selectedSchools : [],
        attachments: form.attachmentName ? [form.attachmentName] : [],
        source: "talim",
        category: form.category,
        type: `talim_${form.category}`,
        deliveryChannels: form.deliveryMethods,
        metadata: {
          source: "talim",
          category: form.category,
          deliveryMethods: form.deliveryMethods,
          deliveryChannels: form.deliveryMethods,
          scheduledFor,
          senderName:
            user?.firstName || user?.lastName
              ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
              : user?.email || "Talim Admin",
        },
      });

      toast.success("Talim notification sent");
      setForm(emptyForm);
      setIsCreateOpen(false);
      await fetchNotifications(1);
      await fetchNotificationStats();
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 text-[#0F172A] sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Announcements & Notifications
            </h1>
            <p className="text-sm text-[#64748B]">
              Send Talim platform notifications and review school announcement delivery.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="h-10 rounded-xl border-[#E2E8F0] bg-white text-[#334155]"
              onClick={() => toast.info("Templates are available on the right panel")}
            >
              <FileText className="h-4 w-4" />
              Notification Templates
            </Button>
            <Button
              className="h-10 rounded-xl bg-[#003366] text-white hover:bg-[#00264D]"
              onClick={() => setIsCreateOpen(true)}
            >
              <Plus className="h-4 w-4" />
              New Talim Notification
            </Button>
          </div>
        </header>

        {loadError ? (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Notification records could not be loaded.</p>
              <p className="mt-1 text-amber-800">
                {loadError}. You can still open the create modal and test the send flow once the backend is available.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-9 rounded-xl border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              onClick={() => {
                fetchNotifications(currentPage);
                fetchNotificationStats();
              }}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    item.tone === "blue" && "bg-blue-50 text-blue-600",
                    item.tone === "green" && "bg-emerald-50 text-emerald-600",
                    item.tone === "orange" && "bg-orange-50 text-orange-600",
                    item.tone === "purple" && "bg-violet-50 text-violet-600",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-xs font-medium text-[#64748B]">{item.label}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="rounded-2xl border border-[#E2E8F0] bg-white shadow-sm">
            <div className="border-b border-[#E2E8F0] px-4 pt-4">
              <div className="flex overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "border-b-2 px-4 py-3 text-sm font-semibold transition",
                      activeTab === tab.key
                        ? "border-[#003366] text-[#003366]"
                        : "border-transparent text-[#64748B] hover:text-[#0F172A]",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 border-b border-[#E2E8F0] p-4 lg:grid-cols-[minmax(0,1fr)_180px_180px_110px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#94A3B8]" />
                <Input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search notifications..."
                  className="h-10 rounded-xl border-[#E2E8F0] bg-white pl-9"
                />
              </div>

              <select
                value={sourceFilter}
                onChange={(event) => {
                  setSourceFilter(event.target.value as "all" | NotificationSource);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#334155]"
              >
                <option value="all">All Sources</option>
                <option value="talim">Talim</option>
                <option value="school">School</option>
                <option value="system">System</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-10 rounded-xl border border-[#E2E8F0] bg-white px-3 text-sm text-[#334155]"
              >
                <option value="all">All Status</option>
                <option value="sent">Sent</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
              </select>

              <Button
                variant="outline"
                className="h-10 rounded-xl border-[#E2E8F0] bg-white"
                onClick={() => fetchNotifications(currentPage)}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                Filter
              </Button>
            </div>

            <NotificationTable
              notifications={filteredNotifications}
              isLoading={isLoading}
              onView={setSelectedNotification}
            />

            <div className="flex flex-col gap-3 border-t border-[#E2E8F0] px-4 py-4 text-sm text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredNotifications.length} of {totalCount} notifications
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-[#E2E8F0]"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-semibold text-[#003366]">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-[#E2E8F0]"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </main>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h2 className="font-semibold">Quick Templates</h2>
                <p className="text-xs text-[#64748B]">
                  Use templates to send notifications quickly.
                </p>
              </div>
              <div className="space-y-3">
                {templates.map((template) => (
                  <button
                    key={template.title}
                    onClick={() => applyTemplate(template)}
                    className="flex w-full items-center justify-between rounded-xl border border-[#E2E8F0] bg-white p-3 text-left transition hover:border-[#BFD7F3] hover:bg-[#F8FBFF]"
                  >
                    <span>
                      <span className="block text-sm font-semibold">{template.title}</span>
                      <span className="block text-xs text-[#64748B]">
                        {template.message.slice(0, 48)}...
                      </span>
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2FB] text-[#003366]">
                      <Send className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {isCreateOpen ? (
        <CreateNotificationModal
          form={form}
          schools={schools}
          isSubmitting={isSubmitting}
          onClose={() => setIsCreateOpen(false)}
          onSubmit={submitNotification}
          setForm={setForm}
          toggleRole={toggleRole}
          toggleSchool={toggleSchool}
          toggleDelivery={toggleDelivery}
        />
      ) : null}

      {selectedNotification ? (
        <NotificationDetail
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      ) : null}
    </div>
  );
}

function NotificationTable({
  notifications,
  isLoading,
  onView,
}: {
  notifications: NotificationResponse[];
  isLoading: boolean;
  onView: (notification: NotificationResponse) => void;
}) {
  if (isLoading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#003366]" />
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
        <Bell className="mb-3 h-10 w-10 text-[#94A3B8]" />
        <p className="font-semibold">No notifications found</p>
        <p className="mt-1 text-sm text-[#64748B]">
          Talim and school notification records will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="border-b border-[#E2E8F0] bg-[#F8FAFC] text-xs font-semibold uppercase text-[#64748B]">
          <tr>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Audience</th>
            <th className="px-4 py-3">Sent By</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Sent / Scheduled</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((notification) => {
            const source = notification.source || "system";
            const status = getStatus(notification);
            return (
              <tr
                key={notification._id}
                className="border-b border-[#EEF2F7] transition hover:bg-[#F8FBFF]"
              >
                <td className="px-4 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EAF2FB] text-[#003366]">
                      {source === "school" ? (
                        <School className="h-4 w-4" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-[#0F172A]">
                        {notification.title}
                      </p>
                      <p className="mt-1 max-w-[360px] truncate text-xs text-[#64748B]">
                        {notification.message}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <Badge
                          variant="outline"
                          className={cn("border text-[11px]", sourceStyles[source])}
                        >
                          {getSourceLabel(source)}
                        </Badge>
                        {notification.category ? (
                          <Badge variant="outline" className="border-[#E2E8F0] text-[11px]">
                            {notification.category}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-[#334155]">
                  <p className="font-semibold">{getAudienceLabel(notification)}</p>
                  <p className="mt-1 text-[#64748B]">
                    {(notification.recipientRoles || []).join(", ") || "All users"}
                  </p>
                </td>
                <td className="px-4 py-4 text-xs">
                  <p className="font-semibold text-[#0F172A]">
                    {notification.senderName || "Talim Admin"}
                  </p>
                  <p className="text-[#64748B]">
                    {notification.senderId?.email || notification.senderEmail || "admin"}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-xs font-semibold",
                      statusStyles[status] || statusStyles.pending,
                    )}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs font-medium text-[#334155]">
                  {formatDateTime(notification.scheduledFor || notification.createdAt)}
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-[#E2E8F0]"
                      onClick={() => onView(notification)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-[#E2E8F0]"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-[#E2E8F0]"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function CreateNotificationModal({
  form,
  schools,
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
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: () => void;
  setForm: React.Dispatch<React.SetStateAction<NotificationFormState>>;
  toggleRole: (role: RecipientRole) => void;
  toggleSchool: (schoolId: string) => void;
  toggleDelivery: (method: DeliveryMethod) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-3 backdrop-blur-sm sm:p-6">
      <div className="my-auto w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF2FB] text-[#003366]">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Create New Notification</h2>
              <p className="text-sm text-[#64748B]">
                Send a Talim notification to schools, user types, or specific users.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#64748B] transition hover:bg-[#F1F5F9] hover:text-[#0F172A]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-7 overflow-y-auto p-5">
          <FormStep number="1" title="Basic Information" />
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
            <Field label="Title" required>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Enter notification title..."
                className="h-11 rounded-xl border-[#CBD5E1]"
              />
            </Field>
            <Field label="Priority">
              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, priority: event.target.value as Priority }))
                }
                className="h-11 w-full rounded-xl border border-[#CBD5E1] px-3 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="high">High</option>
              </select>
            </Field>
          </div>

          <Field label="Message" required>
            <div className="overflow-hidden rounded-xl border border-[#CBD5E1]">
              <div className="flex flex-wrap items-center gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm text-[#334155]">
                <select className="rounded-lg border border-[#E2E8F0] bg-white px-2 py-1 text-xs">
                  <option>Paragraph</option>
                </select>
                <span className="font-bold">B</span>
                <span className="italic">I</span>
                <span className="underline">U</span>
                <Paperclip className="h-4 w-4" />
              </div>
              <textarea
                value={form.message}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, message: event.target.value.slice(0, 2000) }))
                }
                placeholder="Write your notification message..."
                className="h-36 w-full resize-none p-3 text-sm outline-none"
              />
              <div className="px-3 pb-2 text-right text-xs text-[#64748B]">
                {form.message.length}/2000
              </div>
            </div>
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    category: event.target.value as NotificationCategory,
                  }))
                }
                className="h-11 w-full rounded-xl border border-[#CBD5E1] px-3 text-sm"
              >
                {categories.map((category) => (
                  <option key={category.key} value={category.key}>
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Attachment reference">
              <Input
                value={form.attachmentName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, attachmentName: event.target.value }))
                }
                placeholder="Optional file URL or filename"
                className="h-11 rounded-xl border-[#CBD5E1]"
              />
            </Field>
          </div>

          <FormStep number="2" title="Audience" />
          <div className="grid gap-3 md:grid-cols-3">
            <AudienceCard
              active={form.audienceMode === "schools"}
              icon={Building2}
              title="Schools"
              description="Select one or more schools"
              onClick={() => setForm((prev) => ({ ...prev, audienceMode: "schools" }))}
            />
            <AudienceCard
              active={form.audienceMode === "roles"}
              icon={Users}
              title="User Types"
              description="Send by user roles"
              onClick={() => setForm((prev) => ({ ...prev, audienceMode: "roles" }))}
            />
            <AudienceCard
              active={form.audienceMode === "users"}
              icon={ShieldCheck}
              title="Specific Users"
              description="Coming after user search API"
              onClick={() => setForm((prev) => ({ ...prev, audienceMode: "users" }))}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Select Schools" required={form.audienceMode === "schools"}>
              <div className="max-h-44 overflow-y-auto rounded-xl border border-[#CBD5E1] p-2">
                {schools.map((school) => (
                  <label
                    key={school._id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[#F8FAFC]"
                  >
                    <input
                      type="checkbox"
                      checked={form.selectedSchools.includes(school._id)}
                      onChange={() => toggleSchool(school._id)}
                      className="h-4 w-4"
                    />
                    <span>{school.name}</span>
                  </label>
                ))}
                {!schools.length ? (
                  <p className="p-3 text-sm text-[#64748B]">No schools loaded</p>
                ) : null}
              </div>
            </Field>

            <Field label="Select User Types" required>
              <div className="grid gap-2 sm:grid-cols-2">
                {roles.map((role) => (
                  <label
                    key={role.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-3 text-sm",
                      form.recipientRoles.includes(role.key)
                        ? "border-[#0B74DE] bg-[#EAF2FB] text-[#003366]"
                        : "border-[#E2E8F0]",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={form.recipientRoles.includes(role.key)}
                      onChange={() => toggleRole(role.key)}
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </Field>
          </div>

          <div className="rounded-xl bg-[#EFF6FF] px-4 py-3 text-sm text-[#003366]">
            Notifications sent from this portal are tagged as Talim notifications.
          </div>

          <FormStep number="3" title="Delivery Settings" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-semibold">Delivery Method</p>
              {[
                { key: "inApp" as DeliveryMethod, label: "In-App Notification", icon: Radio },
                { key: "email" as DeliveryMethod, label: "Email", icon: Mail },
                { key: "push" as DeliveryMethod, label: "Push Notification", icon: Bell },
              ].map((method) => (
                <label key={method.key} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.deliveryMethods.includes(method.key)}
                    onChange={() => toggleDelivery(method.key)}
                  />
                  <method.icon className="h-4 w-4 text-[#64748B]" />
                  {method.label}
                </label>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Schedule</p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={form.scheduleMode === "now"}
                  onChange={() => setForm((prev) => ({ ...prev, scheduleMode: "now" }))}
                />
                Send Now
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  checked={form.scheduleMode === "later"}
                  onChange={() => setForm((prev) => ({ ...prev, scheduleMode: "later" }))}
                />
                Schedule for Later
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  type="date"
                  value={form.scheduledDate}
                  disabled={form.scheduleMode === "now"}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, scheduledDate: event.target.value }))
                  }
                  className="h-11 rounded-xl border-[#CBD5E1]"
                />
                <Input
                  type="time"
                  value={form.scheduledTime}
                  disabled={form.scheduleMode === "now"}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, scheduledTime: event.target.value }))
                  }
                  className="h-11 rounded-xl border-[#CBD5E1]"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#E2E8F0] p-5">
          <Button variant="outline" className="rounded-xl border-[#E2E8F0]" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="rounded-xl bg-[#003366] text-white hover:bg-[#00264D]"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Notification
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-[#334155]">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
    </label>
  );
}

function FormStep({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0B74DE] text-sm font-bold text-white">
        {number}
      </span>
      <h3 className="font-bold">{title}</h3>
    </div>
  );
}

function AudienceCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-4 rounded-xl border p-4 text-left transition",
        active
          ? "border-[#0B74DE] bg-[#F0F7FF] ring-2 ring-[#0B74DE]/10"
          : "border-[#E2E8F0] hover:bg-[#F8FAFC]",
      )}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#003366] shadow-sm">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm font-bold">{title}</span>
        <span className="text-xs text-[#64748B]">{description}</span>
      </span>
    </button>
  );
}

function NotificationDetail({
  notification,
  onClose,
}: {
  notification: NotificationResponse;
  onClose: () => void;
}) {
  const source = notification.source || "system";
  const status = getStatus(notification);
  const delivered = status === "sent" ? 96 : status === "failed" ? 42 : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-[#334155]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Notifications
          </button>
          <Button variant="outline" size="icon" className="rounded-xl" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <header>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold">{notification.title}</h1>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs font-bold",
                sourceStyles[source],
              )}
            >
              {getSourceLabel(source)}
            </span>
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", statusStyles[status])}>
              {status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#64748B]">
            Sent on {formatDateTime(notification.createdAt)} by{" "}
            <span className="font-semibold text-[#334155]">
              {notification.senderName || notification.senderId?.email || "Talim Admin"}
            </span>
          </p>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className="space-y-4">
                <DetailItem icon={Users} label="Audience" value={getAudienceLabel(notification)} />
                <DetailItem icon={School} label="Targeted" value={(notification.targetSchools || []).map((item) => item.name).join(", ") || "All Schools"} />
                <DetailItem icon={CalendarClock} label="Sent At" value={formatDateTime(notification.createdAt)} />
                <DetailItem icon={Radio} label="Delivery Method" value="In-App, Email, Push Notification" />
                <div>
                  <p className="mb-2 text-sm font-bold">Message</p>
                  <div className="space-y-3 text-sm leading-6 text-[#334155]">
                    {notification.message.split("\n").map((line, index) => (
                      <p key={`${notification._id}-${index}`}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex h-44 items-center justify-center rounded-2xl bg-gradient-to-br from-[#EAF2FB] to-[#FFF8E1] text-[#003366]">
                  <Send className="h-16 w-16" />
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold">Attachments ({notification.attachments?.length || 0})</p>
                  {(notification.attachments || []).length ? (
                    notification.attachments?.map((attachment) => (
                      <div
                        key={attachment}
                        className="flex items-center gap-3 rounded-xl border border-[#E2E8F0] p-3 text-sm"
                      >
                        <FileText className="h-5 w-5 text-red-500" />
                        <span className="truncate">{attachment}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-[#64748B]">No attachments</p>
                  )}
                </div>
              </div>
            </div>
          </main>

          <aside className="space-y-5">
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <h2 className="font-bold">Delivery Summary</h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <SummaryTile label="Total Recipients" value="12,845" />
                <SummaryTile label="Delivered" value={`${delivered}%`} />
                <SummaryTile label="Failed" value={status === "failed" ? "58%" : "2%"} />
                <SummaryTile label="Pending" value={status === "pending" ? "Active" : "-"} />
              </div>
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm">
              <h2 className="font-bold">Delivery Timeline</h2>
              <div className="mt-4 space-y-4 text-sm">
                {["Created", "Queued", status === "sent" ? "Delivered" : "In Progress"].map((item, index) => (
                  <div key={item} className="flex gap-3">
                    <span
                      className={cn(
                        "mt-1 h-2.5 w-2.5 rounded-full",
                        index === 2 ? "bg-emerald-500" : "bg-blue-600",
                      )}
                    />
                    <div>
                      <p className="font-semibold">{item}</p>
                      <p className="text-xs text-[#64748B]">{formatDateTime(notification.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[22px_100px_minmax(0,1fr)] gap-3 text-sm">
      <Icon className="h-4 w-4 text-[#64748B]" />
      <span className="font-semibold text-[#64748B]">{label}</span>
      <span className="font-medium text-[#0F172A]">{value}</span>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] p-3">
      <p className="text-xs text-[#64748B]">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}
