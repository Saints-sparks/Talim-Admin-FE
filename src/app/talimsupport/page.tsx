"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Ticket, LinkIcon } from "lucide-react"
import { TicketsView } from "@/components/support/tickets-view"
import { AttachmentsView } from "@/components/support/attachments-view"

export default function SupportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Tickets</h1>
      </header>

      {/* Tabs Section */}
      <Tabs defaultValue="tickets" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="flex border-b border-dashed w-max">
            <TabsTrigger
              value="tickets"
              aria-label="View Tickets"
              className="flex items-center gap-2 px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              aria-label="View Attachments"
              className="flex items-center gap-2 px-4 py-2 border-b-2 border-transparent data-[state=active]:border-primary"
            >
              <LinkIcon className="h-4 w-4" />
              Attachments
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="tickets" className="m-0">
          <TicketsView />
        </TabsContent>

        <TabsContent value="attachments" className="m-0">
          <AttachmentsView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
