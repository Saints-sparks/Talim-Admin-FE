'use client';

import React from 'react';
import { BroadcastDetail } from '@/components/broadcasts/BroadcastDetail';

/**
 * One sent or scheduled notification. Next hands params as a promise for
 * dynamic segments.
 *
 * @param props - The route params.
 * @param props.params - Resolves to the broadcast id.
 * @returns The page.
 */
export default function NotificationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <BroadcastDetail id={decodeURIComponent(id)} />;
}
