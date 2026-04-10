'use client';

import { useEffect, useState } from 'react';
import {
  Monitor,
  Smartphone,
  Globe,
  LogIn,
  LogOut,
  User,
  Camera,
  KeyRound,
  ShieldAlert,
  Clock,
  Activity,
  ChevronRight,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/app/lib/api/client';
import { API_ENDPOINTS } from '@/app/lib/api/config';

interface ActivityLog {
  _id: string;
  userId: string;
  action: string;
  platform: string;
  deviceToken?: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface ActivityLogsResponse {
  logs: ActivityLog[];
  total: number;
  page: number;
  limit: number;
}

const actionMeta: Record<
  string,
  { label: string; Icon: React.ElementType; color: string }
> = {
  login: { label: 'Signed in', Icon: LogIn, color: 'bg-indigo-100 text-indigo-700' },
  login_failed: { label: 'Failed sign-in', Icon: ShieldAlert, color: 'bg-red-100 text-red-700' },
  admin_login_blocked: { label: 'Access blocked', Icon: ShieldAlert, color: 'bg-red-100 text-red-700' },
  logout: { label: 'Signed out', Icon: LogOut, color: 'bg-slate-100 text-slate-700' },
  profile_update: { label: 'Profile updated', Icon: User, color: 'bg-emerald-100 text-emerald-700' },
  avatar_change: { label: 'Photo changed', Icon: Camera, color: 'bg-purple-100 text-purple-700' },
  password_change: { label: 'Password changed', Icon: KeyRound, color: 'bg-amber-100 text-amber-700' },
  token_refresh: { label: 'Session refreshed', Icon: RefreshCw, color: 'bg-blue-100 text-blue-700' },
};

const platformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('mobile') || p.includes('android') || p.includes('ios')) return Smartphone;
  if (p.includes('web') || p.includes('browser') || p.includes('admin')) return Globe;
  return Monitor;
};

const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatFull = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

export default function RecentActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiRequest<ActivityLogsResponse>(
        `${API_ENDPOINTS.ACTIVITY_LOGS}?limit=15`,
      );
      setLogs(res.logs);
      setTotal(res.total);
    } catch {
      setError('Could not load activity logs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchLogs(); }, []);

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {total > 0 ? `${total} events recorded` : 'Login sessions and account events'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-600"
            onClick={fetchLogs}
            disabled={isLoading}
            aria-label="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Activity className="h-4 w-4 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm text-slate-500">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="text-xs">
            Retry
          </Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LogIn className="mb-3 h-10 w-10 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No activity recorded yet</p>
          <p className="mt-1 text-xs text-slate-400">Events will appear here after you log in</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-50 px-6">
          {logs.map((entry, idx) => {
            const meta = actionMeta[entry.action] ?? {
              label: entry.action.replace(/_/g, ' '),
              Icon: Activity,
              color: 'bg-slate-100 text-slate-700',
            };
            const PlatformIcon = platformIcon(entry.platform);
            return (
              <li key={entry._id} className="flex items-start gap-4 py-4">
                {/* Icon column */}
                <div className="relative mt-0.5 shrink-0">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      entry.success ? 'bg-slate-100' : 'bg-red-50'
                    }`}
                  >
                    <meta.Icon
                      className={`h-4 w-4 ${entry.success ? 'text-slate-600' : 'text-red-500'}`}
                    />
                  </div>
                  {idx < logs.length - 1 && (
                    <div className="absolute left-4 top-9 h-full w-px bg-slate-100" />
                  )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{meta.label}</span>
                    <Badge className={`text-xs font-medium border-0 px-2 py-0.5 ${meta.color}`}>
                      {entry.action.replace(/_/g, ' ')}
                    </Badge>
                    {!entry.success && (
                      <Badge className="text-xs font-medium border-0 px-2 py-0.5 bg-red-100 text-red-700">
                        Failed
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span title={formatFull(entry.createdAt)}>{formatRelative(entry.createdAt)}</span>
                    </span>
                    <span className="flex items-center gap-1 capitalize">
                      <PlatformIcon className="h-3 w-3" />
                      {entry.platform}
                    </span>
                    {entry.ipAddress && (
                      <span className="font-mono">{entry.ipAddress}</span>
                    )}
                  </div>
                </div>

                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-slate-300" />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
