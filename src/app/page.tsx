'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePageIndicator } from './context/PageIndicatorContext';

export default function Home() {
  const router = useRouter();
  const pathname = usePathname(); 
  const { currentPage, setCurrentPage } = usePageIndicator();
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    router.push('/dashboard');  // Redirect to /dashboard page
  };

  const handleDotClick = (index: number) => {
    setCurrentPage(index);
    const routes = ['/', '/email-verification', '/signup'];
    router.push(routes[index]);
  };

  // Sync current page indicator with pathname changes
  useEffect(() => {
    router.replace('/talimadminlogin'); // Redirect to talimadminlogin
  }, [router]);

  return null; // No UI needed as it's just a redirect
}
