import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trash2, Link } from "lucide-react"
import type { Ticket } from "@/types/support"

interface TicketsTableProps {
  tickets: Ticket[]
  onTicketSelect?: (ticketId: string) => void
}

export function TicketsTable({ tickets, onTicketSelect }: TicketsTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table className="w-full min-w-[600px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead className="hidden md:table-cell">Date Created</TableHead>
            <TableHead className="w-24 text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="border-b">
              <TableCell>
                <Checkbox />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 bg-blue-100">
                    <AvatarFallback>{ticket.school.shortName}</AvatarFallback>
                  </Avatar>
                  <div className="truncate max-w-[120px] sm:max-w-[200px]">{ticket.school.name}</div>
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell truncate max-w-[150px]">{ticket.school.email}</TableCell>
              <TableCell>
                <div
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                  ${
                    ticket.priority === "High"
                      ? "bg-red-100 text-red-700"
                      : ticket.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {ticket.priority}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">{ticket.dateSubmitted}</TableCell>
              <TableCell className="text-center">
                <div className="flex justify-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Link className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
