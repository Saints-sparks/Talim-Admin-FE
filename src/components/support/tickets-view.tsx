"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Filter, Search, Trash2, Link, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { SchoolPreview } from "./school-preview"
import { schools as initialSchools, tickets } from "@/data/mockData"
import type { School } from "@/types/support"

const ITEMS_PER_PAGE = 10

export function TicketsView() {
  const [schools, setSchools] = useState<School[]>(initialSchools)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [schoolToDelete, setSchoolToDelete] = useState<School | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>(["High", "Medium", "Low"])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(["Active", "Inactive"])
  const [showFilters, setShowFilters] = useState(false)

  const handleDeleteSchool = () => {
    if (schoolToDelete) {
      setSchools(schools.filter((school) => school.id !== schoolToDelete.id))
      setSchoolToDelete(null)
    }
  }

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      setSelectedPriorities(selectedPriorities.filter((p) => p !== priority))
    } else {
      setSelectedPriorities([...selectedPriorities, priority])
    }
  }

  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  const filteredSchools = schools.filter(
    (school) =>
      (school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
      selectedPriorities.includes(school.priority) &&
      selectedStatuses.includes(school.status),
  )

  const totalPages = Math.ceil(filteredSchools.length / ITEMS_PER_PAGE)
  const paginatedSchools = filteredSchools.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedPriorities.includes("High")}
              onCheckedChange={() => togglePriority("High")}
            >
              <span className="text-red-500 mr-2">●</span> High
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriorities.includes("Medium")}
              onCheckedChange={() => togglePriority("Medium")}
            >
              <span className="text-orange-500 mr-2">●</span> Medium
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedPriorities.includes("Low")}
              onCheckedChange={() => togglePriority("Low")}
            >
              <span className="text-purple-500 mr-2">●</span> Low
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes("Active")}
              onCheckedChange={() => toggleStatus("Active")}
            >
              <span className="text-green-500 mr-2">●</span> Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatuses.includes("Inactive")}
              onCheckedChange={() => toggleStatus("Inactive")}
            >
              <span className="text-yellow-500 mr-2">●</span> Inactive
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="relative w-[300px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <div className="text-sm font-medium">Active filters:</div>
          {selectedPriorities.length < 3 && (
            <>
              {selectedPriorities.includes("High") && (
                <div className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs">
                  High Priority
                  <button onClick={() => togglePriority("High")}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedPriorities.includes("Medium") && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                  Medium Priority
                  <button onClick={() => togglePriority("Medium")}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedPriorities.includes("Low") && (
                <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                  Low Priority
                  <button onClick={() => togglePriority("Low")}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </>
          )}
          {selectedStatuses.length < 2 && (
            <>
              {selectedStatuses.includes("Active") && (
                <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                  Active Status
                  <button onClick={() => toggleStatus("Active")}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              {selectedStatuses.includes("Inactive") && (
                <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs">
                  Inactive Status
                  <button onClick={() => toggleStatus("Inactive")}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </>
          )}
          {(selectedPriorities.length < 3 || selectedStatuses.length < 2) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPriorities(["High", "Medium", "Low"])
                setSelectedStatuses(["Active", "Inactive"])
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="font-medium">Tickets</span>
        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-sm">{filteredSchools.length}</span>
      </div>

      <div className="border-[1px] border-dashed border-gray-200 rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-dashed">
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Date Created</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSchools.map((school) => (
              <TableRow key={school.id} className="border-b border-dashed">
                <TableCell className="border-0">
                  <Checkbox />
                </TableCell>
                <TableCell className="border-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-blue-100 border-0">
                      <AvatarFallback className="text-blue-700">{school.shortName}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{school.name}</div>
                  </div>
                </TableCell>
                <TableCell className="border-0 text-gray-600">{school.email}</TableCell>
                <TableCell className="border-0">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        school.priority === "High"
                          ? "bg-red-500"
                          : school.priority === "Medium"
                            ? "bg-orange-500"
                            : "bg-purple-500"
                      }`}
                    />
                    <span
                      className={
                        school.priority === "High"
                          ? "text-red-500"
                          : school.priority === "Medium"
                            ? "text-orange-500"
                            : "text-purple-500"
                      }
                    >
                      {school.priority}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="border-0 text-gray-600">{school.dateCreated}</TableCell>
                <TableCell className="border-0">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSchoolToDelete(school)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedSchool(school)}>
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "secondary" : "ghost"}
              className={`h-8 w-8 p-0 ${currentPage === page ? "bg-blue-100 text-blue-700" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      {selectedSchool && (
        <SchoolPreview
          school={selectedSchool}
          stats={{ total: 12, resolved: 8, unresolved: 4 }}
          tickets={tickets.slice(0, 3)}
          isOpen={!!selectedSchool}
          onClose={() => setSelectedSchool(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!schoolToDelete} onOpenChange={(open) => !open && setSchoolToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete School</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {schoolToDelete?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchoolToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSchool}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

