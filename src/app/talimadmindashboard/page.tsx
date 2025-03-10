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
        <header className="sticky top-0 z-40 border-b bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-xl font-bold text-gray-800">School Overview</h1>
            <Button className="bg-indigo-600 hover:bg-indigo-700" variant="default" onClick={handleRegisterClick}>
              Register School
            </Button>
          </div>
        </header>

        <main className="p-6">
          <div className="grid gap-6">
            {/* Stats */}
            {!error && (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-gray-800">Total Schools</h3>
                    <SchoolIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{stats.totalSchools}</div>
                      <p className="text-xs text-blue-600/80">
                        +{stats.totalSchoolsIncrease} from last month
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-sm">
                  <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-gray-800">Active Schools</h3>
                    <SchoolIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">{stats.activeNow}</div>
                      <p className="text-xs text-green-600/80">
                        +{stats.activeIncrease} from last month
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    <div
                      key={school._id}
                      className="flex flex-col p-6 rounded-lg border bg-white shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                      onClick={() => handleSchoolClick(school._id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                          <span className="text-indigo-600 font-bold">{school.schoolPrefix}</span>
                        </div>
                        <Badge 
                          variant={school.active ? "default" : "destructive"}
                          className={
                            school.active 
                              ? "bg-green-100 text-green-800 hover:bg-green-200" 
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }
                        >
                          {school.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{school.name}</h3>
                          <p className="text-sm text-gray-500">{school.email}</p>
                        </div>
                        
                        <div className="pt-2 border-t">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <span className="font-medium">{school.location.state}</span>
                            <span>•</span>
                            <span>{school.location.country}</span>
                          </div>
                          {school.primaryContacts[0] && (
                            <p className="text-sm text-gray-600 mt-1">
                              {school.primaryContacts[0].name}
                              <span className="text-gray-400"> • </span>
                              <span className="text-gray-500">{school.primaryContacts[0].role}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
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
