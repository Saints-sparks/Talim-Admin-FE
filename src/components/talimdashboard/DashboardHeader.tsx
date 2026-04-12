import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

interface DashboardHeaderProps {
  isSidebarOpen: boolean;
}

const DashboardHeader = ({ isSidebarOpen }: DashboardHeaderProps) => {
  const router = useRouter();

  const handleRegisterClick = () => {
    router.push("/talimregister");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#F1F1F1] bg-white">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-base font-bold text-[#030E18]">School Overview</h1>
          <p className="text-xs text-[#6F6F6F]">Manage all registered schools</p>
        </div>

        <Button
          className="bg-[#003366] hover:bg-[#002244] text-white text-xs sm:text-sm px-3 sm:px-4 py-2 flex items-center gap-1.5"
          onClick={handleRegisterClick}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Register New School</span>
          <span className="sm:hidden">New School</span>
        </Button>
      </div>
    </header>
  );
};

export default DashboardHeader;
