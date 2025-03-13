import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Modal Container */}
        <div className="p-6 space-y-6 border-[1px] border-dashed border-gray-200 m-4 rounded-lg">

          {/* Header (Sticky) */}
          <div className="flex items-center justify-between border-b border-dashed border-gray-200 pb-4 sticky top-0 bg-white z-10">
            <DialogTitle className="text-xl">School Preview</DialogTitle>
           
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
              {[
                { icon: "🎫", label: "Tickets", value: stats.total },
                { icon: "✓", label: "Resolved tickets", value: stats.resolved },
                { icon: "⌛", label: "Unresolved tickets", value: stats.unresolved },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span>{item.icon}</span>
                    {item.label}
                  </div>
                  <p className="text-2xl font-medium">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* School Details */}
          <div className="border-[1px] border-dashed border-gray-200 rounded-lg">
            <div className="bg-gray-100 p-3 text-sm font-medium border-b border-dashed border-gray-200">
              School Details
            </div>
            <div className="grid grid-cols-2 gap-6 p-4">
              {[
                { icon: "✉️", label: "Email", value: school.email },
                { icon: "📍", label: "Location", value: school.location || "Not specified" },
                { icon: "⏰", label: "Last response time", value: school.lastResponse || "No response" },
                {
                  icon: "📊",
                  label: "Status",
                  value: (
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${school.status === "Active" ? "bg-green-500" : "bg-yellow-500"}`} />
                      {school.status}
                    </div>
                  ),
                },
              ].map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <span>{item.icon}</span>
                    {item.label}
                  </div>
                  <p className="text-sm">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets */}
          <div className="border-[1px] border-dashed border-gray-200 rounded-lg">
            <div className="bg-gray-100 p-3 text-sm font-medium border-b border-dashed border-gray-200">
              Tickets
            </div>
            <div className="divide-y divide-dashed">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-2">
                    {[
                      { icon: "🎫", label: `Ticket ID: ${ticket.ticketId}` },
                      { icon: "🏷️", label: `Label: ${ticket.label}` },
                      { icon: "📅", label: `Request date: ${ticket.requestDate}` },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <span>{item.icon}</span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <X className="h-4 w-4" />
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
