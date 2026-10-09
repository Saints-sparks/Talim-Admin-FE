'use client';

import React, { Suspense } from 'react';
import { UserDirectory } from '@/components/users/UserDirectory';
import { SkeletonRows } from '@/components/tl/States';

/**
 * The Talim Admin user directory (v1.5 addendum 2026-10-09). The directory
 * reads its filters from the URL, hence the Suspense boundary
 * `useSearchParams` needs.
 *
 * @returns The page.
 */
export default function UsersPage() {
  return (
    <Suspense fallback={<SkeletonRows label="Loading users" rows={6} />}>
      <UserDirectory />
    </Suspense>
  );
}
