"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown, Search } from "lucide-react"; // Icons

export function SchoolsHeader() {
  const [filters, setFilters] = useState(["BN", "LG"]); // Example selected filters

  return (
    <div className="flex justify-between items-center py-4 border-b text">
      {/* Left: Quick Filters Button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center bg-blue-300 gap-1">
            {filters.join(", ")} {filters.length > 2 && `+${filters.length - 2}`} 
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          <DropdownMenuItem>Boarding Schools</DropdownMenuItem>
          <DropdownMenuItem>Day Schools</DropdownMenuItem>
          <DropdownMenuItem>Public Schools</DropdownMenuItem>
          <DropdownMenuItem>Private Schools</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Middle: More Filters Button */}
      <Button variant="outline" className="flex items-center gap-1 text-black">
        <Filter className="w-4 h-4 " />
        More Filters
      </Button>

      {/* Right: Search Input */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input type="text" placeholder="Search schools..." className="pl-10" />
      </div>
    </div>
  );
}
