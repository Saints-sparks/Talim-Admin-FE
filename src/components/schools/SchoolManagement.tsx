"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Filter, MoreVertical, Plus, School as SchoolIcon, WifiOff } from "lucide-react"
import { School, schoolService } from "@/app/services/school.service"
import { LoadingModal } from "@/components/ui/loading-modal"

export function SchoolManagement() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showToggleDialog, setShowToggleDialog] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [schools, setSchools] = useState<School[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalSchools, setTotalSchools] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const limit = 10

  const fetchSchools = async (page: number) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await schoolService.getAllSchools(page, limit)
      setSchools(response.data)
      setTotalPages(response.meta.lastPage)
      setTotalSchools(response.meta.total)
    } catch (error) {
      setError("Unable to connect to the server. Please check your connection and try again.")
      toast.error("Connection Error", {
        description: "Failed to fetch schools. Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSchools(currentPage)
  }, [currentPage])

  const handleRegisterClick = () => {
    router.push("/talimregister")
  }

  const handleToggleStatus = async () => {
    if (!selectedSchool) return;

    try {
      setIsUpdatingStatus(true)
      const newStatus = !selectedSchool.active;
      
      await schoolService.updateSchoolStatus(selectedSchool._id, newStatus);
      
      // Update local state optimistically
      setSchools(prevSchools => 
        prevSchools.map(school => 
          school._id === selectedSchool._id 
            ? { ...school, active: newStatus }
            : school
        )
      );

      toast.success(`School ${newStatus ? 'activated' : 'deactivated'} successfully`);
      
      // Refresh the schools list to ensure we have the latest data
      await fetchSchools(currentPage);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update school status';
      toast.error(errorMessage);
      
      // Revert optimistic update on error
      await fetchSchools(currentPage);
    } finally {
      setIsUpdatingStatus(false)
      setShowToggleDialog(false)
      setSelectedSchool(null)
    }
  }

  const handleDelete = async () => {
    if (selectedSchool) {
      setShowDeleteDialog(false)
      setSelectedSchool(null)
      // Refresh the schools list
      fetchSchools(currentPage)
    }
  }

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {error ? (
        <>
          <WifiOff className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Oops! We're not online</h3>
          <p className="text-gray-500 text-center max-w-sm mb-4">{error}</p>
        </>
      ) : (
        <>
          <SchoolIcon className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
          <p className="text-gray-500 text-center max-w-sm mb-4">
            Get started by adding your first school to the system.
          </p>
        </>
      )}
      <Button onClick={handleRegisterClick} className="bg-sky-700 hover:bg-sky-800">
        <Plus className="mr-2 h-4 w-4" />
        Add a school
      </Button>
    </div>
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <LoadingModal isOpen={isLoading || isUpdatingStatus} message={isUpdatingStatus ? "Updating school status..." : "Loading schools..."} />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Schools</h1>
        <Button className="hover:bg-gray-600 bg-sky-700" onClick={handleRegisterClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add a school
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4"/>
              <p className="text-gray-600">Filters</p>
            </Button>
            <div className="text-sm text-gray-500">
              Total Schools: {totalSchools}
            </div>
          </div>
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {(!schools.length || error) ? (
          <EmptyState />
        ) : (
          <>
            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-300">
                    <TableHead>School Prefix</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email Address</TableHead>
                    <TableHead>Primary Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school._id} className="text-black">
                      <TableCell className="font-medium">{school.schoolPrefix}</TableCell>
                      <TableCell>{school.name}</TableCell>
                      <TableCell>{school.email}</TableCell>
                      <TableCell>
                        {school.primaryContacts[0]?.name || 'N/A'}
                        <div className="text-xs text-gray-500">
                          {school.primaryContacts[0]?.role || ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {school.location.state}, {school.location.country}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={school.active ? "default" : "destructive"}
                          className={school.active ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200"}
                        >
                          {school.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/SchoolProfile/${school._id}`)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedSchool(school)
                                setShowToggleDialog(true)
                              }}
                              className={school.active ? "text-red-600" : "text-green-600"}
                            >
                              {school.active ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedSchool(school)
                                setShowDeleteDialog(true)
                              }}
                              className="text-red-600"
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete school</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to remove this school? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showToggleDialog} onOpenChange={setShowToggleDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change School Status</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {selectedSchool?.active ? "deactivate" : "activate"} this school?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleStatus} 
              className={selectedSchool?.active ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

