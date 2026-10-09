'use client';

import React from 'react';
import { UserDetail } from '@/components/users/UserDetail';

/**
 * One user in Talim Admin (v1.5 addendum 2026-10-09). Next hands params as a
 * promise for dynamic segments.
 *
 * @param props - The route params.
 * @param props.params - Resolves to the user id.
 * @returns The page.
 */
export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <UserDetail id={decodeURIComponent(id)} />;
}
