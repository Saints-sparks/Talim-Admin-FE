import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal } from "lucide-react"
import type { School, TicketStats, Ticket } from "@/types/support"

interface SchoolPreviewProps {
  school: School
  stats: TicketStats
  tickets: Ticket[]
  isOpen: boolean
  onClose: () => void
}

export function SchoolPreview({ school, stats, tickets, isOpen, onClose }: SchoolPreviewProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <div className="p-6 space-y-6 border-[1px] border-dashed border-gray-200 m-4 rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-4">
            <DialogTitle className="text-xl">School Preview</DialogTitle>
            <div className="flex gap-2 items-center">
              <Button variant="outline" className="h-8">
                View full details
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* School Name */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-blue-100 border-0">
              <AvatarFallback className="text-blue-700">{school.shortName}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{school.name}</h2>
          </div>

          {/* School Overview */}
          <div className="border-[1px] border-dashed border-gray-200 rounded-lg">
            <div className="bg-gray-100 p-3 text-sm font-medium border-b border-dashed border-gray-200">
              School Overview
            </div>
            <div className="grid grid-cols-3 p-4 gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span className="text-red-500">🎫</span>
                  Tickets
                </div>
                <p className="text-2xl font-medium">{stats.total}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>✓</span>
                  Resolved tickets
                </div>
                <p className="text-2xl font-medium">{stats.resolved}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>⌛</span>
                  Unresolved tickets
                </div>
                <p className="text-2xl font-medium">{stats.unresolved}</p>
              </div>
            </div>
          </div>

          {/* School Details */}
          <div className="border-[1px] border-dashed border-gray-200 rounded-lg">
            <div className="bg-gray-100 p-3 text-sm font-medium border-b border-dashed border-gray-200">
              School Details
            </div>
            <div className="grid grid-cols-2 gap-6 p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>✉️</span>
                  Email
                </div>
                <p className="text-sm">{school.email}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>📍</span>
                  Location
                </div>
                <p className="text-sm">{school.location || "Not specified"}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>⏰</span>
                  Last response time
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm">{school.lastResponse || "No response"}</p>
                  {school.lastResponse && <span className="text-xs text-red-500">• Slow response</span>}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <span>📊</span>
                  Status
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${school.status === "Active" ? "bg-green-500" : "bg-yellow-500"}`}
                  />
                  <p className="text-sm">{school.status}</p>
                  {school.status === "Active" && <span className="text-xs text-green-600">Active</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Tickets */}
          <div className="border-[1px] border-dashed border-gray-200 rounded-lg">
            <div className="bg-gray-100 p-3 text-sm font-medium border-b border-dashed border-gray-200">Tickets</div>
            <div className="divide-y divide-dashed">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-purple-600">🎫</span>
                      Ticket ID: {ticket.ticketId}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🏷️</span>
                      Label: {ticket.label}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📅</span>
                      Request date: {ticket.requestDate}
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

