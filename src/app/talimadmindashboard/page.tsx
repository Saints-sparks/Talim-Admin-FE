"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa"; 
import Stats from "@/components/talimdashboard/Stats";
import { SchoolsHeader } from "@/components/talimdashboard/SchoolsHeader";
import { SchoolsCard } from "@/components/talimdashboard/SchoolsCard";

export default function Page() {
  const router = useRouter(); 
  // Handle navigation to the talimregister page
  const handleRegisterClick = () => {
    router.push("/talimadmindashboard/schools/RegisterSchool");
  };

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <header className="sticky top-0 z-40 border-b bg-white">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-lg text-black font-semibold">School Overview</h1>
            <Button variant="default" className="text-sm bg-blue-700 font-semibold" onClick={handleRegisterClick}>
             <FaPlus /> Register School
            </Button>
          </div>
        </header>
      <Stats />
      <div className="school-container">
<SchoolsHeader />
  <SchoolsCard  />
  </div>
      </div>
    </div>
  );
}
