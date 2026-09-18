/**
 * Query-key factory. The Talim Admin portal is the platform-wide console, so
 * there is no school to scope by: every resource is keyed
 * `[resource, …params]` and a sign-out clears the whole cache at once.
 *
 * Add a resource here when a page moves onto TanStack Query; never build
 * ad-hoc key arrays inside components.
 */
export const queryKeys = {
  schools: {
    all: ['schools'] as const,
    list: (params?: Record<string, unknown>) => ['schools', 'list', params ?? {}] as const,
    detail: (schoolId: string) => ['schools', schoolId] as const,
  },
  complaints: {
    all: ['complaints'] as const,
    list: () => ['complaints', 'list'] as const,
    detail: (complaintId: string) => ['complaints', complaintId] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params ?? {}] as const,
    detail: (notificationId: string) => ['notifications', notificationId] as const,
    stats: (params?: Record<string, unknown>) => ['notifications', 'stats', params ?? {}] as const,
  },
  payments: {
    all: ['payments'] as const,
    providers: () => ['payments', 'providers'] as const,
  },
  profile: {
    all: ['profile'] as const,
    detail: (userId: string) => ['profile', userId] as const,
    activity: (userId: string, params?: Record<string, unknown>) =>
      ['profile', userId, 'activity', params ?? {}] as const,
  },
} as const;

/**
 * The prefix of a params-carrying list key, for invalidating every page of a
 * list at once. Invalidating with the full key would only match one page.
 *
 * @param key - A key built by one of the factories above.
 * @returns The key without its trailing params object.
 */
export function listPrefix(key: readonly unknown[]): readonly unknown[] {
  const last = key[key.length - 1];
  return last && typeof last === 'object' && !Array.isArray(last) ? key.slice(0, -1) : key;
}

/** Stale times (ms) by how often the data actually changes. */
export const staleTimes = {
  /** Provider configuration and the admin's own profile: minutes between changes. */
  reference: 10 * 60_000,
  /** Lists staff edit during the day. */
  list: 30_000,
  /** Counters and delivery stats: always refetch on mount. */
  live: 0,
} as const;
