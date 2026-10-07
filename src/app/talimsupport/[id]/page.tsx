'use client';

import React from 'react';
import { TicketView } from '@/components/support/TicketView';

/**
 * One ticket on the Talim support desk. Next hands params as a promise for
 * dynamic segments.
 *
 * @param props - The route params.
 * @param props.params - Resolves to the ticket id.
 * @returns The page.
 */
export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  return <TicketView id={decodeURIComponent(id)} />;
}
