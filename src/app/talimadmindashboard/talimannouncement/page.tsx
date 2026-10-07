'use client';

import React from 'react';
import { BroadcastHistory } from '@/components/broadcasts/BroadcastHistory';

/**
 * Talim Admin notifications (v1.5 §2): the history of broadcasts with their
 * delivery stats. "Send notification" opens the composer at `./new`.
 *
 * @returns The page.
 */
export default function NotificationsPage() {
  return <BroadcastHistory />;
}
