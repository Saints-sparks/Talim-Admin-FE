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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#F1F1F1] bg-white py-16 px-4">
      {error ? (
        <>
          <WifiOff className="h-12 w-12 text-[#878787] mb-4" />
          <h3 className="text-base font-semibold text-[#030E18] mb-1">Connection error</h3>
          <p className="text-sm text-[#6F6F6F] text-center max-w-sm mb-5">{error}</p>
          <Button onClick={handleRetry} variant="outline" className="border-[#F1F1F1] text-[#030E18] hover:border-[#D7E6F6] text-xs">
            Try Again
          </Button>
        </>
      ) : !schools.length ? (
        <>
          <SchoolIcon className="h-12 w-12 text-[#878787] mb-4" />
          <h3 className="text-base font-semibold text-[#030E18] mb-1">No schools found</h3>
          <p className="text-sm text-[#6F6F6F] text-center max-w-sm mb-5">
            {searchTerm ? "No schools match your search criteria." : "Get started by adding your first school to the system."}
          </p>
          <Button onClick={handleRegisterClick} className="bg-[#003366] hover:bg-[#002244] text-white text-xs gap-1.5">
            <Plus className="h-4 w-4" />
            Add a school
          </Button>
        </>
      ) : null}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F8F8]">
      <LoadingModal isOpen={isLoading} message="Loading schools..." />
      <div className="flex-1">
        <DashboardHeader isSidebarOpen={isSidebarOpen} />

        <main className="p-6">
          <div className="grid gap-5">
            {/* Stats */}
            {!error && (
              <Stats
                totalSchools={stats.totalSchools}
                totalSchoolsIncrease={stats.totalSchoolsIncrease}
                activeNow={stats.activeNow}
                activeIncrease={stats.activeIncrease}
              />
            )}

            {/* Filters */}
            {!error && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2 text-[#030E18] border-[#F1F1F1] hover:border-[#D7E6F6] text-xs">
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                  </Button>
                  <Badge className="bg-[#EAF2FB] text-[#003366] border-0 text-xs font-medium px-2.5">
                    All Schools
                  </Badge>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#878787]" />
                  <Input
                    placeholder="Search schools..."
                    className="w-full pl-9 sm:w-[280px] border-[#F1F1F1] bg-white focus:border-[#003366] focus:ring-[#003366] text-sm"
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {schools.map((school) => (
                    <SchoolCard key={school._id} school={school} onClick={handleSchoolClick} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="text-xs border-[#F1F1F1] text-[#030E18] hover:border-[#D7E6F6] disabled:opacity-40"
                  >
                    Previous
                  </Button>

                  <span className="text-xs text-[#6F6F6F] font-medium bg-white border border-[#F1F1F1] px-3 py-1.5 rounded-lg">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="text-xs border-[#F1F1F1] text-[#030E18] hover:border-[#D7E6F6] disabled:opacity-40"
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
