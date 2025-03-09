"use client";
import SchoolList from "@/components/schools/SchoolList";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";


export default function SchoolsPage() {
    const router = useRouter();


  return (
    <div className="p-6 space-y-4 text-black">
         {/* Page Header */}
               <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-lg font-bold">Schools</h1>
                  <p className="text-gray-500 text-sm">Edit school information here</p>
                </div>
                <Button className="bg-blue-600 text-white" onClick={() => router.push("/talimadmindashboard/schools/RegisterSchool")}>
          + Add a School
        </Button>
              </div>
        
     <SchoolList  />
    </div>
  );
}
