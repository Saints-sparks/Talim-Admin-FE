'use client';

import ProfilePicture from '@/components/setting/ProfilePicture';
import PersonalInfo from '@/components/setting/PersonalInfo';
import RecentActivity from '@/components/setting/RecentActivity';
import { PageHeader } from '@/components/ui/page-header';
import { PublicPageLinks } from '@/components/layout/PublicPageLinks';

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
          <div className="flex flex-col gap-6 lg:col-span-1">
            <RecentActivity />
            <section aria-labelledby="help-policies-title" className="rounded-xl border border-[#F1F1F1] bg-white px-6 py-4">
              <h3 id="help-policies-title" className="text-base font-semibold text-[#030E18]">
                Help and policies
              </h3>
              <p className="mt-0.5 text-xs text-[#6F6F6F]">On www.mytalim.com, for you and the schools you support.</p>
              <PublicPageLinks className="mt-3 flex-col gap-2 text-sm font-medium" />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
