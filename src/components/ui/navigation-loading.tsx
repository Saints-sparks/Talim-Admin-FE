'use client';

import React from 'react';
import { useNavigationLoading } from '@/app/context/NavigationLoadingContext';

export function NavigationLoading() {
  const { isNavigating } = useNavigationLoading();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
        <div className="w-10 h-10 border-4 border-t-[#003366] border-r-[#D7E6F6] border-b-[#F1F1F1] border-l-[#F1F1F1] rounded-full animate-spin"></div>
        <div className="text-sm font-medium text-[#6F6F6F]">Loading…</div>
      </div>
    </div>
  );
} 
