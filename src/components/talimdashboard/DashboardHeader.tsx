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
    <div
      className={`flex-1 lg:ml-0 transition-all ${
        isSidebarOpen ? "backdrop-blur-md" : ""
      }`}
    >
      <header
        className={`sticky top-0 z-30 border-b bg-white shadow-sm transition-all ${
          isSidebarOpen ? "backdrop-blur-md" : ""
        }`}
      >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Title */}
          <h1
            className={`text-base sm:text-lg font-bold text-gray-800 transition-opacity ${
              isSidebarOpen ? "opacity-50" : "opacity-100"
            }`}
          >
            School Overview
          </h1>

          {/* Button */}
          <Button
            className={`bg-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm px-3 sm:px-4 py-2 transition-all flex items-center gap-1 ${
              isSidebarOpen ? "opacity-50 pointer-events-none" : ""
            }`}
            variant="default"
            onClick={handleRegisterClick}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Register New School</span>
            <span className="sm:hidden">New School</span>
          </Button>
        </div>
      </header>
    </div>
  );
};

export default DashboardHeader;
