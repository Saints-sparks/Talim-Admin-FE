"use client"

import * as React from "react"
import { useMemo, useCallback } from "react"
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
import { useToast } from "../../types/use-toast"
import { Filter, MoreVertical, Plus } from "lucide-react"

interface School {
  id: string
  name: string
  email: string
  contact: string
  students: number
  teachers: number
  location: string
  status: "Active" | "Deactivated"
}

export function SchoolManagement() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [showToggleDialog, setShowToggleDialog] = React.useState(false)
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null)
  const { toast } = useToast()
  const entriesPerPage = 10

  const handleViewSchool = (schoolId: string) => {
    router.push(`/schools/${schoolId}`)
  }

  const [schools, setSchools] = React.useState<School[]>([
    {
      id: "SIS-101",
      name: "Sapphire International School",
      email: "info@sapphireintl.edu.ng",
      contact: "Mr. Olumide Adebayo",
      students: 1100,
      teachers: 95,
      location: "Lagos",
      status: "Active",
    },
    ...Array(50)
      .fill(null)
      .map((_, index) => ({
        id: `SCH-${index + 102}`,
        name: `Sample School ${index + 1}`,
        email: `sample${index + 1}@school.edu.ng`,
        contact: `Mr. Sample ${index + 1}`,
        students: 1000 + index,
        teachers: 50 + index,
        location: `City ${index + 1}`,
        status: "Active" as const,
      })),
  ])

  const filteredSchools = useMemo(
    () => schools.filter((school) => school.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [schools, searchTerm],
  )

  const totalPages = useMemo(
    () => Math.ceil(filteredSchools.length / entriesPerPage),
    [filteredSchools.length, entriesPerPage],
  )

  const paginatedSchools = useMemo(
    () => filteredSchools.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage),
    [filteredSchools, currentPage],
  )

  const handleToggleStatus = useCallback(() => {
    if (selectedSchool) {
      setSchools((prev) =>
        prev.map((school) =>
          school.id === selectedSchool.id
            ? {
                ...school,
                status: school.status === "Active" ? "Deactivated" : "Active",
              }
            : school,
        ),
      )
      toast({
        description: `School ${selectedSchool.id} is now ${
          selectedSchool.status === "Active" ? "deactivated" : "active"
        }.`,
      })
      setShowToggleDialog(false)
      setSelectedSchool(null)
    }
  }, [selectedSchool, toast])

  const handleDelete = useCallback(() => {
    if (selectedSchool) {
      setSchools((prev) => prev.filter((school) => school.id !== selectedSchool.id))
      toast({
        description: "School has been deleted.",
        variant: "destructive",
      })
      setShowDeleteDialog(false)
      setSelectedSchool(null)
    }
  }, [selectedSchool, toast])

  const handleRegisterClick = () => {
    router.push("/talimregister");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Schools</h1>
        <Button className="hover:bg-gray-600 bg-sky-700"  variant="default" onClick={handleRegisterClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add a school
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4"/>
            <p  className="text-gray-600">Filters</p>
          </Button>
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }, [])}
            className="max-w-xs"
            aria-label="Search schools"
          />
        </div>

        <div className="relative overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-300">
                <TableHead>School ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Primary Contact</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSchools.map((school) => (
                <TableRow key={school.id} className="text-black">
                  <TableCell className="font-medium">{school.id}</TableCell>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.email}</TableCell>
                  <TableCell>{school.contact}</TableCell>
                  <TableCell>{school.students}</TableCell>
                  <TableCell>{school.teachers}</TableCell>
                  <TableCell>{school.location}</TableCell>
                  <TableCell>
                    <Badge variant={school.status === "Active" ? "default" : "secondary"}>{school.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu >
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-400 "  align="end">
                        <DropdownMenuItem className="hover:bg-blue-400" onClick={() => router.push(`/SchoolProfile/${school.id}`)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-blue-400">Archive</DropdownMenuItem>
                        <DropdownMenuItem 
                        
                          onClick={() => {
                            setSelectedSchool(school)
                            setShowToggleDialog(true)
                          }}
                          className="text-yellow-600 hover:bg-blue-400"
                        >
                          {school.status === "Active" ? "Deactivate" : "Reactivate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedSchool(school)
                            setShowDeleteDialog(true)
                          }}
                          className="text-red-600 hover:bg-blue-400"
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
          className="hover:bg-gray-600"
            variant="outline"
            size="sm"
            onClick={useCallback(() => setCurrentPage((p) => Math.max(1, p - 1)), [])}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            Previous
          </Button>
          <span className="text-sm  text-gray-600 text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
          className="hover:bg-gray-600"
            variant="outline"
            size="sm"
            onClick={useCallback(() => setCurrentPage((p) => Math.min(totalPages, p + 1)), [totalPages])}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next
          </Button>
        </div>
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
              Are you sure you want to {selectedSchool?.status === "Active" ? "deactivate" : "reactivate"} this school?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} className="bg-yellow-600 hover:bg-yellow-700">
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

