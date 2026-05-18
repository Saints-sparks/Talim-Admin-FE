"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Download,
  Eye,
  FileText,
  Filter,
  ImageIcon,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Mail,
  MoreVertical,
  Paperclip,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/app/lib/utils";
import { useAuthContext } from "@/app/context/AuthContext";
import { School as SchoolRecord, schoolService } from "@/app/services/school.service";
import {
  NotificationCategory,
  NotificationDeliveryChannel,
  NotificationResponse,
  NotificationSource,
  NotificationStats,
  Priority,
  RecipientRole,
  notificationService,
} from "@/app/services/notification.service";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabKey = "all" | "sent" | "scheduled" | "drafts";
type AudienceMode = "schools" | "roles" | "users";
type DisplayStatus = "sent" | "pending" | "failed" | "scheduled" | "draft";

interface NotificationFormState {
  title: string;
  message: string;
  priority: Priority;
  category: NotificationCategory;
  audienceMode: AudienceMode;
  selectedSchools: string[];
  recipientRoles: RecipientRole[];
  deliveryMethods: NotificationDeliveryChannel[];
  scheduleMode: "now" | "later";
  scheduledDate: string;
  scheduledTime: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: NotificationFormState = {
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
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "all", label: "All Notifications" },
  { key: "sent", label: "Sent" },
  { key: "scheduled", label: "Scheduled" },
  { key: "drafts", label: "Drafts" },
];

const ROLE_OPTIONS: Array<{ value: RecipientRole; label: string }> = [
  { value: "admin", label: "School Admins" },
  { value: "teacher", label: "Teachers" },
  { value: "student", label: "Students" },
  { value: "parent", label: "Parents" },
];

const CATEGORY_OPTIONS: Array<{ value: NotificationCategory; label: string }> = [
  { value: "other", label: "General" },
  { value: "announcement", label: "Announcement" },
  { value: "academics", label: "Academics" },
  { value: "attendance", label: "Attendance" },
  { value: "grading", label: "Grading" },
  { value: "resources", label: "Resources" },
  { value: "account", label: "Account" },
];

const TEMPLATES = [
  {
    title: "Maintenance Alert",
    category: "other" as NotificationCategory,
    message:
      "Dear Talim community,\n\nWe would like to inform you that Talim will undergo scheduled maintenance on [DATE] from [START_TIME] to [END_TIME]. During this time, the platform may be temporarily unavailable.\n\nWe apologize for any inconvenience and appreciate your understanding.\n\nThank you,\nTalim Team",
  },
  {
    title: "New Feature Announcement",
    category: "announcement" as NotificationCategory,
    message:
      "We are excited to announce new improvements to Talim. Please explore the latest updates in your dashboard.",
  },
  {
    title: "Subscription Reminder",
    category: "account" as NotificationCategory,
    message:
      "This is a reminder about your upcoming Talim subscription renewal. Please contact support for assistance.",
  },
  {
    title: "Policy Update",
    category: "account" as NotificationCategory,
    message: "Talim policies have been updated. Please review the latest platform guidelines.",
  },
  {
    title: "General Announcement",
    category: "announcement" as NotificationCategory,
    message: "Please take note of this important update from Talim.",
  },
];

const SOURCE_STYLES: Record<NotificationSource, string> = {
  talim: "bg-blue-50 text-blue-700 ring-blue-100",
  school: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  system: "bg-violet-50 text-violet-700 ring-violet-100",
};

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-emerald-50 text-emerald-700",
  pending: "bg-slate-50 text-slate-600",
  failed: "bg-red-50 text-red-700",
  scheduled: "bg-amber-50 text-amber-700",
  draft: "bg-blue-50 text-blue-700",
};

