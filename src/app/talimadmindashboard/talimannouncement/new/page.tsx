'use client';

import React from 'react';
import { BroadcastComposer } from '@/components/broadcasts/BroadcastComposer';

/**
 * "Send notification": the one composer for platform notifications.
 *
 * @returns The page.
 */
export default function SendNotificationPage() {
  return <BroadcastComposer />;
}
