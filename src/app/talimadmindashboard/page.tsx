"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Filter, Search, School as SchoolIcon, WifiOff, Plus } from "lucide-react";
import { School, schoolService } from "../services/school.service";
import { LoadingModal } from "@/components/ui/loading-modal";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import DashboardHeader from "@/components/talimdashboard/DashboardHeader";
import Stats from "@/components/talimdashboard/Stats";
import SchoolCard from "@/components/talimdashboard/SchoolCard";

export default function Page() {
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [totalSchools, setTotalSchools] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [isSidebarOpen] = useState(false);
  const limit = 5;

  const stats = {
    totalSchools: totalSchools,
    activeNow: schools.filter(school => school.active).length,
    totalSchoolsIncrease: 40,
    activeIncrease: 20,
  };

  const fetchSchools = async (page: number, query?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await schoolService.getAllSchools(page, limit, query);
      setSchools(response.data);
      setTotalPages(response.meta.lastPage);
      setTotalSchools(response.meta.total);
    } catch (error) {
      setError("Unable to connect to the server. Please check your connection and try again.");
      toast.error("Connection Error", {
        description: "Failed to fetch schools. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools(currentPage, debouncedSearch);
  }, [currentPage, debouncedSearch]);

  const handleRegisterClick = () => {
    router.push("/talimregister");
  };

  const handleSchoolClick = (schoolId: string) => {
    router.push(`/SchoolProfile/view/${schoolId}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRetry = () => {
    fetchSchools(currentPage, debouncedSearch);
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {error ? (
        <>
          <WifiOff className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Oops! We're not online</h3>
          <p className="text-gray-500 text-center max-w-sm mb-4">{error}</p>
          <Button onClick={handleRetry} variant="outline" className="mb-4">
            Try Again
          </Button>
        </>
      ) : !schools.length ? (
        <>
          <SchoolIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
          <p className="text-gray-500 text-center max-w-sm mb-4">
            {searchTerm ? "No schools match your search criteria." : "Get started by adding your first school to the system."}
          </p>
          <Button onClick={handleRegisterClick} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="mr-2 h-4 w-4" />
            Add a school
          </Button>
        </>
      ) : null}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LoadingModal isOpen={isLoading} message="Loading schools..." />
      {/* Main Content */}
       <div className="flex-1 lg:ml-0">

       <DashboardHeader isSidebarOpen={isSidebarOpen} />

        <main className="p-6">
          
          <div className="grid gap-6">
           {/* Stats */}
{!error && <Stats 
  totalSchools={stats.totalSchools} 
  totalSchoolsIncrease={stats.totalSchoolsIncrease} 
  activeNow={stats.activeNow} 
  activeIncrease={stats.activeIncrease} 
/>}

            {/* Filters */}
            {!error && (
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 text-gray-700">
                    <Filter className="h-4 w-4" />
                    Filters
                  </Button>
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                    All Schools
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search schools..."
                    className="w-full pl-9 sm:w-[300px] border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
            )}

            {/* Empty State or Error */}
            {(error || !schools.length) && <EmptyState />}

          {/* School Cards */}
{!error && schools.length > 0 && (
  <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {schools.map((school) => (
        <SchoolCard key={school._id} school={school} onClick={handleSchoolClick} />
      ))}
    </div>

             {/* Pagination */}
<div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between mt-6 gap-3">
  <Button
    variant="outline"
    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
    disabled={currentPage === 1}
    className="px-4 py-2 text-xs border-gray-300 text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Previous
  </Button>

  <span className="text-xs text-gray-700 font-medium bg-gray-100 px-3 py-1 rounded-md">
    Page {currentPage} of {totalPages}
  </span>

  <Button
    variant="outline"
    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
    disabled={currentPage === totalPages}
    className="px-4 py-2 border-gray-300 text-xs text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
  >
    Next
  </Button>
</div>

              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