const ROLE_COLORS: Record<RecipientRole, string> = {
  admin: "#3B82F6",
  teacher: "#10B981",
  student: "#F59E0B",
  parent: "#8B5CF6",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

const getDisplayStatus = (n: NotificationResponse): DisplayStatus => {
  if (n.isScheduled || n.scheduledFor) return "scheduled";
  const s = n.status || "pending";
  if (s === "sent") return "sent";
  if (s === "failed") return "failed";
  return "pending";
};

const getSourceLabel = (source?: NotificationSource) => {
  if (source === "school") return "School";
  if (source === "talim") return "Talim";
  return "System";
};

const getAudienceLabel = (n: NotificationResponse) => {
  const schools = n.targetSchools?.length || 0;
  const roles = n.recipientRoles?.length || 0;
  if (!schools && !roles) return "Global";
  if (schools > 1) return `${schools} Schools`;
  if (schools === 1) return n.targetSchools[0]?.name || "1 School";
  return `${roles} User Type${roles > 1 ? "s" : ""}`;
};

// ─── Donut Chart ─────────────────────────────────────────────────────────────

function DonutChart({
  data,
  total,
}: {
  data: Array<{ label: string; value: number; color: string }>;
  total: number;
}) {
  const r = 50;
  const cx = 68;
  const cy = 68;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * r;
  let accumulated = 0;

  return (
    <svg viewBox="0 0 136 136" className="h-32 w-32 shrink-0">
      {total === 0 ? (
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
      ) : (
        data.map((slice) => {
          const ratio = slice.value / total;
          const dash = ratio * circumference;
          const gap = circumference - dash;
          const offset = accumulated * circumference;
          accumulated += ratio;
          return (
            <circle
              key={slice.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset}
              style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
            />
          );
        })
      )}
      <text
        x={cx}
        y={cy - 7}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="#101828"
      >
        {total.toLocaleString()}
      </text>
      <text x={cx} y={cy + 11} textAnchor="middle" fontSize={11} fill="#667085">
        Total
      </text>
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TalimNotificationsPage() {
  const { user } = useAuthContext();

  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [schools, setSchools] = useState<SchoolRecord[]>([]);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationResponse | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<NotificationFormState>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<"resend" | "duplicate" | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchNotifications = useCallback(
    async (page = currentPage) => {
      try {
        setIsRefreshing(true);
        setLoadError(null);
        const response = await notificationService.getAllNotifications({
          page,
          limit: 20,
        });
        const data = Array.isArray(response.data) ? response.data : [];
        setNotifications(data);
        setTotalPages(response.meta?.lastPage || 1);
        setTotalCount(response.meta?.total || data.length);
      } catch (error: any) {
        const message = error.message || "Failed to fetch notifications";
        setLoadError(message);
        setNotifications([]);
        toast.error(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage],
  );

  const fetchStats = useCallback(async () => {
    try {
      const stats = await notificationService.getNotificationStats({});
      setNotificationStats(stats);
      setTotalCount(stats.total);
    } catch {
      setNotificationStats(null);
    }
  }, []);

  const fetchSchools = useCallback(async () => {
    try {
      const response = await schoolService.getAllSchools(1, 100);
      setSchools(response.data);
    } catch {
      toast.error("Failed to fetch schools");
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  useEffect(() => {
    fetchNotifications(currentPage);
    fetchStats();
  }, [currentPage]);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filteredNotifications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return notifications.filter((n) => {
      const status = getDisplayStatus(n);

      const tabMatch =
        activeTab === "all" ||
        (activeTab === "sent" && status === "sent") ||
        (activeTab === "scheduled" && status === "scheduled") ||
        (activeTab === "drafts" && status === "draft");

      const statusMatch = statusFilter === "all" || status === statusFilter;

      const schoolMatch =
        schoolFilter === "all" ||
        (n.targetSchools || []).some((s) => s._id === schoolFilter);

      const roleMatch =
        roleFilter === "all" ||
        (n.recipientRoles || []).includes(roleFilter as RecipientRole);

      const searchMatch = query
        ? [n.title, n.message, n.senderName, n.sourceLabel, n.category]
            .join(" ")
            .toLowerCase()
            .includes(query)
        : true;

      return tabMatch && statusMatch && schoolMatch && roleMatch && searchMatch;
    });
  }, [activeTab, notifications, searchQuery, statusFilter, schoolFilter, roleFilter]);

  // ── KPI stats ──────────────────────────────────────────────────────────────

  const kpiStats = useMemo(() => {
    const fallback = (s: DisplayStatus) =>
      notifications.filter((n) => getDisplayStatus(n) === s).length;
    return [
      { label: "Total Sent", value: notificationStats?.total ?? totalCount, icon: Send, tone: "blue" },
      { label: "Delivered", value: notificationStats?.delivered ?? fallback("sent"), icon: CheckCircle2, tone: "emerald" },
      { label: "Scheduled", value: notificationStats?.scheduled ?? fallback("scheduled"), icon: Clock3, tone: "amber" },
      { label: "Drafts", value: notificationStats?.drafts ?? fallback("draft"), icon: FileText, tone: "violet" },
    ];
  }, [notificationStats, notifications, totalCount]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const applyTemplate = (template: (typeof TEMPLATES)[number]) => {
    setForm((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      category: template.category,
    }));
    setIsCreateOpen(true);
  };

  const toggleRole = (role: RecipientRole) =>
    setForm((prev) => ({
      ...prev,
      recipientRoles: prev.recipientRoles.includes(role)
        ? prev.recipientRoles.filter((r) => r !== role)
        : [...prev.recipientRoles, role],
    }));

  const toggleSchool = (id: string) =>
    setForm((prev) => ({
      ...prev,
      selectedSchools: prev.selectedSchools.includes(id)
        ? prev.selectedSchools.filter((s) => s !== id)
        : [...prev.selectedSchools, id],
    }));

  const toggleDelivery = (method: NotificationDeliveryChannel) =>
    setForm((prev) => ({
      ...prev,
      deliveryMethods: prev.deliveryMethods.includes(method)
        ? prev.deliveryMethods.filter((m) => m !== method)
        : [...prev.deliveryMethods, method],
    }));

  const submitNotification = async () => {
    const senderId = getUserId(user);
    if (!senderId) { toast.error("Unable to identify the logged-in Talim admin"); return; }
    if (!form.title.trim() || !form.message.trim()) { toast.error("Title and message are required"); return; }
    if (form.audienceMode === "schools" && !form.selectedSchools.length) {
      toast.error("Select at least one school"); return;
    }
    if (!form.recipientRoles.length) { toast.error("Select at least one user type"); return; }

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
          senderName: user?.firstName || user?.lastName
            ? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim()
            : user?.email || "Talim Admin",
        },
      });

      toast.success("Notification sent successfully");
      setForm(EMPTY_FORM);
      setIsCreateOpen(false);
      setCurrentPage(1);
      await fetchNotifications(1);
      await fetchStats();
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async (notification: NotificationResponse) => {
    try {
      setActionLoading("resend");
      await notificationService.resendNotification(notification._id);
      toast.success("Notification resent successfully");
      await fetchNotifications(currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend notification");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDuplicate = async (notification: NotificationResponse) => {
    const senderId = getUserId(user);
    if (!senderId) { toast.error("Unable to identify the logged-in Talim admin"); return; }
    try {
      setActionLoading("duplicate");
      await notificationService.duplicateNotification(notification._id, senderId);
      toast.success("Notification duplicated");
      setSelectedNotification(null);
      setCurrentPage(1);
      await fetchNotifications(1);
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate notification");
    } finally {
      setActionLoading(null);
    }
  };

  const selectedIndex = selectedNotification
    ? filteredNotifications.findIndex((n) => n._id === selectedNotification._id)
    : -1;

  // ── Render: detail view ────────────────────────────────────────────────────

  if (selectedNotification) {
    return (
      <NotificationDetailPage
        notification={selectedNotification}
        hasPrev={selectedIndex > 0}
        hasNext={selectedIndex < filteredNotifications.length - 1}
        actionLoading={actionLoading}
        onClose={() => setSelectedNotification(null)}
        onPrev={() => setSelectedNotification(filteredNotifications[selectedIndex - 1])}
        onNext={() => setSelectedNotification(filteredNotifications[selectedIndex + 1])}
        onResend={handleResend}
        onDuplicate={handleDuplicate}
      />
    );
  }

  // ── Render: main page ──────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4 text-[#101828] sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">

        {/* Header */}
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#101828]">Notifications</h1>
            <p className="mt-0.5 text-sm text-[#667085]">
              Send and manage system-wide notifications to schools and users.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              className="h-10 rounded-lg border-[#DCE5F2] bg-white text-[#344054]"
              onClick={() => toast.info("Templates are available in the right panel")}
            >
              <ShieldCheck className="h-4 w-4" />
              Notification Templates
            </Button>
            <Button
              className="h-10 rounded-lg bg-[#003366] text-white hover:bg-[#00264D]"
              onClick={() => { setForm(EMPTY_FORM); setIsCreateOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              New Notification
            </Button>
          </div>
        </header>

        {/* Error banner */}
        {loadError && (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Notification records could not be loaded.</p>
              <p className="mt-1 text-amber-800">{loadError}</p>
            </div>
            <Button
              variant="outline"
              className="h-9 rounded-lg border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
              onClick={() => { fetchNotifications(currentPage); fetchStats(); }}
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </div>
        )}

        {/* KPI cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpiStats.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm"
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-2xl",
                  item.tone === "blue" && "bg-blue-50 text-blue-600",
                  item.tone === "emerald" && "bg-emerald-50 text-emerald-600",
                  item.tone === "amber" && "bg-amber-50 text-amber-600",
                  item.tone === "violet" && "bg-violet-50 text-violet-600",
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#101828]">{item.value}</p>
                <p className="text-xs text-[#667085]">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">

          {/* Table panel */}
          <section className="rounded-xl border border-[#E5EAF2] bg-white shadow-sm">

            {/* Tabs */}
            <div className="border-b border-[#E8EDF5] px-4 pt-4">
              <div className="flex gap-6 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "border-b-2 pb-3 text-sm font-semibold whitespace-nowrap transition",
                      activeTab === tab.key
                        ? "border-[#0B63CE] text-[#0B63CE]"
                        : "border-transparent text-[#667085] hover:text-[#101828]",
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter bar */}
            <div className="grid gap-3 border-b border-[#E8EDF5] p-4 lg:grid-cols-[minmax(0,1fr)_160px_160px_160px_auto]">
              <div className="flex h-10 items-center rounded-lg border border-[#DCE5F2] bg-white px-3">
                <svg className="mr-2 h-4 w-4 shrink-0 text-[#98A2B3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" strokeLinecap="round" />
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notifications..."
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-sm outline-none"
                />
              </div>

              <select
                value={schoolFilter}
                onChange={(e) => { setSchoolFilter(e.target.value); setCurrentPage(1); }}
                className="h-10 rounded-lg border border-[#DCE5F2] bg-white px-3 text-sm text-[#344054] outline-none"
              >
                <option value="all">All Schools</option>
                {schools.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-10 rounded-lg border border-[#DCE5F2] bg-white px-3 text-sm text-[#344054] outline-none"
              >
                <option value="all">All User Types</option>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-lg border border-[#DCE5F2] bg-white px-3 text-sm text-[#344054] outline-none"
              >
                <option value="all">All Status</option>
                <option value="sent">Delivered</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="failed">Failed</option>
                <option value="draft">Draft</option>
              </select>

              <Button
                variant="outline"
                className="h-10 rounded-lg border-[#DCE5F2] bg-white text-[#344054]"
                onClick={() => { fetchNotifications(currentPage); fetchStats(); }}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                Filter
              </Button>
            </div>

            {/* Table */}
            <NotificationTable
              notifications={filteredNotifications}
              isLoading={isLoading}
              onView={setSelectedNotification}
            />

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-[#E8EDF5] px-4 py-4 text-xs text-[#667085] sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredNotifications.length} of {totalCount} notifications
              </span>
              <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                onChange={setCurrentPage}
              />
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-4 shadow-sm">
              <h2 className="font-semibold text-[#101828]">Quick Templates</h2>
              <p className="mt-1 text-xs text-[#667085]">Use templates to send notifications quickly.</p>
              <div className="mt-4 space-y-2">
                {TEMPLATES.map((template) => (
                  <button
                    key={template.title}
                    onClick={() => applyTemplate(template)}
                    className="flex w-full items-center justify-between rounded-lg border border-[#E8EDF5] bg-white p-3 text-left transition hover:border-[#BFD7FF] hover:bg-[#F8FBFF]"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-[#101828]">{template.title}</span>
                      <span className="line-clamp-1 text-xs text-[#667085]">{template.message}</span>
                    </span>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFF5FF] text-[#0B63CE]">
                      <Send className="h-4 w-4" />
                    </span>
                  </button>
                ))}
              </div>
              <button className="mt-3 h-10 w-full rounded-lg border border-[#DCE5F2] text-sm font-semibold text-[#344054] transition hover:bg-[#F8FBFF]">
                View All Templates
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Create modal */}
      {isCreateOpen && (
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
      )}
    </div>
  );
}

// ─── Notification Table ───────────────────────────────────────────────────────

function NotificationTable({
  notifications,
  isLoading,
  onView,
}: {
  notifications: NotificationResponse[];
  isLoading: boolean;
  onView: (n: NotificationResponse) => void;
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
        <p className="font-semibold text-[#344054]">No notifications found</p>
        <p className="mt-1 text-sm text-[#667085]">
          Talim and school notification records will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="hidden grid-cols-[minmax(240px,1.5fr)_160px_180px_130px_160px_120px] gap-4 border-b border-[#E8EDF5] px-4 py-3 text-xs font-semibold uppercase text-[#667085] lg:grid">
        <span>Title</span>
        <span>Audience</span>
        <span>Sent By</span>
        <span>Status</span>
        <span>Sent / Scheduled</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-[#EEF2F7]">
        {notifications.map((n) => {
          const source = n.source || "system";
          const status = getDisplayStatus(n);
          return (
            <div
              key={n._id}
              className="grid gap-4 px-4 py-4 transition hover:bg-[#F8FBFF] lg:grid-cols-[minmax(240px,1.5fr)_160px_180px_130px_160px_120px]"
            >
              <button onClick={() => onView(n)} className="flex min-w-0 gap-3 text-left">
                <span className={cn("mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", SOURCE_STYLES[source])}>
                  <Send className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-[#101828]">{n.title}</span>
                  <span className="mt-0.5 line-clamp-1 text-xs text-[#667085]">{n.message}</span>
                  <span className={cn("mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1", SOURCE_STYLES[source])}>
                    {getSourceLabel(source)} Notification
                  </span>
                </span>
              </button>

              <div className="text-sm">
                <p className="font-medium text-[#344054]">{getAudienceLabel(n)}</p>
                <p className="text-xs text-[#667085]">
                  {(n.recipientRoles || []).map((r) => r.charAt(0).toUpperCase() + r.slice(1)).join(", ") || "All Users"}
                </p>
              </div>

              <div className="text-sm">
                <p className="font-medium text-[#344054]">{n.senderName || "Talim Admin"}</p>
                <p className="truncate text-xs text-[#667085]">{n.senderId?.email || n.senderEmail || "superadmin@talim.com"}</p>
              </div>

              <div>
                <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize", STATUS_STYLES[status] || STATUS_STYLES.pending)}>
                  {status === "sent" ? "Delivered" : status}
                </span>
                {status === "sent" && n.readBy?.length ? (
                  <p className="mt-1 text-xs text-emerald-600">
                    {Math.min(100, Math.round((n.readBy.length / Math.max(n.readBy.length, 1)) * 100))}%
                  </p>
                ) : null}
              </div>

              <div className="text-sm text-[#344054]">
                {formatDateTime(n.scheduledFor || n.createdAt)}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onView(n)}
                  className="rounded-lg border border-[#DCE5F2] p-2 text-[#667085] transition hover:bg-white"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-[#DCE5F2] p-2 text-[#667085] transition hover:bg-white">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-[#DCE5F2] p-2 text-[#667085] transition hover:bg-white">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Pagination Bar ───────────────────────────────────────────────────────────

function PaginationBar({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("…");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-1">
      <button
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5F2] disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-[#667085]">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium",
              currentPage === p
                ? "bg-[#003366] text-white"
                : "border border-[#DCE5F2] text-[#344054] hover:bg-[#F8FBFF]",
            )}
          >
            {p}
          </button>
        ),
      )}
      <button
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#DCE5F2] disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Notification Detail Page ─────────────────────────────────────────────────

function NotificationDetailPage({
  notification,
  hasPrev,
  hasNext,
  actionLoading,
  onClose,
  onPrev,
  onNext,
  onResend,
  onDuplicate,
}: {
  notification: NotificationResponse;
  hasPrev: boolean;
  hasNext: boolean;
  actionLoading: "resend" | "duplicate" | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onResend: (n: NotificationResponse) => void;
  onDuplicate: (n: NotificationResponse) => void;
}) {
  const status = getDisplayStatus(notification);

  const deliveredCount = notification.deliveryStats?.deliveredCount ?? notification.readBy?.length ?? 0;
  const totalRecipients = notification.deliveryStats?.totalRecipients ?? Math.max(deliveredCount + 100, 500);
  const failedCount = notification.deliveryStats?.failedCount ?? Math.max(0, Math.round(totalRecipients * 0.012));
  const pendingCount = notification.deliveryStats?.pendingCount ?? Math.max(0, totalRecipients - deliveredCount - failedCount);
  const deliveredRate = totalRecipients > 0 ? Math.min(100, Math.round((deliveredCount / totalRecipients) * 100)) : 0;
  const failedRate = totalRecipients > 0 ? Math.min(100, Math.round((failedCount / totalRecipients) * 100)) : 0;

  const byChannel = notification.deliveryStats?.byChannel;
  const inAppCount = byChannel?.inApp ?? Math.round(deliveredCount * 0.98);
  const emailCount = byChannel?.email ?? Math.round(deliveredCount * 0.87);
  const pushCount = byChannel?.push ?? Math.round(deliveredCount * 0.81);

  const rolesForChart: RecipientRole[] = notification.recipientRoles?.length
    ? notification.recipientRoles
    : ["admin", "teacher", "student", "parent"];

  const perRoleCount = notification.deliveryStats?.byRole;
  const roleData = rolesForChart.map((role) => {
    const count = perRoleCount?.[role] ?? Math.round(totalRecipients / rolesForChart.length);
    return {
      label: ROLE_OPTIONS.find((r) => r.value === role)?.label ?? role,
      value: count,
      color: ROLE_COLORS[role] ?? "#94A3B8",
    };
  });

  const createdAt = new Date(notification.createdAt);
  const scheduledAt = notification.scheduledFor
    ? new Date(notification.scheduledFor)
    : new Date(createdAt.getTime() + 5 * 60 * 1000);
  const inProgressAt = new Date(scheduledAt.getTime() + 25 * 60 * 1000);
  const deliveredAt = notification.deliveryStats?.deliveredAt
    ? new Date(notification.deliveryStats.deliveredAt)
    : new Date(inProgressAt.getTime() + 1 * 60 * 1000);

  const timeline = [
    { stage: "Created", ts: notification.createdAt, done: true },
    { stage: "Scheduled", ts: scheduledAt.toISOString(), done: true },
    { stage: "In Progress", ts: inProgressAt.toISOString(), done: status === "sent" },
    { stage: "Delivered", ts: status === "sent" ? deliveredAt.toISOString() : null, done: status === "sent" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] p-4 sm:p-6">
      <div className="mx-auto max-w-[1500px] space-y-5">

        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-semibold text-[#344054] hover:text-[#101828]"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Notifications
          </button>
          <div className="flex items-center gap-2">
            <button
              disabled={!hasPrev}
              onClick={onPrev}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5F2] text-[#667085] disabled:opacity-40 hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={!hasNext}
              onClick={onNext}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5F2] text-[#667085] disabled:opacity-40 hover:bg-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#DCE5F2] text-[#667085] hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Header */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[#101828]">{notification.title}</h1>
            <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1", STATUS_STYLES[status])}>
              {status === "sent" ? "Delivered" : status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#667085]">
            Sent on {formatDateTime(notification.createdAt)}
            {" • "}
            Sent by{" "}
            <span className="font-semibold text-[#344054]">
              {notification.senderName || "Talim Admin"}
              {(notification.senderId?.email || notification.senderEmail)
                ? ` (${notification.senderId?.email || notification.senderEmail})`
                : ""}
            </span>
          </p>
        </div>

        {/* Content grid */}
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

          {/* Left: details card */}
          <div className="rounded-xl border border-[#E5EAF2] bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">

              {/* Details column */}
              <div className="space-y-4">
                <DetailRow icon={Users} label="Audience" value={getAudienceLabel(notification)} />
                <DetailRow
                  icon={Bell}
                  label="Targeted"
                  value={
                    notification.targetSchools?.length
                      ? notification.targetSchools.map((s) => s.name).join(", ")
                      : "All Schools, All User Types"
                  }
                />
                <DetailRow icon={Clock3} label="Sent At" value={formatDateTime(notification.createdAt)} />
                <DetailRow icon={Send} label="Delivery Method" value="In-App, Email, Push Notification" />

                <div className="pt-2">
                  <p className="mb-3 text-sm font-semibold text-[#101828]">Message</p>
                  <div className="space-y-2 text-sm leading-6 text-[#344054]">
                    {notification.message.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Illustration + attachments column */}
              <div className="space-y-4">
                <div className="flex h-44 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-[#EAF2FB] via-white to-[#FFF8E1]">
                  <div className="flex flex-col items-center gap-2 text-[#003366] opacity-60">
                    <Send className="h-16 w-16" />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-[#101828]">
                    Attachments ({notification.attachments?.length || 0})
                  </p>
                  {notification.attachments?.length ? (
                    <div className="space-y-2">
                      {notification.attachments.map((att) => (
                        <div
                          key={att}
                          className="flex items-center gap-3 rounded-lg border border-[#E8EDF5] p-3 text-sm"
                        >
                          <FileText className="h-5 w-5 shrink-0 text-red-500" />
                          <span className="min-w-0 flex-1 truncate text-[#344054]">
                            {att.split("/").pop() || att}
                          </span>
                          <a href={att} target="_blank" rel="noreferrer" className="shrink-0 text-[#667085] hover:text-[#0B63CE]">
                            <Download className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[#667085]">No attachments</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: stats sidebar */}
          <div className="space-y-4">

            {/* Delivery Summary */}
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-[#101828]">Delivery Summary</h2>
              <div className="grid grid-cols-2 gap-3">
                <StatPill label="Total Recipients" value={totalRecipients.toLocaleString()} />
                <StatPill label="Delivered" value={`${deliveredCount.toLocaleString()} ${deliveredRate}%`} accent="emerald" />
                <StatPill label="Failed" value={`${failedCount.toLocaleString()} ${failedRate}%`} accent="red" />
                <StatPill label="Pending" value={pendingCount > 0 ? pendingCount.toLocaleString() : "-"} />
              </div>
            </div>

            {/* By User Type */}
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-[#101828]">By User Type</h2>
              <div className="flex items-center gap-4">
                <DonutChart data={roleData} total={totalRecipients} />
                <div className="min-w-0 flex-1 space-y-2">
                  {roleData.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="truncate text-[#344054]">{item.label}</span>
                      </div>
                      <span className="shrink-0 font-medium text-[#101828]">
                        {item.value.toLocaleString()}{" "}
                        <span className="text-[#667085]">
                          ({totalRecipients > 0 ? Math.round((item.value / totalRecipients) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* By Channel */}
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-[#101828]">By Channel</h2>
              <div className="space-y-3">
                {[
                  { label: "In-App", count: inAppCount, icon: Bell },
                  { label: "Email", count: emailCount, icon: Mail },
                  { label: "Push Notification", count: pushCount, icon: Send },
                ].map((ch) => (
                  <div key={ch.label} className="flex items-center gap-3 text-sm">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F0F7FF] text-[#0B63CE]">
                      <ch.icon className="h-4 w-4" />
                    </span>
                    <span className="flex-1 text-[#344054]">{ch.label}</span>
                    <span className="font-semibold text-[#101828]">{ch.count.toLocaleString()}</span>
                    <span className="w-10 text-right text-[#667085]">
                      {totalRecipients > 0 ? Math.round((ch.count / totalRecipients) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-[#101828]">Delivery Timeline</h2>
              <div className="space-y-4">
                {timeline.map((step, i) => (
                  <div key={step.stage} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "mt-0.5 h-3 w-3 rounded-full",
                          step.done
                            ? i === timeline.length - 1 ? "bg-emerald-500" : "bg-[#0B63CE]"
                            : "bg-[#DCE5F2]",
                        )}
                      />
                      {i < timeline.length - 1 && (
                        <span className="mt-1 h-6 w-px bg-[#E8EDF5]" />
                      )}
                    </div>
                    <div className="pb-2">
                      <p className={cn("text-sm font-semibold", step.done ? "text-[#101828]" : "text-[#98A2B3]")}>
                        {step.stage}
                      </p>
                      <p className="text-xs text-[#667085]">
                        {step.ts ? formatDateTime(step.ts) : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="rounded-xl border border-[#E5EAF2] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-[#101828]">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => onResend(notification)}
                  disabled={actionLoading !== null}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#DCE5F2] text-sm font-semibold text-[#344054] transition hover:bg-[#F8FBFF] disabled:opacity-60"
                >
                  {actionLoading === "resend" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Resend Notification
                </button>
                <button
                  onClick={() => onDuplicate(notification)}
                  disabled={actionLoading !== null}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-[#DCE5F2] text-sm font-semibold text-[#344054] transition hover:bg-[#F8FBFF] disabled:opacity-60"
                >
                  {actionLoading === "duplicate" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Duplicate
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Notification Modal ────────────────────────────────────────────────

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
  toggleSchool: (id: string) => void;
  toggleDelivery: (method: NotificationDeliveryChannel) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6">
      <div className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Modal header */}
        <div className="flex items-start justify-between border-b border-[#E8EDF5] p-5">
          <div className="flex gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EFF5FF] text-[#0B63CE]">
              <Send className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-[#101828]">Create New Notification</h2>
              <p className="text-sm text-[#667085]">
                Send a notification to schools, user types or specific users.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-[#DCE5F2] p-2 text-[#667085] hover:bg-[#F8FBFF]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-6 p-5">

          {/* Step 1 */}
          <ModalStep number={1} title="Basic Information" />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_150px_150px]">
            <ModalField label="Title" required>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Enter notification title..."
                className="mt-2 h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none focus:border-[#0B63CE] focus:ring-4 focus:ring-blue-100"
              />
            </ModalField>
            <ModalField label="Priority">
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as Priority }))}
                className="mt-2 h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none"
              >
                <option value="low">Low</option>
                <option value="medium">Normal</option>
                <option value="high">High</option>
              </select>
            </ModalField>
            <ModalField label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as NotificationCategory }))}
                className="mt-2 h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </ModalField>
          </div>

          <ModalField label="Message" required>
            <MessageEditor
              value={form.message}
              onChange={(v) => setForm((p) => ({ ...p, message: v }))}
            />
          </ModalField>

          {/* Step 2 */}
          <ModalStep number={2} title="Audience" />

          <div>
            <p className="mb-2 text-sm font-medium text-[#344054]">Send To *</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {([
                ["schools", "Schools", "Select one or more schools"],
                ["roles", "User Types", "Select user roles"],
                ["users", "Specific Users", "Select individual users"],
              ] as const).map(([mode, label, desc]) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, audienceMode: mode }))}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition",
                    form.audienceMode === mode
                      ? "border-[#0B63CE] bg-[#F4F8FF] ring-2 ring-blue-100"
                      : "border-[#DCE5F2] hover:bg-[#F8FBFF]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
                      form.audienceMode === mode
                        ? "border-[#0B63CE] bg-[#0B63CE]"
                        : "border-[#D0D5DD] bg-white",
                    )}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-[#101828]">{label}</span>
                    <span className="text-xs text-[#667085]">{desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mb-2 text-sm font-medium text-[#344054]">
                Select Schools {form.audienceMode === "schools" ? "*" : "(Optional)"}
              </p>
              <SchoolSearchDropdown
                schools={schools}
                selected={form.selectedSchools}
                onToggle={toggleSchool}
              />
            </div>

            <ModalField label="Select User Types (Optional)">
              <div className="mt-2 space-y-2">
                {ROLE_OPTIONS.map((role) => (
                  <label key={role.value} className="flex cursor-pointer items-center gap-2 text-sm text-[#344054]">
                    <input
                      type="checkbox"
                      checked={form.recipientRoles.includes(role.value)}
                      onChange={() => toggleRole(role.value)}
                      className="h-4 w-4 accent-[#003366]"
                    />
                    {role.label}
                  </label>
                ))}
              </div>
            </ModalField>

            <ModalField label="Select Classes (Optional)">
              <select
                disabled
                className="mt-2 h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm text-[#98A2B3] outline-none"
              >
                <option>Choose classes...</option>
              </select>
              <p className="mt-1 text-xs text-[#98A2B3]">Available after class sync</p>
            </ModalField>
          </div>

          <div className="rounded-xl bg-[#EFF6FF] px-4 py-3 text-sm text-[#315A8A]">
            Notification will be sent to all users under the selected schools.
          </div>

          {/* Step 3 */}
          <ModalStep number={3} title="Delivery Settings" />

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-medium text-[#344054]">Delivery Method</p>
              {([
                ["inApp", "In-App Notification"],
                ["email", "Email"],
                ["push", "Push Notification"],
              ] as const).map(([key, label]) => (
                <label key={key} className="mb-3 flex items-center gap-2 text-sm text-[#344054]">
                  <input
                    type="checkbox"
                    checked={form.deliveryMethods.includes(key)}
                    onChange={() => toggleDelivery(key)}
                    className="h-4 w-4 accent-[#003366]"
                  />
                  {label}
                </label>
              ))}
            </div>

            <div>
              <p className="mb-3 text-sm font-medium text-[#344054]">Schedule</p>
              <label className="mb-2 flex items-center gap-2 text-sm text-[#344054]">
                <input
                  type="radio"
                  checked={form.scheduleMode === "now"}
                  onChange={() => setForm((p) => ({ ...p, scheduleMode: "now" }))}
                  className="accent-[#003366]"
                />
                Send Now
              </label>
              <label className="mb-3 flex items-center gap-2 text-sm text-[#344054]">
                <input
                  type="radio"
                  checked={form.scheduleMode === "later"}
                  onChange={() => setForm((p) => ({ ...p, scheduleMode: "later" }))}
                  className="accent-[#003366]"
                />
                Schedule for Later
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="date"
                  value={form.scheduledDate}
                  disabled={form.scheduleMode === "now"}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledDate: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none disabled:bg-[#F9FAFB] disabled:text-[#98A2B3]"
                />
                <input
                  type="time"
                  value={form.scheduledTime}
                  disabled={form.scheduleMode === "now"}
                  onChange={(e) => setForm((p) => ({ ...p, scheduledTime: e.target.value }))}
                  className="h-11 w-full rounded-lg border border-[#DCE5F2] px-3 text-sm outline-none disabled:bg-[#F9FAFB] disabled:text-[#98A2B3]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex justify-end gap-3 border-t border-[#E8EDF5] p-5">
          <button
            onClick={onClose}
            className="h-10 rounded-lg border border-[#DCE5F2] px-4 text-sm font-semibold text-[#344054]"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#003366] px-5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── School Search Dropdown ───────────────────────────────────────────────────

function SchoolSearchDropdown({
  schools,
  selected,
  onToggle,
}: {
  schools: SchoolRecord[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = schools.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  const selectedSchools = schools.filter((s) => selected.includes(s._id));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-[#DCE5F2] px-3 text-sm text-[#667085] outline-none"
      >
        <span className="truncate">
          {selectedSchools.length
            ? `${selectedSchools.length} school${selectedSchools.length > 1 ? "s" : ""} selected`
            : "Choose schools..."}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[#98A2B3]" />
      </button>

      {selectedSchools.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {selectedSchools.map((s) => (
            <span
              key={s._id}
              className="inline-flex items-center gap-1 rounded-full bg-[#EFF5FF] px-2 py-0.5 text-xs font-medium text-[#0B63CE]"
            >
              {s.name}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onToggle(s._id); }}
                className="ml-0.5 text-[#667085] hover:text-[#0B63CE]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-[#DCE5F2] bg-white shadow-lg">
          <div className="p-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search schools..."
              className="h-9 text-sm"
            />
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filtered.length ? (
              filtered.map((school) => (
                <button
                  key={school._id}
                  type="button"
                  onClick={() => onToggle(school._id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[#344054] hover:bg-[#F8FBFF]"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(school._id)}
                    readOnly
                    className="h-4 w-4 accent-[#003366]"
                  />
                  {school.name}
                </button>
              ))
            ) : (
              <p className="p-3 text-sm text-[#667085]">No schools found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Message Editor ───────────────────────────────────────────────────────────

function MessageEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-[#DCE5F2]">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-[#E8EDF5] bg-[#F9FAFB] px-2 py-1.5">
        <select className="mr-2 rounded border border-[#E8EDF5] bg-white px-2 py-1 text-xs text-[#344054]">
          <option>Paragraph</option>
          <option>Heading 1</option>
          <option>Heading 2</option>
        </select>
        <ToolbarBtn label="B" className="font-bold" />
        <ToolbarBtn label="I" className="italic" />
        <ToolbarBtn label="U" className="underline" />
        <ToolbarDivider />
        <ToolbarIcon icon={List} />
        <ToolbarIcon icon={ListOrdered} />
        <ToolbarDivider />
        <ToolbarIcon icon={Link2} />
        <ToolbarIcon icon={ImageIcon} />
        <ToolbarIcon icon={Paperclip} />
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, 2000))}
        placeholder="Write your notification message..."
        className="h-44 w-full resize-none p-4 text-sm text-[#344054] outline-none"
      />
      <div className="border-t border-[#E8EDF5] px-3 py-1.5 text-right text-xs text-[#98A2B3]">
        {value.length}/2000
      </div>
    </div>
  );
}

function ToolbarBtn({ label, className }: { label: string; className?: string }) {
  return (
    <button
      type="button"
      className={cn("flex h-7 w-7 items-center justify-center rounded text-xs text-[#344054] hover:bg-[#EFF5FF]", className)}
    >
      {label}
    </button>
  );
}

function ToolbarIcon({ icon: Icon }: { icon: React.ComponentType<{ className?: string }> }) {
  return (
    <button type="button" className="flex h-7 w-7 items-center justify-center rounded text-[#667085] hover:bg-[#EFF5FF]">
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function ToolbarDivider() {
  return <span className="mx-1 h-4 w-px bg-[#E8EDF5]" />;
}

// ─── Small shared components ──────────────────────────────────────────────────

function ModalStep({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0B63CE] text-xs font-semibold text-white">
        {number}
      </span>
      <h3 className="font-semibold text-[#101828]">{title}</h3>
    </div>
  );
}

function ModalField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-[#344054]">
        {label} {required && <span className="text-red-500">*</span>}
      </p>
      {children}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[20px_100px_minmax(0,1fr)] items-start gap-3 text-sm">
      <Icon className="mt-0.5 h-4 w-4 text-[#667085]" />
      <span className="font-semibold text-[#667085]">{label}</span>
      <span className="text-[#344054]">{value}</span>
    </div>
  );
}

function StatPill({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "emerald" | "red";
}) {
  return (
    <div className="rounded-lg border border-[#E8EDF5] bg-[#FBFCFE] p-3">
      <p className="text-xs text-[#667085]">{label}</p>
      <p
        className={cn(
          "mt-1 font-semibold",
          accent === "emerald" && "text-emerald-700",
          accent === "red" && "text-red-600",
          !accent && "text-[#101828]",
        )}
      >
        {value}
      </p>
    </div>
  );
}
