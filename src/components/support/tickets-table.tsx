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
    <Table>
      <TableHeader>
        <TableRow>
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
        {tickets.map((ticket) => (
          <TableRow key={ticket.id}>
            <TableCell>
              <Checkbox />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8 bg-blue-100">
                  <AvatarFallback>{ticket.school.shortName}</AvatarFallback>
                </Avatar>
                <div>{ticket.school.name}</div>
              </div>
            </TableCell>
            <TableCell>{ticket.school.email}</TableCell>
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
            <TableCell>{ticket.dateSubmitted}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
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
  )
}

