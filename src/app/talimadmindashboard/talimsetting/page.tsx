'use client';

import ProfilePicture from '@/components/setting/ProfilePicture';
import PersonalInfo from '@/components/setting/PersonalInfo';
import RecentActivity from '@/components/setting/RecentActivity';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero banner */}
      <div className="h-36 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-500" />

      {/* Page body */}
      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Profile header card — overlaps the banner */}
        <div className="-mt-14 mb-8 rounded-2xl border border-slate-100 bg-white px-6 py-6 shadow-sm">
          <ProfilePicture />
        </div>

        {/* Two-column grid on wide screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Personal info — wider column */}
          <div className="lg:col-span-2">
            <PersonalInfo />
          </div>

          {/* Activity feed — narrower column */}
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
