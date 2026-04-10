'use client';

import React from 'react';
import { useNavigationLoading } from '@/app/context/NavigationLoadingContext';

export function NavigationLoading() {
  const { isNavigating } = useNavigationLoading();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-t-indigo-600 border-r-indigo-600 border-b-gray-200 border-l-gray-200 rounded-full animate-spin"></div>
        <div className="text-gray-700">Loading...</div>
      </div>
    </div>
  );
} 
