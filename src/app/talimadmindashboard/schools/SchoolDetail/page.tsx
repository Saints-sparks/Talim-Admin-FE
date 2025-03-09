// Talim-Admin-FE\src\app\talimadmindashboard\schools\SchoolDetail\page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import SchoolDetails from "@/components/schools/SchoolDetails";

const SchoolDetailPage = () => {
  const searchParams = useSearchParams();
  const schoolId = searchParams.get("id"); // Get school ID from query params

  if (!schoolId) {
    return <p className="text-red-500">Invalid School ID.</p>;
  }

  return <SchoolDetails schoolId={schoolId} />;
};

export default SchoolDetailPage;
