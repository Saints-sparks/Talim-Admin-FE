'use client';

import React, { Suspense } from 'react';
import { DeskQueue } from '@/components/support/DeskQueue';
import { SkeletonRows } from '@/components/tl/States';

/**
 * The Talim support desk (v1.5 §1). It replaces the complaints list this
 * page showed before v1.5; the queue reads its filters from the URL, hence
 * the Suspense boundary `useSearchParams` needs.
 *
 * @returns The page.
 */
export default function SupportPage() {
  return (
    <Suspense fallback={<SkeletonRows label="Loading the support desk" rows={6} />}>
      <DeskQueue />
    </Suspense>
  );
}
