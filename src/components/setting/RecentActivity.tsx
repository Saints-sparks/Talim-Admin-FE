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
  login:               { label: 'Signed in',        Icon: LogIn,      color: 'bg-[#EAF2FB] text-[#003366]'   },
  login_failed:        { label: 'Failed sign-in',    Icon: ShieldAlert, color: 'bg-red-50 text-red-600'       },
  admin_login_blocked: { label: 'Access blocked',    Icon: ShieldAlert, color: 'bg-red-50 text-red-600'       },
  logout:              { label: 'Signed out',        Icon: LogOut,     color: 'bg-[#F8F8F8] text-[#6F6F6F]'  },
  profile_update:      { label: 'Profile updated',   Icon: User,       color: 'bg-emerald-50 text-emerald-700'},
  avatar_change:       { label: 'Photo changed',     Icon: Camera,     color: 'bg-purple-50 text-purple-700'  },
  password_change:     { label: 'Password changed',  Icon: KeyRound,   color: 'bg-amber-50 text-amber-700'    },
  token_refresh:       { label: 'Session refreshed', Icon: RefreshCw,  color: 'bg-[#EAF2FB] text-[#003366]'  },
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
    <div className="rounded-xl border border-[#F1F1F1] bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1F1F1] px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-[#030E18]">Recent Activity</h3>
          <p className="text-xs text-[#6F6F6F] mt-0.5">
            {total > 0 ? `${total} events recorded` : 'Login sessions and account events'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6F6F6F] hover:bg-[#F8F8F8] hover:text-[#030E18] transition-colors disabled:opacity-40"
            onClick={fetchLogs}
            disabled={isLoading}
            aria-label="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF2FB]">
            <Activity className="h-4 w-4 text-[#003366]" />
          </div>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-[#003366]" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center">
          <p className="text-sm text-[#6F6F6F]">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchLogs} className="text-xs border-[#F1F1F1]">
            Retry
          </Button>
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LogIn className="mb-3 h-10 w-10 text-[#D7E6F6]" />
          <p className="text-sm font-medium text-[#6F6F6F]">No activity recorded yet</p>
          <p className="mt-1 text-xs text-[#878787]">Events will appear here after you log in</p>
        </div>
      ) : (
        <ul className="divide-y divide-[#F8F8F8] px-6">
          {logs.map((entry, idx) => {
            const meta = actionMeta[entry.action] ?? {
              label: entry.action.replace(/_/g, ' '),
              Icon: Activity,
              color: 'bg-[#F8F8F8] text-[#6F6F6F]',
            };
            const PlatformIcon = platformIcon(entry.platform);
            return (
              <li key={entry._id} className="flex items-start gap-3 py-3.5">
                {/* Icon column */}
                <div className="relative mt-0.5 shrink-0">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      entry.success ? 'bg-[#F8F8F8]' : 'bg-red-50'
                    }`}
                  >
                    <meta.Icon
                      className={`h-3.5 w-3.5 ${entry.success ? 'text-[#6F6F6F]' : 'text-red-500'}`}
                    />
                  </div>
                  {idx < logs.length - 1 && (
                    <div className="absolute left-4 top-8 h-full w-px bg-[#F1F1F1]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#030E18]">{meta.label}</span>
                    {!entry.success && (
                      <Badge className="text-xs font-medium border-0 px-2 py-0.5 bg-red-50 text-red-600">
                        Failed
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#878787]">
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
