'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/talimadminlogin'); // Redirect to talimadminlogin
  }, [router]);

  return null; // No UI needed as it's just a redirect
}
