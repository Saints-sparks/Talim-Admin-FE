"use client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Ticket, LinkIcon } from "lucide-react"
import { TicketsView } from "@/components/support/tickets-view"
import { AttachmentsView } from "@/components/support/attachments-view"

export default function SupportPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-semibold">Tickets</h1>

      <Tabs defaultValue="tickets" className="space-y-6">
        <div className="flex items-center gap-4 border-b border-dashed">
          <TabsList className="bg-transparent border-0 p-0 h-auto">
            <TabsTrigger
              value="tickets"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2 mr-6"
            >
              <Ticket className="h-4 w-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none px-0 pb-2"
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Attachments
            </TabsTrigger>
          </TabsList>
        </div>

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

