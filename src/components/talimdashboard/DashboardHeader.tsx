"use client";

import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
}

const DashboardHeader = ({ isSidebarOpen: _isSidebarOpen }: DashboardHeaderProps) => {
  const router = useRouter();

  const handleRegisterClick = () => {
    router.push("/talimregister");
  };

  return (
    <PageHeader
      title="School Overview"
      subtitle="Manage all registered schools"
      action={
        <Button
          className="bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm px-3 sm:px-4 py-2 flex items-center gap-1.5"
          onClick={handleRegisterClick}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Register New School</span>
          <span className="sm:hidden">New School</span>
        </Button>
      }
    />
  );
};

export default DashboardHeader;
