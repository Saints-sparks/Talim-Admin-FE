'use client';

import ProfilePicture from '@/components/setting/ProfilePicture';
import PersonalInfo from '@/components/setting/PersonalInfo';
import RecentActivity from '@/components/setting/RecentActivity';
import { PageHeader } from '@/components/ui/page-header';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <PageHeader title="Settings" subtitle="Manage your account and preferences" />

      {/* Decorative hero banner behind the profile card */}
      <div className="h-36 bg-[#003366]" />

      {/* Page body */}
      <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 lg:px-8">
        {/* Profile header card — overlaps the banner */}
        <div className="-mt-14 mb-8 rounded-2xl border border-[#F1F1F1] bg-white px-6 py-6 shadow-sm">
          <ProfilePicture />
        </div>

        {/* Two-column grid on wide screens */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PersonalInfo />
          </div>
          <div className="lg:col-span-1">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
