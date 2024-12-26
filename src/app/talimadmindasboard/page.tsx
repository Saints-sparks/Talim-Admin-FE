"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation"; // Import useRouter
import { SchoolList } from "../../components/talimdashboard/school-lis";
import { StatsCard } from "../../components/talimdashboard/stats-card";
import { Filter, Search } from "lucide-react";

const stats = {
  totalSchools: 220,
  activeNow: 32,
  totalSchoolsIncrease: 40,
  activeIncrease: 20,
};

const schools = [
  {
    id: "UPS-101",
    name: "University Preparatory Secondary School",
    address: "36, 37, 45 & 49 Garrick Layout, Off, Siluko Rd, Benin City",
    principal: {
      name: "Juliet Urevbu",
    },
    teacherCount: 40,
    studentCount: 324,
  },
  {
    id: "HLS-102",
    name: "Honeyland Secondary School",
    address: "J73F+FAP, Idimu, Lagos 102213, Lagos",
    principal: {
      name: "Sarah Johnson",
    },
    teacherCount: 35,
    studentCount: 280,
  },
];

export default function Page() {
  const router = useRouter(); // Initialize useRouter

  // Handle navigation to the talimregister page
  const handleRegisterClick = () => {
    router.push("/talimregister");
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <header className="sticky top-0 z-40 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-lg font-semibold">School Overview</h1>
            <Button variant="default" onClick={handleRegisterClick}>
              Register School
            </Button>
          </div>
        </header>

        <main className="p-6">
          <div className="grid gap-6">
            {/* Stats */}
            <div className="grid gap-6 md:grid-cols-2">
              <StatsCard
                title="Total Schools"
                value={stats.totalSchools}
                increase={stats.totalSchoolsIncrease}
              />
              <StatsCard
                title="Active now"
                value={stats.activeNow}
                increase={stats.activeIncrease}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="gap-1">
                  BN_LG_14
                  <button className="rounded-full hover:bg-gray-200">✕</button>
                </Badge>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  More filters
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search..."
                  className="w-full pl-9 sm:w-[300px]"
                />
              </div>
            </div>

            {/* School List */}
            <SchoolList schools={schools} />
          </div>
        </main>
      </div>
    </div>
  );
}
