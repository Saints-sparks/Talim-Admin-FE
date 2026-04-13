"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Ticket, LinkIcon } from "lucide-react";
import { TicketsView } from "@/components/support/tickets-view";
import { AttachmentsView } from "@/components/support/attachments-view";
import { PageHeader } from "@/components/ui/page-header";

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      <PageHeader
        title="Support"
        subtitle="Manage support tickets submitted by schools"
      />

      <div className="px-6 py-6 space-y-6">
        <Tabs defaultValue="tickets" className="space-y-6">
          <TabsList className="h-auto bg-transparent p-0 border-b border-[#F1F1F1] rounded-none w-full justify-start gap-1">
            <TabsTrigger
              value="tickets"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-[#003366] data-[state=active]:text-[#003366] text-[#6F6F6F] bg-transparent shadow-none"
            >
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger
              value="attachments"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-none border-b-2 border-transparent data-[state=active]:border-[#003366] data-[state=active]:text-[#003366] text-[#6F6F6F] bg-transparent shadow-none"
            >
              <LinkIcon className="h-4 w-4" />
              Attachments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="m-0">
            <TicketsView />
          </TabsContent>

          <TabsContent value="attachments" className="m-0">
            <AttachmentsView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
