'use client';

import { useAuthContext } from '@/app/context/AuthContext';
import {
  Monitor,
  Smartphone,
  Globe,
  LogIn,
  Clock,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ActivityEntry {
  id: string;
  type: 'login' | 'profile_update' | 'password_change' | 'avatar_change';
  description: string;
  platform: string;
  deviceToken: string;
  timestamp: string;
  isCurrent?: boolean;
}

const platformIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('mobile') || p.includes('android') || p.includes('ios')) {
    return Smartphone;
  }
  if (p.includes('web') || p.includes('browser')) {
    return Globe;
  }
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
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const formatFull = (iso: string): string =>
  new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

const buildActivitiesFromUser = (user: {
  devices?: Array<{ deviceToken: string; platform: string }>;
  createdAt?: string;
  updatedAt?: string;
}): ActivityEntry[] => {
  const activities: ActivityEntry[] = [];

  // Derive login sessions from registered devices
  if (user.devices?.length) {
    user.devices.forEach((d, idx) => {
      activities.push({
        id: `device-${idx}`,
        type: 'login',
        description: 'Session registered',
        platform: d.platform || 'web',
        deviceToken: d.deviceToken,
        timestamp: user.updatedAt ?? new Date().toISOString(),
        isCurrent: idx === user.devices!.length - 1,
      });
    });
  }

  // Account creation event
  if (user.createdAt) {
    activities.push({
      id: 'created',
      type: 'login',
      description: 'Account created',
      platform: 'web',
      deviceToken: 'system',
      timestamp: user.createdAt,
    });
  }

  // Sort newest first
  return activities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
};

const typeColors: Record<ActivityEntry['type'], string> = {
  login: 'bg-indigo-100 text-indigo-700',
  profile_update: 'bg-emerald-100 text-emerald-700',
  password_change: 'bg-amber-100 text-amber-700',
  avatar_change: 'bg-purple-100 text-purple-700',
};

const typeLabels: Record<ActivityEntry['type'], string> = {
  login: 'Login',
  profile_update: 'Profile',
  password_change: 'Password',
  avatar_change: 'Avatar',
};

export default function RecentActivity() {
  const { user } = useAuthContext();
  const activities = buildActivitiesFromUser(user ?? {});

  return (
    <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Recent Activity</h3>
          <p className="text-xs text-slate-400 mt-0.5">Your login sessions and account events</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
          <Activity className="h-4 w-4 text-indigo-600" />
        </div>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <LogIn className="mb-3 h-10 w-10 text-slate-200" />
          <p className="text-sm font-medium text-slate-500">No activity recorded yet</p>
          <p className="mt-1 text-xs text-slate-400">Activity will appear here after you log in</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-50 px-6">
          {activities.map((entry, idx) => {
            const Icon = platformIcon(entry.platform);
            return (
              <li
                key={entry.id}
                className="flex items-start gap-4 py-4"
              >
                {/* Icon column */}
                <div className="relative mt-0.5 shrink-0">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <Icon className="h-4 w-4 text-slate-600" />
                  </div>
                  {/* Vertical connector */}
                  {idx < activities.length - 1 && (
                    <div className="absolute left-4 top-9 h-full w-px bg-slate-100" />
                  )}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-900">{entry.description}</span>
                    <Badge
                      className={`text-xs font-medium ${typeColors[entry.type]} border-0 px-2 py-0.5`}
                    >
                      {typeLabels[entry.type]}
                    </Badge>
                    {entry.isCurrent && (
                      <Badge className="gap-1 text-xs font-medium bg-green-100 text-green-700 border-0 px-2 py-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500 inline-block" />
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span title={formatFull(entry.timestamp)}>{formatRelative(entry.timestamp)}</span>
                    </span>
                    <span className="capitalize">{entry.platform}</span>
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
